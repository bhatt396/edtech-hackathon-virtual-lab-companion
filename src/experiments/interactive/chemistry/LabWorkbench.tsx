"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, X } from "lucide-react";

interface PlacedEquipment {
    id: string;
    equipmentId: string;
    label: string;
    x: number;
    y: number;
}

interface TitrationState {
    flaskVolume: number;
    flaskPH: number;
    flaskColor: string;
    buretteVolume: number;
    buretteUsed: number;
    hasIndicator: boolean;
    hasAcid: boolean;
    hasBase: boolean;
    valveOpen: boolean;
    valveSpeed: number;
    experimentComplete: boolean;
    passed: boolean;
}

interface LabWorkbenchProps {
    placedEquipment: PlacedEquipment[];
    selectedEquipment: string | null;
    onSelectEquipment: (id: string | null) => void;
    titrationMode: boolean;
    state: TitrationState;
    onFillBurette: () => void;
    onFillFlask: () => void;
    onAddIndicator: () => void;
    onOpenValve: () => void;
    onCloseValve: () => void;
    onSetValveSpeed: (speed: number) => void;
}

export default function LabWorkbench({
    placedEquipment,
    selectedEquipment,
    onSelectEquipment,
    titrationMode,
    state,
    onFillBurette,
    onFillFlask,
    onAddIndicator,
    onOpenValve,
    onCloseValve,
    onSetValveSpeed,
}: LabWorkbenchProps) {
    const { isOver, setNodeRef } = useDroppable({ id: "workbench" });

    // Calculate liquid color based on pH and indicator
    const getLiquidColor = () => {
        if (!state.hasIndicator) return "rgba(200, 200, 200, 0.3)";
        if (state.flaskPH >= 8.2) return "rgba(255, 182, 193, 0.9)"; // Pink
        if (state.flaskPH >= 7) return "rgba(255, 220, 220, 0.6)"; // Light pink
        return "rgba(200, 200, 200, 0.3)"; // Colorless
    };

    return (
        <div
            ref={setNodeRef}
            className={`
        relative w-full h-full rounded-2xl overflow-hidden
        bg-gradient-to-b from-slate-800/50 to-slate-900/50
        border-4 transition-all duration-300
        ${isOver
                    ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] bg-cyan-900/20"
                    : "border-white/10 hover:border-white/20"
                }
      `}
            style={{ minHeight: "500px" }}
        >
            {/* Lab Table Surface Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: "24px 24px",
                    }}
                />
            </div>

            {/* Drop Zone Visual Indicator */}
            <AnimatePresence>
                {isOver && (
                    <motion.div
                        className="absolute inset-4 border-2 border-dashed border-cyan-400 rounded-xl flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div className="text-cyan-400 text-lg font-semibold">
                            Drop here to place equipment
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Titration Setup Visualization */}
            {titrationMode && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Stand */}
                    <div className="relative">
                        {/* Stand pole */}
                        <div className="absolute -left-8 top-0 w-4 h-80 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-lg" />
                        <div className="absolute -left-12 bottom-0 w-12 h-4 bg-slate-600 rounded" />

                        {/* Burette */}
                        <motion.div
                            className="relative w-8 h-64 mx-auto"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {/* Burette body */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/10 border border-white/30 rounded-t-lg overflow-hidden">
                                {/* Liquid level */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400/60 to-blue-300/40"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(state.buretteVolume / 50) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                                {/* Measurement lines */}
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute left-0 w-2 h-px bg-white/40"
                                        style={{ bottom: `${(i + 1) * 10}%` }}
                                    />
                                ))}
                            </div>

                            {/* Valve Control */}
                            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40">
                                <div className="text-xs text-center text-slate-400 mb-2">Valve Control</div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={state.valveOpen ? state.valveSpeed : 0}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val > 0) {
                                            onSetValveSpeed(val);
                                            onOpenValve();
                                        } else {
                                            onCloseValve();
                                        }
                                    }}
                                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Closed</span>
                                    <span>Fast</span>
                                </div>
                            </div>

                            {/* Drip Animation */}
                            <AnimatePresence>
                                {state.valveOpen && (
                                    <motion.div
                                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"
                                        initial={{ y: 0, opacity: 1 }}
                                        animate={{ y: 80, opacity: 0 }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Flask */}
                        <motion.div
                            className="relative w-32 h-40 mx-auto mt-24"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {/* Flask body */}
                            <svg viewBox="0 0 100 120" className="w-full h-full">
                                {/* Flask outline */}
                                <path
                                    d="M35 10 L35 40 L10 100 Q5 115 20 118 L80 118 Q95 115 90 100 L65 40 L65 10"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="2"
                                />
                                {/* Liquid */}
                                <motion.path
                                    d={`M12 ${100 - (state.flaskVolume / 50) * 40} 
                      Q10 ${115 - (state.flaskVolume / 50) * 15} 20 118 
                      L80 118 
                      Q90 ${115 - (state.flaskVolume / 50) * 15} 88 ${100 - (state.flaskVolume / 50) * 40}
                      Z`}
                                    fill={getLiquidColor()}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                                {/* Glass highlight */}
                                <path
                                    d="M40 15 L40 35 L20 85"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Equivalence Point Glow */}
                            {state.flaskPH >= 8.2 && (
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-pink-400/20 blur-xl"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                            )}
                        </motion.div>
                    </div>

                    {/* Control Buttons */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-3">
                        <button
                            onClick={onFillBurette}
                            disabled={state.buretteVolume >= 50}
                            className="block w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm rounded-lg border border-blue-500/30 disabled:opacity-50 transition-colors"
                        >
                            Fill Burette (NaOH)
                        </button>
                        <button
                            onClick={onFillFlask}
                            disabled={state.hasAcid}
                            className="block w-full px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 text-sm rounded-lg border border-yellow-500/30 disabled:opacity-50 transition-colors"
                        >
                            Add 25ml HCl
                        </button>
                        <button
                            onClick={onAddIndicator}
                            disabled={state.hasIndicator}
                            className="block w-full px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-sm rounded-lg border border-pink-500/30 disabled:opacity-50 transition-colors"
                        >
                            Add Indicator
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State - shown when no equipment placed */}
            {!titrationMode && placedEquipment.length === 0 && !isOver && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                        <FlaskConical size={80} className="mx-auto text-slate-600 mb-6" />
                        <p className="text-slate-300 text-xl font-semibold mb-2">Drag equipment here</p>
                        <p className="text-slate-500 text-sm">
                            Place burette and flask to start titration mode
                        </p>
                    </div>
                </div>
            )}

            {/* Placed Equipment Display */}
            {!titrationMode && placedEquipment.length > 0 && (
                <div className="absolute inset-0 p-6">
                    <div className="grid grid-cols-3 gap-4">
                        {placedEquipment.map((eq) => (
                            <motion.div
                                key={eq.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-center"
                                onClick={() => onSelectEquipment(eq.id)}
                            >
                                <FlaskConical size={32} className="mx-auto text-cyan-400 mb-2" />
                                <p className="text-sm text-white">{eq.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Equipment Panel */}
            <AnimatePresence>
                {selectedEquipment && (
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="absolute top-4 right-4 w-64 p-4 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">Properties</h3>
                            <button
                                onClick={() => onSelectEquipment(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Volume</span>
                                <span className="text-white">{state.flaskVolume.toFixed(1)} ml</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">pH</span>
                                <span className="text-white">{state.flaskPH.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Chemical</span>
                                <span className="text-white">HCl (aq)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Concentration</span>
                                <span className="text-white">0.1 M</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
