
export enum VehicleType {
  CARRO = 'Carro',
  MOTO = 'Moto',
  CAMINHAO = 'Caminhão',
  ONIBUS = 'Ônibus'
}

export interface QuoteRequest {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: string;
  partName: string;
  state?: string;
  city?: string;
}

export interface Product {
  id: string;
  supplierId: string;
  supplierName: string;
  vehicleType: VehicleType;
  make: string;      // Marca do veículo (ex: Fiat)
  model: string;     // Modelo do veículo (ex: Palio)
  partName: string;  // Nome da peça
  brand: string;     // Marca da peça (ex: Bosch)
  stock: number;
  price: number;
  description?: string;
  createdAt: string;
}

// Reutilizamos QuoteResult para exibir na lista de busca
export interface QuoteResult {
  vendorName: string;
  price: number;
  currency: string;
  productName: string;
  description?: string;
  link?: string; // Link simulado de compra
  stock?: number; // Novo campo
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SearchResponse {
  quotes: QuoteResult[];
  groundingSources: GroundingChunk[];
  summary: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'buyer' | 'supplier'; // Novo campo
  companyName?: string; // Para fornecedores
  createdAt: string;
  plan: 'free_trial' | 'premium';
}

export interface QuoteHistoryItem {
  id: string;
  userId: string;
  date: string;
  status: 'concluido' | 'pendente' | 'erro';
  request: QuoteRequest;
  resultCount: number;
  totalValue?: number;
}
