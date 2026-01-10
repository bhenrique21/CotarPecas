
import React from 'react';
import { QuoteResult, GroundingChunk } from '../types';

interface ResultsListProps {
  quotes: QuoteResult[];
  summary: string;
  groundingSources: GroundingChunk[];
}

const ResultsList: React.FC<ResultsListProps> = ({ quotes, summary, groundingSources }) => {
  if (quotes.length === 0) return null;

  // Ordenar por preço (menor primeiro), ignorando preços zerados (links de busca)
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.price === 0) return 1;
    if (b.price === 0) return -1;
    return a.price - b.price;
  });

  return (
    <div className="mt-8 animate-fade-in-up">
      <h3 className="text-xl font-bold text-slate-800 mb-4 font-heading border-l-4 border-brand-orange pl-3">
        Resultados da Cotação
      </h3>
      
      <p className="text-slate-600 mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        {summary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedQuotes.map((quote, index) => {
          const isBestPrice = index === 0 && quote.price > 0;

          return (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border flex flex-col ${isBestPrice ? 'border-green-500 ring-2 ring-green-100 relative' : 'border-slate-100'}`}
            >
              {isBestPrice && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  MELHOR PREÇO
                </div>
              )}

              {/* Cabeçalho do Card */}
              <div className="p-5 border-b border-slate-50 flex-grow">
                <div className="flex justify-between items-start mb-2">
                   <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded tracking-wider">
                      {quote.vendorName}
                   </span>
                </div>
                
                <h4 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2">
                  {quote.productName}
                </h4>
                
                <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                  {quote.description}
                </p>

                <div className="mt-auto">
                    {quote.price > 0 ? (
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs text-slate-400 font-medium">R$</span>
                            <span className={`text-2xl font-extrabold font-heading ${isBestPrice ? 'text-green-600' : 'text-brand-blue'}`}>
                                {quote.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm font-bold text-slate-400 italic">Preço sob consulta</span>
                    )}
                </div>
              </div>

              {/* Rodapé do Card */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <a 
                  href={quote.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block w-full py-3 rounded-lg text-center font-bold text-sm transition-transform active:scale-95 ${
                      isBestPrice 
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200 shadow-lg' 
                      : 'bg-white text-brand-blue border border-brand-blue hover:bg-brand-blue hover:text-white'
                  }`}
                >
                  {quote.price > 0 ? 'Ver Oferta' : 'Pesquisar Preço'}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fontes (Grounding) */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Fontes da pesquisa</h4>
            <div className="flex flex-wrap gap-2">
                {groundingSources.map((source, idx) => (
                    source.web?.uri && (
                        <a 
                            key={idx} 
                            href={source.web.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded truncate max-w-xs"
                        >
                            {source.web.title || source.web.uri}
                        </a>
                    )
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
