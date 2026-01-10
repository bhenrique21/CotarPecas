import React from 'react';

interface PromoBannerProps {
  className?: string;
  variant?: 'default' | 'card-header';
}

const PromoBanner: React.FC<PromoBannerProps> = ({ className = '', variant = 'default' }) => {
  const isCardHeader = variant === 'card-header';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-blue-900 to-brand-blue text-white ${isCardHeader ? 'p-6 md:p-8' : 'rounded-3xl p-6 md:p-8 shadow-xl'} ${className}`}>
      
      {/* Background Decoration Effects - Reduzidos para o banner compacto */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-brand-orange rounded-full opacity-10 blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        
        {/* Top Tag */}
        <div className="flex items-center gap-1.5 mb-2 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-orange" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
          </svg>
          <span className="text-brand-orange font-bold tracking-widest text-[10px] md:text-xs uppercase font-heading">
            Cotação Inteligente
          </span>
        </div>

        {/* Main Title - Tamanho ajustado */}
        <h2 className={`font-heading font-bold mb-2 leading-tight ${isCardHeader ? 'text-2xl md:text-3xl' : 'text-2xl md:text-3xl'}`}>
          Encontre as Melhores Peças
        </h2>

        {/* Subtitle - Margem reduzida - ATUALIZADO */}
        <p className="text-blue-100 max-w-lg mx-auto mb-5 text-xs md:text-sm font-light leading-relaxed">
          Busca automática nos principais fornecedores de peças para carros, motos, caminhões e ônibus do Brasil
        </p>

        {/* Features Pills - Mais compactos */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
          
          <div className="flex items-center gap-1.5 bg-blue-800/40 border border-blue-700/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[10px] md:text-xs font-medium">Busca automática</span>
          </div>

          <div className="flex items-center gap-1.5 bg-blue-800/40 border border-blue-700/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-[10px] md:text-xs font-medium">Compare preços</span>
          </div>

          <div className="flex items-center gap-1.5 bg-blue-800/40 border border-blue-700/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-[10px] md:text-xs font-medium">Múltiplos fornecedores</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PromoBanner;