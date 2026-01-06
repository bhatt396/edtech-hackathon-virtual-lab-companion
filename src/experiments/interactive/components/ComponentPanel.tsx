import React, { useState } from "react";
import DraggableItem from "./DraggableItem";

export default function ComponentPanel() {
    const [voltage, setVoltage] = useState(9);

    return (
        <aside className="panel glass">
            <h2 className="panel-title">Component Panel</h2>

            {/* Battery */}
            <div className="panel-section">
                <label className="slider-label">
                    Battery Voltage: {voltage} V
                    <input
                        type="range"
                        min="1"
                        max="12"
                        step="0.5"
                        value={voltage}
                        onChange={e => setVoltage(parseFloat(e.target.value))}
                        className="slider"
                    />
                </label>
                <DraggableItem type="battery" voltage={voltage} />
            </div>

            {/* Resistors */}
            <div className="panel-section">
                <h3>Resistors</h3>
                {[10, 20, 50].map(r => (
                    <DraggableItem key={r} type="resistor" value={r} />
                ))}
            </div>

            {/* Instruments */}
            <div className="panel-section">
                <DraggableItem type="ammeter" />
                <DraggableItem type="voltmeter" />
                <DraggableItem type="switch" />
                <DraggableItem type="wire" />
            </div>
        </aside>
    );
}
