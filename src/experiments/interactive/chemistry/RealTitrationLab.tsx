"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
    RotateCcw,
    Clock,
    AlertTriangle,
    CheckCircle,
    X,
    GripVertical,
    Droplets,
    FlaskConical,
    Beaker,
    TestTube,
    Sparkles,
    Bot,
} from "lucide-react";

// ============ CHEMISTRY ENGINE ============
interface ChemState {
    buretteVolume: number; // mL of NaOH
    flaskVolume: number; // mL total in flask
    molesHCl: number; // moles of HCl
    molesNaOH: number; // moles of NaOH added
    pH: number;
    hasIndicator: boolean;
    indicatorDrops: number;
    valvePosition: number; // 0-100
    isFlowing: boolean;
    swirling: boolean;
    experimentStarted: boolean;
    experimentComplete: boolean;
    overshoot: boolean;
    passed: boolean;
    setupComplete: boolean;
    buretteMounted: boolean;
    flaskPlaced: boolean;
}

interface XY {
    x: number;
    y: number;
}

const INITIAL_STATE: ChemState = {
    buretteVolume: 50, // Start with 50mL NaOH
    flaskVolume: 25, // 25mL HCl
    molesHCl: 0.1 * 0.025, // 0.1M × 25mL = 0.0025 mol
    molesNaOH: 0,
    pH: 1.0, // Strong acid
    hasIndicator: false,
    indicatorDrops: 0,
    valvePosition: 0,
    isFlowing: false,
    swirling: false,
    experimentStarted: false,
    experimentComplete: false,
    overshoot: false,
    passed: false,
    setupComplete: false,
    buretteMounted: false,
    flaskPlaced: false,
};

// Build a natural language description of the current lab state for the AI backend
function describeChemState(state: ChemState): string {
    let desc = "Student is performing Acid-Base Titration. ";

    // Setup check
    if (!state.buretteMounted) desc += "Burette is NOT mounted on the stand. ";
    else desc += "Burette is correctly mounted. ";

    if (!state.flaskPlaced) desc += "Flask is NOT placed under burette. ";
    else desc += "Flask is placed under burette. ";

    // Indicator check
    if (state.hasIndicator) {
        desc += `Student added ${state.indicatorDrops} drops of Phenolphthalein indicator. `;
    } else {
        desc += "No indicator has been added to the flask yet. ";
    }

    // Titration process
    const volumeAdded = 50 - state.buretteVolume;
    desc += `Total NaOH volume added so far: ${volumeAdded.toFixed(2)} mL. `;
    desc += `Current pH in flask: ${state.pH.toFixed(2)}. `;

    if (state.isFlowing) {
        const rate = state.valvePosition > 50 ? "rapidly" : "slowly";
        desc += `Student is adding titrant ${rate}. `;
        if (!state.swirling) desc += "CRITICAL: Student is adding titrant WITHOUT swirling the flask concurrently. ";
        else desc += "Student is swirling the flask while adding titrant. ";
    }

    if (state.overshoot) {
        desc += "The solution has turned deep pink (pH > 10). Endpoint overshot. ";
    } else if (state.passed) {
        desc += "The solution is faint pink. Endpoint reached successfully. ";
    } else if (volumeAdded > 0 && !state.overshoot) {
        desc += "Solution is still colorless/pre-endpoint. ";
    }

    return desc;
}

// Calculate pH based on moles
function calculatePH(molesHCl: number, molesNaOH: number, totalVolume: number): number {
    const excessHCl = molesHCl - molesNaOH;
    const excessNaOH = molesNaOH - molesHCl;

    if (Math.abs(excessHCl) < 0.00001) {
        return 7.0; // Equivalence point
    } else if (excessHCl > 0) {
        // Acidic
        const concentration = excessHCl / (totalVolume / 1000);
        return Math.max(0, -Math.log10(concentration));
    } else {
        // Basic
        const concentration = excessNaOH / (totalVolume / 1000);
        const pOH = Math.max(0, -Math.log10(concentration));
        return Math.min(14, 14 - pOH);
    }
}

