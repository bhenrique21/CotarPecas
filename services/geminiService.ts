
import { GoogleGenAI } from "@google/genai";
import { QuoteRequest, SearchResponse, QuoteResult } from "../types";

// Inicializa a IA apenas se houver chave.
// O modelo 'gemini-1.5-flash' é escolhido especificamente por ser RÁPIDO e ECONÔMICO.
const genAI = process.env.API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.API_KEY }) 
  : null;

/**
 * GERA LINKS DE BACKUP (FALLBACK)
 * Usado se a IA falhar ou demorar.
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const cleanPart = request.partName.trim();
  const fullTerm = `${cleanPart} ${request.make} ${request.model} ${request.year}`;
  const encodedFullTerm = encodeURIComponent(fullTerm);

  return [
    {
      vendorName: "Mercado Livre",
      productName: `Ofertas: ${cleanPart}`,
      price: 0, 
      currency: "BRL",
      description: "Melhores ofertas classificadas por preço.",
      link: `https://lista.mercadolivre.com.br/pecas/${request.partName.replace(/\s+/g, '-')}-${request.make}-${request.model}-${request.year}_OrderId_PRICE_ASC`
    },
    {
      vendorName: "Google Shopping",
      productName: `Comparador Google`,
      price: 0,
      currency: "BRL",
      description: "Comparativo em múltiplas lojas.",
      link: `https://www.google.com/search?tbm=shop&q=${encodedFullTerm}&tbs=p_ord:p`
    },
    {
      vendorName: "Amazon",
      productName: `Amazon Peças`,
      price: 0,
      currency: "BRL",
      description: "Entrega rápida e garantia A-Z.",
      link: `https://www.amazon.com.br/s?k=${encodedFullTerm}&i=automotive&s=price-asc-rank`
    },
    {
      vendorName: "Shopee",
      productName: `Busca Shopee`,
      price: 0,
      currency: "BRL",
      description: "Preços competitivos.",
      link: `https://shopee.com.br/search?keyword=${encodedFullTerm}&order=asc&sortBy=price`
    },
    {
      vendorName: "Magalu",
      productName: `Magazine Luiza`,
      price: 0,
      currency: "BRL",
      description: "Lojas parceiras Magalu.",
      link: `https://www.magazineluiza.com.br/busca/${fullTerm}/`
    }
  ];
};

/**
 * FUNÇÃO PRINCIPAL DE BUSCA
 */
export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  // 1. Se não tiver chave de API, vai direto para o método robusto (links diretos)
  if (!genAI) {
    console.warn("API Key não encontrada. Usando modo offline/fallback.");
    return {
      quotes: generateFallbackLinks(request),
      summary: "Modo offline: Links diretos gerados.",
      groundingSources: []
    };
  }

  const prompt = `
  Contexto: Você é um buscador de preços de peças automotivas.
  Tarefa: Encontre 4 ofertas reais da peça "${request.partName}" para o veículo "${request.make} ${request.model} ${request.year}".
  Prioridade: MENOR PREÇO e Lojas Confiáveis (Mercado Livre, Amazon, Loja do Mecânico, PneuStore, etc).
  
  Retorne APENAS um JSON (sem markdown) seguindo estritamente este formato:
  [
    {
      "vendorName": "Nome da Loja",
      "productName": "Título exato do anúncio",
      "price": 120.50, (Número puro, use 0 se não encontrar preço exato)
      "link": "URL direta do produto"
    }
  ]
  `;

  try {
    // 2. Define um Timeout de 5 segundos. Se a IA enrolar, abortamos e usamos links diretos.
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout IA")), 5000)
    );

    // 3. Chama o Gemini 1.5 Flash com ferramenta de busca (Google Search)
    const aiPromise = genAI.models.generateContent({
      model: "gemini-1.5-flash", // Modelo mais rápido e barato
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Ativa busca na web real
        responseMimeType: "application/json" // Força resposta JSON limpa
      }
    });

    // Corrida: Quem responder primeiro ganha (IA ou Timeout)
    const result = await Promise.race([aiPromise, timeoutPromise]) as any;
    
    // 4. Processa a resposta da IA
    const jsonText = result.text;
    const aiQuotes = JSON.parse(jsonText);
    
    // Validação básica dos dados recebidos
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Loja Online",
      productName: q.productName || request.partName,
      price: typeof q.price === 'number' ? q.price : 0,
      currency: "BRL",
      description: `Oferta encontrada via IA para ${request.model}`,
      link: q.link // A IA deve retornar o link via Grounding
    }));

    // Se a IA devolveu uma lista vazia ou inútil, lança erro para cair no fallback
    if (validQuotes.length === 0) throw new Error("IA não encontrou resultados");

    // Adiciona 2 links de busca genérica ao final caso a IA tenha achado poucos itens
    const backups = generateFallbackLinks(request).slice(0, 2);
    
    // Captura metadados de fontes (se houver) para transparência
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      quotes: [...validQuotes, ...backups],
      summary: "Preços encontrados em tempo real.",
      groundingSources: groundingMetadata
    };

  } catch (error) {
    console.error("Erro na busca IA ou Timeout:", error);
    // 5. Fallback seguro: Retorna links de busca direta
    return {
      quotes: generateFallbackLinks(request),
      summary: "IA indisponível no momento. Exibindo links de busca direta.",
      groundingSources: []
    };
  }
};
