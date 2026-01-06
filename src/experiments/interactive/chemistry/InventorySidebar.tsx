"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
    Beaker,
    FlaskConical,
    Droplet,
    Pipette,
    TestTube,
    FlaskRound,
} from "lucide-react";

const EQUIPMENT_LIST = [
    { id: "beaker", label: "Beaker", icon: Beaker, color: "cyan" },
    { id: "flask", label: "Erlenmeyer Flask", icon: FlaskConical, color: "purple" },
    { id: "burette", label: "Burette", icon: Pipette, color: "blue" },
    { id: "dropper", label: "Dropper", icon: Droplet, color: "pink" },
    { id: "indicator", label: "Phenolphthalein", icon: FlaskRound, color: "rose" },
    { id: "acid", label: "0.1M HCl", icon: TestTube, color: "yellow" },
    { id: "base", label: "0.1M NaOH", icon: TestTube, color: "green" },
];

function DraggableEquipment({
    id,
    label,
    icon: Icon,
    color,
}: {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `inventory-${id}`,
        data: { type: "equipment", equipmentId: id, label },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
    };

    const colorClasses: Record<string, string> = {
        cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50",
        purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50",
        blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50",
        pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-400/50",
        rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-400/50",
        yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-400/50",
        green: "from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50",
    };

    const iconColors: Record<string, string> = {
        cyan: "text-cyan-400",
        purple: "text-purple-400",
        blue: "text-blue-400",
        pink: "text-pink-400",
        rose: "text-rose-400",
        yellow: "text-yellow-400",
        green: "text-green-400",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        relative p-4 rounded-xl select-none touch-none
        bg-gradient-to-br ${colorClasses[color]}
        border backdrop-blur-sm
        transition-all duration-200
        hover:scale-[1.02] active:scale-95
        ${isDragging ? "shadow-2xl ring-2 ring-cyan-400/50" : ""}
      `}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/30 ${iconColors[color]}`}>
                    <Icon size={24} />
                </div>
                <span className="text-sm font-medium text-white/90">{label}</span>
            </div>
        </div>
    );
}

export default function InventorySidebar() {
    return (
        <aside className="w-72 border-r border-white/10 bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-1">Equipment</h2>
            <p className="text-xs text-slate-400 mb-4">Drag items to the workbench</p>

            <div className="space-y-3">
                {EQUIPMENT_LIST.map((item) => (
                    <DraggableEquipment key={item.id} {...item} />
                ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Quick Guide</h3>
                <ul className="text-xs text-slate-400 space-y-1.5">
                    <li>• Drag equipment to the workbench</li>
                    <li>• Click equipment to see properties</li>
                    <li>• Place burette above flask for titration</li>
                    <li>• Use valve slider to control flow</li>
                </ul>
            </div>
        </aside>
    );
}
