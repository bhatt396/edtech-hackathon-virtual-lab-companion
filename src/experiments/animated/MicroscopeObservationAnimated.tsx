import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MicroscopeObservationAnimated() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "The Compound Microscope",
            description: "A compound microscope uses multiple lenses to magnify small objects. Light passes through the specimen and is magnified by the objective and eyepiece lenses.",
            visual: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        {/* Microscope illustration */}
                        <div className="relative w-64 h-80">
                            {/* Base */}
                            <motion.div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            />
                            {/* Arm */}
                            <motion.div
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-40 bg-gradient-to-r from-slate-500 to-slate-600 rounded-t-full"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            />
                            {/* Head */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                            />
                            {/* Eyepiece */}
                            <motion.div
                                className="absolute top-12 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 0.3 }}
                            />
                            {/* Stage */}
                            <motion.div
                                className="absolute top-32 left-1/2 -translate-x-1/2 w-32 h-2 bg-slate-500"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 1.2, duration: 0.4 }}
                            />
                            {/* Light beam */}
                            <motion.div
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-24 bg-gradient-to-t from-yellow-300/40 to-transparent"
                                style={{ clipPath: 'polygon(40% 100%, 0% 0%, 100% 0%, 60% 100%)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.7, 0.4, 0.7] }}
                                transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                </div>
            ),
            color: "from-blue-500 to-purple-600"
        },
        {
            title: "Plant Cell Structure",
            description: "Plant cells have a rigid cell wall, chloroplasts for photosynthesis, and a large central vacuole. The nucleus controls cell activities.",
            visual: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 300 300" className="w-80 h-80">
                        {/* Cell Wall */}
                        <motion.rect
                            x="50" y="50" width="200" height="200"
                            stroke="#22543d" strokeWidth="4" fill="#d1fae5" fillOpacity="0.3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />

                        {/* Nucleus */}
                        <motion.circle
                            cx="150" cy="130" r="35"
                            fill="#7c3aed" opacity="0.7"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        />
                        <motion.text
                            x="150" y="135" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            Nucleus
                        </motion.text>

                        {/* Chloroplasts */}
                        {[0, 1, 2, 3, 4].map((i) => {
                            const angle = (i / 5) * Math.PI * 2;
                            const x = 150 + Math.cos(angle) * 60;
                            const y = 150 + Math.sin(angle) * 60;
                            return (
                                <motion.ellipse
                                    key={i}
                                    cx={x} cy={y} rx="12" ry="8"
                                    fill="#22c55e" opacity="0.8"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                                    transform={`rotate(${i * 72} ${x} ${y})`}
                                />
                            );
                        })}

                        {/* Vacuole */}
                        <motion.circle
                            cx="150" cy="200" r="30"
                            fill="#fbbf24" opacity="0.4"
                            stroke="#d97706" strokeWidth="2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.5, duration: 0.5 }}
                        />
                        <motion.text
                            x="150" y="205" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                        >
                            Vacuole
                        </motion.text>

                        {/* Labels */}
                        <motion.text
                            x="255" y="60" fill="#22543d" fontSize="10" fontWeight="bold"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            Cell Wall
                        </motion.text>
                        <motion.line
                            x1="250" y1="56" x2="250" y2="50"
                            stroke="#22543d" strokeWidth="1.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.5 }}
                        />
                    </svg>
                </div>
            ),
            color: "from-green-500 to-emerald-600"
        },
        {
            title: "Animal Cell Structure",
            description: "Animal cells lack cell walls and chloroplasts. They have a flexible cell membrane, smaller vacuoles, and many mitochondria for energy production.",
            visual: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 300 300" className="w-80 h-80">
                        {/* Cell Membrane (irregular) */}
                        <motion.path
                            d="M 150,50 C 200,60 240,100 240,150 C 240,200 200,240 150,250 C 100,240 60,200 60,150 C 60,100 100,60 150,50 Z"
                            stroke="#dc2626" strokeWidth="3" fill="#fecaca" fillOpacity="0.3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5 }}
                        />

                        {/* Nucleus (larger) */}
                        <motion.circle
                            cx="150" cy="150" r="40"
                            fill="#6366f1" opacity="0.8"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        />
                        <motion.circle
                            cx="155" cy="145" r="15"
                            fill="#3730a3" opacity="0.9"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                        />
                        <motion.text
                            x="150" y="125" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            Nucleus
                        </motion.text>

                        {/* Mitochondria (bean-shaped) */}
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                            const angle = (i / 6) * Math.PI * 2;
                            const radius = 70;
                            const x = 150 + Math.cos(angle) * radius;
                            const y = 150 + Math.sin(angle) * radius;
                            return (
                                <motion.ellipse
                                    key={i}
                                    cx={x} cy={y} rx="18" ry="10"
                                    fill="#f97316" opacity="0.8"
                                    stroke="#ea580c" strokeWidth="1.5"
                                    initial={{ scale: 0, rotate: 0 }}
                                    animate={{ scale: 1, rotate: angle * (180 / Math.PI) }}
                                    transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                                />
                            );
                        })}

                        {/* Ribosomes (tiny dots) */}
                        {[...Array(15)].map((_, i) => {
                            const angle = (i / 15) * Math.PI * 2;
                            const radius = 55 + (i % 3) * 10;
                            const x = 150 + Math.cos(angle) * radius;
                            const y = 150 + Math.sin(angle) * radius;
                            return (
                                <motion.circle
                                    key={`ribo-${i}`}
                                    cx={x} cy={y} r="2.5"
                                    fill="#64748b"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.8 + i * 0.05 }}
                                />
                            );
                        })}

                        {/* Labels */}
                        <motion.text
                            x="260" y="155" fill="#dc2626" fontSize="10" fontWeight="bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            Cell Membrane
                        </motion.text>
                        <motion.text
                            x="210" y="90" fill="#ea580c" fontSize="9" fontWeight="bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            Mitochondria
                        </motion.text>
                    </svg>
                </div>
            ),
            color: "from-red-500 to-pink-600"
        },
        {
            title: "Key Differences",
            description: "Plant cells are rectangular with cell walls, while animal cells are irregular with flexible membranes. Plant cells have chloroplasts; animal cells don't.",
            visual: (
                <div className="w-full h-full flex items-center justify-center gap-8 p-8">
                    <motion.div
                        className="flex flex-col items-center gap-4"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-40 h-40 border-4 border-green-600 bg-green-100 rounded-lg relative p-4">
                            <div className="absolute top-2 left-2 w-8 h-8 bg-purple-600 rounded-full" />
                            <div className="absolute bottom-2 right-2 w-10 h-10 bg-yellow-400 rounded-full opacity-50" />
                            <div className="absolute top-8 right-4 w-4 h-4 bg-green-500 rounded-full" />
                            <div className="absolute bottom-8 left-6 w-4 h-4 bg-green-500 rounded-full" />
                        </div>
                        <h3 className="text-lg font-bold text-green-600">Plant Cell</h3>
                        <ul className="text-xs space-y-1 text-left">
                            <li className="flex items-start gap-1">
                                <span className="text-green-600">✓</span>
                                <span>Cell wall</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-green-600">✓</span>
                                <span>Chloroplasts</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-green-600">✓</span>
                                <span>Large vacuole</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-green-600">✓</span>
                                <span>Regular shape</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        className="text-4xl font-bold text-slate-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                    >
                        VS
                    </motion.div>

                    <motion.div
                        className="flex flex-col items-center gap-4"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-40 h-40 border-4 border-red-600 bg-red-100 rounded-full relative p-4">
                            <div className="absolute top-6 left-6 w-10 h-10 bg-indigo-600 rounded-full" />
                            <div className="absolute top-8 right-6 w-5 h-5 bg-orange-500 rounded-full" />
                            <div className="absolute bottom-8 left-8 w-5 h-5 bg-orange-500 rounded-full" />
                            <div className="absolute bottom-6 right-10 w-5 h-5 bg-orange-500 rounded-full" />
                        </div>
                        <h3 className="text-lg font-bold text-red-600">Animal Cell</h3>
                        <ul className="text-xs space-y-1 text-left">
                            <li className="flex items-start gap-1">
                                <span className="text-red-600">✓</span>
                                <span>Cell membrane</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-red-600">✓</span>
                                <span>No chloroplasts</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-red-600">✓</span>
                                <span>Small vacuoles</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-red-600">✓</span>
                                <span>Irregular shape</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            ),
            color: "from-purple-500 to-indigo-600"
        }
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color}`}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="h-full flex flex-col">
                            {/* Visual Area */}
                            <div className="flex-1 flex items-center justify-center p-8">
                                {slides[currentSlide].visual}
                            </div>

                            {/* Text Overlay */}
                            <motion.div
                                className="bg-black/80 backdrop-blur-lg p-6 border-t border-white/10"
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {slides[currentSlide].title}
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {slides[currentSlide].description}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Slide Indicators */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                    ? 'bg-white w-8'
                                    : 'bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <Button
                    onClick={prevSlide}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant="default"
                    className="gap-2"
                >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Auto Play'}
                </Button>

                <Button
                    onClick={nextSlide}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
