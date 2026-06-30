import React from 'react';
import { District } from '../types';
import { GraduationCap, ExternalLink } from 'lucide-react';
import { PixelButton } from './PixelButton';

interface NavigationProps {
  currentDistrict: District;
  onNavigate: (d: District, origin?: { x: number, y: number }) => void;
  isHidden?: boolean;
}

const DISTRICT_COLORS: Record<District, string> = {
  [District.NATION]: '#343F92',
  [District.BOOSTER]: '#E12951',
  [District.CONNECT]: '#7865AA',
  [District.VC]: '#11612C',
  [District.COWORK]: '#00ffcc',
};

const CAMPUS_URL = 'https://campusolegario.org/';
const CAMPUS_COLOR = '#ffffff';

export const Navigation: React.FC<NavigationProps> = ({ currentDistrict, onNavigate, isHidden = false }) => {
  const navItems = [
    { id: District.BOOSTER, label: 'BOOSTER', iconSrc: '/distritos/Booster.svg' },
    { id: District.CONNECT, label: 'CONNECT', iconSrc: '/distritos/Connect.svg' },
    { id: District.VC, label: 'VENTURE', iconSrc: '/distritos/Venture.svg' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLElement>, id: District) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    onNavigate(id, { x: centerX, y: centerY });
  };

  const handleCampusClick = () => {
    window.location.href = CAMPUS_URL;
  };

  return (
    <nav
      className={`fixed bottom-4 left-0 w-full px-2 md:px-8 z-[100] pointer-events-none flex justify-center transition-all duration-300 ${
        isHidden ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div
        className={`bg-black/15 backdrop-blur-md border border-white/10 p-2 md:p-3 rounded-full flex items-center justify-start md:justify-between gap-2 md:gap-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-[calc(100vw-16px)] md:w-auto md:overflow-x-visible ${
          isHidden ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >

        {/* Home Button */}
        <div className="flex-1 shrink-0 md:flex-none">
          <PixelButton
            variant={currentDistrict === District.NATION ? 'nav-active' : 'nav'}
            onClick={(e) => handleNavClick(e, District.NATION)}
            className="md:!px-4"
            color={DISTRICT_COLORS[District.NATION]}
          >
            <img 
              src="/distritos/Nation.svg" 
              alt="NATION icon" 
              className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-6 md:h-6 shrink-0" 
              style={{ 
                filter: currentDistrict === District.NATION ? 'none' : 'grayscale(100%) opacity(70%)',
                color: currentDistrict === District.NATION ? DISTRICT_COLORS[District.NATION] : 'currentColor' 
              }} 
            />
            <span className={`text-[15px] sm:text-xs md:text-sm lg:text-base tracking-tighter sm:tracking-tight shrink-0 ${currentDistrict === District.NATION ? 'inline' : 'hidden md:inline'}`} style={{ color: currentDistrict === District.NATION ? DISTRICT_COLORS[District.NATION] : 'currentColor' }}>
              NATION
            </span>
          </PixelButton>
        </div>

        <div className="h-6 md:h-8 w-px bg-white/20 hidden md:block shrink-0"></div>

        {/* District Buttons */}
        {navItems.map((item) => (
          <div key={item.id} className="flex-1 shrink-0 md:flex-none">
            <PixelButton
              variant={currentDistrict === item.id ? 'nav-active' : 'nav'}
              onClick={(e) => handleNavClick(e, item.id)}
              className="md:!px-4"
              color={DISTRICT_COLORS[item.id]}
            >
              <img
                src={item.iconSrc}
                alt={`${item.label} icon`}
                className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-[18px] md:h-[18px] shrink-0"
                style={{ 
                  filter: currentDistrict === item.id ? 'none' : 'grayscale(100%) opacity(70%)',
                  color: currentDistrict === item.id ? DISTRICT_COLORS[item.id] : 'currentColor'
                }}
              />
              <span className={`text-[15px] sm:text-xs md:text-sm lg:text-base tracking-tighter sm:tracking-tight shrink-0 ${currentDistrict === item.id ? 'inline' : 'hidden md:inline'}`} style={{ color: currentDistrict === item.id ? DISTRICT_COLORS[item.id] : 'currentColor' }}>
                {item.label}
              </span>
            </PixelButton>
          </div>
        ))}

        <div className="h-6 md:h-8 w-px bg-white/20 hidden md:block shrink-0"></div>

        <div className="flex-1 shrink-0 md:flex-none">
          <PixelButton
            variant="nav"
            onClick={handleCampusClick}
            className="md:!px-4"
          >
            <GraduationCap
              className="w-4 h-4 sm:w-3.5 sm:h-3.5 md:w-[18px] md:h-[18px] shrink-0"
              strokeWidth={2.5}
              style={{ color: CAMPUS_COLOR }}
            />
            <span className="text-[15px] sm:text-xs md:text-sm lg:text-base tracking-tighter sm:tracking-tight shrink-0 hidden md:inline" style={{ color: CAMPUS_COLOR }}>
              CAMPUS
            </span>
            <ExternalLink size={12} className="hidden md:block text-white/50 shrink-0" />
          </PixelButton>
        </div>
      </div>
    </nav>
  );
};