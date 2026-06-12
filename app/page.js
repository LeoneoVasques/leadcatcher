'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    empresa: '',
    telefone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Format: (XX) XXXXX-XXXX
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

    // Validations
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
        setSuccess(true);
        setFormData({ empresa: '', telefone: '', email: '' });
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
    <main className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-700">
        <h1 className="text-3xl font-bold mb-2 text-center text-white tracking-tight">Captura de Leads</h1>
        <p className="text-neutral-400 mb-8 text-center text-sm">Registre os dados do contato abaixo</p>

        {success ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-6">Obrigado! Dados registrados.</h2>
            <button 
              onClick={() => setSuccess(false)}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cadastrar novo lead
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label htmlFor="empresa" className="text-sm font-medium text-neutral-300">Nome da Empresa</label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Ex: Tech Solutions"
                className="w-full bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="telefone" className="text-sm font-medium text-neutral-300">Telefone</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="w-full bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-neutral-300">E-mail Corporativo</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@empresa.com"
                className="w-full bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 mt-4 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Registrar Lead</span>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
