"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface ProjectileState {
  initialVelocity: number; // m/s
  launchAngle: number; // degrees
  initialHeight: number; // meters
  gravity: number; // m/s²
  isRunning: boolean;
  time: number;
}

export default function ProjectileMotion2D() {
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

  // Calculate projectile position
  const calculatePosition = useCallback((t: number) => {
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    
    const x = vx * t;
    const y = state.initialHeight + vy * t - 0.5 * state.gravity * t * t;
    
    return { x, y, vx, vy };
  }, [state]);

  // Calculate trajectory points
  const calculateTrajectory = useCallback(() => {
    const points: { x: number; y: number }[] = [];
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    
    const timeOfFlight = (2 * vy) / state.gravity;
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * timeOfFlight;
      const x = vx * t;
      const y = state.initialHeight + vy * t - 0.5 * state.gravity * t * t;
      if (y >= 0) {
        points.push({ x, y });
      }
    }
    
    return points;
  }, [state]);

  // Calculate metrics
  const calculateMetrics = useCallback(() => {
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    
    const timeOfFlight = (2 * vy) / state.gravity;
    const maxHeight = state.initialHeight + (vy * vy) / (2 * state.gravity);
    const range = vx * timeOfFlight;
    
    return { timeOfFlight, maxHeight, range };
  }, [state]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Scale factors
    const metrics = calculateMetrics();
    const maxRange = metrics.range * 1.2;
    const maxHeight = metrics.maxHeight * 1.2;
    
    const scaleX = width / maxRange;
    const scaleY = height / (maxHeight + state.initialHeight);
    const originY = height - state.initialHeight * scaleY;
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw ground
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, originY, width, height - originY);
    
    // Draw trajectory
    const trajectory = calculateTrajectory();
    if (trajectory.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      trajectory.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = originY - point.y * scaleY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
    
    // Draw projectile
    if (state.isRunning && state.time >= 0) {
      const pos = calculatePosition(state.time);
      if (pos.y >= 0) {
        const x = pos.x * scaleX;
        const y = originY - pos.y * scaleY;
        
        // Projectile circle
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Velocity vector
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + pos.vx * 0.5, y - pos.vy * 0.5);
        ctx.stroke();
        
        // Velocity arrowhead
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(x + pos.vx * 0.5, y - pos.vy * 0.5);
        ctx.lineTo(x + pos.vx * 0.4, y - pos.vy * 0.4 - 5);
        ctx.lineTo(x + pos.vx * 0.4, y - pos.vy * 0.4 + 5);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Draw launcher
    const angleRad = (state.launchAngle * Math.PI) / 180;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, originY);
    ctx.lineTo(20 + 30 * Math.cos(angleRad), originY - 30 * Math.sin(angleRad));
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.fillText('Range (m)', width / 2, height - 10);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Height (m)', 0, 0);
    ctx.restore();
  }, [state, calculatePosition, calculateTrajectory, calculateMetrics]);

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
    draw();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw]);

  useEffect(() => {
    if (state.isRunning) {
      const startTime = Date.now();
      const metrics = calculateMetrics();
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = elapsed * 2; // Speed up animation
        
        if (newTime <= metrics.timeOfFlight) {
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
  }, [state.isRunning, calculateMetrics]);

  const metrics = calculateMetrics();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative bg-muted/30 rounded-xl overflow-hidden border border-border" style={{ minHeight: '400px' }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      
      <div className="mt-4 space-y-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setState(prev => ({ ...prev, isRunning: !prev.isRunning, time: 0 }))}
            variant={state.isRunning ? "destructive" : "default"}
            className="gap-2"
          >
            {state.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {state.isRunning ? 'Pause' : 'Launch'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setState(prev => ({ ...prev, isRunning: false, time: 0 }))}
            className="gap-2"
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
            <p className="text-xl font-display font-bold text-primary">{metrics.range.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Height</p>
            <p className="text-xl font-display font-bold text-primary">{metrics.maxHeight.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time of Flight</p>
            <p className="text-xl font-display font-bold text-primary">{metrics.timeOfFlight.toFixed(2)} s</p>
          </div>
        </div>
      </div>
    </div>
  );
}



