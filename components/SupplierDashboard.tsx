
import React, { useState, useEffect } from 'react';
import { User, Product, VehicleType } from '../types';
import { saveProduct, getSupplierProducts, processSpreadsheetUpload } from '../services/storageService';
import { VEHICLE_MAKES } from '../constants';

interface SupplierDashboardProps {
  user: User;
}

const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'upload'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [partName, setPartName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  
  // Upload State
  const [csvContent, setCsvContent] = useState('');

  useEffect(() => {
    loadProducts();
  }, [user.id]);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getSupplierProducts(user.id);
    setProducts(data);
    setIsLoading(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await saveProduct({
            supplierId: user.id,
            supplierName: user.companyName || user.name,
            vehicleType: VehicleType.CARRO,
            make,
            model,
            partName,
            brand,
            price: parseFloat(price),
            stock: parseInt(stock)
        });
        alert("Produto cadastrado com sucesso!");
        // Reset form
        setPartName(''); setPrice(''); setStock('');
        setActiveTab('list');
        loadProducts();
    } catch (error) {
        alert("Erro ao cadastrar produto.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!csvContent) return;
      
      setIsLoading(true);
      try {
          const count = await processSpreadsheetUpload(csvContent, user);
          alert(`${count} produtos importados com sucesso!`);
          setCsvContent('');
          setActiveTab('list');
          loadProducts();
      } catch (error) {
          alert("Erro na importação.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-brand-blue p-6 border-b border-blue-900 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-white font-heading">Painel do Fornecedor</h2>
                <p className="text-blue-200 text-sm mt-1">{user.companyName || user.name}</p>
            </div>
            <div className="bg-blue-800 px-4 py-2 rounded-lg">
                <span className="block text-xs text-blue-300 uppercase">Produtos Ativos</span>
                <span className="text-xl font-bold text-white">{products.length}</span>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'list' ? 'bg-slate-50 text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Meus Produtos
            </button>
            <button 
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'add' ? 'bg-slate-50 text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Adicionar Manual
            </button>
            <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'upload' ? 'bg-slate-50 text-brand-orange border-b-2 border-brand-orange' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Importar Planilha
            </button>
        </div>

        <div className="p-6">
            {activeTab === 'list' && (
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-10 text-center text-slate-500">Carregando estoque...</div>
                    ) : products.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            Nenhum produto cadastrado. Comece adicionando itens ao seu estoque.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Peça</th>
                                    <th className="px-4 py-3">Aplicação</th>
                                    <th className="px-4 py-3">Marca</th>
                                    <th className="px-4 py-3 text-right">Preço</th>
                                    <th className="px-4 py-3 text-center">Estoque</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 font-medium text-slate-800">{p.partName}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{p.make} {p.model}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{p.brand}</td>
                                        <td className="px-4 py-3 text-right font-bold text-brand-blue">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'add' && (
                <form onSubmit={handleAddSubmit} className="space-y-4 max-w-2xl mx-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marca do Veículo</label>
                            <select 
                                value={make}
                                onChange={e => setMake(e.target.value)}
                                className="w-full p-3 border rounded-xl bg-slate-50"
                                required
                            >
                                <option value="">Selecione</option>
                                {VEHICLE_MAKES[VehicleType.CARRO].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Modelo</label>
                            <input 
                                type="text"
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                className="w-full p-3 border rounded-xl bg-slate-50"
                                placeholder="Ex: Onix"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome da Peça</label>
                        <input 
                            type="text"
                            value={partName}
                            onChange={e => setPartName(e.target.value)}
                            className="w-full p-3 border rounded-xl bg-slate-50"
                            placeholder="Ex: Pastilha de Freio Dianteira"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marca da Peça</label>
                            <input 
                                type="text"
                                value={brand}
                                onChange={e => setBrand(e.target.value)}
                                className="w-full p-3 border rounded-xl bg-slate-50"
                                placeholder="Ex: Bosch"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preço (R$)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full p-3 border rounded-xl bg-slate-50"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qtd. Estoque</label>
                            <input 
                                type="number"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                className="w-full p-3 border rounded-xl bg-slate-50"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl mt-4 hover:bg-opacity-90"
                    >
                        {isLoading ? 'Salvando...' : 'Cadastrar Produto'}
                    </button>
                </form>
            )}

            {activeTab === 'upload' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                        <h4 className="font-bold text-brand-blue mb-2">Instruções para Importação (.csv)</h4>
                        <p className="text-sm text-blue-800 mb-2">Cole o conteúdo do seu arquivo CSV ou Excel (salvo como CSV) abaixo.</p>
                        <p className="text-xs text-blue-600 font-mono bg-white p-2 rounded border border-blue-100">
                            NomeDaPeca, MarcaCarro, ModeloCarro, MarcaPeca, Preco, Estoque
                        </p>
                        <p className="text-xs text-blue-500 mt-2">Exemplo: Jogo de Velas, Chevrolet, Onix, NGK, 120.00, 50</p>
                    </div>

                    <form onSubmit={handleUploadSubmit}>
                        <textarea
                            value={csvContent}
                            onChange={e => setCsvContent(e.target.value)}
                            rows={10}
                            className="w-full p-4 border border-slate-300 rounded-xl bg-slate-50 font-mono text-sm"
                            placeholder="Cole os dados aqui..."
                        ></textarea>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading || !csvContent}
                            className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl mt-4 hover:bg-opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? 'Processando...' : 'Importar Estoque'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};

export default SupplierDashboard;
