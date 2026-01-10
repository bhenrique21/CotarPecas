import React from 'react';

interface DashboardStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Card Total */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
        <div>
          <p className="text-xs md:text-sm font-medium text-slate-500 mb-1 uppercase tracking-wide">Total de Cotações</p>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 font-heading">{stats.total}</h3>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-brand-blue border border-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>

      {/* Card Concluídas */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
        <div>
          <p className="text-xs md:text-sm font-medium text-slate-500 mb-1 uppercase tracking-wide">Concluídas</p>
          <h3 className="text-3xl md:text-4xl font-bold text-brand-orange font-heading">{stats.completed}</h3>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center text-brand-orange border border-orange-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Card Pendentes (Simulado) */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
        <div>
          <p className="text-xs md:text-sm font-medium text-slate-500 mb-1 uppercase tracking-wide">Pendentes</p>
          <h3 className="text-3xl md:text-4xl font-bold text-yellow-600 font-heading">{stats.pending}</h3>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 border border-yellow-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;