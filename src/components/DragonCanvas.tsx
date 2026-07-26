import React, { useEffect, useRef } from 'react';
import { DragonElement, DragonParticle, DragonSegment, DragonStats, TargetPulse } from '../types';
import { DRAGON_ELEMENTS } from '../data/elements';

interface DragonCanvasProps {
  element: DragonElement;
  showWings: boolean;
  showParticles: boolean;
  dragonSpeedScale: number;
  onUpdateStats?: (stats: DragonStats) => void;
  onCanvasClick?: (x: number, y: number) => void;
}

export const DragonCanvas: React.FC<DragonCanvasProps> = ({
  element,
  showWings,
  showParticles,
  dragonSpeedScale,
  onUpdateStats,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse & Target state
  const targetRef = useRef<{ x: number; y: number; isDown: boolean }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    isDown: false,
  });

  const dragonStateRef = useRef<{
    segments: DragonSegment[];
    headAngle: number;
    velocity: number;
    distanceTraveled: number;
    time: number;
  }>({
    segments: [],
    headAngle: 0,
    velocity: 0,
    distanceTraveled: 0,
    time: 0,
  });

  const particlesRef = useRef<DragonParticle[]>([]);
  const pulsesRef = useRef<TargetPulse[]>([]);

  // Initialize Dragon Spine Segments
  const initDragon = (w: number, h: number) => {
    const count = 36;
    const segs: DragonSegment[] = [];
    const startX = w / 2;
    const startY = h / 2;

    for (let i = 0; i < count; i++) {
      // Calculate radius taper:
      // Head (i=0): ~18, Neck (1-4): ~14, Chest (5-14): ~22, Tail (15-32): 20 -> 4, Tip (33-35): ~2
      let radius = 18;
      if (i === 0) radius = 18;
      else if (i < 5) radius = 14 + i * 1.5;
      else if (i < 15) radius = 22;
      else if (i < 30) radius = 22 - (i - 15) * 1.2;
      else radius = Math.max(2, 6 - (i - 30) * 1.5);

      segs.push({
        x: startX - i * 16,
        y: startY,
        angle: 0,
        radius,
        spineLength: 16,
      });
    }

    dragonStateRef.current.segments = segs;
    dragonStateRef.current.headAngle = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (dragonStateRef.current.segments.length === 0) {
        initDragon(canvas.width, canvas.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handlePointerMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const handlePointerDown = (e: MouseEvent) => {
      targetRef.current.isDown = true;
      const x = e.clientX;
      const y = e.clientY;

      const elemCfg = DRAGON_ELEMENTS[element];
      pulsesRef.current.push({
        x,
        y,
        radius: 10,
        maxRadius: 180,
        color: elemCfg.primaryColor,
        alpha: 1,
      });

      if (onCanvasClick) onCanvasClick(x, y);
    };

    const handlePointerUp = () => {
      targetRef.current.isDown = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    // Shortest angle difference utility
    const angleDiff = (target: number, current: number) => {
      let diff = target - current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      return diff;
    };

    const render = () => {
      const state = dragonStateRef.current;
      state.time += 0.03;
      const t = state.time;
      const elemCfg = DRAGON_ELEMENTS[element];

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update Target & Dragon Head Steering
      const targetX = targetRef.current.x;
      const targetY = targetRef.current.y;
      const head = state.segments[0];

      if (head) {
        const dx = targetX - head.x;
        const dy = targetY - head.y;
        const distToTarget = Math.hypot(dx, dy);

        // Desired angle towards target
        const desiredAngle = Math.atan2(dy, dx);

        // Turn rate (agility)
        const turnSpeed = 0.08 * dragonSpeedScale;
        const diff = angleDiff(desiredAngle, state.headAngle);
        state.headAngle += diff * turnSpeed;

        // Desired velocity: faster if target is far, gentle gliding if close
        let targetVel = 0;
        if (distToTarget > 20) {
          targetVel = Math.min(15 * dragonSpeedScale, distToTarget * 0.08 * dragonSpeedScale);
        } else {
          // Subtle idle floating sway when hovering close to mouse
          targetVel = 1.5 * dragonSpeedScale;
          state.headAngle += Math.sin(t * 3) * 0.02;
        }

        // Acceleration damping
        state.velocity += (targetVel - state.velocity) * 0.1;
        state.distanceTraveled += state.velocity;

        // Move Head
        head.x += Math.cos(state.headAngle) * state.velocity;
        head.y += Math.sin(state.headAngle) * state.velocity;
        head.angle = state.headAngle;

        // 2. Inverse Kinematics Spine Follower
        for (let i = 1; i < state.segments.length; i++) {
          const prev = state.segments[i - 1];
          const curr = state.segments[i];

          const segDx = prev.x - curr.x;
          const segDy = prev.y - curr.y;
          const segAngle = Math.atan2(segDy, segDx);

          curr.angle = segAngle;
          curr.x = prev.x - Math.cos(segAngle) * curr.spineLength;
          curr.y = prev.y - Math.sin(segAngle) * curr.spineLength;
        }

        // Spawn particles (fire/embers/dust) from head snout & wingtips
        if (showParticles && (state.velocity > 2 || targetRef.current.isDown)) {
          const spawnCount = targetRef.current.isDown ? 4 : 1;
          for (let p = 0; p < spawnCount; p++) {
            const spread = (Math.random() - 0.5) * 0.6;
            const pAngle = head.angle + Math.PI + spread;
            const pSpeed = Math.random() * 3 + 2;

            particlesRef.current.push({
              x: head.x + Math.cos(head.angle) * 15,
              y: head.y + Math.sin(head.angle) * 15,
              vx: Math.cos(pAngle) * pSpeed + (Math.random() - 0.5),
              vy: Math.sin(pAngle) * pSpeed + (Math.random() - 0.5),
              size: Math.random() * 4 + 2,
              color: Math.random() > 0.4 ? elemCfg.primaryColor : elemCfg.accentColor,
              alpha: 1,
              life: 0,
              maxLife: Math.random() * 30 + 20,
              spin: (Math.random() - 0.5) * 0.1,
            });
          }
        }
      }

      // Notify parent of live stats
      if (onUpdateStats && head) {
        onUpdateStats({
          speed: Math.round(state.velocity * 10) / 10,
          distanceTraveled: Math.round(state.distanceTraveled),
          headAngle: Math.round((state.headAngle * 180) / Math.PI),
          segmentCount: state.segments.length,
          isBreathingFire: targetRef.current.isDown,
        });
      }

      // Render Click Pulses
      pulsesRef.current.forEach((p, idx) => {
        p.radius += 6;
        p.alpha -= 0.02;
        if (p.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 18;
          ctx.stroke();
          ctx.restore();
        } else {
          pulsesRef.current.splice(idx, 1);
        }
      });

      // Render Particles
      particlesRef.current.forEach((pt, idx) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.96;
        pt.vy *= 0.96;
        pt.life++;
        pt.alpha = 1 - pt.life / pt.maxLife;

        if (pt.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * (1 - pt.life / pt.maxLife), 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.shadowColor = pt.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();
        } else {
          particlesRef.current.splice(idx, 1);
        }
      });

      // RENDER DRAGON
      const segs = state.segments;
      if (segs.length > 2) {
        // PASS A: Ambient Dragon Shadow / Under-glow
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(segs[0].x, segs[0].y);
        for (let i = 1; i < segs.length; i++) {
          ctx.lineTo(segs[i].x, segs[i].y);
        }
        ctx.strokeStyle = elemCfg.glowColor;
        ctx.lineWidth = 36;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.15;
        ctx.shadowColor = elemCfg.glowColor;
        ctx.shadowBlur = 40;
        ctx.stroke();
        ctx.restore();

        // PASS B: Dragon Wings (Attached at Segment 5/6)
        if (showWings && segs.length > 8) {
          const wingSeg = segs[5];
          const wingAngle = wingSeg.angle;
          const flap = Math.sin(t * 6 + state.velocity * 0.2) * 0.4 + (state.velocity * 0.03);

          // Left Wing & Right Wing
          [-1, 1].forEach((side) => {
            ctx.save();
            ctx.translate(wingSeg.x, wingSeg.y);
            ctx.rotate(wingAngle);

            const shoulderX = 0;
            const shoulderY = side * 10;

            // Wing bones positions relative to shoulder
            const elbowX = -15;
            const elbowY = side * (65 + flap * 25);

            const finger1X = 35;
            const finger1Y = side * (110 + flap * 35);

            const finger2X = -10;
            const finger2Y = side * (125 + flap * 40);

            const finger3X = -55;
            const finger3Y = side * (100 + flap * 30);

            // Wing Membrane Fill
            ctx.beginPath();
            ctx.moveTo(shoulderX, shoulderY);
            ctx.quadraticCurveTo(elbowX * 0.5, elbowY * 0.8, elbowX, elbowY);
            ctx.lineTo(finger1X, finger1Y);
            ctx.quadraticCurveTo((finger1X + finger2X) / 2, (finger1Y + finger2Y) / 2, finger2X, finger2Y);
            ctx.quadraticCurveTo((finger2X + finger3X) / 2, (finger2Y + finger3Y) / 2, finger3X, finger3Y);
            ctx.quadraticCurveTo(shoulderX - 25, shoulderY + side * 30, shoulderX, shoulderY);
            ctx.closePath();

            const wingGrad = ctx.createLinearGradient(0, 0, 0, side * 120);
            wingGrad.addColorStop(0, `${elemCfg.primaryColor}cc`);
            wingGrad.addColorStop(0.6, `${elemCfg.secondaryColor}66`);
            wingGrad.addColorStop(1, `${elemCfg.glowColor}11`);

            ctx.fillStyle = wingGrad;
            ctx.globalAlpha = 0.75;
            ctx.fill();

            // Wing Bone Highlights
            ctx.beginPath();
            ctx.moveTo(shoulderX, shoulderY);
            ctx.lineTo(elbowX, elbowY);
            ctx.lineTo(finger1X, finger1Y);
            ctx.moveTo(elbowX, elbowY);
            ctx.lineTo(finger2X, finger2Y);
            ctx.moveTo(elbowX, elbowY);
            ctx.lineTo(finger3X, finger3Y);

            ctx.strokeStyle = elemCfg.primaryColor;
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.9;
            ctx.shadowColor = elemCfg.glowColor;
            ctx.shadowBlur = 10;
            ctx.stroke();

            ctx.restore();
          });
        }

        // PASS C: Dorsal Spines / Fins along back
        for (let i = 1; i < segs.length - 2; i += 2) {
          const seg = segs[i];
          const perpAngle = seg.angle + Math.PI / 2;
          const spineHeight = seg.radius * 0.95;

          const topX = seg.x + Math.cos(perpAngle) * (seg.radius + spineHeight);
          const topY = seg.y + Math.sin(perpAngle) * (seg.radius + spineHeight);

          const baseLeftX = seg.x + Math.cos(seg.angle) * 8;
          const baseLeftY = seg.y + Math.sin(seg.angle) * 8;
          const baseRightX = seg.x - Math.cos(seg.angle) * 8;
          const baseRightY = seg.y - Math.sin(seg.angle) * 8;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(baseLeftX, baseLeftY);
          ctx.lineTo(topX, topY);
          ctx.lineTo(baseRightX, baseRightY);
          ctx.closePath();

          ctx.fillStyle = i % 4 === 0 ? elemCfg.accentColor : elemCfg.primaryColor;
          ctx.globalAlpha = 0.85;
          ctx.shadowColor = elemCfg.glowColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }

        // PASS D: Overlapping Dragon Body Scales & Shell
        for (let i = segs.length - 1; i >= 0; i--) {
          const seg = segs[i];
          ctx.save();
          ctx.translate(seg.x, seg.y);
          ctx.rotate(seg.angle);

          // Body Segment Scale Ellipse
          ctx.beginPath();
          ctx.ellipse(0, 0, seg.radius * 1.1, seg.radius, 0, 0, Math.PI * 2);

          const scaleGrad = ctx.createRadialGradient(
            -seg.radius * 0.3,
            -seg.radius * 0.3,
            2,
            0,
            0,
            seg.radius * 1.2
          );
          scaleGrad.addColorStop(0, elemCfg.primaryColor);
          scaleGrad.addColorStop(0.6, elemCfg.secondaryColor);
          scaleGrad.addColorStop(1, '#020617');

          ctx.fillStyle = scaleGrad;
          ctx.globalAlpha = 0.95;
          ctx.shadowColor = elemCfg.glowColor;
          ctx.shadowBlur = i === 0 ? 25 : 6;
          ctx.fill();

          ctx.strokeStyle = `${elemCfg.primaryColor}88`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        }

        // PASS E: Tail Blade / Ornamental Flame Fin (End of Tail)
        const tailEnd = segs[segs.length - 1];
        const tailPrev = segs[segs.length - 3];
        if (tailEnd && tailPrev) {
          const tailAngle = Math.atan2(tailEnd.y - tailPrev.y, tailEnd.x - tailPrev.x);
          ctx.save();
          ctx.translate(tailEnd.x, tailEnd.y);
          ctx.rotate(tailAngle);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(25, -20, 45, 0);
          ctx.quadraticCurveTo(25, 20, 0, 0);
          ctx.fillStyle = elemCfg.primaryColor;
          ctx.shadowColor = elemCfg.glowColor;
          ctx.shadowBlur = 15;
          ctx.globalAlpha = 0.9;
          ctx.fill();

          ctx.restore();
        }

        // PASS F: Dragon Head Details (Snout, Crown Horns, Slit Eyes, Whiskers)
        const headSeg = segs[0];
        ctx.save();
        ctx.translate(headSeg.x, headSeg.y);
        ctx.rotate(headSeg.angle);

        // 1. Crown Horns (Left & Right)
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.moveTo(-5, side * 8);
          ctx.bezierCurveTo(-25, side * 22, -45, side * 30, -55, side * 24);
          ctx.bezierCurveTo(-35, side * 15, -18, side * 8, -5, side * 4);
          ctx.closePath();

          const hornGrad = ctx.createLinearGradient(0, 0, -50, side * 25);
          hornGrad.addColorStop(0, elemCfg.accentColor);
          hornGrad.addColorStop(0.7, elemCfg.primaryColor);
          hornGrad.addColorStop(1, '#000000');

          ctx.fillStyle = hornGrad;
          ctx.shadowColor = elemCfg.glowColor;
          ctx.shadowBlur = 12;
          ctx.fill();
        });

        // 2. Snout & Skull Outline
        ctx.beginPath();
        ctx.moveTo(22, 0); // Snout tip
        ctx.quadraticCurveTo(12, -14, -8, -15);
        ctx.quadraticCurveTo(-18, -10, -20, 0);
        ctx.quadraticCurveTo(-18, 10, -8, 15);
        ctx.quadraticCurveTo(12, 14, 22, 0);
        ctx.closePath();

        const headGrad = ctx.createRadialGradient(8, -4, 2, 0, 0, 24);
        headGrad.addColorStop(0, elemCfg.accentColor);
        headGrad.addColorStop(0.5, elemCfg.primaryColor);
        headGrad.addColorStop(1, elemCfg.secondaryColor);

        ctx.fillStyle = headGrad;
        ctx.shadowColor = elemCfg.glowColor;
        ctx.shadowBlur = 20;
        ctx.fill();

        // 3. Glowing Dragon Slit Eyes (Left & Right)
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(6, side * 7);
          ctx.rotate(side * 0.2);

          // Eye socket glow
          ctx.beginPath();
          ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
          ctx.fillStyle = elemCfg.eyeColor;
          ctx.shadowColor = elemCfg.eyeColor;
          ctx.shadowBlur = 14;
          ctx.fill();

          // Slit Pupil
          ctx.beginPath();
          ctx.ellipse(0, 0, 1.5, 3.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#020617';
          ctx.fill();

          ctx.restore();
        });

        // 4. Fluid Whisker Barbels (Swaying in wind)
        [-1, 1].forEach((side) => {
          const wave = Math.sin(t * 8 + side) * 8;
          ctx.beginPath();
          ctx.moveTo(18, side * 4);
          ctx.bezierCurveTo(35, side * 18 + wave, 20, side * 35 - wave, 5, side * 48 + wave);
          ctx.strokeStyle = elemCfg.accentColor;
          ctx.lineWidth = 1.8;
          ctx.globalAlpha = 0.85;
          ctx.shadowColor = elemCfg.accentColor;
          ctx.shadowBlur = 10;
          ctx.stroke();
        });

        ctx.restore();
      }

      // 3. Target Mouse Crosshair / Aura Cursor Indicator
      ctx.save();
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8 + Math.sin(t * 5) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = elemCfg.primaryColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = elemCfg.primaryColor;
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      cancelAnimationFrame(animId);
    };
  }, [element, showWings, showParticles, dragonSpeedScale, onUpdateStats, onCanvasClick]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full block z-0 cursor-none bg-slate-950"
    />
  );
};
