
import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import AuthScreen from './components/AuthScreen';
import DashboardStats from './components/DashboardStats';
import QuoteHistory from './components/QuoteHistory';
import PromoBanner from './components/PromoBanner';
import SubscriptionPlans from './components/SubscriptionPlans';
import { QuoteRequest, SearchResponse, User, QuoteHistoryItem } from './types';
import { searchParts } from './services/geminiService';
import { getCurrentUser, logoutUser, checkSubscriptionStatus, saveQuoteToHistory, getDashboardStats, getUserHistory, upgradeToPremium } from './services/storageService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const App: React.FC = () => {
  // Estado Global
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<{ isValid: boolean, daysRemaining: number, isPremium: boolean } | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  // Estado da Busca
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estado do Dashboard
  const [activeTab, setActiveTab] = useState<'nova-cotacao' | 'historico' | 'planos'>('nova-cotacao');
  const [history, setHistory] = useState<QuoteHistoryItem[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  // Inicialização
  useEffect(() => {
    const initSession = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                await handleLoginSuccess(currentUser);
            }
        } catch (e) {
            console.log("Nenhum usuário logado ou erro de conexão");
        } finally {
            setInitializing(false);
        }
    };

    initSession();

    // Apenas ativa listener do Supabase se ele estiver configurado
    let subscriptionListener: any = null;

    if (isSupabaseConfigured) {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setSubscription(null);
                setData(null);
            }
        });
        subscriptionListener = authListener.subscription;
    }

    return () => {
        if (subscriptionListener) {
            subscriptionListener.unsubscribe();
        }
    }
  }, []);

  const handleLoginSuccess = async (currentUser?: User) => {
    // Se não passar usuário, tenta pegar o atual
    const loggedUser = currentUser || await getCurrentUser();
    
    if (loggedUser) {
        setUser(loggedUser);
        setSubscription(checkSubscriptionStatus(loggedUser));
        await loadUserData(loggedUser.id);
    }
  };

  const loadUserData = async (userId: string) => {
    const hist = await getUserHistory(userId);
    setHistory(hist);
    const dashboardStats = await getDashboardStats(userId);
    setStats(dashboardStats);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setData(null);
    setSubscription(null);
  };

  const handleSearch = async (request: QuoteRequest) => {
    if (!user || !subscription) return;

    if (!subscription.isValid) {
       setActiveTab('planos');
       return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    
    // Simula estado pendente visualmente
    setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }));

    try {
      const result = await searchParts(request);
      setData(result);
      
      // Salvar no Histórico (Supabase ou Local)
      const lowestPrice = result.quotes.length > 0 ? Math.min(...result.quotes.map(q => q.price)) : 0;
      await saveQuoteToHistory(user.id, request, result.quotes.length, lowestPrice);
      
      // Atualizar dados locais
      await loadUserData(user.id);

    } catch (err: any) {
      console.error(err);
      // Exibe a mensagem de erro exata retornada pelo serviço
      setError(err.message || "Ocorreu um erro desconhecido ao buscar as cotações.");
      
      // Reverte stats em caso de erro
      await loadUserData(user.id);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'monthly' | 'annual') => {
    if (user) {
        const price = planType === 'monthly' ? 'R$ 12,90' : 'R$ 118,80';
        if(confirm(`Simular pagamento e assinar plano ${planType === 'monthly' ? 'Mensal' : 'Anual'} por ${price}?`)) {
            try {
                await upgradeToPremium(user.id);
                alert("Pagamento confirmado! Plano Premium ativado.");
                await handleLoginSuccess(); // Recarrega dados do perfil
                setActiveTab('nova-cotacao');
            } catch (e) {
                alert("Erro ao processar upgrade. Tente novamente.");
            }
        }
    }
  }

  // --- RENDER ---

  if (initializing) {
      return (
          <div className="min-h-screen bg-slate-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
          </div>
      )
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={() => handleLoginSuccess()} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-12">
      
      {/* Navbar / Header */}
      <header className="bg-brand-blue shadow-lg sticky top-0 z-50 border-b border-blue-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setActiveTab('nova-cotacao'); setData(null); }}>
             <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-orange rounded-lg flex items-center justify-center text-white shadow-lg transform transition-transform group-hover:-rotate-3 -skew-x-12">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 transform skew-x-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
             </div>
             <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold text-white leading-none font-heading tracking-tight">
                  Cotar<span className="text-brand-orange">Peças</span>
                </h1>
                <p className="hidden md:block text-[10px] text-blue-200 uppercase tracking-widest mt-0.5">Painel de Controle</p>
             </div>
          </div>
          
          {/* User & Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-white text-sm font-medium">{user.name}</span>
                <span className="text-xs text-blue-200">{user.email}</span>
            </div>
            {/* Mobile User Icon */}
             <div className="md:hidden w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-blue-200 border border-blue-700">
                <span className="text-xs font-bold">{user.name.charAt(0)}</span>
             </div>

            <div className="h-8 w-px bg-blue-800 mx-1 md:mx-0"></div>

            <button 
                onClick={handleLogout}
                className="p-2 text-blue-300 hover:text-white transition-colors hover:bg-blue-800 rounded-full"
                title="Sair"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
        
        {/* Banner Promocional no topo do Dashboard */}
        <PromoBanner className="mb-8" />

        {/* Subscription Banner (Visível apenas se estiver em trial) */}
        {subscription && !subscription.isPremium && subscription.isValid && (
            <div className={`mb-6 md:mb-8 p-4 md:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border bg-blue-50 border-blue-100`}>
                <div className="flex items-start md:items-center gap-3">
                    <div className="p-2 rounded-full shrink-0 bg-blue-100 text-brand-blue">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm md:text-base text-brand-blue">
                            Período de Teste Ativo
                        </h4>
                        <p className="text-xs md:text-sm leading-tight mt-1 text-blue-700">
                             Você tem <strong>{subscription.daysRemaining} dias restantes</strong> de uso gratuito.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setActiveTab('planos')}
                    className="w-full md:w-auto px-6 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-blue-900 transition-all shadow-md active:scale-95"
                >
                    Ver Planos
                </button>
            </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats stats={stats} />

        {/* Navigation Tabs - Mobile Optimized */}
        <div className="flex border-b border-slate-200 mb-6 md:mb-8 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => { setActiveTab('nova-cotacao'); setData(null); }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'nova-cotacao' ? 'border-brand-orange text-brand-orange bg-orange-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Nova Cotação
            </button>
            <button 
                onClick={() => setActiveTab('historico')}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'historico' ? 'border-brand-orange text-brand-orange bg-orange-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Histórico de Cotações
            </button>
            <button 
                onClick={() => setActiveTab('planos')}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'planos' ? 'border-brand-orange text-brand-orange bg-orange-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Planos
            </button>
        </div>

        {/* --- CONTENT RENDER LOGIC --- */}
        
        {activeTab === 'nova-cotacao' && (
            <div className="animate-fade-in">
                {/* Lógica de Bloqueio Paywall */}
                {subscription && (!subscription.isValid && !subscription.isPremium) ? (
                    <SubscriptionPlans onSubscribe={handleUpgrade} isExpired={true} />
                ) : (
                    <>
                        <SearchForm onSearch={handleSearch} isLoading={loading} />

                        {error && (
                        <div className="mt-6 md:mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 shadow-sm animate-shake">
                            <div className="p-1.5 bg-red-100 rounded-full shrink-0 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-grow">
                            <p className="font-bold text-sm md:text-base">Atenção</p>
                            <p className="text-xs md:text-sm mt-1">{error}</p>
                            </div>
                        </div>
                        )}

                        {data && (
                        <ResultsList 
                            quotes={data.quotes} 
                            summary={data.summary}
                            groundingSources={data.groundingSources}
                        />
                        )}
                    </>
                )}
            </div>
        )}

        {activeTab === 'historico' && (
            <div className="animate-fade-in">
                <QuoteHistory history={history} />
            </div>
        )}
        
        {activeTab === 'planos' && (
            <div className="animate-fade-in">
                 <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 font-heading">Escolha o seu plano</h2>
                    <p className="text-slate-600 mt-2">Aproveite ao máximo a inteligência artificial para cotar peças.</p>
                 </div>
                 <SubscriptionPlans onSubscribe={handleUpgrade} />
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
