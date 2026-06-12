'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function DisplayPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Função que busca a URL do servidor
    const fetchUrl = async () => {
      try {
        const res = await fetch('/api/tunnel', { cache: 'no-store' });
        const data = await res.json();
        
        if (data.url) {
          setUrl(data.url);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };

    // Busca imediatamente
    fetchUrl();

    // Configura o polling para buscar a cada 3 segundos
    const intervalId = setInterval(fetchUrl, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      {url ? (
        <QRCodeSVG 
          value={url} 
          size={700}
          level="H"
          bgColor="#ffffff"
          fgColor="#000000"
        />
      ) : (
        <div className="w-[700px] h-[700px] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
