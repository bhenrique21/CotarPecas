
import React, { useMemo } from 'react';
import { QuoteResult, GroundingChunk } from '../types';

interface ResultsListProps {
  quotes: QuoteResult[];
  summary: string;
  groundingSources: GroundingChunk[];
}

const ResultsList: React.FC<ResultsListProps> = ({ quotes, summary, groundingSources }) => {
  
  // Como agora são links diretos, mantemos a ordem definida no serviço (Google > ML > Amazon)
  // em vez de ordenar por preço (que é 0)
  const sortedQuotes = quotes; 

  if (quotes.length === 0) {
    return (
      <div className="text-center p-8 md:p-12 bg-white rounded-2xl shadow-sm mt-8 border border-slate-200 animate-fade-in">
        <div className="text-slate-300 mb-6 flex justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-700 font-heading">Nenhuma cotação encontrada</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm md:text-base">Não encontramos peças com as especificações exatas. Tente simplificar o nome da peça (ex: apenas "Amortecedor") ou verifique a ortografia.</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className="mt-8 md:mt-10 space-y-8 md:space-y-10 animate-fade-in-up">
      
      {/* Search Insight Summary */}
      <div className="bg-brand-blue text-white p-5 md:p-8 rounded-2xl shadow-lg relative overflow-hidden ring-1 ring-blue-700">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 md:w-32 md:h-32 bg-brand-orange rounded-full opacity-20 blur-2xl"></div>
        <div className="relative z-10 flex gap-4 items-start">
          <div className="bg-brand-orange p-2.5 rounded-xl text-white shadow-lg hidden md:block shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <div>
            <h3 className="text-orange-400 font-bold uppercase tracking-wider text-xs md:text-sm mb-2 font-heading flex items-center gap-2">
                Busca Otimizada
            </h3>
            <p className="text-blue-50 leading-relaxed text-sm md:text-lg font-light tracking-wide">{summary}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 font-heading border-l-4 border-brand-orange pl-4">
          Comparativo de Lojas
        </h3>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {sortedQuotes.map((quote, index) => {
            // Em modo agregador, destacamos Google Shopping e Mercado Livre
            const isHighlighted = quote.vendorName.includes("Google") || quote.vendorName.includes("Mercado");
            
            return (
              <div 
                key={index} 
                className={`relative flex flex-col bg-white rounded-2xl transition-all duration-300 ${
                  isHighlighted 
                    ? 'ring-1 ring-brand-orange/30 shadow-lg md:scale-[1.01] hover:shadow-xl' 
                    : 'border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isHighlighted && quote.vendorName.includes("Google") && (
                  <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-20">
                    Recomendado
                  </div>
                )}

                {/* Header */}
                <div className={`p-4 md:p-5 border-b flex justify-between items-center rounded-t-2xl ${isHighlighted ? 'bg-orange-50/30' : 'bg-slate-50/50'}`}>
                  <span className="font-bold text-slate-700 truncate max-w-[70%] text-sm md:text-base uppercase tracking-wide">
                    {quote.vendorName}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>

                {/* Body */}
                <div className="p-5 md:p-6 flex-grow flex flex-col">
                  <h4 className="font-heading font-bold text-base md:text-lg text-slate-900 mb-2 leading-snug">
                    {quote.productName}
                  </h4>
                  
                  <div className="mb-6 flex-grow">
                     <p className="text-xs md:text-sm text-slate-500 line-clamp-3 leading-relaxed">{quote.description}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    {/* Se preço for 0, mostra layout de Agregador */}
                    {quote.price > 0 ? (
                        <div className="flex flex-col mb-4">
                            <span className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider">Valor aproximado</span>
                            <span className="text-2xl md:text-3xl font-extrabold font-heading text-brand-orange">
                                {formatPrice(quote.price)}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col mb-4">
                            <span className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider">Disponibilidade</span>
                            <span className="text-xl md:text-2xl font-bold font-heading text-slate-800 flex items-center gap-2">
                                Ver Ofertas
                                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Ao vivo</span>
                            </span>
                        </div>
                    )}
                    
                    <a 
                      href={quote.link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center py-3.5 md:py-3 rounded-xl font-bold transition-all duration-200 text-sm md:text-base ${
                        isHighlighted
                          ? 'bg-brand-orange text-white hover:bg-opacity-90 shadow-lg shadow-brand-orange/30 active:scale-95' 
                          : 'bg-white border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white active:scale-95'
                      }`}
                    >
                      {quote.vendorName.includes("YouTube") ? 'Assistir Vídeo' : 'Ir para a Loja'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsList;
