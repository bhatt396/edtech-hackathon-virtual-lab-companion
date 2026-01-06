export type NodeId = string;

export interface CircuitNode {
    id: NodeId;
    type: 'battery' | 'resistor' | 'bulb' | 'transistor' | 'switch';
    position: [number, number, number];
    data: Record<string, any>;
}

/** A wire connects two node terminals */
export interface Wire {
    id: string;
    from: NodeId;
    to: NodeId;
    color?: string;
}

/** Simple linear circuit calculation – assumes a single loop */
export const computeCircuit = (nodes: CircuitNode[], wires: Wire[]) => {
    const battery = nodes.find(n => n.type === 'battery');
    const resistor = nodes.find(n => n.type === 'resistor');
    const bulb = nodes.find(n => n.type === 'bulb');
    const transistor = nodes.find(n => n.type === 'transistor');
    const circuitSwitch = nodes.find(n => n.type === 'switch');

    // If there is a switch and it is OPEN (off), current is 0
    const isSwitchOpen = circuitSwitch?.data.isOpen ?? false;

    const V = battery?.data.voltage ?? 0;
    const R = resistor?.data.resistance ?? 0;
    const Rb = bulb?.data.resistance ?? 50; // default bulb resistance
    const Rt = transistor?.data.resistance ?? 30; // default transistor resistance

    const totalR = R + Rb + Rt;

    // Current only flows if switch is CLOSED
    const I = (totalR === 0 || isSwitchOpen) ? 0 : V / totalR;

    // simple fault detection
    const fault = I > 2 ? 'overheat' : totalR < 1 && !isSwitchOpen ? 'short' : null;

    return { V, R, I, totalR, fault, isSwitchOpen };
};
