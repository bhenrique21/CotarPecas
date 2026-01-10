
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteRequest, SearchResponse, GroundingChunk, QuoteResult } from "../types";

// Helper para aguardar tempo (backoff)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gera links manuais de busca caso a IA falhe.
 * Isso garante que o usuário nunca fique sem resposta.
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const term = `${request.partName} ${request.make} ${request.model} ${request.year}`;
  const encodedTerm = encodeURIComponent(term);
  const encodedPart = encodeURIComponent(request.partName);

  return [
    {
      vendorName: "Mercado Livre",
      productName: `Ofertas no Mercado Livre: ${request.partName}`,
      price: 0, // Indica que o preço deve ser consultado
      currency: "BRL",
      description: "Maior variedade de peças com entrega rápida e compra garantida.",
      link: `https://lista.mercadolivre.com.br/${encodedTerm.replace(/%20/g, '-')}`
    },
    {
      vendorName: "Loja do Mecânico",
      productName: `Busca na Loja do Mecânico`,
      price: 0,
      currency: "BRL",
      description: "Maior loja de máquinas e ferramentas da América Latina.",
      link: `https://www.lojadomecanico.com.br/busca?q=${encodedTerm}`
    },
    {
      vendorName: "Google Shopping",
      productName: `Comparar preços no Google`,
      price: 0,
      currency: "BRL",
      description: "Veja todas as opções disponíveis na web para sua peça.",
      link: `https://www.google.com/search?tbm=shop&q=${encodedTerm}`
    },
    {
      vendorName: "Connect Parts",
      productName: `Busca na Connect Parts`,
      price: 0,
      currency: "BRL",
      description: "Especialista em acessórios e som automotivo.",
      link: `https://www.connectparts.com.br/busca?q=${encodedTerm}`
    }
  ];
};

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  let apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("GeminiService: API Key está undefined ou vazia.");
  } else {
    apiKey = apiKey.trim();
  }
  
  // Se não tiver chave, retorna fallback imediatamente sem erro
  if (!apiKey) {
    return {
      quotes: generateFallbackLinks(request),
      summary: "Modo offline: Chave de API não configurada. Veja os links diretos abaixo.",
      groundingSources: []
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const hasLocation = !!(request.city || request.state);

  const prompt = `
    Você é um COMPRADOR TÉCNICO AUTOMOTIVO SÊNIOR.
    
    DADOS DO PEDIDO:
    Veículo: ${request.make} ${request.model} ${request.year} (${request.vehicleType})
    Peça: "${request.partName}"
    Localização: ${hasLocation ? (request.city ? request.city + ' - ' : '') + (request.state || '') : 'Brasil'}

    OBJETIVO:
    Listar 4 a 5 opções de compra ONLINE para esta peça exata.

    REGRAS:
    1. Tente encontrar o preço exato. Se achar "10x de 30,00", o preço é 300.00.
    2. Se não encontrar o preço exato, mas encontrar o produto, coloque o preço como 0 (zero).
    3. O Link DEVE levar ao produto ou à busca dele.
    
    Priorize lojas: Mercado Livre, Loja do Mecânico, Hipervarejo, PneuStore, Autoglass.
  `;

  const MAX_RETRIES = 2; // Reduzido para ser mais rápido no fallback
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
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
                    vendorName: { type: Type.STRING },
                    productName: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    currency: { type: Type.STRING },
                    description: { type: Type.STRING },
                    link: { type: Type.STRING }
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

      let text = response.text || "{}";
      text = text.replace(/```json\n?|```/g, "").trim();
      let parsedData: any = {};
      
      try {
          parsedData = JSON.parse(text);
      } catch (e) {
          throw new Error("Falha no parse do JSON");
      }

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // Filtra e valida
      let quotes = (parsedData.quotes || []).map((q: any) => ({
          vendorName: q.vendorName || "Loja Online",
          productName: q.productName || request.partName,
          price: typeof q.price === 'number' ? q.price : 0,
          currency: q.currency || "BRL",
          description: q.description || "",
          link: q.link || ""
      }));

      // Se a IA retornou lista vazia, forçamos o erro para cair no fallback
      if (quotes.length === 0) {
        throw new Error("IA não encontrou resultados");
      }

      return {
        quotes: quotes,
        summary: parsedData.summary || "Opções encontradas.",
        groundingSources: groundingChunks as GroundingChunk[]
      };

    } catch (error: any) {
      const errorMessage = error.message || "";
      const isQuotaError = errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("ResourceExhausted") || errorMessage.includes("503");

      if (attempt < MAX_RETRIES) {
        attempt++;
        const delayMs = 1500 * attempt; // Backoff rápido
        await wait(delayMs);
        continue;
      }
      
      // SE FALHAR APÓS TENTATIVAS (OU COTA EXCEDIDA), RETORNA FALLBACK
      console.warn("Retornando fallback devido a erro na IA:", errorMessage);
      
      return {
        quotes: generateFallbackLinks(request),
        summary: "Devido ao alto volume de buscas, nossa IA está congestionada. Selecionamos abaixo os links diretos para você consultar o preço em tempo real nas melhores lojas.",
        groundingSources: []
      };
    }
  }
  
  // Fallback final de segurança
  return {
      quotes: generateFallbackLinks(request),
      summary: "Serviço momentaneamente indisponível. Utilize os links diretos abaixo.",
      groundingSources: []
  };
};
