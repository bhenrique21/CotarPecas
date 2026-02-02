
import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/storageService';
import PromoBanner from './PromoBanner';
import SubscriptionPlans from './SubscriptionPlans';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [viewState, setViewState] = useState<'login' | 'register' | 'plans'>('login');
  const [role, setRole] = useState<'buyer' | 'supplier'>('buyer');
  
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      if (viewState === 'login') {
        await loginUser(cleanEmail, cleanPassword);
      } else {
        if (!name) throw new Error("Nome é obrigatório");
        if (role === 'supplier' && !companyName) throw new Error("Nome da empresa é obrigatório");
        await registerUser(name, cleanEmail, cleanPassword, role, companyName);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao conectar. Verifique seus dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelection = (plan: 'monthly' | 'annual') => {
      setViewState('register');
      setError('Crie sua conta para finalizar a assinatura do plano ' + (plan === 'monthly' ? 'Mensal' : 'Anual'));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-6">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${viewState === 'plans' ? 'md:max-w-4xl' : 'md:max-w-xl'} overflow-hidden border border-slate-200 transition-all duration-500 ease-in-out`}>
        
        <PromoBanner variant="card-header" />

        <div className="p-6 md:p-10">
          
          {viewState === 'plans' ? (
             <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 font-heading">Nossos Planos</h3>
                    <button 
                        onClick={() => setViewState('login')}
                        className="text-sm font-medium text-slate-500 hover:text-brand-orange flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar para Login
                    </button>
                </div>
                <SubscriptionPlans onSubscribe={handlePlanSelection} />
             </div>
          ) : (
            <>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 text-center font-heading">
                    {viewState === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
                </h3>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-3 animate-shake">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Role Selector (Only for Register) */}
                    {viewState === 'register' && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setRole('buyer')}
                                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${role === 'buyer' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-100 text-slate-500'}`}
                            >
                                Sou Comprador
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('supplier')}
                                className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${role === 'supplier' ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-slate-100 text-slate-500'}`}
                            >
                                Sou Fornecedor
                            </button>
                        </div>
                    )}

                    {viewState === 'register' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Nome Completo</label>
                            <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-300 text-slate-800 font-medium rounded-xl focus:ring-brand-orange focus:border-brand-orange placeholder-slate-400 transition-shadow"
                            placeholder="Seu nome"
                            required
                            disabled={isLoading}
                            />
                        </div>
                        {role === 'supplier' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Nome da Empresa</label>
                                <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full p-3.5 bg-slate-50 border border-slate-300 text-slate-800 font-medium rounded-xl focus:ring-brand-orange focus:border-brand-orange placeholder-slate-400 transition-shadow"
                                placeholder="Nome da sua loja/oficina"
                                required
                                disabled={isLoading}
                                />
                            </div>
                        )}
                    </>
                    )}
                    
                    <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">E-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-300 text-slate-800 font-medium rounded-xl focus:ring-brand-orange focus:border-brand-orange placeholder-slate-400 transition-shadow"
                        placeholder="seu@email.com"
                        required
                        disabled={isLoading}
                    />
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">Senha</label>
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3.5 pr-12 bg-slate-50 border border-slate-300 text-slate-800 font-medium rounded-xl focus:ring-brand-orange focus:border-brand-orange placeholder-slate-400 transition-shadow"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-brand-orange focus:outline-none transition-colors"
                        tabIndex={-1} 
                        disabled={isLoading}
                        >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                        </button>
                    </div>
                    </div>

                    <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 bg-brand-orange text-white font-bold text-lg rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-brand-orange/30 active:scale-[0.98] mt-4 flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        viewState === 'login' ? 'Entrar' : 'Cadastrar Conta'
                    )}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-500">
                     <button 
                        type="button"
                        onClick={() => setViewState('plans')}
                        className="text-brand-blue font-bold hover:underline py-2 border-t border-slate-100"
                    >
                        Conheça nossos planos e preços
                    </button>

                    {viewState === 'login' ? (
                    <p>
                        Não tem conta?{' '}
                        <button onClick={() => setViewState('register')} className="text-brand-orange font-bold hover:underline">
                        Cadastre-se agora
                        </button>
                    </p>
                    ) : (
                    <p>
                        Já tem conta?{' '}
                        <button onClick={() => setViewState('login')} className="text-brand-orange font-bold hover:underline">
                        Fazer Login
                        </button>
                    </p>
                    )}
                </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
