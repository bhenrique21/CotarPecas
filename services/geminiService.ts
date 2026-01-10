
import { QuoteRequest, SearchResponse } from "../types";

/**
 * SERVIÇO DE DEEP LINKS (Foco em Menor Preço)
 * 
 * Gera links diretos para buscas filtradas por "Menor Preço" nas principais plataformas.
 * Não usa IA, garantindo velocidade instantânea e zero custo/cotas.
 */

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  // Delay mínimo apenas para feedback visual de carregamento
  await new Promise(resolve => setTimeout(resolve, 500));

  const cleanPart = request.partName.trim();
  const vehicle = `${request.make} ${request.model} ${request.year}`;
  
  // Termos de busca otimizados
  const fullTerm = `${cleanPart} ${vehicle}`;
  const encodedFullTerm = encodeURIComponent(fullTerm);
  const encodedPartOnly = encodeURIComponent(`${cleanPart} ${request.make} ${request.model}`);

  // Estratégia: Gerar uma lista priorizada de onde encontrar mais barato
  const quotes = [
    {
      vendorName: "Mercado Livre",
      productName: `Menores preços para ${cleanPart}`,
      price: 0, 
      currency: "BRL",
      description: "Classificados do menor para o maior preço.",
      // Filtro: _OrderId_PRICE_ASC
      link: `https://lista.mercadolivre.com.br/pecas/${request.partName.replace(/\s+/g, '-')}-${request.make}-${request.model}-${request.year}_OrderId_PRICE_ASC`
    },
    {
      vendorName: "Google Shopping",
      productName: `Comparador: ${cleanPart}`,
      price: 0,
      currency: "BRL",
      description: "Varredura em centenas de lojas menores.",
      // Filtro: tbs=p_ord:p (Preço crescrente)
      link: `https://www.google.com/search?tbm=shop&q=${encodedFullTerm}&tbs=p_ord:p`
    },
    {
      vendorName: "Shopee",
      productName: `Ofertas Econômicas: ${cleanPart}`,
      price: 0,
      currency: "BRL",
      description: "Peças importadas e paralelas com desconto.",
      // Filtro: order=asc&sortBy=price
      link: `https://shopee.com.br/search?keyword=${encodedFullTerm}&order=asc&sortBy=price`
    },
    {
      vendorName: "Amazon",
      productName: `${cleanPart} com entrega rápida`,
      price: 0,
      currency: "BRL",
      description: "Peças de reposição e acessórios.",
      // Filtro: s=price-asc-rank
      link: `https://www.amazon.com.br/s?k=${encodedFullTerm}&i=automotive&s=price-asc-rank`
    },
    {
      vendorName: "Magazine Luiza",
      productName: `Magalu: ${cleanPart}`,
      price: 0,
      currency: "BRL",
      description: "Ofertas em lojas parceiras Magalu.",
      // Busca simples (Magalu não aceita sort via URL facilmente, mas a busca é relevante)
      link: `https://www.magazineluiza.com.br/busca/${fullTerm}/`
    },
    // --- ITENS ABAIXO SÓ APARECEM AO CLICAR EM "MOSTRAR MAIS" ---
    {
      vendorName: "Americanas",
      productName: `Peças Americanas`,
      price: 0,
      currency: "BRL",
      description: "Marketplace de autopeças.",
      link: `https://www.americanas.com.br/busca/${encodedFullTerm}?sortBy=lowerPrice`
    },
    {
      vendorName: "OLX",
      productName: `Usados/Seminovos: ${request.state || 'Brasil'}`,
      price: 0,
      currency: "BRL",
      description: "Ideal para peças de lataria ou desmanche.",
      // Filtro de estado se disponível, senão Brasil
      link: `https://www.olx.com.br/autos-e-pecas/pecas-e-acessorios/${request.state ? `estado-${request.state.toLowerCase()}` : 'brasil'}?q=${encodedFullTerm}&sf=1`
    },
    {
      vendorName: "Casas Bahia",
      productName: `Ofertas Casas Bahia`,
      price: 0,
      currency: "BRL",
      description: "Marketplace automotivo.",
      link: `https://www.casasbahia.com.br/${fullTerm}/b`
    },
    {
      vendorName: "AliExpress",
      productName: `Importação Direta`,
      price: 0,
      currency: "BRL",
      description: "Preços de fábrica da China (prazo maior).",
      link: `https://pt.aliexpress.com/wholesale?SearchText=${encodedFullTerm}&SortType=price_asc`
    },
    {
      vendorName: "YouTube",
      productName: `Vídeo: Como trocar`,
      price: 0,
      currency: "BRL",
      description: "Não gaste com mecânico, veja como fazer.",
      link: `https://www.youtube.com/results?search_query=como+trocar+${encodedFullTerm}`
    }
  ];

  return {
    quotes: quotes,
    summary: "",
    groundingSources: []
  };
};
