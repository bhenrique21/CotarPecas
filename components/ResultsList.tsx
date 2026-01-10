
import React, { useState } from 'react';
import { QuoteResult, GroundingChunk } from '../types';

interface ResultsListProps {
  quotes: QuoteResult[];
  summary: string;
  groundingSources: GroundingChunk[];
}

const ResultsList: React.FC<ResultsListProps> = ({ quotes }) => {
  const [showAll, setShowAll] = useState(false);

  // Ordenação: Preço menor primeiro, mas zeros (sem preço) vão para o final
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.price === 0) return 1;
    if (b.price === 0) return -1;
    return a.price - b.price;
  });

  if (sortedQuotes.length === 0) return null;

  const bestOffer = sortedQuotes[0];
  const otherOffers = sortedQuotes.slice(1);
  const visibleOthers = showAll ? otherOffers : otherOffers.slice(0, 5);
  const remainingCount = otherOffers.length - visibleOthers.length;

  const hasPrice = bestOffer.price > 0;
  
  // Cálculo de estatísticas básicas
  const quotesWithPrice = sortedQuotes.filter(q => q.price > 0);
  let savingsPercentage = 0;
  
  if (quotesWithPrice.length > 1 && hasPrice) {
      const prices = quotesWithPrice.map(q => q.price);
      const maxPrice = Math.max(...prices);
      const diff = maxPrice - bestOffer.price;
      savingsPercentage = Math.round((diff / maxPrice) * 100);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className="mt-8 animate-fade-in-up pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-heading flex items-center gap-2">
                <span className="bg-brand-orange text-white p-1 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
                Resultado da Cotação
            </h3>
            <p className="text-slate-500 text-sm mt-1">
                Listamos abaixo os fornecedores com disponibilidade para sua peça.
            </p>
          </div>
      </div>

      {/* --- DESTAQUE: CARD PRINCIPAL (MELHOR PREÇO) --- */}
      <div className="relative bg-white rounded-2xl shadow-xl border-2 border-green-500 overflow-hidden group hover:shadow-2xl transition-all duration-300 mb-8">
         {hasPrice && (
            <div className="absolute top-0 right-0 bg-green-500 text-white font-bold text-xs md:text-sm px-6 py-2 rounded-bl-2xl uppercase tracking-widest z-10 shadow-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Melhor Oferta
            </div>
         )}
         
         <div className="flex flex-col md:flex-row">
            {/* Imagem */}
            <div className="w-full md:w-1/3 bg-slate-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 relative min-h-[200px]">
                 {bestOffer.image ? (
                    <img 
                        src={bestOffer.image} 
                        alt={bestOffer.productName} 
                        className="max-h-56 w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png';
                            (e.target as HTMLImageElement).style.opacity = "0.5";
                        }}
                    />
                 ) : (
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                 )}
            </div>

            {/* Informações */}
            <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue font-bold text-xs rounded-full uppercase tracking-wide mb-2 border border-brand-blue/20">
                        Vendido por {bestOffer.vendorName}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                        {bestOffer.productName}
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm line-clamp-2">{bestOffer.description}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex flex-col">
                            {hasPrice ? (
                                <>
                                    {savingsPercentage > 0 && (
                                        <span className="text-sm text-green-600 font-bold mb-1">
                                            Economia de até {savingsPercentage}%
                                        </span>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xs text-slate-500 font-medium">À vista</span>
                                        <span className="text-4xl md:text-5xl font-extrabold text-green-600 font-heading tracking-tighter">
                                            {formatPrice(bestOffer.price)}
                                        </span>
                                    </div>
                                    {bestOffer.installments && (
                                        <span className="text-xs text-slate-400 mt-1">{bestOffer.installments}</span>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="text-sm text-slate-400">Preço disponível no site</span>
                                    <span className="text-xl font-bold text-slate-700">Consulte Agora</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <a 
                       href={bestOffer.link} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full md:w-auto px-8 py-4 bg-brand-orange hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 group-hover:bg-orange-600 whitespace-nowrap"
                    >
                       Ir para a Loja
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </div>
         </div>
      </div>

      {/* --- LISTA SECUNDÁRIA --- */}
      {visibleOthers.length > 0 && (
        <div>
             <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
                Outras opções de compra
             </h4>
             
             <div className="grid grid-cols-1 gap-3">
                 {visibleOthers.map((quote, idx) => (
                     <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-brand-blue/30 hover:shadow-md transition-all">
                        
                        {/* Imagem Mini */}
                        <div className="w-16 h-16 shrink-0 bg-slate-50 rounded-lg flex items-center justify-center p-1 border border-slate-100">
                            {quote.image ? (
                                 <img src={quote.image} className="max-h-full w-auto object-contain" alt="" />
                            ) : (
                                <div className="w-8 h-8 bg-slate-200 rounded-full" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow text-center sm:text-left min-w-0">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">{quote.vendorName}</div>
                            <div className="font-bold text-slate-800 text-sm sm:text-base truncate" title={quote.productName}>{quote.productName}</div>
                            {quote.price > 0 && hasPrice && (
                                <div className="text-xs text-red-500 font-medium">
                                    +{Math.round(((quote.price - bestOffer.price) / bestOffer.price) * 100)}% em relação ao melhor preço
                                </div>
                            )}
                        </div>

                        {/* Preço e Botão */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                            <div className="text-right">
                                 {quote.price > 0 ? (
                                    <div className="font-heading font-bold text-xl text-slate-700">{formatPrice(quote.price)}</div>
                                 ) : (
                                    <div className="font-bold text-sm text-slate-400">Ver no site</div>
                                 )}
                            </div>
                            <a 
                                href={quote.link}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-600 hover:border-brand-blue hover:text-brand-blue font-bold rounded-lg text-sm transition-colors text-center whitespace-nowrap shadow-sm"
                            >
                                Ver Oferta
                            </a>
                        </div>
                     </div>
                 ))}
             </div>

             {/* Botão Mostrar Mais */}
             {!showAll && remainingCount > 0 && (
                 <button 
                    onClick={() => setShowAll(true)}
                    className="w-full mt-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm flex items-center justify-center gap-2"
                 >
                    Carregar mais {remainingCount} ofertas
                 </button>
             )}
        </div>
      )}
    </div>
  );
};

export default ResultsList;
