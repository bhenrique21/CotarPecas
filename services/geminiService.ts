
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteRequest, SearchResponse, GroundingChunk } from "../types";

// Função para esperar um tempo (backoff)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("A chave da API (API_KEY) não está configurada.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const hasLocation = !!(request.city || request.state);
  const locationStr = hasLocation ? `${request.city ? request.city + '-' : ''}${request.state || ''}` : 'Brasil';

  // Prompt focado exclusivamente em extração de dados reais
  const prompt = `
    ATUE COMO UM ESPECIALISTA EM COTAÇÃO DE PEÇAS AUTOMOTIVAS.
    
    CONTEXTO:
    Preciso encontrar fornecedores online com PREÇO e ESTOQUE para a seguinte peça:
    - Veículo: ${request.make} ${request.model} ${request.year} (${request.vehicleType})
    - Peça: "${request.partName}"
    - Região de Busca: ${locationStr}

    REQUISITOS OBRIGATÓRIOS:
    1. Utilize a Google Search para encontrar ofertas REAIS e ATUAIS.
    2. Busque em sites confiáveis como: Mercado Livre, Loja do Mecânico, Connect Parts, PneuStore, Hipervarejo, Autoglass, Amazon Brasil.
    3. EXTRAIA O PREÇO REAL. Se o preço estiver parcelado (ex: 10x 30,00), calcule o total (300,00).
    4. Se não encontrar o preço exato em um site específico, ignore esse site e busque outro. NÃO INVENTE PREÇOS.
    5. Retorne apenas produtos que pareçam ser compatíveis com o veículo informado.

    FORMATO DE RESPOSTA (JSON):
    Retorne um objeto JSON contendo:
    - quotes: Array com as 4 melhores opções encontradas.
    - summary: Um resumo técnico de 1 frase sobre a disponibilidade e média de preços.
  `;

  // Configuração de Retry (Persistência)
  // Tenta até 3 vezes. Se falhar na primeira (erro 429), espera e tenta de novo.
  const MAX_RETRIES = 3;
  let attempt = 0;
  let lastError: any = null;

  while (attempt < MAX_RETRIES) {
    try {
      console.log(`Tentativa de cotação ${attempt + 1} de ${MAX_RETRIES}...`);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Modelo estável e rápido
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
                    vendorName: { type: Type.STRING, description: "Nome da loja (ex: Mercado Livre)" },
                    productName: { type: Type.STRING, description: "Título do produto no anúncio" },
                    price: { type: Type.NUMBER, description: "Preço total à vista (ex: 150.00)" },
                    currency: { type: Type.STRING, description: "Sempre BRL" },
                    description: { type: Type.STRING, description: "Breve descrição ou condição" },
                    link: { type: Type.STRING, description: "URL direta para o produto" }
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

      // Se chegamos aqui, a requisição funcionou. Vamos processar.
      let text = response.text || "{}";
      text = text.replace(/```json\n?|```/g, "").trim(); // Limpeza de segurança

      const parsedData = JSON.parse(text);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const quotes = (parsedData.quotes || []).map((q: any) => ({
          vendorName: q.vendorName || "Fornecedor",
          productName: q.productName || request.partName,
          price: typeof q.price === 'number' ? q.price : 0,
          currency: "BRL",
          description: q.description || "",
          link: q.link || ""
      }));

      // Validação: Se a IA retornou array vazio, consideramos falha e tentamos de novo (se tiver tentativas)
      if (quotes.length === 0 && attempt < MAX_RETRIES - 1) {
          throw new Error("IA retornou lista vazia, tentando novamente...");
      }

      return {
        quotes: quotes,
        summary: parsedData.summary || "Cotação realizada com sucesso.",
        groundingSources: groundingChunks as GroundingChunk[]
      };

    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || "";
      
      // Verifica se é erro de tráfego (429) ou erro de servidor (503)
      const isTrafficError = errorMessage.includes("429") || errorMessage.includes("503") || errorMessage.includes("Quota");
      
      if (isTrafficError || errorMessage.includes("lista vazia")) {
        attempt++;
        if (attempt < MAX_RETRIES) {
          // Backoff Exponencial: Espera 2s, depois 4s, depois 8s...
          const delay = 2000 * Math.pow(2, attempt - 1);
          console.warn(`Erro de tráfego (${errorMessage}). Aguardando ${delay}ms para tentar novamente...`);
          await wait(delay);
          continue; // Volta para o início do while
        }
      } else {
        // Se for outro erro (ex: chave inválida), falha imediatamente
        throw error;
      }
    }
    
    attempt++;
  }

  // Se saiu do loop, falhou todas as tentativas
  console.error("Falha definitiva após retries:", lastError);
  throw new Error("O sistema de cotação está momentaneamente sobrecarregado com muitos pedidos. Por favor, aguarde 10 segundos e tente novamente para obter preços reais.");
};
