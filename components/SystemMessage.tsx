import React, { useEffect, useState } from 'react';
import { Terminal, X } from 'lucide-react';

interface SystemMessageProps {
  message: string | null;
  onClose: () => void;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for transition
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message && !isVisible) return null;

  return (
    <div className={`fixed top-24 right-4 md:right-8 z-[100] max-w-[300px] md:max-w-sm transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
      <div className="bg-white border border-black/20 shadow-[0_0_30px_rgba(0,0,0,0.1)] backdrop-blur-xl text-zinc-900">
        <div className="bg-black/5 border-b border-black/10 p-2 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600">
            <Terminal size={12} />
            <span>SYS_MSG_LOG</span>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-black/40 hover:text-black transition-colors">
            <X size={12} />
          </button>
        </div>
        <div className="p-4 font-mono text-sm text-zinc-600 leading-snug">
          <span className="text-emerald-500 mr-2">{'>'}</span>
          {message}
          <span className="animate-pulse inline-block w-1.5 h-3 bg-emerald-500 ml-2 align-middle"></span>
        </div>
      </div>
    </div>
  );
};
