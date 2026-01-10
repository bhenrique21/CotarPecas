
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

export interface QuoteResult {
  vendorName: string;
  price: number;
  currency: string;
  productName: string;
  description?: string;
  link?: string;
  image?: string; // URL da imagem do produto
  installments?: string; // Texto do parcelamento (ex: 10x de R$ 20,00)
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

// Novos tipos para a Plataforma
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Em produção, nunca salvar senha em texto puro
  createdAt: string; // Data de registro para calcular o trial
  plan: 'free_trial' | 'premium';
}

export interface QuoteHistoryItem {
  id: string;
  userId: string;
  date: string;
  status: 'concluido' | 'pendente' | 'erro';
  request: QuoteRequest;
  resultCount: number;
  totalValue?: number; // Menor valor encontrado para estatística
}
