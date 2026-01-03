import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Droplet, TestTube } from 'lucide-react';

interface TitrationState {
    volumeAdded: number; // mL
    titrantMolarity: number; // M
    sampleVolume: number; // mL
    sampleMolarity: number; // M (Unknown to student initially)
    indicatorColor: string;
    isValveOpen: boolean;
    dropRate: number; // drops per second
}

export default function AcidBaseTitration2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [state, setState] = useState<TitrationState>({
        volumeAdded: 0,
        titrantMolarity: 0.1,
        sampleVolume: 25,
        sampleMolarity: 0.1, // Hidden value
        indicatorColor: 'rgba(255, 255, 255, 0.1)', // Clear initially
        isValveOpen: false,
        dropRate: 5,
    });

    const calculatePH = useCallback(() => {
        // Simplified pH calculation for strong acid (HCl) - strong base (NaOH)
        const molsAcid = state.sampleVolume * state.sampleMolarity;
        const molsBase = state.volumeAdded * state.titrantMolarity;
        const totalVolume = state.sampleVolume + state.volumeAdded;

        if (molsBase < molsAcid) {
            const remainingAcidMols = molsAcid - molsBase;
            const hPlusConc = remainingAcidMols / totalVolume;
            return -Math.log10(hPlusConc);
        } else if (molsBase > molsAcid + 0.0001) { // Slight buffer for endpoint
            const remainingBaseMols = molsBase - molsAcid;
            const ohMinusConc = remainingBaseMols / totalVolume;
            const pOH = -Math.log10(ohMinusConc);
            return 14 - pOH;
        } else {
            return 7;
        }
    }, [state.volumeAdded, state.titrantMolarity, state.sampleVolume, state.sampleMolarity]);

    const updateColor = useCallback(() => {
        const ph = calculatePH();
        // Phenolphthalein behavior: Clear in acid (pH < 8.2), Pink in base (pH > 8.2)
        if (ph < 8.2) {
            return 'rgba(255, 255, 255, 0.1)'; // Clear/Watery
        } else if (ph < 10) {
            // Transition pink
            const intensity = (ph - 8.2) / (10 - 8.2);
            return `rgba(255, 105, 180, ${intensity})`;
        } else {
            return 'rgba(255, 20, 147, 0.8)'; // Deep Pink
        }
    }, [calculatePH]);

    useEffect(() => {
        setState(prev => ({ ...prev, indicatorColor: updateColor() }));
    }, [state.volumeAdded, updateColor]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Draw Stand
        ctx.fillStyle = '#64748b';
        ctx.fillRect(width * 0.2, height * 0.1, 10, height * 0.8); // Pole
        ctx.fillRect(width * 0.15, height * 0.9, width * 0.2, 10); // Base
        ctx.fillRect(width * 0.2, height * 0.3, width * 0.2, 5); // Clamp arm

        // Draw Burette
        const buretteX = width * 0.4;
        const buretteY = height * 0.15;
        const buretteW = 20;
        const buretteH = height * 0.4;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(buretteX, buretteY, buretteW, buretteH);

        // Burette Liquid
        const totalCapacity = 50; // mL
        const remainingVolume = 50 - state.volumeAdded;
        if (remainingVolume > 0) {
            const liquidH = (remainingVolume / totalCapacity) * buretteH;
            ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
            ctx.fillRect(buretteX + 1, buretteY + (buretteH - liquidH), buretteW - 2, liquidH - 1);
        }

        // Burette Graduations
        ctx.beginPath();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const y = buretteY + (i / 10) * buretteH;
            ctx.moveTo(buretteX, y);
            ctx.lineTo(buretteX + 10, y);
        }
        ctx.stroke();

        // Stopcock (Valve)
        ctx.fillStyle = state.isValveOpen ? '#22c55e' : '#ef4444';
        ctx.fillRect(buretteX + 5, buretteY + buretteH, 10, 15);

        // Tip
        ctx.beginPath();
        ctx.moveTo(buretteX + 5, buretteY + buretteH + 15);
        ctx.lineTo(buretteX + 15, buretteY + buretteH + 15);
        ctx.lineTo(buretteX + 10, buretteY + buretteH + 30);
        ctx.closePath();
        ctx.fillStyle = '#94a3b8';
        ctx.fill();

        // Droplet animation
        if (state.isValveOpen) {
            const dropY = buretteY + buretteH + 35 + (Date.now() % 500) / 10;
            if (dropY < height * 0.75) {
                ctx.beginPath();
                ctx.arc(buretteX + 10, dropY, 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(200, 230, 255, 0.8)';
                ctx.fill();
            }
        }

        // Flask
        const flaskX = buretteX + 10;
        const flaskY = height * 0.8;
        const flaskNeckW = 30;
        const flaskNeckH = 40;
        const flaskBodyR = 50;

        ctx.beginPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        // Flask Neck Left
        ctx.moveTo(flaskX - flaskNeckW / 2, flaskY - flaskBodyR - flaskNeckH);
        ctx.lineTo(flaskX - flaskNeckW / 2, flaskY - flaskBodyR);
        // Flask Body Left
        ctx.arc(flaskX, flaskY, flaskBodyR, -Math.PI / 2 - 0.5, Math.PI / 2 + 3.5, true);
        // Flask Neck Right
        ctx.moveTo(flaskX + flaskNeckW / 2, flaskY - flaskBodyR);
        ctx.lineTo(flaskX + flaskNeckW / 2, flaskY - flaskBodyR - flaskNeckH);
        ctx.stroke();

        // Flask Liquid
        const liquidVolume = state.sampleVolume + state.volumeAdded;
        // Approximate filling height logic
        const fillLevel = Math.min(1, liquidVolume / 150);
        const liquidTopY = flaskY + flaskBodyR - (fillLevel * 2 * flaskBodyR * 0.8);

        ctx.save();
        ctx.beginPath();
        // Clip to flask shape for liquid
        ctx.moveTo(flaskX - flaskNeckW / 2, flaskY - flaskBodyR - flaskNeckH);
        ctx.lineTo(flaskX - flaskNeckW / 2, flaskY - flaskBodyR);
        ctx.arc(flaskX, flaskY, flaskBodyR, -Math.PI / 2 - 0.5, Math.PI / 2 + 3.5, true);
        ctx.lineTo(flaskX + flaskNeckW / 2, flaskY - flaskBodyR - flaskNeckH);
        ctx.clip();

        ctx.fillStyle = state.indicatorColor;
        ctx.fillRect(flaskX - flaskBodyR, liquidTopY, flaskBodyR * 2, flaskBodyR * 2);
        ctx.restore();

        // Labels
        ctx.fillStyle = '#475569';
        ctx.font = '14px Inter';
        ctx.fillText(`Added: ${state.volumeAdded.toFixed(1)} mL`, buretteX + 50, buretteY + 50);
        ctx.fillText(`pH: ${calculatePH().toFixed(2)}`, flaskX + 60, flaskY);

    }, [state, calculatePH]);


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
        let animationId: number;

        const animate = () => {
            draw();
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => cancelAnimationFrame(animationId);
    }, [draw]);

    useEffect(() => {
        if (state.isValveOpen && state.volumeAdded < 50) {
            const interval = setInterval(() => {
                setState(prev => {
                    if (prev.volumeAdded >= 50) {
                        return { ...prev, isValveOpen: false };
                    }
                    return {
                        ...prev,
                        volumeAdded: Math.min(50, prev.volumeAdded + (prev.dropRate * 0.05))
                    };
                });
            }, 50); // Update every 50ms

            return () => clearInterval(interval);
        }
    }, [state.isValveOpen, state.dropRate]);


    const reset = () => {
        setState(prev => ({
            ...prev,
            volumeAdded: 0,
            isValveOpen: false,
            indicatorColor: 'rgba(255, 255, 255, 0.1)'
        }));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 relative bg-white/50 rounded-xl overflow-hidden border border-border min-h-[400px]">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>

            <div className="mt-4 space-y-4 p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setState(prev => ({ ...prev, isValveOpen: !prev.isValveOpen }))}
                            variant={state.isValveOpen ? "destructive" : "default"}
                            className="w-32"
                        >
                            <Droplet className="mr-2 h-4 w-4" />
                            {state.isValveOpen ? "Stop" : "Titrate"}
                        </Button>
                        <Button variant="outline" onClick={reset}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-muted-foreground" />
                        <span className="font-mono text-lg">{state.volumeAdded.toFixed(1)} mL</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Drop Rate (Fast/Slow)</label>
                        <Slider
                            value={[state.dropRate]}
                            min={1}
                            max={20}
                            step={1}
                            onValueChange={([val]) => setState(prev => ({ ...prev, dropRate: val }))}
                        />
                    </div>
                    {/* Could add Molarity slider here if we want to make it harder/variable */}
                </div>
            </div>
        </div>
    );
}
