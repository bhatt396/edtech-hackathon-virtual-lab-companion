import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useTitration } from "./TitrationEngine";
import Container from "./Container";

export default function Workbench() {
    const {
        beaker,
        flask,
        burette,
        addEquipment,
        startTitration,
        reset,
        state,
    } = useTitration();

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over?.id === "workbench") {
            addEquipment(active.data.current);
        }
    };

    return (
        <section className="workbench flex-1 glass relative" id="workbench">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                {beaker && <Container type="beaker" data={beaker} />}
                {flask && <Container type="flask" data={flask} />}
                {burette && <Container type="burette" data={burette} />}
            </DndContext>

            <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                    className="btn-primary"
                    onClick={startTitration}
                    disabled={!state.ready || state.titrating}
                >
                    Start Titration
                </button>
                <button className="btn-secondary" onClick={reset}>
                    Reset
                </button>
            </div>
        </section>
    );
}
