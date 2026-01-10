
import React, { useState } from 'react';
import { QuoteResult, GroundingChunk } from '../types';

interface ResultsListProps {
  quotes: QuoteResult[];
  summary: string;
  groundingSources: GroundingChunk[];
}

const ResultsList: React.FC<ResultsListProps> = ({ quotes }) => {
  const [visibleCount, setVisibleCount] = useState(5);

  if (quotes.length === 0) {
    return null;
  }

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const visibleQuotes = quotes.slice(0, visibleCount);
  const hasMore = visibleCount < quotes.length;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className="mt-8 animate-fade-in-up">
      <h3 className="text-xl font-bold text-slate-800 mb-4 font-heading flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Melhores Preços (Lojas Confiáveis)
      </h3>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {visibleQuotes.map((quote, index) => {
          const hasExactPrice = quote.price && quote.price > 0;
          
          // Estilo mais sóbrio para lojas especializadas
          const vendorColorClass = "bg-slate-800 text-white"; 

          return (
            <div key={index} className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-5 hover:bg-slate-50 transition-colors group relative">
              
              {/* Badge de Melhor Preço (Apenas para o primeiro com preço real) */}
              {index === 0 && hasExactPrice && (
                  <div className="absolute top-0 left-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 uppercase tracking-wide">
                      Menor Preço Encontrado
                  </div>
              )}

              {/* Vendor Logo/Name Placeholder */}
              <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 font-bold text-xs text-center p-1 break-words leading-tight">
                     {quote.vendorName}
                  </div>
              </div>

              {/* Info */}
              <div className="flex-grow w-full md:w-auto text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {quote.vendorName}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base md:text-lg leading-tight">
                  {quote.productName}
                </h4>
                <p className="text-sm text-slate-500 mt-1 font-medium">{quote.description}</p>
              </div>

              {/* Price & CTA */}
              <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end gap-3 min-w-[140px]">
                {hasExactPrice ? (
                    <div className="text-center md:text-right">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Valor à vista</span>
                        <span className="text-3xl font-bold text-brand-orange font-heading tracking-tight">
                            {formatPrice(quote.price)}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm font-medium text-slate-400 italic">Preço sob consulta</span>
                )}

                <a 
                  href={quote.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block w-full text-center px-6 py-3 rounded-lg font-bold transition-all active:scale-95 shadow-sm text-sm uppercase tracking-wide ${
                      hasExactPrice 
                      ? 'bg-brand-blue text-white hover:bg-blue-900 shadow-blue-200'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-brand-blue hover:text-brand-blue'
                  }`}
                >
                  {hasExactPrice ? 'Ir para Loja' : 'Ver na Loja'}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleShowMore}
            className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 mx-auto text-sm uppercase tracking-wide"
          >
            Ver mais lojas
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
