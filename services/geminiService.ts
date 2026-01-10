
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteRequest, SearchResponse, GroundingChunk } from "../types";

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  let apiKey = process.env.API_KEY;
  
  // Debug (seguro)
  if (!apiKey) {
    console.error("GeminiService: API Key está undefined ou vazia.");
  } else {
    // Sanitização básica
    apiKey = apiKey.trim();
    console.log("GeminiService: API Key carregada (" + apiKey.substring(0, 4) + "...)");
  }
  
  if (!apiKey) {
    throw new Error("API Key not configured. A variável de ambiente API_KEY não foi encontrada.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construção de query para contexto
  const hasLocation = !!(request.city || request.state);

  const prompt = `
    Você é um COMPRADOR TÉCNICO AUTOMOTIVO SÊNIOR.
    
    DADOS DO PEDIDO:
    Veículo: ${request.make} ${request.model} ${request.year} (${request.vehicleType})
    Peça: "${request.partName}"
    Localização Preferencial: ${hasLocation ? (request.city ? request.city + ' - ' : '') + (request.state || '') : 'Brasil (Todo o território)'}

    OBJETIVO CRÍTICO:
    Localizar a peça EXATA compatível com este veículo específico em lojas online, retornando o LINK DIRETO para a página de compra do produto.

    REGRAS DE OURO (COMPATIBILIDADE 100%):
    1. RIGOR TOTAL NO ANO E MODELO: A peça DEVE servir no ${request.model} ano ${request.year}. Verifique a faixa de anos da peça (ex: se a peça é 2012-2016 e o carro é 2018, NÃO SERVE).
    2. LINK DIRETO (DEEP LINK): O campo 'link' DEVE ser a URL DIRETA da página do produto (onde há o botão "Comprar").
    3. PROIBIDO LINKS DE LISTA: Não retorne links de resultados de busca (ex: site.com/busca?q=...) a menos que seja absolutamente impossível encontrar o item específico. O usuário quer o produto final.
    
    DIRETRIZES DE PRIORIDADE DE LOJAS E LOCALIZAÇÃO:
    1. ${hasLocation ? `PRIORIDADE REGIONAL: Tente encontrar fornecedores que atendam ou estejam localizados em ${request.state || request.city}.` : ''}
    2. PRIORIDADE MÁXIMA (Especializadas): Hipervarejo, Connect Parts, Loja do Mecânico, PneuStore, Autoglass, Jocar, AutoZ, MercadoCar, Koga Koga.
    3. MARKETPLACES: Mercado Livre, Amazon, Shopee (verifique se são vendedores bem avaliados).
    4. Se houver opções locais (na região de ${request.state || request.city}), destaque isso na descrição. Caso contrário, liste grandes e-commerces que entregam em todo o Brasil.

    INSTRUÇÕES DE PESQUISA:
    - Utilize a ferramenta de busca para encontrar URLs reais de produtos (PDP - Product Detail Pages).
    - Priorize peças de marcas conhecidas (Bosch, Cofap, Nakata, Monroe, Moura, etc.) sobre marcas genéricas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  vendorName: { type: Type.STRING, description: "Nome da Loja" },
                  productName: { type: Type.STRING, description: "Título Completo do Produto (Inclua marca e aplicação ex: 'Amortecedor Nakata para Onix 2020')" },
                  price: { type: Type.NUMBER, description: "Preço numérico do produto" },
                  currency: { type: Type.STRING, description: "Moeda (ex: BRL)" },
                  description: { type: Type.STRING, description: "Breve descrição técnica e confirmação de compatibilidade (ex: 'Lado direito, ano 2019 a 2023')" },
                  link: { type: Type.STRING, description: "URL direta do produto" }
                },
                required: ["vendorName", "productName", "price", "currency", "link"]
              }
            },
            summary: { type: Type.STRING, description: "Resumo executivo de 1 parágrafo explicando as opções encontradas, variação de preços e se houve sucesso em encontrar opções na região solicitada." }
          },
          required: ["quotes", "summary"]
        }
      }
    });

    let text = response.text || "{}";
    
    // Limpeza robusta de Markdown (remove ```json e ```)
    text = text.replace(/```json\n?|```/g, "").trim();

    let parsedData: any = {};
    
    try {
        parsedData = JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error. Raw text:", text);
        console.error("Parse Error Details:", e);
        // Não lançar erro aqui para tentar recuperar via regex se necessário futuramente, 
        // ou retornar vazio para não quebrar a UI
        parsedData = { quotes: [], summary: "Não foi possível estruturar os dados da busca. Tente novamente." };
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Mapeia para garantir a tipagem correta
    const quotes = (parsedData.quotes || []).map((q: any) => ({
        vendorName: q.vendorName || "Loja Desconhecida",
        productName: q.productName || request.partName,
        price: typeof q.price === 'number' ? q.price : parseFloat(q.price) || 0,
        currency: q.currency || "BRL",
        description: q.description || "",
        link: q.link || ""
    }));

    return {
      quotes: quotes,
      summary: parsedData.summary || "Busca finalizada.",
      groundingSources: groundingChunks as GroundingChunk[]
    };

  } catch (error: any) {
    console.error("Gemini API Error Full:", error);
    
    // Tratamento de erros específicos conhecidos
    let errorMessage = error.message || "Erro desconhecido na API";

    if (errorMessage.includes("API Key") || errorMessage.includes("403")) {
        throw new Error("Erro de Autenticação: Verifique se sua API KEY é válida e está configurada corretamente na Vercel.");
    }

    if (errorMessage.includes("429")) {
         throw new Error("Limite de requisições excedido (Quota Exceeded). Tente novamente em alguns instantes.");
    }
    
    // Repassa a mensagem original para facilitar debug na UI
    throw new Error(`Erro na busca: ${errorMessage}`);
  }
};
