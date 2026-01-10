
import React, { useState } from 'react';
import { QuoteResult, GroundingChunk } from '../types';

interface ResultsListProps {
  quotes: QuoteResult[];
  summary: string;
  groundingSources: GroundingChunk[];
}

const ResultsList: React.FC<ResultsListProps> = ({ quotes }) => {
  const [visibleCount, setVisibleCount] = useState(10);

  if (quotes.length === 0) return null;

  const handleShowMore = () => setVisibleCount(prev => prev + 5);
  const visibleQuotes = quotes.slice(0, visibleCount);
  const hasMore = visibleCount < quotes.length;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  // Helper para identificar lojas especializadas e aplicar cores
  const getStoreStyle = (name: string) => {
    const n = name.toLowerCase();
    
    // Especializados
    if (n.includes('mecanico') || n.includes('mecânico')) return { color: 'text-orange-600', bg: 'bg-black', border: 'border-orange-500', logoText: 'Loja do Mecânico' };
    if (n.includes('hipervarejo')) return { color: 'text-red-600', bg: 'bg-blue-900', border: 'border-blue-900', logoText: 'Hipervarejo' };
    if (n.includes('jocar')) return { color: 'text-red-600', bg: 'bg-yellow-400', border: 'border-red-600', logoText: 'Jocar' };
    if (n.includes('connect')) return { color: 'text-orange-500', bg: 'bg-black', border: 'border-orange-500', logoText: 'Connect Parts' };
    if (n.includes('autoglass')) return { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-600', logoText: 'Autoglass' };
    if (n.includes('pneu')) return { color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-600', logoText: 'PneuStore' };
    
    // Genéricos (caso apareçam)
    if (n.includes('mercadolivre') || n.includes('mercado livre')) return { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-400', logoText: 'Mercado Livre' };
    
    // Default
    return { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', logoText: name };
  };

  return (
    <div className="mt-6 md:mt-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-lg md:text-xl font-bold text-slate-800 font-heading flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-orange" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Melhores Preços em Lojas Especializadas
         </h3>
      </div>

      <div className="space-y-4">
        {visibleQuotes.map((quote, index) => {
          const hasExactPrice = quote.price && quote.price > 0;
          const storeStyle = getStoreStyle(quote.vendorName);
          const isBestPrice = index === 0 && hasExactPrice;

          return (
            <div key={index} className={`bg-white rounded-lg border-l-4 ${isBestPrice ? 'border-l-green-500 shadow-lg ring-1 ring-green-100' : `border-l-slate-300 ${storeStyle.border}`} shadow-sm p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-6 relative group transition-all hover:bg-slate-50`}>
              
              {/* Badge de Melhor Oferta */}
              {isBestPrice && (
                 <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 uppercase tracking-wide">
                    Melhor Preço Encontrado
                 </div>
              )}

              {/* 1. Imagem do Produto (Esquerda) */}
              <div className="w-full md:w-40 shrink-0 flex items-center justify-center bg-white p-2 rounded-lg border border-slate-100">
                 {quote.image ? (
                    <img 
                        src={quote.image} 
                        alt={quote.productName} 
                        className="max-h-32 w-auto object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1554/1554401.png'; // Fallback auto part icon
                            (e.target as HTMLImageElement).style.opacity = "0.5";
                        }}
                    />
                 ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                 )}
              </div>

              {/* 2. Informações do Produto (Centro) */}
              <div className="flex-grow flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 md:pr-6 pb-4 md:pb-0">
                <div className="mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${storeStyle.color} bg-opacity-10 border-opacity-20`}>
                        {storeStyle.logoText}
                    </span>
                </div>
                <h4 className="font-bold text-slate-800 text-base md:text-lg leading-snug mb-1 line-clamp-2">
                  {quote.productName}
                </h4>
                <p className="text-xs text-slate-500 font-medium mb-3">{quote.description}</p>
                
                {hasExactPrice ? (
                    <div>
                        <div className="flex items-end gap-2">
                             <span className="text-3xl font-extrabold text-slate-900 font-heading leading-none">
                                {formatPrice(quote.price)}
                             </span>
                        </div>
                        
                        {quote.installments && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                {quote.installments}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-500 italic text-sm mt-2">Clique para consultar disponibilidade</p>
                )}
              </div>

              {/* 3. Botão de Compra (Direita) */}
              <div className="w-full md:w-48 shrink-0 flex flex-col justify-center gap-2">
                 <a 
                    href={quote.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-full font-bold text-base py-3 px-4 rounded-lg shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide ${
                        hasExactPrice 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                        : 'bg-brand-blue hover:bg-blue-800 text-white'
                    }`}
                 >
                    Ver na Loja
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                 </a>
                 <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Site Verificado
                 </div>
              </div>

            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleShowMore}
            className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors shadow-sm text-sm uppercase tracking-wide"
          >
            Carregar mais opções
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
