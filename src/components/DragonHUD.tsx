import React from 'react';
import { DragonStats, DragonElement } from '../types';
import { DRAGON_ELEMENTS } from '../data/elements';
import { Activity, Compass, Flame, MousePointer, ShieldCheck } from 'lucide-react';

interface DragonHUDProps {
  stats: DragonStats;
  activeElement: DragonElement;
}

export const DragonHUD: React.FC<DragonHUDProps> = ({ stats, activeElement }) => {
  const elemCfg = DRAGON_ELEMENTS[activeElement];

  return (
    <div className="fixed bottom-6 left-6 z-20 hidden sm:flex flex-col gap-2 pointer-events-none">
      {/* Live Telemetry Card */}
      <div className="bg-slate-900/85 border border-slate-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3 w-64 text-xs font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            FLIGHT TELEMETRY
          </span>
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: elemCfg.primaryColor }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="text-slate-500 text-[10px]">VELOCITY</p>
            <p className="text-white font-bold text-sm" style={{ color: elemCfg.primaryColor }}>
              {stats.speed} <span className="text-[10px] text-slate-400">px/f</span>
            </p>
          </div>

          <div>
            <p className="text-slate-500 text-[10px]">HEAD ANGLE</p>
            <p className="text-white font-bold text-sm">
              {stats.headAngle}°
            </p>
          </div>

          <div>
            <p className="text-slate-500 text-[10px]">SPINE SEGMENTS</p>
            <p className="text-slate-300 font-bold">{stats.segmentCount} Nodes</p>
          </div>

          <div>
            <p className="text-slate-500 text-[10px]">FIRE BREATH</p>
            <p className={`font-bold ${stats.isBreathingFire ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
              {stats.isBreathingFire ? 'ACTIVE' : 'IDLE'}
            </p>
          </div>
        </div>
      </div>

      {/* Instruction Tip */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-400 flex items-center gap-2 backdrop-blur-md">
        <MousePointer className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        <span>MOVE MOUSE TO GUIDE DRAGON • CLICK TO IGNITE BURST</span>
      </div>
    </div>
  );
};
