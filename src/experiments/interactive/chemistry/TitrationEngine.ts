import { useState, useEffect } from "react";

type ContainerData = {
    volume: number; // mL
    concentration?: number; // M
    pH?: number;
    color?: string;
};

export function useTitration() {
    const [beaker, setBeaker] = useState<ContainerData | null>(null);
    const [flask, setFlask] = useState<ContainerData | null>(null);
    const [burette, setBurette] = useState<ContainerData | null>(null);
    const [state, setState] = useState<{ ready: boolean; titrating: boolean }>({
        ready: false,
        titrating: false,
    });

    // Add equipment to the workbench
    const addEquipment = (item: any) => {
        switch (item.id) {
            case "beaker":
                setBeaker({ volume: 0 });
                break;
            case "flask":
                setFlask({ volume: 0 });
                break;
            case "burette":
                setBurette({ volume: 0, concentration: 0.1 });
                break;
            default:
                break;
        }
        // Enable start when all three are present
        setState(s => ({
            ...s,
            ready: !!beaker && !!flask && !!burette,
        }));
    };

    // Fill initial chemicals (called on mount)
    const fillInitial = () => {
        setBurette({ volume: 30, concentration: 0.1, color: "#fff" }); // 0.1M NaOH
        setFlask({
            volume: 25,
            concentration: 0.1,
            pH: 1,
            color: "#fff",
        }); // 0.1M HCl + indicator
        setBeaker({ volume: 0 });
        setState(s => ({ ...s, ready: true }));
    };

    useEffect(() => {
        fillInitial();
    }, []);

    // Titration simulation
    const startTitration = () => {
        if (!burette || !flask) return;
        setState(s => ({ ...s, titrating: true }));
        const interval = setInterval(() => {
            // Transfer 0.2 mL each tick from burette to flask
            setBurette(prev => {
                if (!prev) return prev;
                const newVol = Math.max(prev.volume - 0.2, 0);
                return { ...prev, volume: newVol };
            });
            setFlask(prev => {
                if (!prev) return prev;
                const added = 0.2;
                const newVol = prev.volume + added;
                // Simple neutralisation calculation
                const molesNaOH = added * (burette?.concentration ?? 0);
                const molesHCl = prev.volume * (prev.concentration ?? 0);
                const remainingHCl = Math.max(molesHCl - molesNaOH, 0);
                const newConc = remainingHCl / newVol;
                const newPH = remainingHCl > 0 ? 1 : 9; // crude switch after equivalence
                const newColor = newPH > 8.2 ? "#ffb6c1" : "#fff"; // pink after equivalence
                return {
                    ...prev,
                    volume: newVol,
                    concentration: newConc,
                    pH: newPH,
                    color: newColor,
                };
            });
            // Stop condition
            setBurette(prev => {
                if (!prev || prev.volume <= 0) {
                    clearInterval(interval);
                    setState(s => ({ ...s, titrating: false }));
                }
                return prev;
            });
        }, 200);
    };

    const reset = () => {
        setBeaker(null);
        setFlask(null);
        setBurette(null);
        setState({ ready: false, titrating: false });
        fillInitial();
    };

    return {
        beaker,
        flask,
        burette,
        addEquipment,
        startTitration,
        reset,
        state,
    };
}
