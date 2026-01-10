
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteRequest, SearchResponse, GroundingChunk } from "../types";

// Helper para aguardar tempo (backoff)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  let apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("GeminiService: API Key está undefined ou vazia.");
  } else {
    apiKey = apiKey.trim();
  }
  
  if (!apiKey) {
    throw new Error("API Key not configured. A variável de ambiente API_KEY não foi encontrada.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construção de query para contexto
  const hasLocation = !!(request.city || request.state);

  const prompt = `
    Você é um COMPRADOR TÉCNICO AUTOMOTIVO SÊNIOR.
    
    DADOS DO PEDIDO:
    Veículo: ${request.make} ${request.model} ${request.year} (${request.vehicleType})
    Peça: "${request.partName}"
    Localização Preferencial: ${hasLocation ? (request.city ? request.city + ' - ' : '') + (request.state || '') : 'Brasil (Todo o território)'}

    OBJETIVO CRÍTICO:
    Localizar a peça EXATA compatível com este veículo específico em lojas online, retornando o LINK DIRETO para a página de compra do produto.

    REGRAS DE OURO (COMPATIBILIDADE 100%):
    1. RIGOR TOTAL NO ANO E MODELO: A peça DEVE servir no ${request.model} ano ${request.year}. Verifique a faixa de anos da peça (ex: se a peça é 2012-2016 e o carro é 2018, NÃO SERVE).
    2. LINK DIRETO (DEEP LINK): O campo 'link' DEVE ser a URL DIRETA da página do produto (onde há o botão "Comprar").
    3. PROIBIDO LINKS DE LISTA: Não retorne links de resultados de busca (ex: site.com/busca?q=...) a menos que seja absolutamente impossível encontrar o item específico. O usuário quer o produto final.
    
    DIRETRIZES DE PRIORIDADE DE LOJAS E LOCALIZAÇÃO:
    1. ${hasLocation ? `PRIORIDADE REGIONAL: Tente encontrar fornecedores que atendam ou estejam localizados em ${request.state || request.city}.` : ''}
    2. PRIORIDADE MÁXIMA (Especializadas): Hipervarejo, Connect Parts, Loja do Mecânico, PneuStore, Autoglass, Jocar, AutoZ, MercadoCar, Koga Koga.
    3. MARKETPLACES: Mercado Livre, Amazon, Shopee (verifique se são vendedores bem avaliados).
    4. Se houver opções locais (na região de ${request.state || request.city}), destaque isso na descrição. Caso contrário, liste grandes e-commerces que entregam em todo o Brasil.

    INSTRUÇÕES DE PESQUISA:
    - Utilize a ferramenta de busca para encontrar URLs reais de produtos (PDP - Product Detail Pages).
    - Priorize peças de marcas conhecidas (Bosch, Cofap, Nakata, Monroe, Moura, etc.) sobre marcas genéricas.
  `;

  // Configuração de Retry
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    vendorName: { type: Type.STRING, description: "Nome da Loja" },
                    productName: { type: Type.STRING, description: "Título Completo do Produto (Inclua marca e aplicação ex: 'Amortecedor Nakata para Onix 2020')" },
                    price: { type: Type.NUMBER, description: "Preço numérico do produto" },
                    currency: { type: Type.STRING, description: "Moeda (ex: BRL)" },
                    description: { type: Type.STRING, description: "Breve descrição técnica e confirmação de compatibilidade (ex: 'Lado direito, ano 2019 a 2023')" },
                    link: { type: Type.STRING, description: "URL direta do produto" }
                  },
                  required: ["vendorName", "productName", "price", "currency", "link"]
                }
              },
              summary: { type: Type.STRING, description: "Resumo executivo de 1 parágrafo explicando as opções encontradas, variação de preços e se houve sucesso em encontrar opções na região solicitada." }
            },
            required: ["quotes", "summary"]
          }
        }
      });

      let text = response.text || "{}";
      text = text.replace(/```json\n?|```/g, "").trim();

      let parsedData: any = {};
      try {
          parsedData = JSON.parse(text);
      } catch (e) {
          console.error("JSON Parse Error. Raw text:", text);
          parsedData = { quotes: [], summary: "Não foi possível estruturar os dados da busca. Tente novamente." };
      }

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const quotes = (parsedData.quotes || []).map((q: any) => ({
          vendorName: q.vendorName || "Loja Desconhecida",
          productName: q.productName || request.partName,
          price: typeof q.price === 'number' ? q.price : parseFloat(q.price) || 0,
          currency: q.currency || "BRL",
          description: q.description || "",
          link: q.link || ""
      }));

      return {
        quotes: quotes,
        summary: parsedData.summary || "Busca finalizada.",
        groundingSources: groundingChunks as GroundingChunk[]
      };

    } catch (error: any) {
      const errorMessage = error.message || "";
      const isQuotaError = errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("ResourceExhausted");

      // Se for erro de cota e ainda tivermos tentativas, aguarda e tenta de novo
      if (isQuotaError && attempt < MAX_RETRIES - 1) {
        attempt++;
        // Backoff: 2s, 4s...
        const delayMs = 2000 * Math.pow(2, attempt - 1);
        console.warn(`Cota excedida. Tentando novamente em ${delayMs/1000}s (Tentativa ${attempt}/${MAX_RETRIES - 1})`);
        await wait(delayMs);
        continue;
      }

      console.error("Gemini API Error Full:", error);
      
      if (errorMessage.includes("API Key") || errorMessage.includes("403")) {
          throw new Error("Erro de Autenticação: Verifique se sua API KEY é válida e está configurada corretamente na Vercel.");
      }

      if (isQuotaError) {
           throw new Error("Muitas requisições simultâneas. O serviço gratuito do Google está congestionado. Aguarde 1 minuto e tente novamente.");
      }
      
      throw new Error(`Erro na busca: ${errorMessage}`);
    }
  }
  
  throw new Error("Falha ao conectar com o serviço após várias tentativas.");
};
