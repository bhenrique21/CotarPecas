
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
 * GERA LINKS DE BACKUP (Focado em Lojas de Autopeças)
 * Usado quando a IA falha ou não tem API Key
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const cleanPart = request.partName.trim();
  const fullTerm = `${cleanPart} ${request.make} ${request.model} ${request.year}`;
  const encodedTerm = encodeURIComponent(fullTerm);
  const encodedPart = encodeURIComponent(cleanPart);

  return [
    {
      vendorName: "Loja do Mecânico",
      productName: `Buscar na Loja do Mecânico: ${cleanPart}`,
      price: 0, 
      currency: "BRL",
      description: "A maior loja de máquinas e ferramentas.",
      link: `https://www.lojadomecanico.com.br/busca?q=${encodedTerm}`,
      image: "https://www.lojadomecanico.com.br/imagens/logo-loja-do-mecanico.png"
    },
    {
      vendorName: "Hipervarejo",
      productName: `Peças para ${request.model} na Hipervarejo`,
      price: 0,
      currency: "BRL",
      description: "Especialista em peças e pneus.",
      link: `https://www.hipervarejo.com.br/busca?q=${encodedTerm}`,
      image: "https://images.tcdn.com.br/img/img_prod/717887/1634925769_logo_hipervarejo.png"
    },
    {
      vendorName: "Jocar",
      productName: `Ofertas na Jocar`,
      price: 0,
      currency: "BRL",
      description: "Autopeças online tradicional.",
      link: `https://www.jocar.com.br/busca/?q=${encodedTerm}`,
      image: "https://www.jocar.com.br/Imagens/logo-jocar.png"
    },
    {
      vendorName: "PneuStore",
      productName: `Busca PneuStore`,
      price: 0,
      currency: "BRL",
      description: "Líder em pneus e rodas.",
      link: `https://www.pneustore.com.br/busca?q=${encodedTerm}`,
      image: "https://static.pneustore.com.br/pneustore-logo.png"
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

  // Prompt Focado em Produto Específico e Lojas Especializadas
  const prompt = `
  Você é um especialista em compras de autopeças.
  OBJETIVO: Encontrar o MENOR PREÇO REAL e o LINK DIRETO DO PRODUTO.
  
  PEÇA: "${request.partName}"
  VEÍCULO: "${request.make} ${request.model} ${request.year}"
  
  REGRAS RÍGIDAS DE BUSCA:
  1. PRIORIDADE TOTAL para Lojas Especializadas: Loja do Mecânico, Hipervarejo, Jocar, PneuStore, Connect Parts, Autoglass, KD Pneus, Della Via.
  2. EVITE Marketplaces Genéricos (Shopee, AliExpress, Mercado Livre, Amazon) a menos que seja uma Loja Oficial da marca dentro deles.
  3. O link DEVE ser para a página do produto específico, não para uma página de busca.
  4. Extraia o preço à vista.
  
  SAÍDA OBRIGATÓRIA (JSON Array):
  [
    {
      "vendorName": "Nome da Loja (ex: Loja do Mecânico)",
      "productName": "Nome exato da peça no site",
      "price": 120.50, (Número float puro)
      "link": "URL DIRETA da página do produto",
      "image": "URL da imagem principal do produto",
      "installments": "ex: 10x de R$ 12,05",
      "description": "Marca da peça (ex: Bosch, Cofap, Nakata)"
    }
  ]
  `;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("A busca demorou muito. Tente novamente.")), 20000)
    );

    const aiPromise = genAI.models.generateContent({
      model: "gemini-2.0-flash-exp", // Modelo mais rápido e capaz de web grounding
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json" 
      }
    });

    const result = await Promise.race([aiPromise, timeoutPromise]) as any;
    
    const jsonText = result.text;
    const aiQuotes = cleanAndParseJSON(jsonText);
    
    // Filtragem e Validação
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Loja Especializada",
      productName: q.productName || request.partName,
      price: (typeof q.price === 'number' && q.price > 0) ? q.price : 0,
      currency: "BRL",
      description: q.description || "Peça Nova",
      link: q.link,
      image: q.image,
      installments: q.installments
    })).filter((q: QuoteResult) => q.link && q.link.startsWith('http'));

    if (validQuotes.length === 0) throw new Error("Nenhum produto específico encontrado.");

    // Ordenar estritamente pelo menor preço
    validQuotes.sort((a: QuoteResult, b: QuoteResult) => {
        if (a.price > 0 && b.price > 0) return a.price - b.price;
        return 0;
    });

    // Se tiver poucos resultados, completa com links de busca direta nas lojas especializadas
    let finalQuotes = validQuotes;
    if (finalQuotes.length < 3) {
        const backups = generateFallbackLinks(request);
        // Adiciona backups no final
        finalQuotes = [...finalQuotes, ...backups.slice(0, 3 - finalQuotes.length)]; 
    }

    return {
      quotes: finalQuotes,
      summary: `Encontramos ${validQuotes.length} opções em lojas especializadas.`,
      groundingSources: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    return {
      quotes: generateFallbackLinks(request),
      summary: "Não foi possível verificar o preço exato no momento. Use os links diretos abaixo:",
      groundingSources: []
    };
  }
};
