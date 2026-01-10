
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
 * GERA LINKS DE FALLBACK (Último recurso)
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const cleanPart = request.partName.trim();
  const fullTerm = `${cleanPart} ${request.make} ${request.model} ${request.year}`;
  const encodedTerm = encodeURIComponent(fullTerm);

  return [
    {
      vendorName: "Loja do Mecânico",
      productName: `Buscar "${cleanPart}" na Loja do Mecânico`,
      price: 0, 
      currency: "BRL",
      description: "Clique para ver o preço atual no site",
      link: `https://www.lojadomecanico.com.br/busca?q=${encodedTerm}`,
      image: "https://www.lojadomecanico.com.br/imagens/logo-loja-do-mecanico.png"
    },
    {
      vendorName: "Hipervarejo",
      productName: `Buscar "${cleanPart}" na Hipervarejo`,
      price: 0,
      currency: "BRL",
      description: "Clique para ver o preço atual no site",
      link: `https://www.hipervarejo.com.br/busca?q=${encodedTerm}`,
      image: "https://images.tcdn.com.br/img/img_prod/717887/1634925769_logo_hipervarejo.png"
    },
    {
      vendorName: "Jocar",
      productName: `Buscar "${cleanPart}" na Jocar`,
      price: 0,
      currency: "BRL",
      description: "Clique para ver o preço atual no site",
      link: `https://www.jocar.com.br/busca/?q=${encodedTerm}`,
      image: "https://www.jocar.com.br/Imagens/logo-jocar.png"
    },
    {
      vendorName: "Connect Parts",
      productName: `Buscar "${cleanPart}" na Connect Parts`,
      price: 0,
      currency: "BRL",
      description: "Clique para ver o preço atual no site",
      link: `https://www.connectparts.com.br/busca?q=${encodedTerm}`,
      image: "https://www.connectparts.com.br/arquivos/logo-connect-parts.png"
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
      summary: "Modo offline: Acesse diretamente as lojas especializadas.",
      groundingSources: []
    };
  }

  // Prompt MATEMÁTICO e INTELIGENTE
  const prompt = `
  ATUE COMO UM ALGORITMO DE PRECIFICAÇÃO DE AUTOPEÇAS.

  OBJETIVO: Encontrar o PREÇO À VISTA (PIX/Boleto) ou CALCULAR O TOTAL se houver apenas parcelas.

  INPUT:
  - Peça: "${request.partName}"
  - Veículo: "${request.make} ${request.model} ${request.year}"
  - Contexto: Brasil, Lojas de Autopeças Especializadas.

  ALGORITMO DE BUSCA E EXTRAÇÃO:
  1. Use o Google Search para encontrar ofertas em sites como: Loja do Mecânico, Hipervarejo, Jocar, Connect Parts, PneuStore, Autoglass, etc.
  2. IGNORE: Mercado Livre, Shopee, Amazon, AliExpress (Marketplaces genéricos).
  3. LÓGICA DE PREÇO (CRÍTICO):
     - Tente encontrar "R$ 100,00 à vista" e use 100.00.
     - Se encontrar "10x de R$ 30,00", CALCULE: 10 * 30 = 300.00.
     - Se NÃO encontrar o preço, tente encontrar pelo menos o LINK do produto e retorne com price: 0.

  OUTPUT STRICT JSON:
  Retorne um array JSON com as 5 melhores ofertas (menor preço primeiro).
  [
    {
      "vendorName": "Nome da Loja",
      "productName": "Título exato do anúncio",
      "price": 150.50, // Se não achar preço, coloque 0
      "link": "URL direta do produto",
      "image": "URL da imagem",
      "description": "Detalhes breves"
    }
  ]
  `;

  try {
    // Aumentando timeout para 35s
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 35000)
    );

    const aiPromise = genAI.models.generateContent({
      model: "gemini-2.0-flash-exp", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json" 
      }
    });

    const result = await Promise.race([aiPromise, timeoutPromise]) as any;
    
    const jsonText = result.text;
    const aiQuotes = cleanAndParseJSON(jsonText);
    
    // FILTRAGEM
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Loja Especializada",
      productName: q.productName || request.partName,
      price: (typeof q.price === 'number') ? q.price : 0, // Aceita 0
      currency: "BRL",
      description: q.description || "Peça Nova",
      link: q.link,
      image: q.image,
      installments: q.installments
    })).filter((q: QuoteResult) => {
        // Aceita price >= 0, mas exige link válido e fora dos marketplaces proibidos
        return q.price >= 0 && q.link && q.link.startsWith('http') && !q.link.includes('mercadolivre') && !q.link.includes('shopee');
    });

    // Se a IA não retornou NADA válido, usamos o fallback
    if (validQuotes.length === 0) {
        return {
          quotes: generateFallbackLinks(request),
          summary: "A IA não encontrou links diretos. Use as buscas sugeridas abaixo.",
          groundingSources: []
        };
    }

    // Ordenação Inteligente: Menor Preço -> Maior Preço (Zeros no final)
    validQuotes.sort((a: QuoteResult, b: QuoteResult) => {
        if (a.price === 0) return 1;
        if (b.price === 0) return -1;
        return a.price - b.price;
    });

    const lowestPrice = validQuotes.find((q: any) => q.price > 0)?.price;
    const summaryPrice = lowestPrice ? `A partir de R$ ${lowestPrice.toFixed(2)}.` : "Confira os preços nos sites.";

    return {
      quotes: validQuotes,
      summary: `Análise concluída: ${validQuotes.length} ofertas encontradas. ${summaryPrice}`,
      groundingSources: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Erro ou Timeout na busca IA:", error);
    // Em caso de erro, SEMPRE retorna os links de fallback para não deixar o usuário na mão
    return {
      quotes: generateFallbackLinks(request),
      summary: "A busca automática demorou muito. Clique nos links diretos abaixo para ver os preços.",
      groundingSources: []
    };
  }
};
