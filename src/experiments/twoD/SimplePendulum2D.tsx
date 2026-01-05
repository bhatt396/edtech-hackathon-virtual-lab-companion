"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface PendulumState {
    length: number; // meters
    gravity: number; // m/s²
    angle: number; // degrees
    velocity: number;
    isRunning: boolean;
    time: number;
    damping: number;
}

export default function SimplePendulum2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [state, setState] = useState<PendulumState>({
        length: 1.0,
        gravity: 9.8,
        angle: 45, // Initial displacement
        velocity: 0,
        isRunning: false,
        time: 0,
        damping: 0.995, // Simple damping factor
    });

    const getPeriod = useCallback(() => {
        return 2 * Math.PI * Math.sqrt(state.length / state.gravity);
    }, [state.length, state.gravity]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const originX = width / 2;
        const originY = 50;
        const scale = 250; // pixels per meter

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Support
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(originX - 50, originY);
        ctx.lineTo(originX + 50, originY);
        ctx.stroke();

        // Pendulum String
        const bobX = originX + Math.sin(state.angle * Math.PI / 180) * state.length * scale;
        const bobY = originY + Math.cos(state.angle * Math.PI / 180) * state.length * scale;

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Pendulum Bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.stroke();

        // Angle Arc
        ctx.beginPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.setLineDash([5, 5]);
        ctx.arc(originX, originY, 50, Math.PI / 2, Math.PI / 2 + state.angle * Math.PI / 180, state.angle < 0);
        ctx.stroke();
        ctx.setLineDash([]);

        // Vertical Reference
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX, originY + state.length * scale + 40);
        ctx.stroke();


        // Metrics Overlay
        ctx.font = '14px Inter';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(`Period (T): ${getPeriod().toFixed(2)}s`, 20, height - 40);
        ctx.fillText(`Angle: ${state.angle.toFixed(1)}°`, 20, height - 20);

    }, [state, getPeriod]);

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

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        // Physics Loop
        if (state.isRunning) {
            const dt = 0.016; // Approx 60fps

            const interval = setInterval(() => {
                setState(prev => {
                    const angleRad = prev.angle * Math.PI / 180;
                    const angularAccel = -(prev.gravity / prev.length) * Math.sin(angleRad);

                    let newVelocity = prev.velocity + angularAccel * dt;
                    newVelocity *= prev.damping; // Apply damping

                    let newAngle = prev.angle + (newVelocity * dt * 180 / Math.PI);

                    return {
                        ...prev,
                        angle: newAngle,
                        velocity: newVelocity,
                        time: prev.time + dt
                    };
                });
            }, 16);

            return () => clearInterval(interval);
        }
    }, [state.isRunning]);

    useEffect(() => {
        draw();
    }, [state, draw]);

    const reset = () => {
        setState(prev => ({
            ...prev,
            angle: 45,
            velocity: 0,
            isRunning: false,
            time: 0
        }));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 relative bg-white/50 rounded-xl overflow-hidden border border-border min-h-[400px]">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            <div className="mt-4 space-y-4 p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                        variant={state.isRunning ? "secondary" : "default"}
                    >
                        {state.isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {state.isRunning ? "Pause" : "Start"}
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>Length (L)</span>
                            <span className="font-mono text-primary">{state.length.toFixed(1)}m</span>
                        </label>
                        <Slider
                            value={[state.length]}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            onValueChange={([val]) => setState(prev => ({ ...prev, length: val }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>Gravity (g)</span>
                            <span className="font-mono text-primary">{state.gravity.toFixed(1)}m/s²</span>
                        </label>
                        <Slider
                            value={[state.gravity]}
                            min={1.6}
                            max={20.0}
                            step={0.1}
                            onValueChange={([val]) => setState(prev => ({ ...prev, gravity: val }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
