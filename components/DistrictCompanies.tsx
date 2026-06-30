import React from 'react';
import { District } from '../types';
import { PixelCard } from './PixelCard';
import { ArrowUpRight, Hexagon } from 'lucide-react';

const COMPANIES_DATA: Record<District, { title: string, subtitle: string, list: string[] }> = {
  [District.NATION]: {
    title: 'NETWORK_NODES',
    subtitle: 'BACKERS_&_PARTNERS',
    list: ['StarkInd', 'WayneEnt', 'CyberDy', 'Tyrell', 'Massive', 'Hooli', 'Globex', 'Umbrella']
  },
  [District.BOOSTER]: {
    title: 'ALUMNI_BATCHES',
    subtitle: 'ACCELERATED_UNITS',
    list: ['PiedPiper', 'Aviato', 'Sliceline', 'Raviga', 'Endframe', 'Bachman', 'SeeFood', 'NewInternet']
  },
  [District.CONNECT]: {
    title: 'EVENT_SPONSORS',
    subtitle: 'ECOSYSTEM_ALLIES',
    list: ['Meetup', 'Discord', 'Eventbrite', 'Luma', 'Telegram', 'Signal', 'Twitch', 'Kick']
  },
  [District.VC]: {
    title: 'DEPLOYED_CAPITAL',
    subtitle: 'PORTFOLIO_HITS',
    list: ['Coinbase', 'OpenAI', 'SpaceX', 'Stripe', 'Figma', 'Vercel', 'Replit', 'Supabase']
  },
  [District.COWORK]: {
    title: 'CURRENT_RESIDENTS',
    subtitle: 'MEMBERS',
    list: ['WeWork', 'Selina', 'ImpactHub', 'Station F', 'SecondHome', 'Betahaus', 'SohoHouse', 'TheWing']
  },
};

interface DistrictCompaniesProps {
  district: District;
  onAction: (msg: string) => void;
}

export const DistrictCompanies: React.FC<DistrictCompaniesProps> = ({ district, onAction }) => {
  const data = COMPANIES_DATA[district];

  return (
    <PixelCard title={data.title} subtitle={data.subtitle} variant="highlight">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.list.map((company, i) => (
          <div
            key={i}
            onClick={() => onAction(`ACCESSING_NODE_DATA: ${company.toUpperCase()}`)}
            className="group relative bg-black/5 border border-black/5 h-20 flex flex-col items-center justify-center hover:bg-black/10 transition-all hover:-translate-y-1 hover:border-black/20 cursor-pointer overflow-hidden rounded-sm"
          >

            {/* Icon Placeholder */}
            <div className="mb-2 text-black/20 group-hover:text-black/80 transition-colors">
              <Hexagon size={20} strokeWidth={1} />
            </div>

            <span className="font-mono text-xs font-bold text-zinc-500 group-hover:text-zinc-800 tracking-tight text-center z-10">
              {company}
            </span>

            {/* Hover Icon */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-black">
              <ArrowUpRight size={10} />
            </div>

            {/* Decorative Corner */}
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black/10 group-hover:border-black/40 transition-colors"></div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-end border-t border-black/10 pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Valuation</span>
          <span className="font-pixel text-2xl text-zinc-800 leading-none">$420M+</span>
        </div>
        <button
          onClick={() => onAction('REQUESTING_FULL_DATABASE_ACCESS...')}
          className="text-xs font-mono text-zinc-500 hover:text-zinc-800 underline decoration-1 underline-offset-4 transition-colors"
        >
          VIEW_FULL_DATABASE
        </button>
      </div>
    </PixelCard>
  );
};
