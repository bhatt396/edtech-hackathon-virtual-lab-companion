import React from "react";

export default function ProcedurePanel() {
    return (
        <aside className="procedure w-64 glass p-4">
            <h2 className="text-lg font-bold mb-3">Procedure</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Drag a Beaker, Flask, and Burette onto the workbench.</li>
                <li>The Burette is pre‑filled with 0.1 M NaOH.</li>
                <li>The Flask contains 25 ml 0.1 M HCl + indicator.</li>
                <li>Press “Start Titration” – the valve opens and NaOH drips.</li>
                <li>Watch the color change at the equivalence point (pH ≈ 8.2).</li>
                <li>Use “Reset” to start over.</li>
            </ol>
        </aside>
    );
}
