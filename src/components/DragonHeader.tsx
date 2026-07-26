import React from 'react';
import { DragonElement } from '../types';
import { DRAGON_ELEMENTS } from '../data/elements';
import { Sparkles, Flame, Zap, Wind, Eye } from 'lucide-react';

interface DragonHeaderProps {
  activeElement: DragonElement;
  onSelectElement: (el: DragonElement) => void;
  showWings: boolean;
  onToggleWings: () => void;
  showParticles: boolean;
  onToggleParticles: () => void;
  speedScale: number;
  onChangeSpeed: (speed: number) => void;
}

export const DragonHeader: React.FC<DragonHeaderProps> = ({
  activeElement,
  onSelectElement,
  showWings,
  onToggleWings,
  showParticles,
  onToggleParticles,
  speedScale,
  onChangeSpeed,
}) => {
  const currentCfg = DRAGON_ELEMENTS[activeElement];

  return (
    <header className="w-full max-w-6xl mx-auto px-4 py-4 relative z-20 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Dragon Title */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20 transition-colors duration-500"
          style={{
            backgroundColor: `${currentCfg.primaryColor}22`,
            boxShadow: `0 0 20px ${currentCfg.primaryColor}44`,
          }}
        >
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
            AETHER DRAGON
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase"
              style={{
                color: currentCfg.primaryColor,
                borderColor: `${currentCfg.primaryColor}44`,
                backgroundColor: `${currentCfg.primaryColor}11`,
              }}
            >
              {currentCfg.name}
            </span>
          </h1>
          <p className="text-[11px] font-mono text-slate-400">
            INVERSE KINETICS • SMOOTH MOUSE TRAIL
          </p>
        </div>
      </div>

      {/* Elemental Selector Pills */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl">
        {(Object.keys(DRAGON_ELEMENTS) as DragonElement[]).map((key) => {
          const item = DRAGON_ELEMENTS[key];
          const isSelected = activeElement === key;
          return (
            <button
              key={key}
              onClick={() => onSelectElement(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: item.primaryColor,
                      boxShadow: `0 0 15px ${item.primaryColor}66`,
                    }
                  : {}
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#ffffff' : item.primaryColor }}
              />
              {item.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Controls: Wings, Particles, Speed */}
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-xl text-xs font-mono">
        {/* Wings Toggle */}
        <button
          onClick={onToggleWings}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            showWings ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>WINGS</span>
        </button>

        {/* Particles Toggle */}
        <button
          onClick={onToggleParticles}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            showParticles ? 'bg-slate-800 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>EMBERS</span>
        </button>

        {/* Agility Speed Scale */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">AGILITY:</span>
          <select
            value={speedScale}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="bg-slate-800 text-white rounded-lg px-2 py-0.5 border border-slate-700 outline-none cursor-pointer"
          >
            <option value={0.7}>0.7x Smooth</option>
            <option value={1.0}>1.0x Normal</option>
            <option value={1.5}>1.5x Agile</option>
            <option value={2.0}>2.0x Hyper</option>
          </select>
        </div>
      </div>
    </header>
  );
};
