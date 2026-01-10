
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

  return (
    <div className="mt-8 animate-fade-in-up">
      <h3 className="text-xl font-bold text-slate-800 mb-4 font-heading flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Resultados encontrados (Menor Preço)
      </h3>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {visibleQuotes.map((quote, index) => {
          // Cores para identificar lojas facilmente
          let vendorColorClass = "bg-slate-100 text-slate-600";
          if (quote.vendorName.includes("Mercado")) vendorColorClass = "bg-yellow-100 text-yellow-800";
          if (quote.vendorName.includes("Google")) vendorColorClass = "bg-blue-100 text-blue-800";
          if (quote.vendorName.includes("Amazon")) vendorColorClass = "bg-orange-100 text-orange-800";
          if (quote.vendorName.includes("Shopee")) vendorColorClass = "bg-red-100 text-red-800";

          return (
            <div key={index} className="p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 hover:bg-slate-50 transition-colors group">
              
              {/* Ranking Number */}
              <div className="hidden md:flex flex-col items-center justify-center w-10 shrink-0">
                <span className="text-xl font-bold text-slate-300 group-hover:text-brand-orange">#{index + 1}</span>
              </div>

              {/* Vendor Info */}
              <div className="flex-grow w-full md:w-auto text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${vendorColorClass}`}>
                    {quote.vendorName}
                  </span>
                  {index === 0 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Melhor Preço</span>}
                </div>
                <h4 className="font-bold text-slate-800 text-base md:text-lg leading-tight">
                  {quote.productName}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{quote.description}</p>
              </div>

              {/* Action Button */}
              <div className="w-full md:w-auto shrink-0">
                <a 
                  href={quote.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full md:w-auto text-center px-6 py-3 bg-white border-2 border-brand-blue text-brand-blue font-bold rounded-xl hover:bg-brand-blue hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  Ver no Site
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
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
            className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-2 mx-auto"
          >
            Mostrar mais opções
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
