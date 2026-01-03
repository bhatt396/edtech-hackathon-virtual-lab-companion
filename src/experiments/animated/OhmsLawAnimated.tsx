import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Zap, Activity, Info, BarChart3 } from 'lucide-react';

export default function OhmsLawAnimated() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [voltage, setVoltage] = useState(5);
    const [resistance, setResistance] = useState(10);
    const [recordedData, setRecordedData] = useState<{ v: number; i: number }[]>([]);

    const current = voltage / resistance;

    const resetData = () => {
        setRecordedData([]);
        setVoltage(5);
        setResistance(10);
    };

    const recordPoint = () => {
        if (recordedData.length >= 10) {
            setRecordedData(prev => [...prev.slice(1), { v: voltage, i: current }]);
        } else {
            setRecordedData(prev => [...prev, { v: voltage, i: current }]);
        }
    };

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        // Circuit Coordinates
        const cx = width / 2;
        const cy = height / 2;
        const cw = 300;
        const ch = 200;

        // Draw wires
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);

        // Battery (Bottom Center)
        const bx = cx;
        const by = cy + ch / 2;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 30, by - 10, 60, 20); // Clear wire behind battery

        // Battery symbols
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx - 15, by - 15);
        ctx.lineTo(bx - 15, by + 15);
        ctx.moveTo(bx - 5, by - 8);
        ctx.lineTo(bx - 5, by + 8);
        ctx.moveTo(bx + 5, by - 15);
        ctx.lineTo(bx + 5, by + 15);
        ctx.moveTo(bx + 15, by - 8);
        ctx.lineTo(bx + 15, by + 8);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('+', bx + 20, by - 10);
        ctx.fillText('-', bx - 30, by - 10);

        // Resistor (Top Center)
        const rx = cx;
        const ry = cy - ch / 2;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rx - 40, ry - 15, 80, 30);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rx - 40, ry);
        for (let i = 0; i < 8; i++) {
            const x = rx - 35 + i * 10;
            const y = ry + (i % 2 === 0 ? -10 : 10);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(rx + 40, ry);
        ctx.stroke();

        // Ammeter (Right Side)
        const ax = cx + cw / 2;
        const ay = cy;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ax, ay, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('A', ax, ay + 7);

        // Electron Animation
        const time = Date.now() / 1000;
        const speed = current * 2; // Speed proportional to current
        const dashOffset = (time * speed * 20) % 40;

        ctx.setLineDash([5, 15]);
        ctx.lineDashOffset = -dashOffset;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);
        ctx.setLineDash([]);

        // Glow effect for resistor based on power
        const power = current * voltage;
        ctx.shadowBlur = power * 2;
        ctx.shadowColor = '#ef4444';
        // Redraw resistor with glow
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rx - 40, ry);
        for (let i = 0; i < 8; i++) {
            const x = rx - 35 + i * 10;
            const y = ry + (i % 2 === 0 ? -10 : 10);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(rx + 40, ry);
        ctx.stroke();
        ctx.shadowBlur = 0;

    }, [voltage, resistance, current]);

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

    return (
        <div className="flex flex-col h-full bg-[#020617] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Simulation Area */}
            <div className="flex-1 relative min-h-[400px]">
                <canvas ref={canvasRef} className="w-full h-full" />

                {/* Floating Labels */}
                <div className="absolute top-10 left-10 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 animate-fade-in shadow-xl">
                    <div className="flex items-center gap-3 mb-1">
                        <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Calculated Current</span>
                    </div>
                    <p className="text-4xl font-black text-white">{current.toFixed(3)} <span className="text-xl text-primary font-bold">A</span></p>
                </div>

                <div className="absolute bottom-10 right-10 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 animate-fade-in shadow-xl text-right">
                    <div className="flex items-center gap-3 mb-1 justify-end">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Power Dissipated</span>
                        <Activity className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-4xl font-black text-white">{(voltage * current).toFixed(2)} <span className="text-xl text-red-500 font-bold">W</span></p>
                </div>
            </div>

            {/* Controls Area */}
            <div className="p-8 bg-white/5 backdrop-blur-xl border-t border-white/10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                Voltage (V)
                            </label>
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg font-mono font-bold text-lg">
                                {voltage}V
                            </span>
                        </div>
                        <Slider
                            value={[voltage]}
                            onValueChange={(val) => setVoltage(val[0])}
                            min={1}
                            max={30}
                            step={0.5}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500 font-medium italic">Adjust the potential difference to see how electron flow changes.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity className="h-4 w-4 text-red-500" />
                                Resistance (Ω)
                            </label>
                            <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg font-mono font-bold text-lg">
                                {resistance}Ω
                            </span>
                        </div>
                        <Slider
                            value={[resistance]}
                            onValueChange={(val) => setResistance(val[0])}
                            min={1}
                            max={100}
                            step={1}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500 font-medium italic">Higher resistance opposes the flow of electrons, reducing current.</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Button
                        onClick={recordPoint}
                        className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-glow-primary gap-3"
                    >
                        <BarChart3 className="h-5 w-5" />
                        Record Data Point
                    </Button>
                    <Button
                        variant="outline"
                        onClick={resetData}
                        className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-6 rounded-2xl transition-all gap-3"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Reset Experiment
                    </Button>
                </div>

                {/* Data Visualization */}
                {recordedData.length > 0 && (
                    <div className="mt-8 p-6 bg-black/20 rounded-3xl border border-white/5 animate-slide-up">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Observed Data Points (V vs I)
                        </h3>
                        <div className="flex items-end gap-2 h-40">
                            {recordedData.map((point, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        className="w-full bg-gradient-to-t from-primary/80 to-blue-500/80 rounded-t-lg transition-all duration-500 group-hover:from-primary group-hover:to-blue-500 shadow-lg"
                                        style={{ height: `${(point.i / (30 / 1)) * 100}%` }}
                                    />
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-white/90">{point.v}V</span>
                                        <span className="text-[8px] font-medium text-slate-500">{point.i.toFixed(2)}A</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-slate-500 mt-6 font-medium italic uppercase tracking-tighter">
                            As Voltage increases, Current increases linearly (if Temperature & Resistance remain constant).
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
