import React from "react";
import { useDroppable } from "@dnd-kit/core";

export default function Terminal({ id }: { id: string }) {
    const { isOver, setNodeRef } = useDroppable({
        id,
        data: { type: "terminal", id },
    });

    return (
        <div
            ref={setNodeRef}
            className={`terminal ${isOver ? "highlight" : ""}`}
        />
    );
}
