import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Pause } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SimplePendulumAnimated() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeConcept, setActiveConcept] = useState(0);

    const concepts = [
        {
            title: "Potential Energy (PE)",
            description: "Maximum at the highest points of the swing (extremes). PE = mgh",
            color: "text-red-400"
        },
        {
            title: "Kinetic Energy (KE)",
            description: "Maximum at the lowest point of the swing (equilibrium). KE = 0.5mv²",
            color: "text-blue-400"
        },
        {
            title: "Energy Conservation",
            description: "Total Energy (PE + KE) remains constant throughout the motion (ignoring friction).",
            color: "text-purple-400"
        }
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setActiveConcept((prev) => (prev + 1) % 3);
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">

                {/* Pendulum Animation */}
                <div className="relative w-full h-full flex justify-center pt-12">
                    <div className="origin-top relative" style={{ height: '300px' }}>
                        <motion.div
                            className="origin-top"
                            animate={{ rotate: [45, -45, 45] }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: "easeInOut",
                                repeatType: "loop"
                            }}
                            style={{
                                width: 2,
                                height: 250,
                                background: 'white',
                                transformOrigin: 'top center'
                            }}
                        >
                            {/* Bob */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/20" />
                        </motion.div>

                        {/* Visual Indicators Layer */}
                        {isPlaying && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] pointer-events-none">
                                {activeConcept === 0 && (
                                    <>
                                        <motion.div
                                            className="absolute top-1/2 left-[-100px] text-red-400 font-bold"
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.9] }}
                                        >
                                            Max PE
                                        </motion.div>
                                        <motion.div
                                            className="absolute top-1/2 right-[-100px] text-red-400 font-bold"
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: 1.5, times: [0, 0.1, 0.9] }}
                                        >
                                            Max PE
                                        </motion.div>
                                    </>
                                )}
                                {activeConcept === 1 && (
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-blue-400 font-bold"
                                        animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        Max KE
                                    </motion.div>
                                )}
                            </div>
                        )}


                    </div>

                    {/* Pivot Point */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-400 rounded-full z-10" />
                </div>

                {/* Text Overlay */}
                <div className="absolute bottom-8 left-0 w-full text-center px-4">
                    <motion.div
                        key={activeConcept}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/80 backdrop-blur border border-slate-700 p-4 rounded-xl max-w-lg mx-auto"
                    >
                        <h3 className={`text-xl font-bold mb-2 ${concepts[activeConcept].color}`}>{concepts[activeConcept].title}</h3>
                        <p className="text-slate-300 text-sm">{concepts[activeConcept].description}</p>
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
            </div>
        </div>
    );
}
