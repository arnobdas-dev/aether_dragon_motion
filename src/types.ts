export type DragonElement = 'celestial_cyan' | 'ember_fire' | 'jade_dragon' | 'void_shadow' | 'solaris_gold';

export interface DragonElementConfig {
  id: DragonElement;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  accentColor: string;
  eyeColor: string;
  particleColor: string;
  bgGradient: string;
}

export interface DragonSegment {
  x: number;
  y: number;
  angle: number;
  radius: number;
  spineLength: number;
}

export interface DragonParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  spin: number;
}

export interface TargetPulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export interface DragonStats {
  speed: number; // current velocity in px/frame
  distanceTraveled: number;
  headAngle: number;
  segmentCount: number;
  isBreathingFire: boolean;
}
