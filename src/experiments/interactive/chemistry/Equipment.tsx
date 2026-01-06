import React from "react";
import { useDraggable } from "@dnd-kit/core";

export default function Equipment({
    id,
    icon,
    label,
}: {
    id: string;
    icon: React.ReactNode;
    label: string;
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data: { type: "equipment", id },
    });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="draggable-equipment glass flex items-center gap-2 p-2 mb-2 cursor-grab"
            {...attributes}
            {...listeners}
        >
            {icon}
            <span>{label}</span>
        </div>
    );
}
