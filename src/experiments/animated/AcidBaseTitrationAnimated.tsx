import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Pause, Thermometer, Droplet, Info, Activity, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AcidBaseTitrationAnimated() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [step, setStep] = useState(0);
    const [showRipple, setShowRipple] = useState(false);

    const steps = [
        {
            title: "Preparation",
            description: "25ml of HCl (Acid) is placed in the conical flask. A few drops of Phenolphthalein indicator are added. The burette is filled with NaOH (Base).",
            color: "rgba(255, 255, 255, 0.1)",
            targetLiquidLevel: 20,
            targetBuretteLevel: 80,
            ph: 1.0,
        },
        {
            title: "Initial Titration",
            description: "NaOH is added slowly. The H+ ions in the flask react with OH- ions. The solution remains colorless as it's still acidic.",
            color: "rgba(255, 255, 255, 0.15)",
            targetLiquidLevel: 40,
            targetBuretteLevel: 60,
            ph: 3.5,
        },
        {
            title: "Equivalence Point",
            description: "Just enough base has been added to neutralize the acid. The pH is 7. A very faint pink tint appears as indicator reacts.",
            color: "rgba(255, 182, 193, 0.45)",
            targetLiquidLevel: 60,
            targetBuretteLevel: 40,
            ph: 7.0,
        },
        {
            title: "Endpoint Reached",
            description: "A slight excess of NaOH turns the Phenolphthalein permanently bright pink. This signals the end of the titration.",
            color: "rgba(255, 20, 147, 0.85)",
            targetLiquidLevel: 65,
            targetBuretteLevel: 35,
            ph: 10.5,
        }
    ];

    const handleRecord = () => {
        const initialReading = 0.0;
        const volUsed = (steps[step].targetLiquidLevel - 20) * 1.0; // Simple ratio for demo
        const finalReading = initialReading + volUsed;

        const event = new CustomEvent('experiment-data-capture', {
            detail: {
                data: {
                    initial: initialReading.toFixed(1),
                    final: finalReading.toFixed(1)
                }
            }
        });
        window.dispatchEvent(event);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setStep((prev) => {
                    const next = (prev + 1) % steps.length;
                    if (next === 0) setIsPlaying(false);
                    return next;
                });
            }, 6000);
        } else if (step > 0) {
            // Auto-record when user pauses at a significant step
            handleRecord();
        }
        return () => clearInterval(interval);
    }, [isPlaying, steps.length]);

    // Ripple effect trigger when playing
    useEffect(() => {
        if (isPlaying) {
            const rippleInterval = setInterval(() => {
                setShowRipple(true);
                setTimeout(() => setShowRipple(false), 800);
            }, 1000);
            return () => clearInterval(rippleInterval);
        }
    }, [isPlaying]);

    return (
        <div className="flex flex-col md:flex-row h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Sidebar Instructions */}
            <div className="w-full md:w-80 bg-slate-900/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="flex items-center gap-2 text-blue-400">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold uppercase tracking-widest text-xs">Experiment Guide</h2>
                </div>

                <div className="flex flex-col gap-4">
                    {steps.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                opacity: step === i ? 1 : 0.4,
                                x: step === i ? 5 : 0,
                                borderColor: step === i ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${step === i ? 'bg-blue-600/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/5 hover:bg-white/10'
                                }`}
                            onClick={() => {
                                setStep(i);
                                setIsPlaying(false);
                            }}
                        >
                            {step === i && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                                />
                            )}
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-offset-2 ring-offset-slate-900 transition-all ${step === i ? 'bg-blue-500 text-white ring-blue-500/50' : 'bg-slate-700 text-slate-400 ring-transparent'
                                    }`}>
                                    {i + 1}
                                </span>
                                <h3 className={`font-bold text-sm tracking-tight ${step === i ? 'text-white' : 'text-slate-500'}`}>
                                    {s.title}
                                </h3>
                            </div>
                            <AnimatePresence mode="wait">
                                {step === i && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-xs text-slate-400 leading-relaxed font-medium"
                                    >
                                        {s.description}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">
                        <span>Solution pH</span>
                        <motion.span
                            key={steps[step].ph}
                            initial={{ scale: 1.2, color: '#3b82f6' }}
                            animate={{ scale: 1, color: '#94a3b8' }}
                            className="font-mono text-lg"
                        >
                            {steps[step].ph.toFixed(1)}
                        </motion.span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600"
                            animate={{ width: `${(steps[step].ph / 14) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Animation Area */}
            <div className="flex-1 relative flex flex-col min-h-[500px] overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="flex-1 relative flex items-center justify-center p-12">

                    {/* Laboratory Apparatus */}
                    <div className="relative flex flex-col items-center">
                        {/* Stand Support */}
                        <div className="absolute top-[-50px] bottom-[-40px] left-1/2 w-3 bg-gradient-to-r from-slate-700 to-slate-800 -translate-x-16 z-0 rounded-full shadow-inner" />
                        <div className="absolute bottom-[-40px] left-1/2 w-64 h-6 bg-gradient-to-b from-slate-800 to-slate-900 -translate-x-32 z-0 rounded-xl shadow-2xl border border-white/5" />

                        {/* Burette Clamp */}
                        <div className="absolute top-1/4 left-1/2 -translate-x-16 w-20 h-4 bg-gradient-to-r from-slate-600 to-slate-700 z-10 rounded-full shadow-lg" />

                        {/* Burette */}
                        <div className="relative w-14 h-72 border-l-2 border-r-2 border-white/10 bg-white/5 backdrop-blur-md z-20 flex flex-col items-center rounded-b-full shadow-inner">
                            {/* Burette Liquid */}
                            <motion.div
                                className="absolute bottom-2 w-full bg-gradient-to-b from-blue-400/20 to-blue-500/40 border-t border-blue-300/30"
                                animate={{ height: `${steps[step].targetBuretteLevel}%` }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                            {/* Graduations */}
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="w-full h-1/20 flex justify-between px-1 opacity-20 pointer-events-none">
                                    <div className={`h-px bg-white ${i % 5 === 0 ? 'w-4' : 'w-2'}`} />
                                    <div className={`h-px bg-white ${i % 5 === 0 ? 'w-4' : 'w-2'}`} />
                                </div>
                            ))}
                            {/* Stopcock */}
                            <motion.div
                                className="absolute -bottom-6 w-8 h-8 flex items-center justify-center z-30"
                                animate={{ rotate: isPlaying ? 90 : 0 }}
                            >
                                <div className="w-full h-2 bg-slate-600 rounded-full" />
                                <div className="absolute w-2 h-full bg-slate-700 rounded-full" />
                            </motion.div>
                        </div>

                        {/* Liquid Stream (Dripping) */}
                        <AnimatePresence>
                            {isPlaying && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-[280px] w-0.5 bg-blue-400/50"
                                    style={{ height: '110px', left: '50%', transform: 'translateX(-50%)' }}
                                >
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-blue-300 rounded-full absolute -left-[3.5px]"
                                            animate={{ y: [0, 110], opacity: [1, 0], scale: [1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 0.6, ease: "linear", delay: i * 0.2 }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Conical Flask */}
                        <div className="relative mt-28 w-48 h-52 z-20 group">
                            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                <defs>
                                    <linearGradient id="flaskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                                    </linearGradient>
                                    <clipPath id="flaskClip">
                                        <path d="M40 0 L60 0 L60 40 L95 115 L5 115 L40 40 Z" />
                                    </clipPath>
                                </defs>

                                {/* Flask Outline */}
                                <path
                                    d="M40 0 L60 0 L60 40 L95 115 L5 115 L40 40 Z"
                                    fill="url(#flaskGrad)"
                                    stroke="rgba(255,255,255,0.3)"
                                    strokeWidth="1.5"
                                    className="filter drop-shadow-sm"
                                />

                                {/* Liquid inside flask */}
                                <motion.rect
                                    x="0"
                                    y="0"
                                    width="100"
                                    height="120"
                                    clipPath="url(#flaskClip)"
                                    animate={{
                                        y: 115 - steps[step].targetLiquidLevel * 0.9,
                                        fill: steps[step].color
                                    }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />

                                {/* Ripples */}
                                {showRipple && (
                                    <motion.ellipse
                                        cx="50"
                                        cy={115 - steps[step].targetLiquidLevel * 0.9}
                                        rx="10"
                                        ry="2"
                                        fill="transparent"
                                        stroke="white"
                                        strokeWidth="0.5"
                                        initial={{ opacity: 0.5, scale: 0 }}
                                        animate={{ opacity: 0, scale: 3 }}
                                        transition={{ duration: 0.8 }}
                                    />
                                )}

                                {/* Bubbles Animation */}
                                {[...Array(5)].map((_, i) => (
                                    <motion.circle
                                        key={i}
                                        r="1"
                                        fill="white"
                                        initial={{ opacity: 0, y: 110, x: 30 + Math.random() * 40 }}
                                        animate={{
                                            y: [110, 115 - steps[step].targetLiquidLevel * 0.9],
                                            opacity: [0, 0.4, 0]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 2 + Math.random() * 2,
                                            delay: i * 0.5
                                        }}
                                        clipPath="url(#flaskClip)"
                                    />
                                ))}

                                {/* Surface Shine */}
                                <path
                                    d="M42 5 L45 5 L45 35 L85 110 L82 110 Z"
                                    fill="rgba(255,255,255,0.05)"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Status Floating Badges */}
                    <div className="absolute top-12 right-12 flex flex-col gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-slate-900/90 border border-slate-700/50 rounded-2xl px-6 py-3 backdrop-blur-xl flex items-center gap-4 shadow-xl"
                        >
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                <Thermometer className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Temp</span>
                                <span className="text-sm font-mono text-white">25.4 °C</span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-slate-900/90 border border-slate-700/50 rounded-2xl px-6 py-3 backdrop-blur-xl flex items-center gap-4 shadow-xl"
                        >
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Droplet className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Volume Adds</span>
                                <span className="text-sm font-mono text-white">{(steps[step].targetLiquidLevel - 20).toFixed(1)} mL</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Experimental Controls */}
                <div className="p-8 bg-slate-950 border-t border-slate-800/50 flex items-center justify-center gap-6 relative z-10">
                    <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        variant={isPlaying ? "destructive" : "default"}
                        className={`min-w-[180px] gap-3 rounded-2xl h-14 shadow-2xl transition-all active:scale-95 group relative overflow-hidden ${!isPlaying ? 'bg-blue-600 hover:bg-blue-500' : ''
                            }`}
                    >
                        {isPlaying ? <Pause className="h-6 w-6 animate-pulse" /> : <Play className="h-6 w-6" />}
                        <span className="font-black tracking-tighter text-lg">{isPlaying ? "STOP" : "CONTINUE"}</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRecord}
                        className="h-14 px-6 gap-3 rounded-2xl border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-blue-400 font-bold tracking-tight shadow-xl group transition-all"
                    >
                        <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        RECORD TO TABLE
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-14 h-14 rounded-2xl border-slate-700 hover:bg-slate-800 transition-all group shadow-xl"
                        onClick={() => { setIsPlaying(false); setStep(0); }}
                    >
                        <RotateCcw className="h-6 w-6 text-slate-500 group-hover:text-white group-hover:rotate-[-180deg] transition-all duration-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
