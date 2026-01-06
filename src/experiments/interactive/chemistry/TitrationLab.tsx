"use client";

import React, { useState } from "react";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import InventorySidebar from "./InventorySidebar";
import LabWorkbench from "./LabWorkbench";
import ProcedureChecklist from "./ProcedureChecklist";
import { useTitrationEngine } from "./useTitrationEngine";
import { RotateCcw, AlertTriangle, CheckCircle, Beaker, FlaskConical, Pipette } from "lucide-react";

export default function TitrationLab() {
    const {
        state,
        placedEquipment,
        selectedEquipment,
        titrationMode,
        hints,
        errors,
        practiceMode,
        addEquipment,
        selectEquipment,
        fillBurette,
        fillFlask,
        addIndicator,
        openValve,
        closeValve,
        setValveSpeed,
        reset,
        toggleMode,
        completedSteps,
    } = useTitrationEngine();

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeDragData, setActiveDragData] = useState<any>(null);

    // Configure sensors for both mouse and touch
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        setActiveDragData(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveDragData(null);

        if (over?.id === "workbench" && active.data.current) {
            addEquipment(active.data.current);
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
        setActiveDragData(null);
    };

    // Get icon for drag overlay
    const getDragOverlayIcon = () => {
        if (!activeDragData) return null;
        const iconMap: Record<string, React.ReactNode> = {
            beaker: <Beaker size={32} />,
            flask: <FlaskConical size={32} />,
            burette: <Pipette size={32} />,
        };
        return iconMap[activeDragData.equipmentId] || <Beaker size={32} />;
    };

    return (
        <div className="titration-lab min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/30 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Acid-Base Titration Lab
                        </h1>
                        <p className="text-sm text-slate-400">Virtual Chemistry Practical</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleMode}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${practiceMode
                                    ? "bg-green-600/20 text-green-400 border border-green-500/30"
                                    : "bg-orange-600/20 text-orange-400 border border-orange-500/30"
                                }`}
                        >
                            {practiceMode ? "Practice Mode" : "Exam Mode"}
                        </button>
                        <button
                            onClick={reset}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    </div>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="flex h-[calc(100vh-80px)]">
                    {/* Left Sidebar - Equipment Inventory */}
                    <InventorySidebar />

                    {/* Center - Lab Workbench */}
                    <main className="flex-1 p-6 overflow-hidden relative">
                        <LabWorkbench
                            placedEquipment={placedEquipment}
                            selectedEquipment={selectedEquipment}
                            onSelectEquipment={selectEquipment}
                            titrationMode={titrationMode}
                            state={state}
                            onFillBurette={fillBurette}
                            onFillFlask={fillFlask}
                            onAddIndicator={addIndicator}
                            onOpenValve={openValve}
                            onCloseValve={closeValve}
                            onSetValveSpeed={setValveSpeed}
                        />

                        {/* Live Data Display */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-10">
                            <motion.div
                                className="glass-panel px-6 py-3 rounded-xl"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                <div className="text-xs text-slate-400 mb-1">Flask pH</div>
                                <div className={`text-2xl font-bold ${state.flaskPH >= 8.2 ? "text-pink-400" :
                                        state.flaskPH >= 7 ? "text-green-400" : "text-cyan-400"
                                    }`}>
                                    {state.flaskPH.toFixed(2)}
                                </div>
                            </motion.div>
                            <motion.div
                                className="glass-panel px-6 py-3 rounded-xl"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="text-xs text-slate-400 mb-1">Flask Volume</div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {state.flaskVolume.toFixed(1)} ml
                                </div>
                            </motion.div>
                            <motion.div
                                className="glass-panel px-6 py-3 rounded-xl"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="text-xs text-slate-400 mb-1">Burette Volume</div>
                                <div className="text-2xl font-bold text-purple-400">
                                    {state.buretteVolume.toFixed(1)} ml
                                </div>
                            </motion.div>
                        </div>
                    </main>

                    {/* Right Sidebar - Procedure & Hints */}
                    <aside className="w-80 border-l border-white/10 bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
                        <ProcedureChecklist completedSteps={completedSteps} />

                        {/* Hints Panel */}
                        {practiceMode && hints.length > 0 && (
                            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                                <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={14} />
                                    Hints
                                </h3>
                                <ul className="space-y-2">
                                    {hints.map((hint, i) => (
                                        <li key={i} className="text-xs text-blue-300/80">{hint}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Errors Panel */}
                        <AnimatePresence>
                            {errors.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
                                >
                                    <h3 className="text-sm font-semibold text-red-400 mb-2">Warnings</h3>
                                    <ul className="space-y-1">
                                        {errors.map((err, i) => (
                                            <li key={i} className="text-xs text-red-300/80">{err}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Result Display */}
                        {state.experimentComplete && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`mt-6 p-6 rounded-xl text-center ${state.passed
                                        ? "bg-green-900/30 border border-green-500/50"
                                        : "bg-orange-900/30 border border-orange-500/50"
                                    }`}
                            >
                                <CheckCircle
                                    size={48}
                                    className={`mx-auto mb-3 ${state.passed ? "text-green-400" : "text-orange-400"}`}
                                />
                                <h3 className={`text-xl font-bold ${state.passed ? "text-green-400" : "text-orange-400"}`}>
                                    {state.passed ? "Experiment Passed!" : "Try Again"}
                                </h3>
                                <p className="text-sm text-slate-400 mt-2">
                                    Endpoint pH: {state.flaskPH.toFixed(2)}
                                </p>
                            </motion.div>
                        )}
                    </aside>
                </div>

                {/* Drag Overlay - shows what's being dragged */}
                <DragOverlay>
                    {activeId ? (
                        <div className="p-4 bg-cyan-500/20 border border-cyan-400/50 rounded-xl backdrop-blur-sm shadow-2xl">
                            <div className="text-cyan-400">
                                {getDragOverlayIcon()}
                            </div>
                            <span className="text-sm text-white mt-2 block">
                                {activeDragData?.label || "Equipment"}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <style jsx global>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .titration-lab {
          font-family: "Inter", system-ui, sans-serif;
        }
      `}</style>
        </div>
    );
}
