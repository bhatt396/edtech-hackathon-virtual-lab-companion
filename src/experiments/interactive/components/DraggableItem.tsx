import React from "react";
import { useDraggable } from "@dnd-kit/core";

export type ItemProps =
    | { type: "battery"; voltage: number }
    | { type: "resistor"; value: number }
    | { type: "ammeter" }
    | { type: "voltmeter" }
    | { type: "switch" }
    | { type: "wire" };

export default function DraggableItem(props: ItemProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `${props.type}-${Math.random().toString(36).substr(2, 5)}`,
        data: props,
    });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
    };

    const iconClass = `icon ${props.type}`;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="draggable-item glass"
            {...attributes}
            {...listeners}
        >
            <span className={iconClass} />
        </div>
    );
}
