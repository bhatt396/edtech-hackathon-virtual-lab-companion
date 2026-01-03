import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Pause } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AcidBaseTitrationAnimated() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setStep((prev) => (prev + 1) % 4);
            }, 3000); // Change step every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const steps = [
        {
            title: "Initial State",
            description: "Acid (HCl) is in the flask. Base (NaOH) is in the burette. Indicator is colorless.",
            color: "rgba(255, 255, 255, 0.1)",
            liquidLevel: 20
        },
        {
            title: "Adding Base",
            description: "NaOH is added dropwise. OH- ions neutralize H+ ions. Still colorless relative to equivalence point.",
            color: "rgba(255, 255, 255, 0.3)",
            liquidLevel: 40
        },
        {
            title: "Equivalence Point",
            description: "Moles of Acid = Moles of Base. The solution is neutral (pH 7).",
            color: "rgba(255, 192, 203, 0.3)", // Faint pink
            liquidLevel: 60
        },
        {
            title: "Endpoint",
            description: "Slight excess of Base makes the Phenolphthalein turn bright pink.",
            color: "rgba(255, 20, 147, 0.8)", // Deep pink
            liquidLevel: 65
        }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <div className="flex-1 relative flex items-center justify-center p-8">

                {/* Animation Container */}
                <div className="relative w-64 h-80">
                    {/* Flask Shape */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/5 rounded-full border-2 border-slate-600 overflow-hidden backdrop-blur-sm z-10">
                        {/* Liquid */}
                        <motion.div
                            className="absolute bottom-0 left-0 w-full"
                            animate={{
                                height: `${steps[step].liquidLevel}%`,
                                backgroundColor: steps[step].color
                            }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                    {/* Flask Neck */}
                    <div className="absolute bottom-44 left-1/2 -translate-x-1/2 w-16 h-28 bg-white/5 border-l-2 border-r-2 border-slate-600 z-10" />

                    {/* Dripping Animation */}
                    {isPlaying && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2">
                            <motion.div
                                className="w-3 h-3 bg-cyan-200 rounded-full"
                                animate={{ y: [0, 200], opacity: [1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                            />
                        </div>
                    )}
                </div>

                {/* Text Overlay */}
                <div className="absolute bottom-8 left-0 w-full text-center px-4">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/80 backdrop-blur border border-slate-700 p-4 rounded-xl max-w-md mx-auto"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">{steps[step].title}</h3>
                        <p className="text-slate-300 text-sm">{steps[step].description}</p>
                    </motion.div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
                <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant="default"
                    className="w-32 gap-2"
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => { setIsPlaying(false); setStep(0); }}
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
