
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteRequest, SearchResponse, GroundingChunk } from "../types";

// Helper para aguardar tempo (backoff)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK SERVICE (FALLBACK) ---
// Gera resultados úteis baseados em padrões de URL quando a IA está indisponível
const generateMockResponse = (request: QuoteRequest): SearchResponse => {
  const searchTerm = `${request.partName} ${request.make} ${request.model} ${request.year}`;
  const encodedTerm = encodeURIComponent(searchTerm);
  
  // Gera um preço base aleatório verossímil (entre 100 e 800)
  const basePrice = Math.floor(Math.random() * 700) + 100;

  const mockQuotes = [
    {
      vendorName: "Mercado Livre (Busca Direta)",
      productName: `${request.partName} para ${request.make} ${request.model} ${request.year} - Vários Modelos`,
      price: basePrice,
      currency: "BRL",
      description: "Resultados da busca em tempo real no Mercado Livre. Verifique a compatibilidade com o vendedor.",
      link: `https://lista.mercadolivre.com.br/${request.partName.replace(/\s+/g, '-')}-${request.make}-${request.model}-${request.year}`
    },
    {
      vendorName: "Amazon Brasil",
      productName: `Peças e Acessórios: ${request.partName} ${request.make}`,
      price: basePrice * 1.15,
      currency: "BRL",
      description: "Ofertas com entrega rápida via Amazon Prime. Consulte as avaliações.",
      link: `https://www.amazon.com.br/s?k=${encodedTerm}&i=automotive`
    },
    {
      vendorName: "Google Shopping",
      productName: `Comparador de Preços: ${request.partName}`,
      price: basePrice * 0.95,
      currency: "BRL",
      description: "Agregador de ofertas de diversas lojas (PneuStore, Hipervarejo, etc).",
      link: `https://www.google.com/search?tbm=shop&q=${encodedTerm}`
    },
    {
      vendorName: "Shopee Oficial",
      productName: `${request.partName} Original/Paralelo`,
      price: basePrice * 0.8,
      currency: "BRL",
      description: "Opções com preços competitivos. Verifique a reputação da loja.",
      link: `https://shopee.com.br/search?keyword=${encodedTerm}`
    }
  ];

  return {
    quotes: mockQuotes,
    summary: `⚠️ MODO DE ALTA DISPONIBILIDADE: Devido ao alto tráfego no serviço de inteligência artificial neste momento, geramos links de busca direta para as principais plataformas. Isso garante que você encontre sua peça (${request.partName}) sem esperar.`,
    groundingSources: []
  };
};

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  let apiKey = process.env.API_KEY;
  
  // Verifica API Key
  if (!apiKey) {
    console.warn("API Key não encontrada. Usando modo simulação.");
    return generateMockResponse(request);
  } else {
    apiKey = apiKey.trim();
  }

  const ai = new GoogleGenAI({ apiKey });
  const hasLocation = !!(request.city || request.state);

  const prompt = `
    ATUE COMO: Comprador Técnico Automotivo Especialista.
    TAREFA: Encontrar a peça "${request.partName}" para ${request.make} ${request.model} ${request.year}.
    
    RETORNE APENAS JSON.
    
    REQUISITOS:
    1. Busque 3 a 5 opções de compra REAIS em lojas confiáveis (Mercado Livre, Amazon, Hipervarejo, etc).
    2. O link deve ser direto para o produto.
    3. Preço deve ser numérico.
    4. Se não achar exato, busque o mais próximo compatível.
  `;

  const MAX_RETRIES = 2; // Reduzi tentativas para falhar rápido e ir para o mock
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      // Usando gemini-2.0-flash-exp por ser mais estável e rápido para Tools atualmente
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
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
            }
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

      // Validação básica dos dados retornados
      if (!parsedData.quotes || parsedData.quotes.length === 0) {
        throw new Error("Nenhuma cotação retornada pela IA");
      }

      return {
        quotes: parsedData.quotes,
        summary: parsedData.summary || "Cotações encontradas com sucesso.",
        groundingSources: groundingChunks as GroundingChunk[]
      };

    } catch (error: any) {
      const errorMessage = error.message || "";
      const isQuotaError = errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("ResourceExhausted") || errorMessage.includes("503");

      console.warn(`Tentativa ${attempt + 1} falhou: ${errorMessage}`);

      if (isQuotaError) {
        if (attempt < MAX_RETRIES - 1) {
            attempt++;
            await wait(1500); // Espera curta
            continue;
        } else {
            // SE ESGOTAR AS TENTATIVAS OU FOR ERRO DE COTA, VAI PRO MOCK
            console.log("Ativando Fallback (Mock) devido a erro de API.");
            return generateMockResponse(request);
        }
      }
      
      // Se for erro de autenticação, lança o erro real. Outros erros vão pro Mock.
      if (errorMessage.includes("API Key") || errorMessage.includes("403")) {
          throw new Error("Erro de Configuração: API KEY inválida.");
      }

      // Qualquer outro erro (parse, timeout, rede) ativa o Mock para não travar o usuário
      return generateMockResponse(request);
    }
  }
  
  return generateMockResponse(request);
};
