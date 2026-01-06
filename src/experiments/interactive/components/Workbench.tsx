import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useCircuit } from "../hooks/useCircuit";
import Wire from "./Wire";
import Terminal from "./Terminal";

export default function Workbench() {
    const {
        components,
        wires,
        addComponent,
        connect,
        toggleSwitch,
        state,
        errors,
    } = useCircuit();

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        // Drop on the workbench area (its id is "workbench")
        if (over?.id?.startsWith("workbench")) {
            addComponent(active.data.current);
        }
    };

    // Simple terminal drop handler – when a wire is dropped onto a terminal
    const handleTerminalDrop = (event: any) => {
        const { active, over } = event;
        if (active?.id?.startsWith("wire") && over?.id?.startsWith("terminal")) {
            // active.id is the wire, over.id is the terminal
            const fromId = (active.data.current?.fromId as string) ?? "";
            const toId = (over.id as string).replace("terminal-", "");
            connect(fromId, toId);
        }
    };

    return (
        <section className="workbench glass" id="workbench">
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragOver={handleTerminalDrop}
            >
                {/* Placed components */}
                {components.map(c => (
                    <div
                        key={c.id}
                        className="placed-component"
                        style={{ left: c.x, top: c.y, position: "absolute" }}
                    >
                        {/* Two terminals for each component */}
                        <Terminal id={`terminal-${c.id}-1`} />
                        <Terminal id={`terminal-${c.id}-2`} />
                        <div className={`component ${c.type}`} />
                    </div>
                ))}

                {/* Wires */}
                {wires.map(w => (
                    <Wire
                        key={w.id}
                        from={w.from}
                        to={w.to}
                        active={state.currentFlow}
                    />
                ))}
            </DndContext>

            {/* Real‑time feedback panel */}
            <div className="circuit-feedback glass">
                <p>V = {state.voltage?.toFixed(2) ?? "—"} V</p>
                <p>I = {state.current?.toFixed(3) ?? "—"} A</p>
                <p>R = {state.resistance?.toFixed(1) ?? "—"} Ω</p>
                <p className="formula">V = I × R</p>
                {errors.length > 0 && (
                    <ul className="error-list">
                        {errors.map((e, i) => (
                            <li key={i} className="error-item">{e}</li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
