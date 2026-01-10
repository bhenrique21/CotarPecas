
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
 * GERA LINKS DE FALLBACK (Focado EXCLUSIVAMENTE em Lojas de Autopeças)
 * Usado apenas se a IA falhar totalmente.
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
      description: "Maior loja de máquinas e ferramentas da América Latina.",
      link: `https://www.lojadomecanico.com.br/busca?q=${encodedTerm}`,
      image: "https://www.lojadomecanico.com.br/imagens/logo-loja-do-mecanico.png"
    },
    {
      vendorName: "Hipervarejo",
      productName: `Buscar na Hipervarejo`,
      price: 0,
      currency: "BRL",
      description: "Especialista em peças e pneus.",
      link: `https://www.hipervarejo.com.br/busca?q=${encodedTerm}`,
      image: "https://images.tcdn.com.br/img/img_prod/717887/1634925769_logo_hipervarejo.png"
    },
    {
      vendorName: "Jocar",
      productName: `Buscar na Jocar`,
      price: 0,
      currency: "BRL",
      description: "A loja de autopeças online.",
      link: `https://www.jocar.com.br/busca/?q=${encodedTerm}`,
      image: "https://www.jocar.com.br/Imagens/logo-jocar.png"
    },
    {
      vendorName: "Connect Parts",
      productName: `Buscar na Connect Parts`,
      price: 0,
      currency: "BRL",
      description: "Som, vídeo e acessórios automotivos.",
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

  // Prompt desenhado para ignorar marketplaces e focar em dados estruturados de lojas reais
  const prompt = `
  Você é um especialista em compras de autopeças (Auto Parts Sniper).
  
  MISSÃO: Encontrar o MENOR PREÇO REAL para a peça solicitada, ignorando marketplaces genéricos.
  
  DADOS DA BUSCA:
  - Peça: "${request.partName}"
  - Veículo: "${request.make} ${request.model} ${request.year}"
  - Localização: Brasil
  
  REGRAS DE OURO (Whitelisting):
  1. BUSQUE APENAS nestes domínios confiáveis e similares (Lojas Oficiais de Autopeças):
     - lojadomecanico.com.br
     - hipervarejo.com.br
     - jocar.com.br
     - connectparts.com.br
     - autoglass.com.br
     - pneustore.com.br
     - kdpneus.com.br
     - dellavia.com.br
     - canaldapeca.com.br
     - autoz.com.br
  
  2. PROIBIDO (Blacklisting):
     - NÃO retorne resultados do Mercado Livre (mercadolivre.com.br).
     - NÃO retorne resultados da Shopee.
     - NÃO retorne resultados da Amazon.
     - NÃO retorne resultados da OLX ou AliExpress.
  
  3. EXTRAÇÃO DE DADOS:
     - Você DEVE extrair o preço numérico exato (ex: 150.00). Não retorne 0 se encontrar o produto.
     - O link DEVE ser direto para o produto, não para a home ou busca genérica.
  
  SAÍDA ESPERADA (JSON ARRAY):
  Retorne um JSON puro com 5 a 8 opções encontradas.
  [
    {
      "vendorName": "Nome da Loja (ex: Hipervarejo)",
      "productName": "Título completo do produto",
      "price": 129.90, (Número float, use ponto para decimais)
      "link": "URL completa do produto",
      "image": "URL da imagem (se conseguir extrair)",
      "description": "Detalhes breves (ex: Marca Cofap, Dianteiro)"
    }
  ]
  `;

  try {
    // Timeout para garantir UX (25 segundos)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("A busca demorou muito. Tente novamente.")), 25000)
    );

    const aiPromise = genAI.models.generateContent({
      model: "gemini-2.0-flash-exp", // Modelo rápido com capacidade de busca atualizada
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Força o uso da busca do Google
        responseMimeType: "application/json" 
      }
    });

    const result = await Promise.race([aiPromise, timeoutPromise]) as any;
    
    const jsonText = result.text;
    const aiQuotes = cleanAndParseJSON(jsonText);
    
    // Filtragem e Validação Rigorosa
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
        // Remove links quebrados ou genéricos se possível
        return q.link && q.link.startsWith('http') && !q.link.includes('mercadolivre') && !q.link.includes('shopee');
    });

    // Ordenação: Menor preço primeiro (ignorando zeros se houver)
    validQuotes.sort((a: QuoteResult, b: QuoteResult) => {
        if (a.price > 0 && b.price > 0) return a.price - b.price;
        if (a.price > 0) return -1;
        return 1;
    });

    // Se a IA falhar em trazer preços reais, lançamos erro para acionar fallback manual
    if (validQuotes.length === 0) {
        throw new Error("Nenhum preço encontrado nas lojas selecionadas.");
    }

    return {
      quotes: validQuotes,
      summary: `Encontramos ${validQuotes.length} ofertas em lojas especializadas, começando por R$ ${validQuotes[0].price.toFixed(2)}.`,
      groundingSources: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    return {
      quotes: generateFallbackLinks(request),
      summary: "Não foi possível verificar o preço exato em tempo real. Use os links diretos das lojas parceiras abaixo:",
      groundingSources: []
    };
  }
};
