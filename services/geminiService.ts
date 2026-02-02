
import { QuoteRequest, SearchResponse } from "../types";
import { searchInternalProducts } from "./storageService";

// Função para esperar um tempo (simulação de processamento)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchParts = async (request: QuoteRequest): Promise<SearchResponse> => {
  
  // Simula um delay de rede/processamento para UX
  await wait(800);

  // Busca diretamente no banco de dados interno
  const products = await searchInternalProducts(request.partName, request.model);

  const quotes = products.map(p => ({
    vendorName: p.supplierName,
    productName: `${p.partName} - ${p.brand}`,
    price: p.price,
    currency: "BRL",
    description: `Marca: ${p.brand} | Aplicação: ${p.make} ${p.model} | Estoque: ${p.stock}`,
    link: `#compra-${p.id}`, // Link interno simulado
    stock: p.stock
  }));

  // Ordena por menor preço
  quotes.sort((a, b) => a.price - b.price);

  // Pega os top 10
  const topQuotes = quotes.slice(0, 10);

  let summary = "";
  if (topQuotes.length > 0) {
    const minPrice = topQuotes[0].price;
    const maxPrice = topQuotes[topQuotes.length - 1].price;
    summary = `Encontramos ${products.length} ofertas em nossa rede de fornecedores, variando de R$ ${minPrice} a R$ ${maxPrice}.`;
  } else {
    summary = "No momento, nenhum fornecedor parceiro possui esta peça em estoque cadastrado.";
  }

  return {
    quotes: topQuotes,
    summary: summary,
    groundingSources: [] // Não usamos mais fontes externas
  };
};
