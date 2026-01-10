import React, { useState } from 'react';
import { QuoteRequest, VehicleType } from '../types';
import { VEHICLE_MAKES, VEHICLE_MODELS, YEARS, SUGGESTED_PARTS, BRAZIL_STATES } from '../constants';

interface SearchFormProps {
  onSearch: (request: QuoteRequest) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.CARRO);
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [partName, setPartName] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // Handle vehicle type change
  const handleTypeChange = (type: VehicleType) => {
    setVehicleType(type);
    setMake('');
    setModel('');
  };

  // Handle make change
  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMake(e.target.value);
    setModel(''); // Reset model when make changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (make && model && year && partName) {
      onSearch({ 
        vehicleType, 
        make, 
        model, 
        year, 
        partName,
        state,
        city
      });
    }
  };

  const availableMakes = VEHICLE_MAKES[vehicleType] || [];
  
  let lookupKey = make.trim();
  if (vehicleType !== VehicleType.CARRO && VEHICLE_MODELS[make.trim() + ' ']) {
     lookupKey = make.trim() + ' ';
  }
  
  const availableModels = make && VEHICLE_MODELS[lookupKey] ? VEHICLE_MODELS[lookupKey] : [];
  const hasModels = availableModels.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-brand-blue p-5 md:p-6 border-b border-blue-900">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 font-heading uppercase tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Cotação Rápida
        </h2>
        <p className="text-blue-200 text-xs md:text-sm mt-1">Preencha os dados do veículo para buscar fornecedores</p>
      </div>
      
      <div className="p-4 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Vehicle Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tipo de Veículo</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
              {Object.values(VehicleType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`py-3 md:py-4 px-2 rounded-xl text-sm font-bold transition-all duration-200 border-2 touch-manipulation ${
                    vehicleType === type
                      ? 'border-brand-orange bg-orange-50 text-brand-orange shadow-md transform scale-[1.02]'
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
            
            {/* Make */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Marca</label>
              <div className="relative">
                <select
                  value={make}
                  onChange={handleMakeChange}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm md:text-base rounded-xl focus:ring-brand-orange focus:border-brand-orange block p-3 md:p-3.5 appearance-none font-medium transition-colors"
                  required
                >
                  <option value="">Selecione a Marca</option>
                  {availableMakes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Outra">Outra</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Model */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Modelo</label>
              
              {hasModels ? (
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm md:text-base rounded-xl focus:ring-brand-orange focus:border-brand-orange block p-3 md:p-3.5 appearance-none font-medium transition-colors"
                    required
                    disabled={!make}
                  >
                    <option value="">
                      {!make ? "Selecione a Marca primeiro" : "Selecione o Modelo"}
                    </option>
                    {availableModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Outro">Outro / Não listado</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={make === 'Outra' ? "Digite o modelo" : "Selecione a marca primeiro"}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm md:text-base rounded-xl focus:ring-brand-orange focus:border-brand-orange block p-3 md:p-3.5 font-medium transition-colors"
                  required
                  disabled={!make && make !== 'Outra'}
                />
              )}
            </div>

            {/* Year */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Ano</label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm md:text-base rounded-xl focus:ring-brand-orange focus:border-brand-orange block p-3 md:p-3.5 appearance-none font-medium transition-colors"
                  required
                >
                  <option value="">Ano</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

             {/* Localização (Opcional) */}
             <div className="lg:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Estado <span className="text-slate-400 font-normal lowercase">(opcional)</span></label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm md:text-base rounded-xl focus:ring-brand-orange focus:border-brand-orange block p-3 md:p-3.5 appearance-none font-medium"
                  >
                    <option value="">Todo o Brasil</option>
                    {BRAZIL_STATES.map((uf) => (
                      <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
            </div>

            <div className="lg:col-span-8 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Cidade <span className="text-slate-400 font-normal lowercase">(opcional)</span></label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo, Curitiba..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm md:text-base rounded-xl focus:ring-brand-orange focus:border-brand-orange block p-3 md:p-3.5 font-medium placeholder-slate-400"
                />
            </div>

            {/* Part Name */}
            <div className="lg:col-span-12 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Qual peça você precisa?</label>
              <div className="relative group">
                 {/* Aumentado o padding-left do container do ícone e o padding-left do input para evitar sobreposição */}
                 <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-brand-orange">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
                <input
                  type="text"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="Ex: Jogo de Velas, Pastilha de Freio..."
                  // Ajustado pl-10 para pl-12 (mobile) e md:pl-14 para dar mais espaço ao ícone
                  className="w-full pl-12 md:pl-14 bg-slate-50 border border-slate-300 text-slate-900 text-base md:text-lg rounded-xl focus:ring-brand-orange focus:border-brand-orange block p-3.5 md:p-4 font-medium placeholder-slate-400 transition-shadow shadow-sm"
                  list="parts-suggestions"
                  required
                />
              </div>
              <datalist id="parts-suggestions">
                {SUGGESTED_PARTS.map((part) => (
                  <option key={part} value={part} />
                ))}
              </datalist>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-300 transform active:scale-[0.98] uppercase tracking-wide ${
              isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-brand-orange hover:bg-opacity-90 hover:shadow-brand-orange/30'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando...
              </span>
            ) : (
              'Buscar Melhores Preços'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;