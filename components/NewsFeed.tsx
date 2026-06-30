import React from 'react';
import { District } from '../types';
import { ExternalLink, Radio, MessageSquareText, FileText, Megaphone } from 'lucide-react';
import { PixelCard } from './PixelCard';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
  tag: string;
  isOfficial?: boolean; // New flag for company content
  type: 'article' | 'alert' | 'event';
}

const NEWS_DATA: Record<District, NewsItem[]> = {
  [District.NATION]: [
    { id: '1', title: 'Embarca Manifesto: Why we are building a nation, not just a fund', date: '2h ago', source: 'Embarca Press', tag: 'OFFICIAL', isOfficial: true, type: 'article' },
    { id: '2', title: 'Ecosystem Report 2024: The Rise of LatAm Tech', date: '5h ago', source: 'TechCrunch', tag: 'MARKET', type: 'article' },
    { id: '3', title: 'Governance tokens distributed to active nodes', date: '1d ago', source: 'DAO', tag: 'CRYPTO', isOfficial: true, type: 'alert' },
  ],
  [District.BOOSTER]: [
    { id: '1', title: 'Call for Founders: Batch #04 Thesis & Application Guide', date: 'Now', source: 'Booster Team', tag: 'ANNOUNCEMENT', isOfficial: true, type: 'article' },
    { id: '2', title: 'Demo Day: 12 Startups presenting next week', date: '2d ago', source: 'Events', tag: 'LIVE', type: 'event' },
    { id: '3', title: 'Success Story: Fintech alum raises Series A', date: '4d ago', source: 'Portfolio', tag: 'GROWTH', type: 'article' },
  ],
  [District.CONNECT]: [
    { id: '1', title: 'The Collision Theory: How we design serendipity at Embarca', date: '12m ago', source: 'Community Lead', tag: 'THOUGHTS', isOfficial: true, type: 'article' },
    { id: '2', title: 'Weekly mixer at Crypto Café tonight: DeFi focus', date: '4h ago', source: 'Discord', tag: 'MEETUP', type: 'event' },
    { id: '3', title: 'New partnership with global innovation hubs', date: '2d ago', source: 'Network', tag: 'PARTNER', isOfficial: true, type: 'alert' },
  ],
  [District.VC]: [
    { id: '1', title: 'Deep Dive: Our Bull Case for Solarpunk Infrastructure', date: '1w ago', source: 'Investment Team', tag: 'THESIS', isOfficial: true, type: 'article' },
    { id: '2', title: 'Investment Alert: $3M deployment in BioTech AI', date: '1h ago', source: 'Portfolio', tag: 'DEAL', type: 'alert' },
    { id: '3', title: 'Q3 LP Report: Outperforming market benchmarks', date: '3d ago', source: 'Finance', tag: 'ALPHA', isOfficial: true, type: 'article' },
  ],
  [District.COWORK]: [
    { id: '1', title: 'Space Upgrade: Introducing the new Deep Work Pods', date: '30m ago', source: 'Ops Team', tag: 'UPDATE', isOfficial: true, type: 'alert' },
    { id: '2', title: 'Fiber internet upgrade completed (10Gbps)', date: '1d ago', source: 'Infra', tag: 'TECH', type: 'alert' },
    { id: '3', title: 'Nomad Visa partnership established for members', date: '3d ago', source: 'Legal', tag: 'PERK', type: 'article' },
  ],
};

export const NewsFeed: React.FC<{ district: District }> = ({ district }) => {
  const news = NEWS_DATA[district];
  const featured = news[0]; // Assume first item is always the main feature
  const stream = news.slice(1);

  const getIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText size={14} />;
      case 'event': return <Radio size={14} />;
      default: return <Megaphone size={14} />;
    }
  };

  return (
    <PixelCard title="INTELLIGENCE" subtitle="LIVE_FEED" variant="default">

      {/* Header Status */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-[10px] font-mono text-green-400 animate-pulse">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          <span>NETWORK_ACTIVE</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-500">
          SYNCED: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* FEATURED / COMPANY ARTICLE */}
      <div className="mb-8 relative group cursor-pointer">
        <div className="absolute -left-3 top-0 bottom-0 w-1 bg-black scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

        {featured.isOfficial && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-white font-pixel text-xs mb-3">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            OFFICIAL_TRANSMISSION
          </div>
        )}

        <h3 className="text-xl md:text-2xl font-bold leading-tight mb-2 group-hover:text-emerald-500 transition-colors text-zinc-800">
          {featured.title}
        </h3>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 mt-2">
          <span className="text-zinc-800 bg-black/5 px-1.5 py-0.5 rounded flex items-center gap-1.5">
            {getIcon(featured.type)}
            {featured.source}
          </span>
          <span>{featured.date}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-black/50 group-hover:text-black transition-colors">
          <span>READ_FULL_ENTRY</span>
          <ExternalLink size={12} />
        </div>
      </div>

      {/* SIGNAL STREAM LABEL */}
      <div className="font-mono text-[10px] text-zinc-500 mb-3 uppercase tracking-widest flex items-center gap-2">
        <div className="h-px bg-black/10 flex-grow"></div>
        INCOMING_SIGNALS
        <div className="h-px bg-black/10 flex-grow"></div>
      </div>

      {/* SECONDARY LIST */}
      <div className="flex flex-col gap-3">
        {stream.map((item, index) => (
          <div
            key={item.id}
            className="group/item cursor-pointer flex gap-3 items-start p-2 rounded hover:bg-black/5 transition-all duration-200"
          >
            <div className={`mt-1 shrink-0 ${item.isOfficial ? 'text-zinc-800' : 'text-zinc-500'}`}>
              {getIcon(item.type)}
            </div>

            <div className="flex-grow">
              <h4 className="font-sans text-sm font-medium text-zinc-700 leading-snug group-hover/item:text-zinc-800 transition-colors mb-1">
                {item.title}
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-500">
                  {item.source} // {item.tag}
                </span>
                <span className="text-[9px] font-mono text-zinc-500">
                  {item.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </PixelCard>
  );
};
