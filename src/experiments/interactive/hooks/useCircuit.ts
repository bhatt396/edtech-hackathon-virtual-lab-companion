import { useState } from "react";

type ComponentInstance = {
    id: string;
    type: string;
    x: number;
    y: number;
    data: any;
};

type WireInstance = {
    id: string;
    from: { x: number; y: number };
    to: { x: number; y: number };
};

export function useCircuit() {
    const [components, setComponents] = useState<ComponentInstance[]>([]);
    const [wires, setWires] = useState<WireInstance[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const [state, setState] = useState<{
        voltage?: number;
        current?: number;
        resistance?: number;
        currentFlow: boolean;
    }>({ currentFlow: false });

    // Add a component dropped from the panel
    const addComponent = (data: any) => {
        const id = `${data.type}-${Math.random().toString(36).substr(2, 5)}`;
        const newComp: ComponentInstance = {
            id,
            type: data.type,
            x: 150,
            y: 150,
            data,
        };
        setComponents(prev => [...prev, newComp]);
    };

    // Connect two terminals (called from Terminal drop handler)
    const connect = (fromId: string, toId: string) => {
        const from = components.find(c => c.id === fromId);
        const to = components.find(c => c.id === toId);
        if (!from || !to) return;

        const dx = from.x - to.x;
        const dy = from.y - to.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 30) {
            setErrors(prev => [...prev, "Components are too far apart – snap them closer."]);
            return;
        }

        const wire: WireInstance = {
            id: `wire-${Math.random().toString(36).substr(2, 5)}`,
            from: { x: from.x, y: from.y },
            to: { x: to.x, y: to.y },
        };
        setWires(prev => [...prev, wire]);
        evaluateCircuit();
    };

    // Switch toggle (ON/OFF)
    const toggleSwitch = (id: string) => {
        setComponents(prev =>
            prev.map(c =>
                c.id === id ? { ...c, data: { ...c.data, on: !c.data.on } } : c
            )
        );
        evaluateCircuit();
    };

    // Core physics – Ohm's law evaluation
    const evaluateCircuit = () => {
        const battery = components.find(c => c.type === "battery");
        const resistor = components.find(c => c.type === "resistor");
        const sw = components.find(c => c.type === "switch");

        if (!battery || !resistor) {
            setErrors(prev => [...prev, "Missing battery or resistor."]);
            setState({ currentFlow: false });
            return;
        }

        const voltage = battery.data.voltage ?? 9;
        const resistance = resistor.data.value ?? 10;
        const switchOn = sw?.data?.on ?? true;

        if (!switchOn) {
            setState({ voltage, current: 0, resistance, currentFlow: false });
            return;
        }

        const current = voltage / resistance;
        setState({ voltage, current, resistance, currentFlow: true });
    };

    return {
        components,
        wires,
        addComponent,
        connect,
        toggleSwitch,
        state,
        errors,
    };
}
