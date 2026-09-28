import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Link as LinkIcon, Check, MessageCircle, Linkedin, Twitter, Facebook, Send } from 'lucide-react';
import { getNewsShareUrl, getSocialShareLinks, copyToClipboard } from './shareLinks';

interface ShareNewsButtonProps {
  newsId: string;
  title: string;
  className?: string;
  iconSize?: number;
  label?: string;
}

const MENU_WIDTH = 224;

export const ShareNewsButton: React.FC<ShareNewsButtonProps> = ({ newsId, title, className = '', iconSize = 16, label }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = getNewsShareUrl(newsId);
  const links = getSocialShareLinks(shareUrl, title);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const closeMenu = () => setMenuPos(null);

  useEffect(() => {
    if (!menuPos) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('scroll', closeMenu, { passive: true });
    window.addEventListener('resize', closeMenu);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', closeMenu);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuPos]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuPos) return closeMenu();
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(Math.max(8, rect.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8);
    const openUp = rect.bottom + 280 > window.innerHeight;
    setMenuPos({ top: openUp ? Math.max(8, rect.top - 8 - 272) : rect.bottom + 8, left });
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch (e) {}
    closeMenu();
  };

  const itemClass = 'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-sans text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label="Compartir"
        aria-haspopup="menu"
        aria-expanded={!!menuPos}
        className={className}
      >
        <Share2 size={iconSize} />
        {label && <span>{label}</span>}
      </button>

      {menuPos && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[300]"
          onClick={(e) => { e.stopPropagation(); closeMenu(); }}
          onWheel={closeMenu}
        >
          <div
            role="menu"
            className="absolute bg-white rounded-xl shadow-2xl border border-black/10 py-2 overflow-hidden"
            style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-1 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">Compartir</div>
            <button type="button" role="menuitem" onClick={handleCopy} className={itemClass}>
              {copied ? <Check size={16} className="text-green-600" /> : <LinkIcon size={16} />}
              {copied ? '¡Link copiado!' : 'Copiar link'}
            </button>
            <a role="menuitem" href={links.whatsapp} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className={itemClass}>
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a role="menuitem" href={links.linkedin} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className={itemClass}>
              <Linkedin size={16} /> LinkedIn
            </a>
            <a role="menuitem" href={links.x} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className={itemClass}>
              <Twitter size={16} /> X / Twitter
            </a>
            <a role="menuitem" href={links.facebook} target="_blank" rel="noopener noreferrer" onClick={closeMenu} className={itemClass}>
              <Facebook size={16} /> Facebook
            </a>
            {canNativeShare && (
              <button type="button" role="menuitem" onClick={handleNativeShare} className={itemClass}>
                <Send size={16} /> Más opciones…
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
