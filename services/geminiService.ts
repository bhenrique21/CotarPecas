
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
      productName: `Verificar preço na Loja do Mecânico`,
      price: 0, 
      currency: "BRL",
      description: "Clique para ver o preço atual no site",
      link: `https://www.lojadomecanico.com.br/busca?q=${encodedTerm}`,
      image: "https://www.lojadomecanico.com.br/imagens/logo-loja-do-mecanico.png"
    },
    {
      vendorName: "Hipervarejo",
      productName: `Verificar preço na Hipervarejo`,
      price: 0,
      currency: "BRL",
      description: "Clique para ver o preço atual no site",
      link: `https://www.hipervarejo.com.br/busca?q=${encodedTerm}`,
      image: "https://images.tcdn.com.br/img/img_prod/717887/1634925769_logo_hipervarejo.png"
    },
    {
      vendorName: "Jocar",
      productName: `Verificar preço na Jocar`,
      price: 0,
      currency: "BRL",
      description: "Clique para ver o preço atual no site",
      link: `https://www.jocar.com.br/busca/?q=${encodedTerm}`,
      image: "https://www.jocar.com.br/Imagens/logo-jocar.png"
    },
    {
      vendorName: "Connect Parts",
      productName: `Verificar preço na Connect Parts`,
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
     - Se encontrar "R$ 100,00 à vista", use 100.00.
     - Se encontrar "10x de R$ 30,00", CALCULE: 10 * 30 = 300.00.
     - Se encontrar "R$ 200,00 (sem estoque)", IGNORE.
     - O preço DEVE ser numérico e maior que zero.

  OUTPUT STRICT JSON:
  Retorne um array JSON com as 5 melhores ofertas (menor preço primeiro).
  [
    {
      "vendorName": "Nome da Loja",
      "productName": "Título exato do anúncio",
      "price": 150.50, // FLOAT OBRIGATÓRIO. NÃO USE STRINGS.
      "link": "URL direta do produto",
      "image": "URL da imagem (tente encontrar uma URL válida de jpg/png)",
      "description": "Marca X, Modelo Y (Detalhes técnicos breves)"
    }
  ]
  `;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Tempo limite excedido na busca de preços.")), 30000)
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
    
    // FILTRAGEM RIGOROSA DE INTEGRIDADE
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Loja Especializada",
      productName: q.productName || request.partName,
      price: (typeof q.price === 'number' && q.price > 0) ? q.price : 0,
      currency: "BRL",
      description: q.description || "Peça Nova",
      link: q.link,
      image: q.image,
      installments: q.installments
    })).filter((q: QuoteResult) => {
        // Regra de Ouro: Só passa se tiver preço real E link válido
        return q.price > 0 && q.link && q.link.startsWith('http') && !q.link.includes('mercadolivre') && !q.link.includes('shopee');
    });

    // Ordenação Inteligente: Menor Preço -> Maior Preço
    validQuotes.sort((a: QuoteResult, b: QuoteResult) => a.price - b.price);

    // Se falhar, lança erro para cair no tratamento visual de erro, em vez de mostrar lista vazia
    if (validQuotes.length === 0) {
        throw new Error("A IA não conseguiu validar os preços finais nos sites parceiros.");
    }

    return {
      quotes: validQuotes,
      summary: `Análise concluída: ${validQuotes.length} ofertas validadas. Melhor preço: R$ ${validQuotes[0].price.toFixed(2)}.`,
      groundingSources: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    return {
      quotes: generateFallbackLinks(request),
      summary: "Não foi possível confirmar o preço exato. Verifique os links abaixo.",
      groundingSources: []
    };
  }
};
