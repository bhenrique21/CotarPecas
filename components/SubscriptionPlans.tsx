import React from 'react';

interface SubscriptionPlansProps {
  onSubscribe: (plan: 'monthly' | 'annual') => void;
  isExpired?: boolean;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSubscribe, isExpired }) => {
  return (
    <div className="w-full animate-fade-in-up">
      {isExpired && (
        <div className="text-center mb-8 bg-red-50 border border-red-100 p-6 rounded-2xl">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 font-heading">Seu período de teste acabou</h2>
          <p className="text-slate-600 mt-2 max-w-lg mx-auto">
            Para continuar cotando peças com inteligência artificial e economizar dinheiro, escolha um dos planos abaixo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* Plano Mensal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col relative overflow-hidden transition-transform hover:scale-[1.01]">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider">Plano Mensal</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 font-heading">R$ 12,90</span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8 flex-grow">
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Cotações ilimitadas
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Comparação de fornecedores
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Acesso a todo histórico
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Cancele quando quiser
            </li>
          </ul>

          <button 
            onClick={() => onSubscribe('monthly')}
            className="w-full py-3.5 border-2 border-brand-blue text-brand-blue font-bold rounded-xl hover:bg-brand-blue hover:text-white transition-all active:scale-95"
          >
            Assinar Mensal
          </button>
        </div>

        {/* Plano Anual - Destaque */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-brand-orange p-6 md:p-8 flex flex-col relative overflow-hidden transform md:-translate-y-2">
           <div className="absolute top-0 right-0 bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Mais Popular
           </div>
           
           <div className="mb-4">
            <h3 className="text-lg font-bold text-brand-orange uppercase tracking-wider">Plano Anual</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 font-heading">R$ 118,80</span>
              <span className="text-slate-500 font-medium">/ano</span>
            </div>
            <p className="text-sm text-green-600 font-bold mt-1 bg-green-50 inline-block px-2 py-0.5 rounded-md border border-green-100">
                Equivalente a R$ 9,90/mês
            </p>
          </div>
          
          <ul className="space-y-3 mb-8 flex-grow">
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <div className="p-0.5 bg-orange-100 rounded-full text-brand-orange"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
              <span className="font-bold">Economize 23% no total</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <div className="p-0.5 bg-orange-100 rounded-full text-brand-orange"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
              Cotações ilimitadas
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <div className="p-0.5 bg-orange-100 rounded-full text-brand-orange"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
              Suporte prioritário
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-700">
              <div className="p-0.5 bg-orange-100 rounded-full text-brand-orange"><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
              Acesso a todo histórico
            </li>
          </ul>

          <button 
            onClick={() => onSubscribe('annual')}
            className="w-full py-4 bg-brand-orange text-white font-bold rounded-xl hover:bg-opacity-90 shadow-lg shadow-brand-orange/30 transition-all active:scale-95"
          >
            Assinar Anual (Economizar)
          </button>
        </div>

      </div>
      
      <div className="text-center mt-8 text-slate-400 text-xs">
         Pagamento seguro via Cartão de Crédito ou PIX. Cancelamento fácil.
      </div>
    </div>
  );
};

export default SubscriptionPlans;