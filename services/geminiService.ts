
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
      vendorName: "Mercado Livre",
      productName: `Ofertas de ${cleanPart} no Mercado Livre`,
      price: 0, 
      currency: "BRL",
      description: "Maior variedade de peças com entrega rápida",
      link: `https://lista.mercadolivre.com.br/${encodedTerm.replace(/%20/g, '-')}`,
      image: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png"
    },
    {
      vendorName: "Loja do Mecânico",
      productName: `Buscar na Loja do Mecânico`,
      price: 0, 
      currency: "BRL",
      description: "Loja especializada em ferramentas e peças",
      link: `https://www.lojadomecanico.com.br/busca?q=${encodedTerm}`,
      image: "https://www.lojadomecanico.com.br/imagens/logo-loja-do-mecanico.png"
    },
    {
      vendorName: "Google Shopping",
      productName: `Comparar preços no Google`,
      price: 0,
      currency: "BRL",
      description: "Veja todas as opções disponíveis na web",
      link: `https://www.google.com/search?tbm=shop&q=${encodedTerm}`,
      image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
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

  // Prompt Otimizado para MARKETPLACES e PREÇO VISÍVEL
  const prompt = `
  VOCÊ É UM AGENTE DE COMPRAS ESPECIALISTA EM AUTOPEÇAS.
  SUA MISSÃO: ENCONTRAR O PREÇO EXATO DA PEÇA SOLICITADA.

  INPUT:
  - Peça: "${request.partName}"
  - Veículo: "${request.make} ${request.model} ${request.year}"
  - Região: Brasil

  ESTRATÉGIA DE BUSCA:
  1. Busque em grandes sites que SEMPRE mostram preço: Mercado Livre, Amazon Brasil, Shopee, Loja do Mecânico, Connect Parts, Hipervarejo, PneuStore.
  2. PRIORIZE resultados que tenham "R$" ou "Preço" visível no snippet.
  3. EVITE sites institucionais ou catálogos sem botão de compra.

  REGRAS DE EXTRAÇÃO DE PREÇO:
  - Se encontrar "10x de R$ 20,00", O PREÇO É 200.00.
  - Se encontrar "R$ 150,00 à vista", O PREÇO É 150.00.
  - Se encontrar "R$ 100,00 (5% off)", use o valor final.
  - Se tiver dúvida entre dois preços para o mesmo item, use o MENOR.

  OUTPUT (JSON ARRAY STRICT):
  Retorne as 5 melhores ofertas encontradas.
  [
    {
      "vendorName": "Nome da Loja (ex: Mercado Livre, Connect Parts)",
      "productName": "Título completo do anúncio",
      "price": 120.50, // NÚMERO FLOAT. SE NÃO ACHAR, TENTE ESTIMAR COM BASE EM SIMILARES OU USE 0.
      "link": "URL direta do produto",
      "image": "URL da imagem (tente pegar do snippet se possível)",
      "description": "Breve descrição (marca, condição)",
      "installments": "ex: 12x de R$ 10,00"
    }
  ]
  `;

  try {
    // Timeout de 40s para dar tempo da IA processar múltiplas fontes
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 40000)
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
    
    // FILTRAGEM E VALIDAÇÃO
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Fornecedor Online",
      productName: q.productName || request.partName,
      price: (typeof q.price === 'number') ? q.price : 0,
      currency: "BRL",
      description: q.description || "Peça automotiva",
      link: q.link,
      image: q.image,
      installments: q.installments
    })).filter((q: QuoteResult) => {
        // Aceita link válido. Se preço for 0, o front vai tratar, mas a IA deve tentar evitar.
        return q.link && q.link.startsWith('http');
    });

    // Se a IA falhar totalmente
    if (validQuotes.length === 0) {
        return {
          quotes: generateFallbackLinks(request),
          summary: "Não encontramos ofertas diretas com a IA, mas separamos os melhores links de busca para você.",
          groundingSources: []
        };
    }

    // Ordenação: Preço menor primeiro (zeros no final)
    validQuotes.sort((a: QuoteResult, b: QuoteResult) => {
        if (a.price === 0) return 1;
        if (b.price === 0) return -1;
        return a.price - b.price;
    });

    const lowestPrice = validQuotes.find((q: any) => q.price > 0)?.price;
    const summaryPrice = lowestPrice 
      ? `O melhor preço encontrado foi R$ ${lowestPrice.toFixed(2)}.` 
      : "Confira os valores diretamente nos sites parceiros.";

    return {
      quotes: validQuotes,
      summary: `Encontramos ${validQuotes.length} opções disponíveis. ${summaryPrice}`,
      groundingSources: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    return {
      quotes: generateFallbackLinks(request),
      summary: "O sistema de IA está congestionado, mas aqui estão os links diretos para compra.",
      groundingSources: []
    };
  }
};
