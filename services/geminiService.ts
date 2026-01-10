
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
 * GERA LINKS DE BACKUP (FALLBACK) - Focado em Lojas Especializadas
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const cleanPart = request.partName.trim();
  const fullTerm = `${cleanPart} ${request.make} ${request.model} ${request.year}`;
  const encodedTerm = encodeURIComponent(fullTerm);
  const encodedPart = encodeURIComponent(cleanPart);

  return [
    {
      vendorName: "Loja do Mecânico",
      productName: `Busca: ${cleanPart}`,
      price: 0, 
      currency: "BRL",
      description: "Maior loja de ferramentas e peças do Brasil.",
      link: `https://www.lojadomecanico.com.br/busca?q=${encodedTerm}`
    },
    {
      vendorName: "Hipervarejo",
      productName: `Peças para ${request.model}`,
      price: 0,
      currency: "BRL",
      description: "Especialista em peças automotivas.",
      link: `https://www.hipervarejo.com.br/busca?q=${encodedTerm}`
    },
    {
      vendorName: "Jocar",
      productName: `Ofertas Jocar`,
      price: 0,
      currency: "BRL",
      description: "Autopeças e acessórios online.",
      link: `https://www.jocar.com.br/busca/?q=${encodedTerm}`
    },
    {
      vendorName: "PneuStore",
      productName: `PneuStore Busca`,
      price: 0,
      currency: "BRL",
      description: "Se for pneu ou item de roda.",
      link: `https://www.pneustore.com.br/busca?q=${encodedTerm}`
    },
    {
      vendorName: "Canal da Peça",
      productName: `Catálogo Canal da Peça`,
      price: 0,
      currency: "BRL",
      description: "Marketplace especializado em autopeças.",
      link: `https://www.canaldapeca.com.br/busca?q=${encodedTerm}`
    }
  ];
};

/**
 * FUNÇÃO PRINCIPAL DE BUSCA
 */
export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  if (!genAI) {
    console.warn("API Key não encontrada. Usando modo offline/fallback.");
    return {
      quotes: generateFallbackLinks(request),
      summary: "Modo offline: Buscas em lojas especializadas.",
      groundingSources: []
    };
  }

  // Prompt agressivo para ignorar marketplaces genéricos e focar em especialistas
  const prompt = `
  Você é um comprador profissional de autopeças.
  OBJETIVO: Encontrar o MENOR PREÇO REAL para a peça: "${request.partName}"
  Veículo: "${request.make} ${request.model} ${request.year}"
  
  DIRETRIZES ESTRITAS:
  1. PRIORIZE LOJAS ESPECIALIZADAS e CONFIÁVEIS: Loja do Mecânico, Hipervarejo, Jocar, PneuStore, Autoglass, Connect Parts, Canal da Peça, KD Pneus.
  2. EVITE Marketplaces Genéricos (Mercado Livre, Shopee, Amazon, AliExpress) a menos que o preço seja drasticamente menor (50% menos) ou não haja estoque em outro lugar.
  3. Você deve entrar nos sites (via search tool) e extrair o PREÇO À VISTA atual.
  4. Ignore peças usadas/desmanche, busque peças novas.
  
  SAÍDA OBRIGATÓRIA (JSON Array):
  [
    {
      "vendorName": "Nome da Loja Especializada",
      "productName": "Nome exato da peça no site",
      "price": 120.50, (Número float puro)
      "link": "URL direta do produto",
      "description": "Marca da peça (ex: Bosch, Cofap)"
    }
  ]
  `;

  try {
    // Timeout de 15s para dar tempo de navegar em sites específicos
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout IA")), 15000)
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
    
    // Validação
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Loja Especializada",
      productName: q.productName || request.partName,
      price: (typeof q.price === 'number' && q.price > 0) ? q.price : 0,
      currency: "BRL",
      description: q.description || "Peça Nova",
      link: q.link
    })).filter((q: QuoteResult) => q.link);

    if (validQuotes.length === 0) throw new Error("Sem resultados exatos");

    // Ordena por preço (menor para maior)
    validQuotes.sort((a: QuoteResult, b: QuoteResult) => {
        if (a.price > 0 && b.price > 0) return a.price - b.price;
        return 0;
    });

    // Se tiver menos de 3 resultados, completa com busca direta em lojas especializadas
    let finalQuotes = validQuotes;
    if (finalQuotes.length < 3) {
        const backups = generateFallbackLinks(request);
        finalQuotes = [...finalQuotes, ...backups.slice(0, 3)];
    }

    const groundingMetadata = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      quotes: finalQuotes,
      summary: `Encontramos ofertas em lojas especializadas.`,
      groundingSources: groundingMetadata
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    return {
      quotes: generateFallbackLinks(request),
      summary: "Não foi possível verificar o preço exato. Acesse as lojas especializadas abaixo:",
      groundingSources: []
    };
  }
};
