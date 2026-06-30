import React from 'react';
import { District } from '../types';
import { PixelCard } from './PixelCard';
import { User, Shield, Zap, Code, ScanFace } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  icon: any;
  status: string;
}

const TEAM_DATA: Record<District, TeamMember[]> = {
  [District.NATION]: [
    { name: 'Agustin F.', role: 'General Partner', icon: Shield, status: 'ONLINE' },
    { name: 'Sofia M.', role: 'Head of Ops', icon: Zap, status: 'BUSY' },
    { name: 'Dev Team', role: 'Protocol Main', icon: Code, status: 'CODING' },
  ],
  [District.BOOSTER]: [
    { name: 'Lucas R.', role: 'Program Director', icon: Zap, status: 'ONLINE' },
    { name: 'Mentors DAO', role: 'Advisory Network', icon: User, status: 'ACTIVE' },
    { name: 'Scout Unit', role: 'Selection', icon: ScanFace, status: 'HUNTING' },
  ],
  [District.CONNECT]: [
    { name: 'Community Lead', role: 'Head of Vibes', icon: User, status: 'ONLINE' },
    { name: 'Event Squad', role: 'Logistics', icon: User, status: 'OFFLINE' },
  ],
  [District.VC]: [
    { name: 'Inv. Commitee', role: 'Decision Node', icon: Shield, status: 'LOCKED' },
    { name: 'Analyst One', role: 'Dealflow', icon: User, status: 'READING' },
    { name: 'Legal Dept', role: 'Compliance', icon: Shield, status: 'ACTIVE' },
  ],
  [District.COWORK]: [
    { name: 'Space Mgr', role: 'Facilities', icon: User, status: 'ON_SITE' },
    { name: 'Net Admin', role: 'Infra', icon: Code, status: 'ONLINE' },
  ],
};

interface DistrictTeamProps {
  district: District;
  onAction: (msg: string) => void;
}

export const DistrictTeam: React.FC<DistrictTeamProps> = ({ district, onAction }) => {
  const members = TEAM_DATA[district];

  return (
    <PixelCard title="OPERATORS" subtitle="CORE_TEAM" variant="default">
      <div className="flex flex-col gap-3">
        {members.map((member, i) => (
          <div
            key={i}
            onClick={() => onAction(`PINGING_OPERATOR: ${member.name.toUpperCase()} [${member.status}]`)}
            className="flex items-center gap-3 p-2 -mx-2 rounded hover:bg-black/5 transition-colors group cursor-pointer"
          >

            {/* Avatar Placeholder */}
            <div className="w-10 h-10 bg-black/5 border border-black/10 flex items-center justify-center rounded-sm">
              <member.icon size={20} className="text-black/50 group-hover:text-black transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-sans font-bold text-sm text-zinc-800 truncate">{member.name}</span>
                <span className={`text-[9px] font-mono px-1 rounded ${member.status === 'ONLINE' || member.status === 'ACTIVE'
                  ? 'text-green-600 bg-green-500/10'
                  : 'text-zinc-500 bg-black/10'
                  }`}>
                  {member.status}
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 truncate">
                {member.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
};