import React from "react";
import InventorySidebar from "./InventorySidebar";
import Workbench from "./Workbench";
import ProcedurePanel from "./ProcedurePanel";
import "./styles.css";

export default function ChemistryLab() {
    return (
        <div className="chemistry-lab flex flex-col md:flex-row gap-4 p-4 min-h-screen bg-gray-900 text-white">
            <InventorySidebar />
            <Workbench />
            <ProcedurePanel />
        </div>
    );
}
