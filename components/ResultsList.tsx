
import React, { useMemo } from 'react';
import { QuoteResult, GroundingChunk } from '../types';

interface ResultsListProps {
  quotes: QuoteResult[];
  summary: string;
  groundingSources: GroundingChunk[];
}

const ResultsList: React.FC<ResultsListProps> = ({ quotes, summary, groundingSources }) => {
  
  const sortedQuotes = useMemo(() => {
    // Ordena: Preço menor primeiro, mas zeros (sem preço) vão para o final da lista,
    // a menos que TODOS sejam zero (fallback mode), aí mantemos a ordem original
    const allZero = quotes.every(q => q.price === 0);
    if (allZero) return quotes;

    return [...quotes].sort((a, b) => {
        if (a.price === 0) return 1;
        if (b.price === 0) return -1;
        return a.price - b.price;
    });
  }, [quotes]);

  if (quotes.length === 0) {
    return (
      <div className="text-center p-8 md:p-12 bg-white rounded-2xl shadow-sm mt-8 border border-slate-200 animate-fade-in">
        <div className="text-slate-300 mb-6 flex justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-700 font-heading">Nenhuma cotação encontrada</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm md:text-base">Tente simplificar o nome da peça ou verifique a conexão.</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "Ver no site";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const isFallback = quotes.every(q => q.price === 0);

  return (
    <div className="mt-8 md:mt-10 space-y-8 md:space-y-10 animate-fade-in-up">
      
      {/* AI Insight Summary */}
      <div className={`p-5 md:p-8 rounded-2xl shadow-lg relative overflow-hidden ring-1 ${isFallback ? 'bg-slate-700 ring-slate-600' : 'bg-brand-blue ring-blue-700'} text-white`}>
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-20 blur-2xl ${isFallback ? 'bg-slate-400' : 'bg-brand-orange'}`}></div>
        <div className="relative z-10 flex gap-4 items-start">
          <div className={`p-2.5 rounded-xl text-white shadow-lg hidden md:block shrink-0 ${isFallback ? 'bg-slate-600' : 'bg-brand-orange'}`}>
            {isFallback ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )}
          </div>
          <div>
            <h3 className={`${isFallback ? 'text-slate-300' : 'text-orange-400'} font-bold uppercase tracking-wider text-xs md:text-sm mb-2 font-heading flex items-center gap-2`}>
                <span className={`md:hidden px-2 py-0.5 rounded ${isFallback ? 'bg-slate-600 text-slate-200' : 'bg-brand-orange/20 text-orange-300'}`}>
                    {isFallback ? 'Info' : 'IA'}
                </span>
                {isFallback ? 'Busca Direta' : 'Análise Inteligente'}
            </h3>
            <p className="text-blue-50 leading-relaxed text-sm md:text-lg font-light tracking-wide">{summary}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 font-heading border-l-4 border-brand-orange pl-4">
          {isFallback ? 'Links para Consulta' : 'Melhores Ofertas Encontradas'}
        </h3>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {sortedQuotes.map((quote, index) => {
            const hasPrice = quote.price > 0;
            const isBestPrice = index === 0 && hasPrice && !isFallback;
            
            return (
              <div 
                key={index} 
                className={`relative flex flex-col bg-white rounded-2xl transition-all duration-300 ${
                  isBestPrice 
                    ? 'ring-2 ring-brand-orange shadow-xl md:scale-[1.02] z-10 order-first md:order-none' 
                    : 'border border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isBestPrice && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1 whitespace-nowrap z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Melhor Preço
                  </div>
                )}

                {/* Header */}
                <div className={`p-4 md:p-5 border-b flex justify-between items-center rounded-t-2xl ${isBestPrice ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/50 border-slate-100'}`}>
                  <span className="font-bold text-slate-700 truncate max-w-[70%] text-xs md:text-sm uppercase tracking-wide">
                    {quote.vendorName}
                  </span>
                  <span className={`text-[10px] font-bold uppercase py-1 px-2 rounded-md ${isBestPrice ? 'bg-orange-100 text-brand-orange' : 'bg-slate-200 text-slate-600'}`}>
                    Online
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 md:p-6 flex-grow flex flex-col">
                  <h4 className="font-heading font-bold text-base md:text-lg text-slate-900 mb-2 line-clamp-2 min-h-[3rem] md:min-h-[3.5rem] leading-snug">
                    {quote.productName}
                  </h4>
                  
                  <div className="mb-6 flex-grow">
                     <p className="text-xs md:text-sm text-slate-500 line-clamp-3 leading-relaxed">{quote.description || "Verifique a disponibilidade no site do vendedor."}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex flex-col mb-4">
                      <span className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          {hasPrice ? 'Valor à vista' : 'Preço no site'}
                      </span>
                      <span className={`text-2xl md:text-3xl font-extrabold font-heading ${isBestPrice ? 'text-brand-orange' : 'text-slate-900'}`}>
                        {formatPrice(quote.price)}
                      </span>
                    </div>
                    
                    <a 
                      href={quote.link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center py-3.5 md:py-3 rounded-xl font-bold transition-all duration-200 text-sm md:text-base ${
                        isBestPrice
                          ? 'bg-brand-orange text-white hover:bg-opacity-90 shadow-lg shadow-brand-orange/30 active:scale-95' 
                          : 'bg-brand-blue text-white hover:bg-blue-900 hover:shadow-lg active:scale-95'
                      } ${!quote.link ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {quote.link ? (hasPrice ? 'Ir para a Loja' : 'Ver Oferta') : 'Link Indisponível'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grounding Sources */}
      {groundingSources.length > 0 && (
        <div className="pt-6 md:pt-8 border-t border-slate-300">
          <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Fontes verificadas</h4>
          <div className="flex flex-wrap gap-2">
            {groundingSources.map((source, idx) => (
              source.web?.uri ? (
                <a
                  key={idx}
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-300 bg-white text-[10px] md:text-xs text-slate-600 hover:border-brand-orange hover:text-brand-orange transition-colors truncate max-w-[150px] md:max-w-[200px]"
                >
                  <span className="truncate">{source.web.title || new URL(source.web.uri).hostname}</span>
                  <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              ) : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
