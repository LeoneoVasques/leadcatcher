'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    empresa: '',
    telefone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Formatação automática para: (XX) XXXXX-XXXX
    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }
    
    setFormData({ ...formData, telefone: formatted });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.empresa.trim() || !formData.telefone.trim() || !formData.email.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (formData.telefone.replace(/\D/g, '').length < 10) {
      setError('Por favor, insira um telefone válido.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setShowModal(true); // Abre o Modal em vez de trocar a tela inteira
        setFormData({ empresa: '', telefone: '', email: '' }); // Limpa o formulário atrás do modal
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao enviar dados. Tente novamente.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorativo com as cores da SwitchPay */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#15c2ea] to-[#00fecf]"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#15c2ea]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00fecf]/10 blur-[120px] pointer-events-none"></div>

      {/* Container Principal do Formulário */}
      <div className="w-full max-w-md p-8 sm:p-10 bg-[#4d4d4d] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neutral-600 relative z-10">
        
        <div className="mb-8 text-center flex flex-col items-center">
          <img 
            src="https://github.com/LeoneoVasques/swp-email-assets/blob/main/logo-horizontal-color.png?raw=true" 
            alt="SwitchPay Logo" 
            className="h-10 mb-2 object-contain"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center font-medium animate-in fade-in">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label htmlFor="empresa" className="text-sm font-semibold text-neutral-200 ml-1">Nome OU Nome da Empresa</label>
            <input
              type="text"
              id="empresa"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              placeholder="Ex: Tech Solutions"
              className="w-full bg-neutral-800 border-2 border-transparent text-white placeholder-neutral-500 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#15c2ea] focus:ring-1 focus:ring-[#15c2ea] transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="telefone" className="text-sm font-semibold text-neutral-200 ml-1">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              className="w-full bg-neutral-800 border-2 border-transparent text-white placeholder-neutral-500 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#15c2ea] focus:ring-1 focus:ring-[#15c2ea] transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-neutral-200 ml-1">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contato@empresa.com"
              className="w-full bg-neutral-800 border-2 border-transparent text-white placeholder-neutral-500 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#15c2ea] focus:ring-1 focus:ring-[#15c2ea] transition-all shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#15c2ea] to-[#11a9cc] hover:from-[#00fecf] hover:to-[#00fecf] disabled:opacity-70 disabled:cursor-not-allowed text-neutral-900 font-extrabold text-lg py-4 px-4 rounded-xl transition-all duration-300 mt-4 flex items-center justify-center space-x-2 shadow-lg shadow-[#15c2ea]/30 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processando...</span>
              </>
            ) : (
              <span>Enviar</span>
            )}
          </button>
        </form>
      </div>

      {/* Modal de Sucesso (Popup) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#4d4d4d] w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-neutral-600 flex flex-col items-center text-center transform animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-[#00fecf]/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-[#00fecf]/30">
              <svg className="w-10 h-10 text-[#00fecf]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-extrabold text-white mb-2">Sucesso!</h2>
            <p className="text-neutral-300 mb-8 font-medium">
              Obrigado por escolher a SwitchPay!<br />Entraremos em contato em breve.
            </p>
            
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-gradient-to-r from-[#15c2ea] to-[#11a9cc] hover:from-[#00fecf] hover:to-[#00fecf] text-neutral-900 font-extrabold text-lg py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#15c2ea]/30"
            >
              Novo Cadastro
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
