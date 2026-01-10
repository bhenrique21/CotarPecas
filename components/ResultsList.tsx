
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

  // Helper para simular logos/cores das lojas baseado no nome
  const getStoreStyle = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('magalu') || n.includes('magazine')) return { color: 'text-blue-600', bg: 'bg-blue-600', logoText: 'Magalu' };
    if (n.includes('bahia')) return { color: 'text-red-600', bg: 'bg-red-600', logoText: 'Casas Bahia' };
    if (n.includes('americanas')) return { color: 'text-red-600', bg: 'bg-red-600', logoText: 'Americanas' };
    if (n.includes('amazon')) return { color: 'text-slate-800', bg: 'bg-slate-800', logoText: 'Amazon' };
    if (n.includes('mercado')) return { color: 'text-yellow-600', bg: 'bg-yellow-500', logoText: 'Mercado Livre' };
    if (n.includes('pneu')) return { color: 'text-orange-600', bg: 'bg-orange-600', logoText: 'PneuStore' };
    return { color: 'text-slate-700', bg: 'bg-brand-blue', logoText: name };
  };

  return (
    <div className="mt-6 md:mt-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-lg md:text-xl font-bold text-slate-800 font-heading">
            Melhores ofertas encontradas
         </h3>
         <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">
            Menor preço primeiro
         </span>
      </div>

      <div className="space-y-4">
        {visibleQuotes.map((quote, index) => {
          const hasExactPrice = quote.price && quote.price > 0;
          const storeStyle = getStoreStyle(quote.vendorName);
          const isBestPrice = index === 0 && hasExactPrice;

          return (
            <div key={index} className={`bg-white rounded-lg border ${isBestPrice ? 'border-green-400 shadow-md ring-1 ring-green-100' : 'border-slate-200'} p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 relative group transition-all hover:shadow-lg`}>
              
              {/* Badge de Menor Preço */}
              {isBestPrice && (
                 <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg rounded-tl-lg z-10 uppercase tracking-wide shadow-sm">
                    Menor Preço
                 </div>
              )}

              {/* 1. Imagem do Produto (Esquerda) */}
              <div className="w-full md:w-48 shrink-0 flex items-center justify-center bg-white p-2">
                 {quote.image ? (
                    <img 
                        src={quote.image} 
                        alt={quote.productName} 
                        className="max-h-32 md:max-h-40 w-auto object-contain mix-blend-multiply"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png'; // Fallback icon
                            (e.target as HTMLImageElement).style.opacity = "0.5";
                        }}
                    />
                 ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                 )}
              </div>

              {/* 2. Informações do Produto (Centro) */}
              <div className="flex-grow flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 md:pr-6 pb-4 md:pb-0">
                <h4 className="font-bold text-slate-800 text-base md:text-lg leading-snug mb-2 line-clamp-3">
                  {quote.productName}
                </h4>
                
                {hasExactPrice ? (
                    <div className="mt-auto">
                        <div className="flex items-baseline gap-2">
                             <span className="text-3xl font-extrabold text-slate-900 font-heading">
                                {formatPrice(quote.price)}
                             </span>
                             <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">à vista</span>
                        </div>
                        
                        {quote.installments && (
                            <p className="text-sm text-slate-500 mt-1">
                                {quote.installments}
                            </p>
                        )}
                        
                        {/* Fake Perks parecidos com o print */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {isBestPrice && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                                    1% de Cashback
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                Entrega Garantida
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 italic text-sm mt-2">Clique para ver o preço atualizado na loja.</p>
                )}
              </div>

              {/* 3. Loja e Botão (Direita) */}
              <div className="w-full md:w-56 shrink-0 flex flex-col justify-center items-center md:items-end gap-3 md:pl-2">
                 {/* Logo da Loja (Simulado com Texto/Cor) */}
                 <div className="flex items-center justify-center md:justify-end w-full mb-1">
                     <span className={`font-bold text-sm ${storeStyle.color} flex items-center gap-1`}>
                        {storeStyle.logoText}
                        <div className={`w-2 h-2 rounded-full ${storeStyle.bg}`}></div>
                     </span>
                 </div>

                 <a 
                    href={quote.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#5D2E8C] hover:bg-[#4a2470] text-white font-bold text-base py-3 px-4 rounded-lg shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
                 >
                    Ir à loja
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                 </a>
                 
                 <div className="text-[10px] text-slate-400 text-center md:text-right w-full">
                    Site seguro e verificado
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
            Carregar mais ofertas
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
