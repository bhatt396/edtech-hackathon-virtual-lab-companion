import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, ZoomIn, ZoomOut, Eye, Microscope } from 'lucide-react';

interface MicroscopeState {
    magnification: number;
    focus: number;
    cellType: 'plant' | 'animal';
    lightIntensity: number;
    stainApplied: boolean;
}

export default function MicroscopeObservation2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [state, setState] = useState<MicroscopeState>({
        magnification: 400,
        focus: 50,
        cellType: 'plant',
        lightIntensity: 70,
        stainApplied: false,
    });

    const drawPlantCell = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number, blur: number) => {
        const scale = state.magnification / 400;
        const cellSize = size * scale;

        // Apply blur based on focus
        ctx.filter = `blur(${blur}px)`;

        // Cell Wall (rectangular/hexagonal shape)
        ctx.strokeStyle = state.stainApplied ? '#4a5568' : '#718096';
        ctx.lineWidth = 3 * scale;
        ctx.fillStyle = state.stainApplied ? '#f0fff4' : '#f7fafc';

        ctx.beginPath();
        ctx.rect(centerX - cellSize / 2, centerY - cellSize / 2, cellSize, cellSize);
        ctx.fill();
        ctx.stroke();

        // Nucleus
        ctx.fillStyle = state.stainApplied ? '#553c9a' : '#cbd5e1';
        ctx.beginPath();
        ctx.arc(centerX + cellSize * 0.1, centerY - cellSize * 0.1, cellSize * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Chloroplasts
        if (state.lightIntensity > 40) {
            ctx.fillStyle = state.stainApplied ? '#22543d' : '#68d391';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * cellSize * 0.25;
                const y = centerY + Math.sin(angle) * cellSize * 0.25;
                ctx.beginPath();
                ctx.ellipse(x, y, cellSize * 0.08, cellSize * 0.05, angle, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Vacuole (large central)
        ctx.strokeStyle = state.stainApplied ? '#d69e2e' : '#e2e8f0';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, cellSize * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.filter = 'none';
    }, [state]);

    const drawAnimalCell = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number, blur: number) => {
        const scale = state.magnification / 400;
        const cellSize = size * scale;

        ctx.filter = `blur(${blur}px)`;

        // Cell Membrane (irregular circular shape)
        ctx.fillStyle = state.stainApplied ? '#fff5f5' : '#fef5e7';
        ctx.strokeStyle = state.stainApplied ? '#e53e3e' : '#fc8181';
        ctx.lineWidth = 2 * scale;

        ctx.beginPath();
        // Irregular circle
        for (let i = 0; i <= 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = cellSize / 2 + Math.sin(i * 3) * cellSize * 0.08;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Nucleus (larger and more prominent)
        ctx.fillStyle = state.stainApplied ? '#5a67d8' : '#a0aec0';
        ctx.strokeStyle = state.stainApplied ? '#4c51bf' : '#718096';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, cellSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Nucleolus
        ctx.fillStyle = state.stainApplied ? '#2d3748' : '#4a5568';
        ctx.beginPath();
        ctx.arc(centerX + cellSize * 0.05, centerY - cellSize * 0.05, cellSize * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Mitochondria
        if (state.lightIntensity > 30) {
            ctx.fillStyle = state.stainApplied ? '#dd6b20' : '#f6ad55';
            ctx.strokeStyle = state.stainApplied ? '#c05621' : '#ed8936';
            ctx.lineWidth = 1 * scale;

            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
                const x = centerX + Math.cos(angle) * cellSize * 0.3;
                const y = centerY + Math.sin(angle) * cellSize * 0.3;

                ctx.beginPath();
                ctx.ellipse(x, y, cellSize * 0.1, cellSize * 0.05, angle, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.filter = 'none';
    }, [state]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Calculate blur based on focus (0-100 range)
        const optimalFocus = 50;
        const focusDiff = Math.abs(state.focus - optimalFocus);
        const blur = (focusDiff / 10) * 2;

        // Draw microscope field of view circle
        const centerX = width / 2;
        const centerY = height / 2;
        const viewRadius = Math.min(width, height) * 0.4;

        // Field of view background
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, viewRadius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${state.lightIntensity / 100})`);
        gradient.addColorStop(1, `rgba(200, 200, 200, ${state.lightIntensity / 150})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, viewRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw cells in a pattern
        const cellSize = 80;
        const drawCell = state.cellType === 'plant' ? drawPlantCell : drawAnimalCell;

        // Grid of cells
        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                const x = centerX + col * cellSize * 1.2;
                const y = centerY + row * cellSize * 1.2;
                drawCell(ctx, x, y, cellSize, blur);
            }
        }

        // Vignette effect
        const vignetteGradient = ctx.createRadialGradient(centerX, centerY, viewRadius * 0.5, centerX, centerY, viewRadius);
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = vignetteGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, viewRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw measurement scale
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.font = '12px monospace';
        const scaleLength = 50;
        const scaleX = width - 80;
        const scaleY = height - 30;

        ctx.beginPath();
        ctx.moveTo(scaleX, scaleY);
        ctx.lineTo(scaleX + scaleLength, scaleY);
        ctx.moveTo(scaleX, scaleY - 5);
        ctx.lineTo(scaleX, scaleY + 5);
        ctx.moveTo(scaleX + scaleLength, scaleY - 5);
        ctx.lineTo(scaleX + scaleLength, scaleY + 5);
        ctx.stroke();

        const micrometers = Math.round(100 / (state.magnification / 100));
        ctx.fillText(`${micrometers} μm`, scaleX + 5, scaleY - 10);

    }, [state, drawPlantCell, drawAnimalCell]);

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
        draw();
    }, [state, draw]);

    const reset = () => {
        setState({
            magnification: 400,
            focus: 50,
            cellType: 'plant',
            lightIntensity: 70,
            stainApplied: false,
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 relative bg-black rounded-xl overflow-hidden border-4 border-border min-h-[400px]">
                <canvas ref={canvasRef} className="w-full h-full" />

                {/* Microscope Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-2 rounded-lg border border-white/20">
                    <div className="flex items-center gap-2 text-white text-sm">
                        <Microscope className="h-4 w-4" />
                        <span className="font-mono">{state.magnification}x magnification</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-4 p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-4 flex-wrap">
                    <Button
                        onClick={() => setState(prev => ({ ...prev, cellType: prev.cellType === 'plant' ? 'animal' : 'plant' }))}
                        variant="default"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {state.cellType === 'plant' ? 'Switch to Animal Cell' : 'Switch to Plant Cell'}
                    </Button>
                    <Button
                        onClick={() => setState(prev => ({ ...prev, stainApplied: !prev.stainApplied }))}
                        variant={state.stainApplied ? "secondary" : "outline"}
                    >
                        {state.stainApplied ? 'Remove Stain' : 'Apply Stain'}
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>Magnification</span>
                            <span className="font-mono text-primary">{state.magnification}x</span>
                        </label>
                        <Slider
                            value={[state.magnification]}
                            min={100}
                            max={1000}
                            step={100}
                            onValueChange={([val]) => setState(prev => ({ ...prev, magnification: val }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>Focus</span>
                            <span className="font-mono text-primary">{state.focus}%</span>
                        </label>
                        <Slider
                            value={[state.focus]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([val]) => setState(prev => ({ ...prev, focus: val }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>Light Intensity</span>
                            <span className="font-mono text-primary">{state.lightIntensity}%</span>
                        </label>
                        <Slider
                            value={[state.lightIntensity]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={([val]) => setState(prev => ({ ...prev, lightIntensity: val }))}
                        />
                    </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Current View: {state.cellType === 'plant' ? 'Plant Cell (Onion Epidermis)' : 'Animal Cell (Cheek Cells)'}</h4>
                    <p className="text-xs text-muted-foreground">
                        {state.cellType === 'plant'
                            ? 'Plant cells have cell walls, chloroplasts, and large central vacuoles.'
                            : 'Animal cells have irregular shapes, no cell walls, and smaller vacuoles.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