// Get indicator color based on pH
function getIndicatorColor(pH: number, hasIndicator: boolean): string {
    if (!hasIndicator) return "rgba(255, 255, 255, 0.1)";

    if (pH < 8.2) return "rgba(255, 255, 255, 0.2)"; // Colorless
    if (pH < 8.4) return "rgba(255, 200, 200, 0.4)"; // Very light pink
    if (pH < 9.0) return "rgba(255, 150, 170, 0.6)"; // Light pink
    if (pH < 10.0) return "rgba(255, 100, 150, 0.8)"; // Pink
    return "rgba(255, 50, 100, 0.9)"; // Deep pink (overshoot)
}

export default function RealTitrationLab() {
    const [state, setState] = useState<ChemState>(INITIAL_STATE);
    const [heldTool, setHeldTool] = useState<string | null>(null);
    const [examMode, setExamMode] = useState(false);
    const [timer, setTimer] = useState(0);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [dropperSqueezing, setDropperSqueezing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [draggingTool, setDraggingTool] = useState<string | null>(null);
    const [burettePos, setBurettePos] = useState<XY>({ x: 260, y: 40 });
    const [flaskPos, setFlaskPos] = useState<XY>({ x: 280, y: 260 });
    const [dropperPos, setDropperPos] = useState<XY>({ x: 420, y: 220 });

    // AI State
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const flowIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const swirlingRef = useRef(false);
    const autoFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const buretteZoneRef = useRef<HTMLDivElement | null>(null);
    const flaskZoneRef = useRef<HTMLDivElement | null>(null);
    const indicatorZoneRef = useRef<HTMLDivElement | null>(null);
    const benchRef = useRef<HTMLDivElement | null>(null);

    // Valve motion value for continuous control
    const valveY = useMotionValue(0);
    const valvePosition = useTransform(valveY, [0, 100], [0, 100]);

    // ============ TOOL PICKUP ============
    const pickUpTool = (tool: string) => {
        if (heldTool === tool) {
            setHeldTool(null);
        } else {
            setHeldTool(tool);
            setWarnings([]);
        }
    };

    // ============ DRAG DROP HANDLER ============
    const clampToBench = (pos: XY) => {
        const bench = benchRef.current?.getBoundingClientRect();
        if (!bench) return pos;
        const padding = 12;
        return {
            x: Math.min(Math.max(pos.x, padding), bench.width - padding - 80),
            y: Math.min(Math.max(pos.y, padding), bench.height - padding - 80),
        };
    };

    const handleInstrumentDrop = (tool: string, clientX: number, clientY: number) => {
        const bench = benchRef.current?.getBoundingClientRect();
        if (!bench) return;
        const local = { x: clientX - bench.left, y: clientY - bench.top };
        const clamped = clampToBench(local);

        if (tool === "burette") {
            setBurettePos(clamped);
            mountBurette();
        }

        if (tool === "flask") {
            setFlaskPos(clamped);
            placeFlask();
        }

        if (tool === "dropper") {
            setDropperPos(clamped);
            if (heldTool === "dropper") {
                squeezeDropper();
            }
        }
    };

    // ============ MOUNT BURETTE ============
    const mountBurette = () => {
        if (!state.buretteMounted && heldTool !== "burette") {
            addWarning("Pick up the burette first");
            return;
        }
        setState(prev => ({ ...prev, buretteMounted: true }));
        setHeldTool(null);
    };

    // ============ PLACE FLASK ============
    const placeFlask = () => {
        if (!state.flaskPlaced && heldTool !== "flask") {
            addWarning("Pick up the flask first");
            return;
        }
        if (!state.buretteMounted) {
            addWarning("Mount the burette first");
            return;
        }
        setState(prev => ({ ...prev, flaskPlaced: true, setupComplete: true }));
        setHeldTool(null);
    };

    // ============ ADD INDICATOR ============
    const squeezeDropper = () => {
        if (heldTool !== "dropper") {
            addWarning("Pick up the dropper first");
            return;
        }
        if (!state.flaskPlaced) {
            addWarning("Place the flask first");
            return;
        }

        setDropperSqueezing(true);
        setTimeout(() => {
            setDropperSqueezing(false);
            setState(prev => ({
                ...prev,
                hasIndicator: true,
                indicatorDrops: prev.indicatorDrops + 1,
            }));
        }, 300);
    };

    // ============ VALVE CONTROL ============
    const adjustValve = (position: number) => {
        if (!state.setupComplete) {
            addWarning("Complete lab setup first");
            return;
        }
        if (!state.hasIndicator && position > 0) {
            addWarning("Add indicator before starting titration");
            return;
        }
        if (state.buretteVolume <= 0) {
            addWarning("Burette is empty");
            return;
        }

        setState(prev => ({
            ...prev,
            valvePosition: position,
            isFlowing: position > 0,
            experimentStarted: position > 0 ? true : prev.experimentStarted,
        }));
    };

    // ============ FLOW SIMULATION ============
    useEffect(() => {
        if (state.isFlowing && state.buretteVolume > 0 && !state.experimentComplete) {
            flowIntervalRef.current = setInterval(() => {
                setState(prev => {
                    const flowRate = (prev.valvePosition / 100) * 0.5; // Max 0.5 mL per tick
                    const newBuretteVolume = Math.max(0, prev.buretteVolume - flowRate);
                    const volumeAdded = prev.buretteVolume - newBuretteVolume;
                    const molesAdded = 0.1 * (volumeAdded / 1000); // 0.1M NaOH
                    const newMolesNaOH = prev.molesNaOH + molesAdded;
                    const newFlaskVolume = prev.flaskVolume + volumeAdded;
                    const newPH = calculatePH(prev.molesHCl, newMolesNaOH, newFlaskVolume);

                    // Check for overshoot
                    const isOvershoot = newPH > 10;

                    // Check for completion (endpoint reached)
                    const isComplete = newPH >= 8.2 && newPH <= 10;

                    return {
                        ...prev,
                        buretteVolume: newBuretteVolume,
                        flaskVolume: newFlaskVolume,
                        molesNaOH: newMolesNaOH,
                        pH: newPH,
                        overshoot: isOvershoot || prev.overshoot,
                        experimentComplete: (isComplete || isOvershoot) && prev.valvePosition === 0,
                        passed: isComplete && !isOvershoot && !prev.overshoot,
                    };
                });
            }, 100);
        } else {
            if (flowIntervalRef.current) {
                clearInterval(flowIntervalRef.current);
            }
        }

        return () => {
            if (flowIntervalRef.current) {
                clearInterval(flowIntervalRef.current);
            }
        };
    }, [state.isFlowing, state.buretteVolume, state.experimentComplete]);

    // ============ EXAM TIMER ============
    useEffect(() => {
        if (examMode && state.experimentStarted && !state.experimentComplete) {
            timerIntervalRef.current = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [examMode, state.experimentStarted, state.experimentComplete]);

    // ============ SWIRL FLASK ============
    const handleSwirl = useCallback(() => {
        if (!state.flaskPlaced) return;
        setState(prev => ({ ...prev, swirling: true }));
        setTimeout(() => {
            setState(prev => ({ ...prev, swirling: false }));
        }, 500);
    }, [state.flaskPlaced]);

    // ============ WARNINGS ============
    const addWarning = (msg: string) => {
        if (!examMode) {
            setWarnings(prev => [...prev.slice(-2), msg]);
            setTimeout(() => {
                setWarnings(prev => prev.filter(w => w !== msg));
            }, 3000);
        }
    };

    // ============ RESET ============
    const reset = () => {
        setState(INITIAL_STATE);
        setHeldTool(null);
        setTimer(0);
        setWarnings([]);
        setAiFeedback(null);
    };

    // ============ AI CHECK ============
    const handleAskAI = async () => {
        setIsAnalyzing(true);
        setAiFeedback(null);

        const desc = describeChemState(state);
        console.log("Sending State to AI (manual):", desc);

        // Call Backend
        try {
            const res = await fetch("http://localhost:8000/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: desc }),
            });

            if (!res.ok) throw new Error("AI Server Error");

            const data = await res.json();
            setAiFeedback(data.feedback);
        } catch (err) {
            console.error(err);
            setAiFeedback("Error: Could not connect to Lab AI. Ensure local RAG server is running on port 8000.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Continuous AI feedback (like a live lab instructor), debounced on state changes
    useEffect(() => {
        // Clear any pending evaluation
        if (autoFeedbackTimeoutRef.current) {
            clearTimeout(autoFeedbackTimeoutRef.current);
        }

        autoFeedbackTimeoutRef.current = setTimeout(async () => {
            const desc = describeChemState(state);
            console.log("Sending State to AI (auto):", desc);

            try {
                const res = await fetch("http://localhost:8000/evaluate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ state: desc }),
                });

                if (!res.ok) throw new Error("AI Server Error");

                const data = await res.json();
                setAiFeedback(data.feedback);
            } catch (err) {
                console.error(err);
                // For auto feedback, keep existing feedback if server goes down
            }
        }, 800);

        return () => {
            if (autoFeedbackTimeoutRef.current) {
                clearTimeout(autoFeedbackTimeoutRef.current);
            }
        };
    }, [state]);

    // Format time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className={`real-lab bg-gradient-to-b from-slate-950 to-slate-900 text-white overflow-hidden ${isFullscreen ? "fixed inset-0 z-50" : "h-full min-h-[540px]"
                }`}
        >
            {/* Header */}
            <header className="border-b border-white/10 bg-black/50 backdrop-blur-md px-6 py-3">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-xl font-bold text-cyan-400">Acid-Base Titration Practical</h1>
                        <p className="text-xs text-slate-400">Virtual Chemistry Lab</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {examMode && (
                            <div className="flex items-center gap-2 text-orange-400">
                                <Clock size={16} />
                                <span className="font-mono">{formatTime(timer)}</span>
                            </div>
                        )}
                        <button
                            onClick={() => setExamMode(!examMode)}
                            className={`px-3 py-1.5 rounded text-xs font-medium ${examMode
                                ? "bg-orange-600/30 text-orange-300 border border-orange-500/50"
                                : "bg-green-600/30 text-green-300 border border-green-500/50"
                                }`}
                        >
                            {examMode ? "Exam Mode" : "Practice Mode"}
                        </button>
                        <button onClick={reset} className="p-2 hover:bg-white/10 rounded">
                            <RotateCcw size={18} />
                        </button>
                        <button
                            onClick={() => setIsFullscreen(f => !f)}
                            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600 text-slate-100"
                        >
                            {isFullscreen ? "Exit Full Screen" : "Full Screen"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex h-full min-h-[480px]">
                {/* Equipment Rack (Left) */}
                <div className="w-48 bg-slate-900/50 border-r border-white/10 p-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Equipment</h3>

                    {/* Burette */}
                    <motion.button
                        onClick={() => {
                            pickUpTool("burette");
                            mountBurette();
                        }}
                        disabled={state.buretteMounted}
                        drag
                        dragMomentum={false}
                        onDragStart={() => {
                            setDraggingTool("burette");
                            pickUpTool("burette");
                        }}
                        onDragEnd={(e, info) => {
                            setDraggingTool(null);
                            handleInstrumentDrop("burette", info.point.x, info.point.y);
                            setHeldTool(null);
                        }}
                        className={`w-full p-3 mb-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${heldTool === "burette"
                                ? "bg-cyan-600/30 border-cyan-400"
                                : state.buretteMounted
                                    ? "bg-slate-800/50 border-slate-700 opacity-50"
                                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                            }`}
                    >
                        <TestTube size={24} className="mx-auto mb-1" />
                        <span className="text-xs">Burette</span>
                        {state.buretteMounted && <span className="text-xs text-green-400 block">✓ Mounted</span>}
                    </motion.button>

                    {/* Flask */}
                    <motion.button
                        onClick={() => {
                            pickUpTool("flask");
                            placeFlask();
                        }}
                        disabled={state.flaskPlaced}
                        drag
                        dragMomentum={false}
                        onDragStart={() => {
                            setDraggingTool("flask");
                            pickUpTool("flask");
                        }}
                        onDragEnd={(e, info) => {
                            setDraggingTool(null);
                            handleInstrumentDrop("flask", info.point.x, info.point.y);
                            setHeldTool(null);
                        }}
                        className={`w-full p-3 mb-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${heldTool === "flask"
                                ? "bg-purple-600/30 border-purple-400"
                                : state.flaskPlaced
                                    ? "bg-slate-800/50 border-slate-700 opacity-50"
                                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                            }`}
                    >
                        <FlaskConical size={24} className="mx-auto mb-1" />
                        <span className="text-xs">Flask (25mL HCl)</span>
                        {state.flaskPlaced && <span className="text-xs text-green-400 block">✓ Placed</span>}
                    </motion.button>

                    {/* Dropper + Indicator */}
                    <motion.button
                        onClick={() => {
                            pickUpTool("dropper");
                            squeezeDropper();
                        }}
                        drag
                        dragMomentum={false}
                        onDragStart={() => {
                            setDraggingTool("dropper");
                            pickUpTool("dropper");
                        }}
                        onDragEnd={(e, info) => {
                            setDraggingTool(null);
                            handleInstrumentDrop("dropper", info.point.x, info.point.y);
                            setHeldTool(null);
                        }}
                        className={`w-full p-3 mb-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${heldTool === "dropper"
                                ? "bg-pink-600/30 border-pink-400"
                                : "bg-slate-800 border-slate-600 hover:border-slate-500"
                            }`}
                    >
                        <Droplets size={24} className="mx-auto mb-1" />
                        <span className="text-xs">Indicator Dropper</span>
                        {state.hasIndicator && <span className="text-xs text-green-400 block">✓ Added</span>}
                    </motion.button>

                    {/* Held Tool Indicator */}
                    {heldTool && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-2 bg-cyan-900/30 border border-cyan-500/50 rounded text-xs text-center"
                        >
                            <GripVertical size={14} className="inline mr-1" />
                            Holding: <span className="font-semibold">{heldTool}</span>
                        </motion.div>
                    )}
                </div>

                {/* Lab Bench (Center) */}
                <div className="flex-1 relative p-6">
                    {/* Lab Table */}
                    <div
                        ref={benchRef}
                        className="absolute inset-6 bg-gradient-to-b from-slate-800/30 to-slate-900/50 rounded-2xl border border-white/10 overflow-hidden"
                    >
                        {/* Burette Stand Zone (free-move) */}
                        <motion.div
                            ref={buretteZoneRef}
                            drag
                            dragConstraints={benchRef}
                            dragMomentum={false}
                            style={{ left: burettePos.x, top: burettePos.y, width: 128, height: 64 }}
                            className={`absolute rounded-lg border-2 border-dashed transition-all cursor-grab active:cursor-grabbing ${state.buretteMounted
                                    ? "border-green-500/50 bg-green-900/20"
                                    : draggingTool === "burette"
                                        ? "border-cyan-400 bg-cyan-900/40 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                                        : heldTool === "burette"
                                            ? "border-cyan-400 bg-cyan-900/30 animate-pulse"
                                            : "border-slate-600 hover:border-slate-500"
                                }`}
                            onDragStart={() => setDraggingTool("burette")}
                            onDragEnd={(e, info) => {
                                setDraggingTool(null);
                                handleInstrumentDrop("burette", info.point.x, info.point.y);
                            }}
                            onClick={mountBurette}
                        >
                            {!state.buretteMounted && (
                                <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                                    Mount Burette (drag anywhere)
                                </span>
                            )}
                        </motion.div>

                        {/* Mounted Burette */}
                        <AnimatePresence>
                            {state.buretteMounted && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute"
                                    style={{ left: burettePos.x + 32, top: burettePos.y + 24 }}
                                >
                                    {/* Stand */}
                                    <div className="absolute left-1/2 -translate-x-1/2 -left-8 w-2 h-64 bg-gradient-to-b from-slate-500 to-slate-700 rounded" />

                                    {/* Burette Body */}
                                    <div className="relative w-6 h-56 bg-gradient-to-b from-white/20 to-white/5 border border-white/30 rounded-t-lg ml-4">
                                        {/* Liquid */}
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/50 to-blue-400/30 rounded-b"
                                            animate={{ height: `${(state.buretteVolume / 50) * 100}%` }}
                                            transition={{ type: "spring", damping: 15 }}
                                        />

                                        {/* Scale markings */}
                                        {[0, 10, 20, 30, 40, 50].map(v => (
                                            <div
                                                key={v}
                                                className="absolute left-0 w-full flex items-center"
                                                style={{ bottom: `${(v / 50) * 100}%` }}
                                            >
                                                <div className="w-2 h-px bg-white/50" />
                                                <span className="text-[8px] text-white/50 ml-1">{50 - v}</span>
                                            </div>
                                        ))}

                                        {/* Meniscus */}
                                        <div
                                            className="absolute left-0 right-0 h-1 bg-blue-300/30"
                                            style={{ bottom: `${(state.buretteVolume / 50) * 100}%` }}
                                        />
                                    </div>

                                    {/* Valve - Realistic Rotatable Knob */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 flex flex-col items-center justify-center z-10">
                                        <div className="text-[8px] text-slate-400 mb-1">Valve</div>
                                        <motion.div
                                            className="w-8 h-8 rounded-full border-2 border-slate-400 bg-slate-800 shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center relative touch-none"
                                            style={{ rotate: state.valvePosition * 0.9 }} // 0 to 90 degrees approx
                                            drag="y"
                                            dragConstraints={{ top: 0, bottom: 0 }}
                                            dragElastic={0}
                                            dragMomentum={false}
                                            onDrag={(e, info) => {
                                                // Convert drag distance to rotation (0-100)
                                                // We rely on delta y. Dragging DOWN opens it (increases value)
                                                const sensitivity = 2;
                                                const delta = info.delta.y * sensitivity;
                                                const newVal = Math.min(100, Math.max(0, state.valvePosition + delta));
                                                adjustValve(newVal);
                                            }}
                                            title="Drag up/down to rotate valve"
                                        >
                                            {/* Valve Handle visual */}
                                            <div className="w-1 h-8 bg-cyan-500 rounded-full shadow-sm" />
                                            {/* Central Hub */}
                                            <div className="absolute w-3 h-3 bg-slate-300 rounded-full shadow-inner" />
                                        </motion.div>
                                    </div>

                                    {/* Drip */}
                                    <AnimatePresence>
                                        {state.isFlowing && (
                                            <motion.div
                                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full"
                                                initial={{ y: 0, opacity: 1 }}
                                                animate={{ y: 40, opacity: 0 }}
                                                transition={{ duration: 0.4, repeat: Infinity }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Flask Placement Zone (free-move) */}
                        <motion.div
                            ref={flaskZoneRef}
                            drag
                            dragConstraints={benchRef}
                            dragMomentum={false}
                            style={{ left: flaskPos.x, top: flaskPos.y, width: 160, height: 96 }}
                            className={`absolute rounded-lg border-2 border-dashed transition-all cursor-grab active:cursor-grabbing ${state.flaskPlaced
                                    ? "border-green-500/50 bg-green-900/20"
                                    : draggingTool === "flask"
                                        ? "border-purple-400 bg-purple-900/40 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                        : heldTool === "flask"
                                            ? "border-purple-400 bg-purple-900/30 animate-pulse"
                                            : "border-slate-600 hover:border-slate-500"
                                }`}
                            onDragStart={() => setDraggingTool("flask")}
                            onDragEnd={(e, info) => {
                                setDraggingTool(null);
                                handleInstrumentDrop("flask", info.point.x, info.point.y);
                            }}
                            onClick={placeFlask}
                        >
                            {!state.flaskPlaced && (
                                <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                                    Place Flask (drag anywhere)
                                </span>
                            )}
                        </motion.div>

                        {/* Placed Flask */}
                        <AnimatePresence>
                            {state.flaskPlaced && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute"
                                    style={{ left: flaskPos.x + 40, top: flaskPos.y + 24 }}
                                    onClick={handleSwirl}
                                >
                                    <motion.svg
                                        viewBox="0 0 100 120"
                                        className="w-32 h-40 cursor-pointer"
                                        animate={state.swirling ? { rotate: [0, -5, 5, -5, 0] } : {}}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Flask outline */}
                                        <path
                                            d="M35 10 L35 35 L15 95 Q10 110 25 115 L75 115 Q90 110 85 95 L65 35 L65 10"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.4)"
                                            strokeWidth="2"
                                        />

                                        {/* Liquid with proper fill */}
                                        <motion.path
                                            d={`M17 ${95 - (state.flaskVolume / 60) * 30} 
                          Q12 ${110 - (state.flaskVolume / 60) * 12} 25 115 
                          L75 115 
                          Q88 ${110 - (state.flaskVolume / 60) * 12} 83 ${95 - (state.flaskVolume / 60) * 30}
                          Z`}
                                            fill={getIndicatorColor(state.pH, state.hasIndicator)}
                                            animate={{ fill: getIndicatorColor(state.pH, state.hasIndicator) }}
                                            transition={{ duration: 0.5 }}
                                        />

                                        {/* Glass highlight */}
                                        <path
                                            d="M40 15 L40 32 L22 80"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.15)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    </motion.svg>

                                    <div className="text-center text-xs text-slate-400 mt-1">
                                        Click to swirl
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Indicator / Dropper Action Zone (free-move) */}
                        <motion.div
                            ref={indicatorZoneRef}
                            drag
                            dragConstraints={benchRef}
                            dragMomentum={false}
                            style={{ left: dropperPos.x, top: dropperPos.y, width: 128, height: 96 }}
                            className="absolute rounded-lg border-2 border-dashed border-pink-500/40 bg-pink-500/5 flex items-center justify-center cursor-grab active:cursor-grabbing"
                            onDragStart={() => setDraggingTool("dropper")}
                            onDragEnd={(e, info) => {
                                setDraggingTool(null);
                                handleInstrumentDrop("dropper", info.point.x, info.point.y);
                            }}
                        >
                            {state.flaskPlaced && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <button
                                        onMouseDown={() => setDropperSqueezing(true)}
                                        onMouseUp={squeezeDropper}
                                        onMouseLeave={() => setDropperSqueezing(false)}
                                        className={`p-4 rounded-full transition-all ${dropperSqueezing
                                                ? "bg-pink-500/30 scale-90"
                                                : "bg-pink-600/20 hover:bg-pink-600/30"
                                            } border border-pink-500/50`}
                                    >
                                        <Droplets size={32} className="text-pink-400" />
                                    </button>
                                    <div className="text-[10px] text-pink-300 text-center mt-1">
                                        Add indicator here
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Live Data Display */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                        <div className="glass-panel px-4 py-2 rounded-lg text-center">
                            <div className="text-[10px] text-slate-400">pH</div>
                            <div className={`text-xl font-bold font-mono ${state.pH >= 8.2 && state.pH <= 10 ? "text-green-400" :
                                state.pH > 10 ? "text-red-400" : "text-cyan-400"
                                }`}>
                                {state.pH.toFixed(2)}
                            </div>
                        </div>
                        <div className="glass-panel px-4 py-2 rounded-lg text-center">
                            <div className="text-[10px] text-slate-400">Volume Added</div>
                            <div className="text-xl font-bold font-mono text-blue-400">
                                {(50 - state.buretteVolume).toFixed(1)} mL
                            </div>
                        </div>
                        <div className="glass-panel px-4 py-2 rounded-lg text-center">
                            <div className="text-[10px] text-slate-400">Flask Volume</div>
                            <div className="text-xl font-bold font-mono text-purple-400">
                                {state.flaskVolume.toFixed(1)} mL
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-72 bg-slate-900/50 border-l border-white/10 p-4 overflow-y-auto">
                    {/* Procedure */}
                    <h3 className="text-sm font-semibold text-white mb-3">Guided Procedure</h3>
                    <div className="space-y-2 mb-6">
                        {[
                            { step: "1. Fill burette with NaOH and mount on stand", done: state.buretteMounted && state.buretteVolume > 0 },
                            { step: "2. Place conical flask under burette", done: state.flaskPlaced },
                            { step: "3. Add 2–3 drops of indicator", done: state.indicatorDrops >= 2 },
                            { step: "4. Start titration slowly", done: state.experimentStarted },
                            { step: "5. Stop at faint pink endpoint", done: state.experimentComplete && state.passed },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded text-xs flex items-center gap-2 ${item.done
                                        ? "bg-green-900/30 text-green-300"
                                        : "bg-slate-800/50 text-slate-400"
                                    }`}
                            >
                                {item.done ? (
                                    <CheckCircle size={14} />
                                ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-current" />
                                )}
                                {item.step}
                            </div>
                        ))}
                    </div>

                    {/* Warnings */}
                    <AnimatePresence>
                        {warnings.map((w, i) => (
                            <motion.div
                                key={w + i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="mb-2 p-2 bg-red-900/40 border border-red-500/50 rounded text-xs text-red-200 flex items-center gap-2 animate-[shake_0.25s_ease-in-out]"
                            >
                                <AlertTriangle size={14} />
                                {w}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Result */}
                    {state.experimentComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mt-4 p-4 rounded-lg text-center ${state.passed
                                ? "bg-green-900/30 border border-green-500/50"
                                : "bg-red-900/30 border border-red-500/50"
                                }`}
                        >
                            {state.passed ? (
                                <>
                                    <CheckCircle size={40} className="mx-auto text-green-400 mb-2" />
                                    <div className="text-lg font-bold text-green-400">Experiment Passed!</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Endpoint pH: {state.pH.toFixed(2)}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <X size={40} className="mx-auto text-red-400 mb-2" />
                                    <div className="text-lg font-bold text-red-400">Overshoot!</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        pH went above 10. Try again.
                                    </div>
                                </>
                            )}
                            {examMode && (
                                <div className="text-xs text-slate-400 mt-2">
                                    Time: {formatTime(timer)}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* AI Assistant Button */}
                    <div className="mb-6 mt-6">
                        <button
                            onClick={handleAskAI}
                            disabled={isAnalyzing}
                            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${isAnalyzing
                                ? "bg-purple-900/50 text-purple-300 cursor-wait"
                                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20"
                                }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Ask Lab AI Assistant
                                </>
                            )}
                        </button>
                    </div>

                    {/* AI Feedback Display */}
                    <AnimatePresence>
                        {aiFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                                        <Bot size={18} className="text-indigo-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                                            AI Evaluation
                                        </div>
                                        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {aiFeedback}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAiFeedback(null)}
                                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Formula Reference */}
                    <div className="mt-6 p-3 bg-slate-800/50 rounded-lg">
                        <div className="text-xs text-slate-400 mb-2">Moles Calculation</div>
                        <div className="font-mono text-sm text-cyan-400">
                            n = M × V
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                            HCl: {state.molesHCl.toFixed(5)} mol<br />
                            NaOH: {state.molesNaOH.toFixed(5)} mol
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .real-lab {
          font-family: "Inter", system-ui, sans-serif;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #22d3ee;
          border-radius: 50%;
          cursor: pointer;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
      `}</style>
        </div>
    );
}
