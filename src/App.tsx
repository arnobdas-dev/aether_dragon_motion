import React, { useState } from 'react';
import { DragonElement, DragonStats } from './types';
import { DragonCanvas } from './components/DragonCanvas';
import { DragonHeader } from './components/DragonHeader';
import { DragonHUD } from './components/DragonHUD';
import { ElementalCards } from './components/ElementalCards';
import { Compass, MousePointer, Shield } from 'lucide-react';

export default function App() {
  const [element, setElement] = useState<DragonElement>('celestial_cyan');
  const [showWings, setShowWings] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [speedScale, setSpeedScale] = useState(1.0);

  const [stats, setStats] = useState<DragonStats>({
    speed: 0,
    distanceTraveled: 0,
    headAngle: 0,
    segmentCount: 36,
    isBreathingFire: false,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden select-none flex flex-col justify-between">
      {/* Dynamic 60 FPS Inverse Kinematics Dragon Canvas */}
      <DragonCanvas
        element={element}
        showWings={showWings}
        showParticles={showParticles}
        dragonSpeedScale={speedScale}
        onUpdateStats={setStats}
      />

      {/* Floating Live Telemetry HUD */}
      <DragonHUD stats={stats} activeElement={element} />

      {/* Main Overlay Content */}
      <div className="relative z-10 space-y-6">
        {/* Header Controls */}
        <DragonHeader
          activeElement={element}
          onSelectElement={setElement}
          showWings={showWings}
          onToggleWings={() => setShowWings(!showWings)}
          showParticles={showParticles}
          onToggleParticles={() => setShowParticles(!showParticles)}
          speedScale={speedScale}
          onChangeSpeed={setSpeedScale}
        />

        {/* Hero Title & Interactive Guidance */}
        <main className="max-w-4xl mx-auto text-center px-4 pt-4 space-y-4 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase shadow-2xl backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>KINETIC DRAGON MOTION ENGINE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            GUIDE THE CELESTIAL WYRM WITH YOUR{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              CURSOR
            </span>
          </h2>

          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest max-w-xl mx-auto">
            SERPENTINE INVERSE KINETICS • GLOWING SCALES • FLUID FLAPPING WINGS
          </p>
        </main>
      </div>

      {/* Bottom Section: Elemental Selector Cards & Footer */}
      <div className="relative z-10 space-y-4">
        <ElementalCards activeElement={element} onSelectElement={setElement} />

        <footer className="max-w-5xl mx-auto px-4 py-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>AETHER DRAGON MOTION • INVERSE KINETICS ENGINE</span>
          </div>

          <div className="flex items-center gap-3">
            <span>POINTER TRACKING</span>
            <span>•</span>
            <span>60 FPS VECTOR CANVAS</span>
            <span>•</span>
            <span>SILENT ARTWORK</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
