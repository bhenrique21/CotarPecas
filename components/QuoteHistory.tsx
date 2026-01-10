import React from 'react';
import { QuoteHistoryItem } from '../types';

interface QuoteHistoryProps {
  history: QuoteHistoryItem[];
}

const QuoteHistory: React.FC<QuoteHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm mx-4 md:mx-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-slate-500 font-medium">Nenhum histórico disponível ainda.</p>
        <p className="text-slate-400 text-sm mt-1">Faça sua primeira cotação agora!</p>
      </div>
    );
  }

  return (
    <div className="bg-white md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden rounded-xl">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Histórico Recente
        </h3>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Veículo</th>
              <th className="px-6 py-4 font-semibold">Peça</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Melhor Preço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium text-slate-900">{new Date(item.date).toLocaleDateString('pt-BR')}</div>
                  <div className="text-xs text-slate-400">{new Date(item.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  {item.request.make} {item.request.model} <span className="text-slate-400 font-normal text-xs ml-1">({item.request.year})</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.request.partName}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    Concluído
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right group-hover:text-brand-orange transition-colors">
                  {item.totalValue 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalValue) 
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {history.map((item) => (
            <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                        <h4 className="font-bold text-slate-900 text-lg">{item.request.make} {item.request.model}</h4>
                        <p className="text-sm text-slate-600">{item.request.partName}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-800 border border-green-200">
                        Concluído
                    </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                     <span className="text-xs text-slate-500">Menor valor encontrado:</span>
                     <span className="text-xl font-bold text-brand-orange font-heading">
                        {item.totalValue 
                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalValue) 
                        : '-'}
                     </span>
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};

export default QuoteHistory;