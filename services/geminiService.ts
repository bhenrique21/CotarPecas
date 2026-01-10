
import { QuoteRequest, SearchResponse } from "../types";

/**
 * SERVIÇO DE LINKS DIRETOS (AGREGADOR)
 * 
 * Em vez de usar IA para tentar "ler" a internet (o que é lento e sujeito a cotas),
 * este serviço constrói URLs inteligentes que levam o usuário DIRETAMENTE
 * para as páginas de resultados das lojas, já com filtros aplicados.
 */

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  // Simula um pequeno delay para dar sensação de processamento na UI
  await new Promise(resolve => setTimeout(resolve, 600));

  const cleanPart = request.partName.trim();
  const vehicle = `${request.make} ${request.model} ${request.year}`;
  const fullTerm = `${cleanPart} ${vehicle}`;
  const encodedTerm = encodeURIComponent(fullTerm);
  const encodedPart = encodeURIComponent(cleanPart);
  const encodedVehicle = encodeURIComponent(vehicle);

  // Construção de URLs com Parâmetros de Ordenação por Preço (onde possível)

  const quotes = [
    {
      vendorName: "Google Shopping",
      productName: `Comparar preços: ${cleanPart} para ${request.model}`,
      price: 0, // 0 indica para a UI que é um link de comparação
      currency: "BRL",
      description: "Melhor para comparar diversas lojas (PneuStore, Hipervarejo, etc) de uma só vez.",
      // tbm=shop: Google Shopping | tbs=p_ord:p: Ordenar por Preço Crescente
      link: `https://www.google.com/search?tbm=shop&q=${encodedTerm}&tbs=p_ord:p`
    },
    {
      vendorName: "Mercado Livre",
      productName: `Ofertas de ${cleanPart} - ${request.make} ${request.model}`,
      price: 0,
      currency: "BRL",
      description: "Resultados ordenados pelo MENOR PREÇO. Verifique a reputação do vendedor.",
      // _OrderId_PRICE_ASC: Ordena por menor preço
      link: `https://lista.mercadolivre.com.br/pecas/${request.partName.replace(/\s+/g, '-')}-${request.make}-${request.model}-${request.year}_OrderId_PRICE_ASC`
    },
    {
      vendorName: "Amazon Brasil",
      productName: `Peças Automotivas: ${request.model} ${request.year}`,
      price: 0,
      currency: "BRL",
      description: "Frete grátis para membros Prime em muitos itens. Peças originais e reposição.",
      // s=price-asc-rank: Ordenar por menor preço
      link: `https://www.amazon.com.br/s?k=${encodedTerm}&i=automotive&s=price-asc-rank`
    },
    {
      vendorName: "Shopee",
      productName: `Busca Geral: ${cleanPart}`,
      price: 0,
      currency: "BRL",
      description: "Opções econômicas. Atenção aos prazos de entrega.",
      link: `https://shopee.com.br/search?keyword=${encodedTerm}`
    },
    {
      vendorName: "YouTube (Tutoriais)",
      productName: `Como trocar ${cleanPart} ${request.model}`,
      price: 0,
      currency: "BRL",
      description: "Veja vídeos de como instalar ou verificar esta peça no seu carro.",
      link: `https://www.youtube.com/results?search_query=trocar+${encodedTerm}`
    }
  ];

  return {
    quotes: quotes,
    summary: `Geramos links de busca direta para **${request.partName}** do veículo **${request.make} ${request.model} ${request.year}**. Clique nos cartões abaixo para ver os preços em tempo real diretamente nas lojas.`,
    groundingSources: []
  };
};
