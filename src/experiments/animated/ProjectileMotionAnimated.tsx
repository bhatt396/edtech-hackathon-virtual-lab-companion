"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface ProjectileState {
  initialVelocity: number;
  launchAngle: number;
  initialHeight: number;
  gravity: number;
  isRunning: boolean;
  time: number;
}

export default function ProjectileMotionAnimated() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [state, setState] = useState<ProjectileState>({
    initialVelocity: 20,
    launchAngle: 45,
    initialHeight: 0,
    gravity: 9.8,
    isRunning: false,
    time: 0,
  });

  const calculatePosition = useCallback((t: number) => {
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    
    const x = vx * t;
    const y = state.initialHeight + vy * t - 0.5 * state.gravity * t * t;
    
    return { x, y, vx, vy };
  }, [state]);

  const calculateTrajectory = useCallback(() => {
    const points: { x: number; y: number; t: number }[] = [];
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    
    const timeOfFlight = (2 * vy) / state.gravity;
    const steps = 200;
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * timeOfFlight;
      const x = vx * t;
      const y = state.initialHeight + vy * t - 0.5 * state.gravity * t * t;
      if (y >= 0) {
        points.push({ x, y, t });
      }
    }
    
    return points;
  }, [state]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
      const x = (i * width / 5) + (Date.now() / 50) % (width / 5);
      const y = 50 + i * 30;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Scale factors
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    const timeOfFlight = (2 * vy) / state.gravity;
    const range = vx * timeOfFlight;
    const maxHeight = state.initialHeight + (vy * vy) / (2 * state.gravity);
    
    const scaleX = (width * 0.8) / (range * 1.2);
    const scaleY = (height * 0.7) / ((maxHeight + state.initialHeight) * 1.2);
    const originX = width * 0.1;
    const originY = height * 0.9 - state.initialHeight * scaleY;
    
    // Draw ground with texture
    const groundGradient = ctx.createLinearGradient(0, originY, 0, height);
    groundGradient.addColorStop(0, '#84cc16');
    groundGradient.addColorStop(1, '#65a30d');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, originY, width, height - originY);
    
    // Draw grass
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, originY);
      ctx.lineTo(i + 3, originY - 5);
      ctx.stroke();
    }
    
    // Draw trajectory trail (animated)
    const trajectory = calculateTrajectory();
    if (state.isRunning && state.time > 0) {
      const currentIndex = Math.floor((state.time / timeOfFlight) * trajectory.length);
      const visibleTrajectory = trajectory.slice(0, currentIndex);
      
      // Draw trail with gradient
      if (visibleTrajectory.length > 1) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        visibleTrajectory.forEach((point, i) => {
          const x = originX + point.x * scaleX;
          const y = originY - point.y * scaleY;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } else if (!state.isRunning) {
      // Draw full trajectory when not running
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      trajectory.forEach((point, i) => {
        const x = originX + point.x * scaleX;
        const y = originY - point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw launcher/cannon
    const launcherX = originX;
    const launcherY = originY;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(launcherX - 15, launcherY - 10, 30, 20);
    
    // Draw cannon barrel
    ctx.save();
    ctx.translate(launcherX, launcherY);
    ctx.rotate(-angleRad);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, -5, 40, 10);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(35, -3, 5, 6);
    ctx.restore();
    
    // Draw projectile with motion blur
    if (state.isRunning && state.time >= 0) {
      const pos = calculatePosition(state.time);
      if (pos.y >= 0) {
        const x = originX + pos.x * scaleX;
        const y = originY - pos.y * scaleY;
        
        // Motion blur effect
        for (let i = 0; i < 5; i++) {
          const blurX = x - (pos.vx * 0.1 * i);
          const blurY = y + (pos.vy * 0.1 * i);
          ctx.fillStyle = `rgba(239, 68, 68, ${0.3 - i * 0.05})`;
          ctx.beginPath();
          ctx.arc(blurX, blurY, 8 - i, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Main projectile
        const projectileGradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
        projectileGradient.addColorStop(0, '#fbbf24');
        projectileGradient.addColorStop(1, '#ef4444');
        ctx.fillStyle = projectileGradient;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Velocity vector
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + pos.vx * 0.8, y - pos.vy * 0.8);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Velocity arrowhead
        const arrowLength = Math.sqrt(pos.vx * pos.vx + pos.vy * pos.vy) * 0.8;
        const arrowAngle = Math.atan2(-pos.vy, pos.vx);
        ctx.fillStyle = '#22c55e';
        ctx.save();
        ctx.translate(x + pos.vx * 0.8, y - pos.vy * 0.8);
        ctx.rotate(arrowAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Draw impact explosion
    if (state.isRunning && state.time > 0) {
      const pos = calculatePosition(state.time);
      const angleRad = (state.launchAngle * Math.PI) / 180;
      const vx = state.initialVelocity * Math.cos(angleRad);
      const vy = state.initialVelocity * Math.sin(angleRad);
      const timeOfFlight = (2 * vy) / state.gravity;
      
      if (Math.abs(state.time - timeOfFlight) < 0.1 && pos.y <= 0.1) {
        const impactX = originX + pos.x * scaleX;
        const impactY = originY;
        
        // Explosion particles
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2;
          const distance = 30 + Math.random() * 20;
          const particleX = impactX + Math.cos(angle) * distance;
          const particleY = impactY + Math.sin(angle) * distance;
          
          ctx.fillStyle = `hsl(${Math.random() * 60}, 100%, 50%)`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [state, calculatePosition, calculateTrajectory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let animationId: number;
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [draw]);

  useEffect(() => {
    if (state.isRunning) {
      const startTime = Date.now();
      const angleRad = (state.launchAngle * Math.PI) / 180;
      const vy = state.initialVelocity * Math.sin(angleRad);
      const timeOfFlight = (2 * vy) / state.gravity;
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = elapsed * 2;
        
        if (newTime <= timeOfFlight + 0.5) {
          setState(prev => ({ ...prev, time: newTime }));
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setState(prev => ({ ...prev, isRunning: false, time: 0 }));
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isRunning, state.launchAngle, state.initialVelocity]);

  const angleRad = (state.launchAngle * Math.PI) / 180;
  const vy = state.initialVelocity * Math.sin(angleRad);
  const timeOfFlight = (2 * vy) / state.gravity;
  const vx = state.initialVelocity * Math.cos(angleRad);
  const range = vx * timeOfFlight;
  const maxHeight = state.initialHeight + (vy * vy) / (2 * state.gravity);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative bg-gradient-to-b from-blue-50 to-green-50 rounded-xl overflow-hidden border border-border shadow-lg" style={{ minHeight: '500px' }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      
      <div className="mt-4 space-y-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setState(prev => ({ ...prev, isRunning: !prev.isRunning, time: 0 }))}
            variant={state.isRunning ? "destructive" : "default"}
            className="gap-2"
            size="lg"
          >
            {state.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {state.isRunning ? 'Pause' : 'Launch Projectile'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setState(prev => ({ ...prev, isRunning: false, time: 0 }))}
            className="gap-2"
            size="lg"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Initial Velocity (m/s)</span>
              <span className="text-primary font-mono">{state.initialVelocity}</span>
            </label>
            <Slider
              value={[state.initialVelocity]}
              onValueChange={(val) => setState(prev => ({ ...prev, initialVelocity: val[0] }))}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Launch Angle (°)</span>
              <span className="text-primary font-mono">{state.launchAngle}</span>
            </label>
            <Slider
              value={[state.launchAngle]}
              onValueChange={(val) => setState(prev => ({ ...prev, launchAngle: val[0] }))}
              min={0}
              max={90}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Initial Height (m)</span>
              <span className="text-primary font-mono">{state.initialHeight}</span>
            </label>
            <Slider
              value={[state.initialHeight]}
              onValueChange={(val) => setState(prev => ({ ...prev, initialHeight: val[0] }))}
              min={0}
              max={20}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground">Range</p>
            <p className="text-xl font-display font-bold text-primary">{range.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Height</p>
            <p className="text-xl font-display font-bold text-primary">{maxHeight.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time of Flight</p>
            <p className="text-xl font-display font-bold text-primary">{timeOfFlight.toFixed(2)} s</p>
          </div>
        </div>
      </div>
    </div>
  );
}



