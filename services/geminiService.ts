
import { GoogleGenAI } from "@google/genai";
import { QuoteRequest, SearchResponse, QuoteResult } from "../types";

// Inicializa a IA apenas se houver chave.
const genAI = process.env.API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.API_KEY }) 
  : null;

/**
 * Limpa a string JSON retornada pela IA (remove markdown ```json ... ```)
 */
const cleanAndParseJSON = (text: string): any => {
  try {
    // Remove marcadores de código markdown se existirem
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Erro ao fazer parse do JSON da IA:", e);
    throw new Error("Formato de resposta inválido da IA");
  }
};

/**
 * GERA LINKS DE BACKUP (FALLBACK)
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const cleanPart = request.partName.trim();
  const fullTerm = `${cleanPart} ${request.make} ${request.model} ${request.year}`;
  const encodedFullTerm = encodeURIComponent(fullTerm);

  return [
    {
      vendorName: "Mercado Livre",
      productName: `Verificar Preço: ${cleanPart}`,
      price: 0, 
      currency: "BRL",
      description: "Clique para ver as ofertas disponíveis agora.",
      link: `https://lista.mercadolivre.com.br/pecas/${request.partName.replace(/\s+/g, '-')}-${request.make}-${request.model}-${request.year}_OrderId_PRICE_ASC`
    },
    {
      vendorName: "Google Shopping",
      productName: `Comparar Preços`,
      price: 0,
      currency: "BRL",
      description: "Veja comparativo de preços em várias lojas.",
      link: `https://www.google.com/search?tbm=shop&q=${encodedFullTerm}&tbs=p_ord:p`
    },
    {
      vendorName: "Amazon",
      productName: `Amazon Auto`,
      price: 0,
      currency: "BRL",
      description: "Peças com entrega rápida.",
      link: `https://www.amazon.com.br/s?k=${encodedFullTerm}&i=automotive&s=price-asc-rank`
    },
    {
      vendorName: "Shopee",
      productName: `Shopee Ofertas`,
      price: 0,
      currency: "BRL",
      description: "Busca por menor preço na Shopee.",
      link: `https://shopee.com.br/search?keyword=${encodedFullTerm}&order=asc&sortBy=price`
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
      summary: "Modo offline: Links de busca gerados.",
      groundingSources: []
    };
  }

  // Prompt focado em extração de dados reais
  const prompt = `
  Você é um assistente de compras especializado em autopeças.
  OBJETIVO: Pesquisar no Google Shopping e lojas confiáveis o preço REAL e ATUAL da peça:
  Produto: "${request.partName}"
  Veículo: "${request.make} ${request.model} ${request.year}"
  
  REGRAS:
  1. Use a ferramenta de busca para encontrar ofertas reais.
  2. Extraia o preço numérico. Se encontrar "R$ 150,00", retorne 150.00.
  3. Se não encontrar o preço exato, mas achar o produto, retorne 0 no preço.
  4. Priorize lojas como: Mercado Livre, Amazon, Loja do Mecânico, PneuStore, Americanas, Magalu.
  5. Retorne 4 a 6 resultados.
  
  FORMATO DE SAÍDA (JSON Puro):
  [
    {
      "vendorName": "Nome da Loja",
      "productName": "Título exato do produto no anúncio",
      "price": 120.50,
      "link": "Link direto para a oferta",
      "description": "Breve detalhe (ex: Marca da peça, condição)"
    }
  ]
  `;

  try {
    // 2. Timeout aumentado para 12 segundos (Busca real leva tempo)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout IA")), 12000)
    );

    // 3. Chama o Gemini 1.5 Flash com Google Search
    const aiPromise = genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json" 
      }
    });

    const result = await Promise.race([aiPromise, timeoutPromise]) as any;
    
    // 4. Processa a resposta
    const jsonText = result.text;
    const aiQuotes = cleanAndParseJSON(jsonText);
    
    // Validação e normalização
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Loja Online",
      productName: q.productName || request.partName,
      price: (typeof q.price === 'number' && q.price > 0) ? q.price : 0,
      currency: "BRL",
      description: q.description || `Peça compatível com ${request.model}`,
      link: q.link
    })).filter((q: QuoteResult) => q.link); // Garante que tem link

    // Se a IA não retornou nada útil
    if (validQuotes.length === 0) throw new Error("IA não encontrou resultados válidos");

    // Adiciona links genéricos no final caso a IA traga poucos resultados (< 3)
    let finalQuotes = validQuotes;
    if (finalQuotes.length < 3) {
        const backups = generateFallbackLinks(request);
        finalQuotes = [...finalQuotes, ...backups.slice(0, 3)];
    }

    const groundingMetadata = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      quotes: finalQuotes,
      summary: `Encontramos ${validQuotes.length} ofertas com preços reais.`,
      groundingSources: groundingMetadata
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    // Fallback silencioso
    return {
      quotes: generateFallbackLinks(request),
      summary: "Não foi possível recuperar os preços exatos no momento. Exibindo links diretos.",
      groundingSources: []
    };
  }
};
