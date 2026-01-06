import React from "react";
import ComponentPanel from "./components/ComponentPanel";
import Workbench from "./components/Workbench";
import "./styles.css";

export default function OhmsCircuitAssembly() {
    return (
        <div className="circuit-assembly-container">
            <ComponentPanel />
            <Workbench />
        </div>
    );
}
