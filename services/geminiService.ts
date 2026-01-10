
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteRequest, SearchResponse, GroundingChunk } from "../types";

// Função para esperar um tempo (backoff)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LISTA DE MODELOS PARA ROTAÇÃO (BALANCEAMENTO DE CARGA)
// Removido o modelo 'pro-exp' que estava causando 404.
// Alternamos entre a versão estável e a experimental do Flash.
const AVAILABLE_MODELS = [
  "gemini-2.0-flash",           // Padrão: Rápido e Estável
  "gemini-2.0-flash-exp",       // Experimental: Fila separada
];

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("A chave da API (API_KEY) não está configurada.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const hasLocation = !!(request.city || request.state);
  const locationStr = hasLocation ? `${request.city ? request.city + '-' : ''}${request.state || ''}` : 'Brasil';

  // Prompt otimizado para extração direta de preços
  const prompt = `
    ATUE COMO UM ESPECIALISTA EM COTAÇÃO DE PEÇAS AUTOMOTIVAS.
    
    CONTEXTO:
    Preciso encontrar fornecedores online com PREÇO e ESTOQUE para a seguinte peça:
    - Veículo: ${request.make} ${request.model} ${request.year} (${request.vehicleType})
    - Peça: "${request.partName}"
    - Região de Busca: ${locationStr}

    REQUISITOS OBRIGATÓRIOS:
    1. Utilize a Google Search para encontrar ofertas REAIS e ATUAIS.
    2. Busque em sites confiáveis como: Mercado Livre, Loja do Mecânico, Connect Parts, PneuStore, Hipervarejo, Autoglass, Amazon Brasil, Magalu.
    3. EXTRAIA O PREÇO REAL. 
       - Se for parcelado (ex: 10x 30,00), calcule o total (300,00).
       - Ignore frete na extração do preço, foque no valor do produto.
    4. Se não encontrar o preço exato, ignore o site. NÃO INVENTE PREÇOS.
    5. Retorne apenas produtos compatíveis com o veículo informado.

    FORMATO DE RESPOSTA (JSON):
    Retorne um objeto JSON contendo:
    - quotes: Array com as 4 melhores opções encontradas.
    - summary: Um resumo técnico de 1 frase sobre a disponibilidade da peça no mercado.
  `;

  const MAX_RETRIES = 4; // Aumentado um pouco para garantir rotação completa se necessário
  let attempt = 0;
  let lastError: any = null;

  while (attempt < MAX_RETRIES) {
    // Rotação de modelo: A cada tentativa, usa um modelo diferente da lista
    const currentModel = AVAILABLE_MODELS[attempt % AVAILABLE_MODELS.length];

    try {
      console.log(`Tentativa ${attempt + 1} usando modelo: ${currentModel}...`);

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }], // Ferramenta de busca ativada
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    vendorName: { type: Type.STRING, description: "Nome da loja" },
                    productName: { type: Type.STRING, description: "Título do produto" },
                    price: { type: Type.NUMBER, description: "Preço à vista" },
                    currency: { type: Type.STRING, description: "BRL" },
                    description: { type: Type.STRING, description: "Condição de pagto ou detalhe" },
                    link: { type: Type.STRING, description: "URL do produto" }
                  },
                  required: ["vendorName", "productName", "price", "currency", "link"]
                }
              },
              summary: { type: Type.STRING }
            },
            required: ["quotes", "summary"]
          }
        }
      });

      // Processamento da resposta
      let text = response.text || "{}";
      text = text.replace(/```json\n?|```/g, "").trim();

      const parsedData = JSON.parse(text);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const quotes = (parsedData.quotes || []).map((q: any) => ({
          vendorName: q.vendorName || "Loja Online",
          productName: q.productName || request.partName,
          price: typeof q.price === 'number' ? q.price : 0,
          currency: "BRL",
          description: q.description || "",
          link: q.link || ""
      }));

      // Se a lista vier vazia, força o erro para tentar o próximo modelo
      if (quotes.length === 0 && attempt < MAX_RETRIES - 1) {
          throw new Error("Lista vazia retornada pelo modelo.");
      }

      return {
        quotes: quotes,
        summary: parsedData.summary || "Cotação realizada com sucesso.",
        groundingSources: groundingChunks as GroundingChunk[]
      };

    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || "";
      
      console.warn(`Erro no modelo ${currentModel}: ${errorMessage}`);

      // TRATAMENTO DE ERRO 404 (Modelo não encontrado)
      // Se o modelo não existe, pulamos imediatamente para o próximo sem esperar (backoff = 0)
      if (errorMessage.includes("404") || errorMessage.includes("NOT_FOUND")) {
          console.warn(`Modelo ${currentModel} indisponível. Pulando...`);
          attempt++;
          continue; 
      }

      // Erros que justificam tentar outro modelo (Fila, Cota, Erro de Servidor, Timeout, Lista Vazia)
      const isRetryable = errorMessage.includes("429") || 
                          errorMessage.includes("503") || 
                          errorMessage.includes("Quota") || 
                          errorMessage.includes("fetch failed") ||
                          errorMessage.includes("Lista vazia");
      
      if (isRetryable) {
        attempt++;
        if (attempt < MAX_RETRIES) {
          // Espera progressiva (backoff) apenas para erros de sobrecarga
          // 1.5s, 3s, 4.5s...
          await wait(1500 * attempt);
          continue; 
        }
      } else {
        // Erros fatais (ex: chave inválida, erro de sintaxe grave) param imediatamente
        throw error;
      }
    }
    
    attempt++;
  }

  console.error("Todas as tentativas de rotação falharam.", lastError);
  throw new Error("Alta demanda no momento. Nossos servidores estão alternando conexões, mas todas estão ocupadas. Por favor, tente novamente em 15 segundos.");
};
