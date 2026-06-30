import React from 'react';
import { District } from '../types';
import { LiquidBackground } from './LiquidBackground';

interface HeaderProps {
    district: District;
    themeName: string;
    isVisible: boolean;
    modelPlaceholderRef: React.RefObject<HTMLDivElement>;
}

export const Header: React.FC<HeaderProps> = ({ district, themeName, isVisible, modelPlaceholderRef }) => {
    return (
        <header
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] h-12 md:h-16 transition-all duration-500 border border-white/20 bg-black/15 backdrop-blur-md rounded-full px-4 md:px-8 ${isVisible ? 'translate-y-0 opacity-100 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]' : '-translate-y-[150%] opacity-0'
                }`}
        >
            <div className="h-full flex items-center justify-center gap-4 md:gap-6 w-max">

                {/* Logo (Left Column, replacing the particle target) */}
                <div className="w-6 h-6 md:w-10 md:h-10 flex-shrink-0 relative flex items-center justify-center">
                    <div
                        ref={modelPlaceholderRef}
                        className="absolute inset-0 opacity-0 pointer-events-none"
                        aria-hidden="true"
                    />
                    <img 
                      src={`/distritos/${district === District.VC ? 'Venture' : district.charAt(0) + district.slice(1).toLowerCase()}.svg`} 
                      alt={`${district} logo`} 
                      className="w-full h-full object-contain"
                      style={{ filter: `drop-shadow(0 0 5px ${
                        district === District.NATION ? '#52D8D6' : 
                        district === District.BOOSTER ? '#FF8F22' : 
                        district === District.CONNECT ? '#0066FF' : 
                        district === District.VC ? '#1BB45A' : 
                        '#00ffcc'
                      })` }}
                    />
                </div>

                {/* Text (Right of Logo) */}
                <div className="flex items-center justify-center relative h-8 md:h-12 overflow-hidden px-2 rounded-full">
                    {/* Hidden text to dictate width precisely */}
                    <span aria-hidden className="opacity-0 font-['VT323',_monospace] text-[20px] md:text-[28px] whitespace-nowrap">{themeName.toUpperCase()}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LiquidBackground
                            district={district}
                            text={themeName}
                            className="w-full h-full"
                            align="center"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};
