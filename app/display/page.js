'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function DisplayPage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'online' | 'offline'

  useEffect(() => {
    let isMounted = true;

    const fetchUrl = async () => {
      try {
        const res = await fetch('/api/tunnel', { cache: 'no-store' });
        const data = await res.json();

        if (!isMounted) return;

        if (data?.url && typeof data.url === 'string' && data.url.startsWith('http')) {
          setUrl(data.url);
          setStatus('online');
        } else {
          setUrl('');
          setStatus('connecting');
        }
      } catch {
        if (isMounted) {
          setStatus('offline');
        }
      }
    };

    fetchUrl();
    const intervalId = setInterval(fetchUrl, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      
      {/* Luzes decorativas com as cores da SwitchPay */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#15c2ea] to-[#00fecf]"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#15c2ea]/15 blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#00fecf]/15 blur-[140px] pointer-events-none"></div>

      {/* Topo: Logo da SwitchPay e Título */}
      <header className="w-full max-w-2xl text-center flex flex-col items-center z-10 pt-2">
        <div className="mb-4">
          <img 
            src="/logo.png" 
            alt="SwitchPay Logo" 
            className="h-12 sm:h-14 object-contain filter drop-shadow-lg"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          Conecte-se com a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15c2ea] to-[#00fecf]">SwitchPay</span>
        </h1>
        <p className="mt-2 text-base sm:text-lg text-neutral-400 font-medium max-w-lg">
          Aponte a câmera do seu celular para o QR Code abaixo e cadastre-se em menos de 1 minuto.
        </p>
      </header>

      {/* Centro: Moldura do QR Code */}
      <div className="my-6 z-10 flex flex-col items-center">
        <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-[0_20px_60px_rgba(21,194,234,0.25)] border-4 border-neutral-800 transition-all duration-500 hover:scale-[1.02]">
          {url ? (
            <div className="relative">
              <QRCodeSVG 
                value={url} 
                size={340}
                level="H"
                bgColor="#ffffff"
                fgColor="#0a0a0a"
                className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
              />
            </div>
          ) : (
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex flex-col items-center justify-center space-y-4 bg-neutral-100 rounded-2xl">
              <div className="w-12 h-12 border-4 border-neutral-300 border-t-[#15c2ea] rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-neutral-600 animate-pulse">
                Iniciando túnel seguro...
              </p>
            </div>
          )}
        </div>

        {/* Link / Status abaixo do QR Code */}
        {url && (
          <div className="mt-4 flex items-center space-x-2 text-xs sm:text-sm text-neutral-400 bg-neutral-900/80 px-4 py-1.5 rounded-full border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-neutral-300 truncate max-w-xs sm:max-w-md">{url}</span>
          </div>
        )}
      </div>

      {/* Rodapé: Passo a Passo e Status */}
      <footer className="w-full max-w-3xl z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800/80 text-xs sm:text-sm text-neutral-400">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-[#15c2ea]/20 text-[#15c2ea] font-bold flex items-center justify-center text-xs">1</span>
            <span>Abra a câmera</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-[#15c2ea]/20 text-[#15c2ea] font-bold flex items-center justify-center text-xs">2</span>
            <span>Aponte pro QR</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-[#00fecf]/20 text-[#00fecf] font-bold flex items-center justify-center text-xs">3</span>
            <span>Preencha rápido</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {status === 'online' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Totem Ativo
            </span>
          ) : status === 'connecting' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ◌ Aguardando túnel...
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              ✕ Desconectado
            </span>
          )}
        </div>
      </footer>
    </main>
  );
}

