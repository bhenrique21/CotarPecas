import { User, QuoteHistoryItem, QuoteRequest } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// === LOCAL STORAGE KEYS (FALLBACK) ===
const LS_USERS_KEY = 'cotarpecas_users';
const LS_HISTORY_KEY = 'cotarpecas_history';
const LS_SESSION_KEY = 'cotarpecas_session';

// --- AUTH & PROFILES ---

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  if (isSupabaseConfigured) {
    // --- SUPABASE MODE ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Erro ao criar usuário.");

    const newUserProfile = {
      id: authData.user.id,
      name,
      email,
      plan: 'free_trial',
      created_at: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([newUserProfile]);

    if (profileError) {
      console.error("Erro ao criar perfil:", profileError);
      throw new Error("Usuário criado, mas falha ao configurar perfil.");
    }

    return {
      id: newUserProfile.id,
      name: newUserProfile.name,
      email: newUserProfile.email,
      plan: newUserProfile.plan as 'free_trial' | 'premium',
      createdAt: newUserProfile.created_at,
      password: ''
    };
  } else {
    // --- LOCAL STORAGE MODE ---
    const usersStr = localStorage.getItem(LS_USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      throw new Error("E-mail já cadastrado (Modo Local).");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // Nota: Em localStorage salvamos a senha para simular login, em prod isso é inseguro
      plan: 'free_trial',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(LS_SESSION_KEY, newUser.id); // Auto login

    return newUser;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  if (isSupabaseConfigured) {
    // --- SUPABASE MODE ---
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error("Credenciais inválidas ou falha no login.");
    if (!authData.user) throw new Error("Usuário não encontrado.");

    return await getUserProfile(authData.user.id);
  } else {
    // --- LOCAL STORAGE MODE ---
    const usersStr = localStorage.getItem(LS_USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error("Credenciais inválidas (Modo Local).");
    }

    localStorage.setItem(LS_SESSION_KEY, user.id);
    return user;
  }
};

export const logoutUser = async () => {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem(LS_SESSION_KEY);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (isSupabaseConfigured) {
    // --- SUPABASE MODE ---
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      return await getUserProfile(session.user.id);
    } catch (e) {
      console.warn("Falha ao recuperar sessão Supabase, verificando offline...");
      return null;
    }
  } else {
    // --- LOCAL STORAGE MODE ---
    const userId = localStorage.getItem(LS_SESSION_KEY);
    if (!userId) return null;

    const usersStr = localStorage.getItem(LS_USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    return users.find(u => u.id === userId) || null;
  }
};

const getUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
     throw new Error("Perfil de usuário não encontrado.");
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    plan: data.plan,
    createdAt: data.created_at
  };
}

// --- SUBSCRIPTION ---

export const checkSubscriptionStatus = (user: User): { isValid: boolean, daysRemaining: number, isPremium: boolean } => {
  if (user.plan === 'premium') return { isValid: true, daysRemaining: 30, isPremium: true };

  const created = new Date(user.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const daysRemaining = 7 - diffDays;

  return {
    isValid: diffDays <= 7,
    daysRemaining: Math.max(0, daysRemaining),
    isPremium: false
  };
};

export const upgradeToPremium = async (userId: string) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'premium' })
      .eq('id', userId);

    if (error) throw new Error("Erro ao atualizar plano.");
  } else {
    const usersStr = localStorage.getItem(LS_USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index].plan = 'premium';
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    }
  }
};

// --- HISTORY & STATS ---

export const saveQuoteToHistory = async (userId: string, request: QuoteRequest, resultCount: number, lowestPrice: number) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('quotes')
      .insert([{
        user_id: userId,
        request: request,
        result_count: resultCount,
        total_value: lowestPrice,
        status: 'concluido'
      }]);

    if (error) console.error("Erro ao salvar histórico:", error);
  } else {
    const historyStr = localStorage.getItem(LS_HISTORY_KEY);
    const history: QuoteHistoryItem[] = historyStr ? JSON.parse(historyStr) : [];
    
    const newItem: QuoteHistoryItem = {
      id: crypto.randomUUID(),
      userId,
      date: new Date().toISOString(),
      status: 'concluido',
      request,
      resultCount,
      totalValue: lowestPrice
    };
    
    history.push(newItem);
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(history));
  }
};

export const getUserHistory = async (userId: string): Promise<QuoteHistoryItem[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      date: item.created_at,
      status: item.status,
      request: item.request,
      resultCount: item.result_count,
      totalValue: item.total_value
    }));
  } else {
    const historyStr = localStorage.getItem(LS_HISTORY_KEY);
    const history: QuoteHistoryItem[] = historyStr ? JSON.parse(historyStr) : [];
    return history
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};

export const getDashboardStats = async (userId: string) => {
  if (isSupabaseConfigured) {
    const { count: total, error: errTotal } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: completed, error: errCompleted } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'concluido');

    if (errTotal || errCompleted) {
      return { total: 0, completed: 0, pending: 0 };
    }

    return {
      total: total || 0,
      completed: completed || 0,
      pending: 0, 
    };
  } else {
    const history = await getUserHistory(userId);
    return {
      total: history.length,
      completed: history.filter(h => h.status === 'concluido').length,
      pending: history.filter(h => h.status === 'pendente').length
    };
  }
};