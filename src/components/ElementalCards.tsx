import React from 'react';
import { DragonElement } from '../types';
import { DRAGON_ELEMENTS } from '../data/elements';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ElementalCardsProps {
  activeElement: DragonElement;
  onSelectElement: (el: DragonElement) => void;
}

export const ElementalCards: React.FC<ElementalCardsProps> = ({
  activeElement,
  onSelectElement,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 relative z-20 pt-4 pb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          ELEMENTAL DRAGON ARCHETYPES
        </h3>
        <span className="text-[11px] font-mono text-slate-500">SELECT TO TRANSFORM WYRM</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(DRAGON_ELEMENTS) as DragonElement[]).map((key) => {
          const item = DRAGON_ELEMENTS[key];
          const isSelected = activeElement === key;

          return (
            <button
              key={key}
              onClick={() => onSelectElement(key)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 backdrop-blur-xl flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/90 border-white/40 shadow-xl scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
              style={{
                boxShadow: isSelected ? `0 0 25px ${item.primaryColor}33` : undefined,
              }}
            >
              {/* Top Accent Pill */}
              <div className="flex items-center justify-between w-full mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
                  style={{ backgroundColor: item.primaryColor }}
                />
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isSelected ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:text-slate-300'
                  }`}
                />
              </div>

              {/* Title & Tagline */}
              <div>
                <h4 className="text-xs font-mono font-bold text-white group-hover:text-cyan-200 transition-colors">
                  {item.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                  {item.tagline}
                </p>
              </div>

              {/* Selection Border Glow */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none border"
                  style={{ borderColor: item.primaryColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
