import React from 'react';
import { Linkedin, Instagram, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/embarca/',
      icon: Linkedin
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/embarca.vc/',
      icon: Instagram
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@embarcavc',
      icon: Youtube
    }
  ];

  return (
    <footer className="w-full relative z-[2] pt-10 pb-8 flex flex-col items-center justify-center pointer-events-none bg-white/75 backdrop-blur-md">
      <div className="bg-white/75 backdrop-blur-md rounded-2xl md:rounded-[2rem] w-[calc(100%-80px)] p-6 md:p-12 lg:p-16 flex flex-col justify-between items-center gap-8 md:gap-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 pointer-events-auto text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-10">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-3 text-zinc-900">Embarca</h2>
              <p className="text-zinc-600 text-sm max-w-md">
                Un fondo con alma de aceleradora para founders que construyen el futuro de LatAm.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg border border-black/10 bg-black/5 hover:bg-black/10 transition text-zinc-900"
                    aria-label={link.name}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
        </div>
          <div className="w-full mt-8 pt-6 border-t border-black/10 text-xs uppercase tracking-[0.3em] text-zinc-500 text-center md:text-left">
            © {currentYear} Embarca. Todos los derechos reservados.
          </div>
      </div>
    </footer>
  );
};
