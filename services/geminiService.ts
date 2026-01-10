
import { GoogleGenAI } from "@google/genai";
import { QuoteRequest, SearchResponse, QuoteResult } from "../types";

// Inicializa a IA apenas se houver chave.
const genAI = process.env.API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.API_KEY }) 
  : null;

/**
 * Limpa a string JSON retornada pela IA
 */
const cleanAndParseJSON = (text: string): any => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Erro ao fazer parse do JSON da IA:", e);
    throw new Error("Formato de resposta inválido da IA");
  }
};

/**
 * GERA LINKS DE BACKUP (Estilo Buscapé)
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const cleanPart = request.partName.trim();
  const fullTerm = `${cleanPart} ${request.make} ${request.model} ${request.year}`;
  const encodedTerm = encodeURIComponent(fullTerm);

  return [
    {
      vendorName: "Mercado Livre",
      productName: `Ofertas: ${cleanPart}`,
      price: 0, 
      currency: "BRL",
      description: "Envio rápido e compra garantida.",
      link: `https://lista.mercadolivre.com.br/pecas/${request.partName.replace(/\s+/g, '-')}-${request.make}-${request.model}-${request.year}_OrderId_PRICE_ASC`,
      image: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png"
    },
    {
      vendorName: "Magalu",
      productName: `Busca Magazine Luiza`,
      price: 0,
      currency: "BRL",
      description: "Retire na loja ou receba em casa.",
      link: `https://www.magazineluiza.com.br/busca/${encodedTerm}/`,
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Magalu_Logo.png/800px-Magalu_Logo.png"
    },
    {
      vendorName: "Amazon",
      productName: `Amazon Peças`,
      price: 0,
      currency: "BRL",
      description: "Frete grátis para assinantes Prime.",
      link: `https://www.amazon.com.br/s?k=${encodedTerm}&i=automotive`,
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png"
    }
  ];
};

/**
 * FUNÇÃO PRINCIPAL DE BUSCA
 */
export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  if (!genAI) {
    return {
      quotes: generateFallbackLinks(request),
      summary: "Modo offline: Comparadores diretos.",
      groundingSources: []
    };
  }

  // Prompt estilo "Buscapé"
  const prompt = `
  Atue como um motor de comparação de preços (como Buscapé ou Zoom).
  PRODUTO: "${request.partName}"
  VEÍCULO: "${request.make} ${request.model} ${request.year}"
  
  TAREFA:
  1. Pesquise no Google Shopping e grandes varejistas (Mercado Livre, Magalu, Casas Bahia, Americanas, Amazon, PneuStore, Loja do Mecânico).
  2. Encontre 4 a 6 ofertas específicas deste produto.
  3. Extraia o preço à vista, informações de parcelamento e, SE POSSÍVEL, um link direto para a IMAGEM do produto.
  
  SAÍDA OBRIGATÓRIA (JSON Array):
  [
    {
      "vendorName": "Nome da Loja (ex: Magalu, Mercado Livre)",
      "productName": "Título completo do anúncio",
      "price": 120.50, (Preço à vista numérico)
      "link": "URL da oferta",
      "image": "URL da imagem principal do produto (tente encontrar uma jpg/png válida, se não achar deixe vazio)",
      "installments": "ex: 10x de R$ 12,05 sem juros",
      "description": "Frete grátis ou condição especial (opcional)"
    }
  ]
  `;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout IA")), 16000)
    );

    const aiPromise = genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json" 
      }
    });

    const result = await Promise.race([aiPromise, timeoutPromise]) as any;
    
    const jsonText = result.text;
    const aiQuotes = cleanAndParseJSON(jsonText);
    
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Loja Parceira",
      productName: q.productName || request.partName,
      price: (typeof q.price === 'number' && q.price > 0) ? q.price : 0,
      currency: "BRL",
      description: q.description || "Oferta Buscapé",
      link: q.link,
      image: q.image, // URL da imagem
      installments: q.installments || "Consulte parcelamento"
    })).filter((q: QuoteResult) => q.link);

    if (validQuotes.length === 0) throw new Error("Sem ofertas");

    // Ordenar por preço
    validQuotes.sort((a: QuoteResult, b: QuoteResult) => {
        if (a.price > 0 && b.price > 0) return a.price - b.price;
        return 0;
    });

    return {
      quotes: validQuotes,
      summary: `Comparação de preços concluída.`,
      groundingSources: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    return {
      quotes: generateFallbackLinks(request),
      summary: "Não foi possível carregar os preços em tempo real. Veja nos parceiros:",
      groundingSources: []
    };
  }
};
