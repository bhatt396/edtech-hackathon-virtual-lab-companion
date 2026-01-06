"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle } from "lucide-react";

const PROCEDURE_STEPS = [
    { id: 1, title: "Set up equipment", description: "Drag burette and flask to workbench" },
    { id: 2, title: "Fill burette", description: "Add 50ml of 0.1M NaOH to burette" },
    { id: 3, title: "Add acid to flask", description: "Pour 25ml of 0.1M HCl into flask" },
    { id: 4, title: "Add indicator", description: "Add 2-3 drops of phenolphthalein" },
    { id: 5, title: "Begin titration", description: "Open valve slowly, observe color" },
    { id: 6, title: "Reach endpoint", description: "Stop when persistent pink appears" },
    { id: 7, title: "Record results", description: "Note final volume and pH" },
];

interface ProcedureChecklistProps {
    completedSteps: number[];
}

export default function ProcedureChecklist({ completedSteps }: ProcedureChecklistProps) {
    const currentStep = completedSteps.length > 0
        ? Math.max(...completedSteps) + 1
        : 1;

    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white mb-4">Procedure</h2>

            {PROCEDURE_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = step.id === currentStep;

                return (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
              p-3 rounded-lg transition-all duration-300
              ${isCompleted
                                ? "bg-green-900/20 border border-green-500/30"
                                : isCurrent
                                    ? "bg-cyan-900/20 border border-cyan-500/30"
                                    : "bg-slate-800/30 border border-transparent"
                            }
            `}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {isCompleted ? (
                                    <CheckCircle size={18} className="text-green-400" />
                                ) : (
                                    <Circle
                                        size={18}
                                        className={isCurrent ? "text-cyan-400" : "text-slate-500"}
                                    />
                                )}
                            </div>
                            <div>
                                <h3 className={`text-sm font-medium ${isCompleted
                                        ? "text-green-300"
                                        : isCurrent
                                            ? "text-cyan-300"
                                            : "text-slate-400"
                                    }`}>
                                    {step.id}. {step.title}
                                </h3>
                                <p className={`text-xs mt-0.5 ${isCompleted
                                        ? "text-green-400/60"
                                        : isCurrent
                                            ? "text-cyan-400/60"
                                            : "text-slate-500"
                                    }`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* Progress Indicator */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{completedSteps.length}/{PROCEDURE_STEPS.length} steps</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedSteps.length / PROCEDURE_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
}
