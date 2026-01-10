
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
    // Remove marcadores de código markdown se existirem
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Erro ao fazer parse do JSON da IA:", e);
    throw new Error("Formato de resposta inválido da IA");
  }
};

/**
 * GERA LINKS DE FALLBACK
 * Usado quando a IA falha ou não tem API Key
 */
const generateFallbackLinks = (request: QuoteRequest): QuoteResult[] => {
  const searchTerm = encodeURIComponent(`${request.partName} ${request.make} ${request.model} ${request.year}`);
  
  return [
    {
      vendorName: "Mercado Livre",
      productName: `Busca por ${request.partName}`,
      price: 0, 
      currency: "BRL",
      description: "Verificar disponibilidade e preços no Mercado Livre",
      link: `https://lista.mercadolivre.com.br/${request.partName}-${request.make}-${request.model}-${request.year}`,
      image: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png"
    },
    {
      vendorName: "Google Shopping",
      productName: "Comparar Preços no Google",
      price: 0,
      currency: "BRL",
      description: "Veja várias opções no Google Shopping",
      link: `https://www.google.com/search?tbm=shop&q=${searchTerm}`
    },
    {
      vendorName: "Amazon Brasil",
      productName: "Peças na Amazon",
      price: 0,
      currency: "BRL",
      description: "Frete grátis para membros Prime em produtos elegíveis",
      link: `https://www.amazon.com.br/s?k=${searchTerm}&i=automotive`
    }
  ];
};

/**
 * FUNÇÃO PRINCIPAL DE BUSCA
 */
export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  if (!genAI) {
    console.warn("API Key não encontrada. Retornando links de fallback.");
    return {
      quotes: generateFallbackLinks(request),
      summary: "Modo de demonstração (sem API Key). Redirecionando para buscas diretas.",
      groundingSources: []
    };
  }

  const prompt = `
  Você é um assistente de cotação de peças automotivas.
  O usuário precisa da peça: "${request.partName}"
  Veículo: ${request.make} ${request.model} ${request.year}
  Localização (opcional): ${request.city ? request.city + '-' : ''}${request.state || 'Brasil'}

  TAREFA:
  1. Pesquise na internet (Google Shopping, Mercado Livre, lojas de autopeças online) por esta peça específica.
  2. Retorne uma lista de 4 a 6 opções de compra reais ou estimadas.
  3. Priorize lojas confiáveis (Ex: Loja do Mecânico, Mercado Livre (Lojas Oficiais), Amazon, PneuStore, etc).
  4. Inclua o link direto para o produto se possível.
  
  FORMATO DE RESPOSTA (JSON Array):
  [
    {
      "vendorName": "Nome da Loja",
      "productName": "Título do produto encontrado",
      "price": 100.00, (apenas números)
      "currency": "BRL",
      "description": "Breve descrição (marca, condição)",
      "link": "URL do produto",
      "image": "URL de uma imagem do produto (opcional)"
    }
  ]
  `;

  try {
    // Timeout de 20s para a requisição
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Tempo limite de busca excedido")), 20000)
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
    
    // Validação básica dos dados
    const validQuotes = aiQuotes.map((q: any) => ({
      vendorName: q.vendorName || "Fornecedor Desconhecido",
      productName: q.productName || request.partName,
      price: typeof q.price === 'number' ? q.price : 0,
      currency: q.currency || "BRL",
      description: q.description || "",
      link: q.link || `https://www.google.com/search?q=${encodeURIComponent(request.partName + " " + request.make)}`,
      image: q.image
    }));

    return {
      quotes: validQuotes,
      summary: `Encontramos ${validQuotes.length} opções para sua busca.`,
      groundingSources: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };

  } catch (error) {
    console.error("Erro na busca IA:", error);
    return {
      quotes: generateFallbackLinks(request),
      summary: "Não foi possível processar a busca em tempo real. Tente os links diretos abaixo.",
      groundingSources: []
    };
  }
};
