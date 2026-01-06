"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PlacedEquipment {
    id: string;
    equipmentId: string;
    label: string;
    x: number;
    y: number;
}

interface TitrationState {
    flaskVolume: number;
    flaskPH: number;
    flaskColor: string;
    buretteVolume: number;
    buretteUsed: number;
    hasIndicator: boolean;
    hasAcid: boolean;
    hasBase: boolean;
    valveOpen: boolean;
    valveSpeed: number;
    experimentComplete: boolean;
    passed: boolean;
}

const INITIAL_STATE: TitrationState = {
    flaskVolume: 0,
    flaskPH: 7,
    flaskColor: "transparent",
    buretteVolume: 0,
    buretteUsed: 0,
    hasIndicator: false,
    hasAcid: false,
    hasBase: false,
    valveOpen: false,
    valveSpeed: 1,
    experimentComplete: false,
    passed: false,
};

export function useTitrationEngine() {
    const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
    const [state, setState] = useState<TitrationState>(INITIAL_STATE);
    const [practiceMode, setPracticeMode] = useState(true);
    const [hints, setHints] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const titrationInterval = useRef<NodeJS.Timeout | null>(null);

    // Check if titration mode should be active
    const hasBurette = placedEquipment.some((e) => e.equipmentId === "burette");
    const hasFlask = placedEquipment.some((e) => e.equipmentId === "flask");
    const titrationMode = hasBurette && hasFlask;

    // Add equipment to workbench
    const addEquipment = useCallback((data: { equipmentId: string; label: string }) => {
        const newEquipment: PlacedEquipment = {
            id: `placed-${Date.now()}`,
            equipmentId: data.equipmentId,
            label: data.label,
            x: 200 + Math.random() * 100,
            y: 150 + Math.random() * 100,
        };
        setPlacedEquipment((prev) => [...prev, newEquipment]);

        // Mark step 1 complete when both burette and flask are placed
        if (data.equipmentId === "burette" || data.equipmentId === "flask") {
            const hasOther = placedEquipment.some(
                (e) => e.equipmentId === (data.equipmentId === "burette" ? "flask" : "burette")
            );
            if (hasOther) {
                setCompletedSteps((prev) => (prev.includes(1) ? prev : [...prev, 1]));
            }
        }
    }, [placedEquipment]);

    // Select equipment
    const selectEquipment = useCallback((id: string | null) => {
        setSelectedEquipment(id);
    }, []);

    // Fill burette with NaOH
    const fillBurette = useCallback(() => {
        setState((prev) => ({ ...prev, buretteVolume: 50, hasBase: true }));
        setCompletedSteps((prev) => (prev.includes(2) ? prev : [...prev, 2]));
        setErrors([]);
    }, []);

    // Fill flask with HCl
    const fillFlask = useCallback(() => {
        setState((prev) => ({
            ...prev,
            flaskVolume: 25,
            flaskPH: 1, // Strong acid
            hasAcid: true,
        }));
        setCompletedSteps((prev) => (prev.includes(3) ? prev : [...prev, 3]));
        setErrors([]);
    }, []);

    // Add indicator
    const addIndicator = useCallback(() => {
        if (!state.hasAcid) {
            setErrors(["Add acid to the flask first before adding indicator"]);
            return;
        }
        setState((prev) => ({ ...prev, hasIndicator: true }));
        setCompletedSteps((prev) => (prev.includes(4) ? prev : [...prev, 4]));
        setErrors([]);
    }, [state.hasAcid]);

    // Open valve
    const openValve = useCallback(() => {
        if (!state.hasAcid) {
            setErrors(["Add acid to the flask first"]);
            return;
        }
        if (!state.hasBase) {
            setErrors(["Fill the burette with NaOH first"]);
            return;
        }
        if (!state.hasIndicator && practiceMode) {
            setHints(["Consider adding indicator to observe the color change"]);
        }
        setState((prev) => ({ ...prev, valveOpen: true }));
        setCompletedSteps((prev) => (prev.includes(5) ? prev : [...prev, 5]));
        setErrors([]);
    }, [state.hasAcid, state.hasBase, state.hasIndicator, practiceMode]);

    // Close valve
    const closeValve = useCallback(() => {
        setState((prev) => ({ ...prev, valveOpen: false }));
    }, []);

    // Set valve speed
    const setValveSpeed = useCallback((speed: number) => {
        setState((prev) => ({ ...prev, valveSpeed: speed }));
    }, []);

    // Titration simulation effect
    useEffect(() => {
        if (state.valveOpen && state.buretteVolume > 0 && !state.experimentComplete) {
            titrationInterval.current = setInterval(() => {
                setState((prev) => {
                    const dropVolume = 0.1 * prev.valveSpeed;
                    const newBuretteVolume = Math.max(0, prev.buretteVolume - dropVolume);
                    const newFlaskVolume = prev.flaskVolume + dropVolume;
                    const buretteUsed = prev.buretteUsed + dropVolume;

                    // Calculate pH based on titration progress
                    // Simplified: at equivalence point (25ml NaOH added), pH jumps to ~7
                    // Then it becomes basic
                    const molesHCl = 0.1 * 25; // 0.0025 mol
                    const molesNaOH = 0.1 * buretteUsed; // mol added
                    const excessMoles = molesNaOH - molesHCl;

                    let newPH: number;
                    if (excessMoles < -0.001) {
                        // Acidic - simplified calculation
                        newPH = 1 + (buretteUsed / 25) * 5;
                    } else if (excessMoles < 0.0005) {
                        // Near equivalence
                        newPH = 7 + excessMoles * 1000;
                    } else {
                        // Basic
                        newPH = Math.min(14, 7 + Math.log10(excessMoles * 1000 + 1) * 2);
                    }

                    // Check for overshoot
                    if (newPH > 10 && practiceMode) {
                        setHints(["You may have added too much base - the solution is very alkaline"]);
                    }

                    // Check for experiment completion
                    const isComplete = newPH >= 8.2;
                    const passed = newPH >= 8.2 && newPH <= 10;

                    if (isComplete && !prev.experimentComplete) {
                        setCompletedSteps((steps) => (steps.includes(6) ? steps : [...steps, 6, 7]));
                    }

                    return {
                        ...prev,
                        buretteVolume: newBuretteVolume,
                        flaskVolume: newFlaskVolume,
                        buretteUsed,
                        flaskPH: newPH,
                        experimentComplete: isComplete,
                        passed,
                    };
                });
            }, 100);
        } else if (titrationInterval.current) {
            clearInterval(titrationInterval.current);
            titrationInterval.current = null;
        }

        return () => {
            if (titrationInterval.current) {
                clearInterval(titrationInterval.current);
            }
        };
    }, [state.valveOpen, state.buretteVolume, state.experimentComplete, practiceMode]);

    // Generate hints in practice mode
    useEffect(() => {
        if (!practiceMode) {
            setHints([]);
            return;
        }

        const newHints: string[] = [];

        if (!titrationMode) {
            newHints.push("Place both burette and flask on the workbench to start");
        } else if (!state.hasBase) {
            newHints.push("Fill the burette with NaOH solution");
        } else if (!state.hasAcid) {
            newHints.push("Add HCl to the flask");
        } else if (!state.hasIndicator) {
            newHints.push("Add phenolphthalein indicator to observe color change");
        } else if (!state.valveOpen && !state.experimentComplete) {
            newHints.push("Open the valve to begin titration");
        }

        setHints(newHints);
    }, [titrationMode, state, practiceMode]);

    // Reset experiment
    const reset = useCallback(() => {
        setState(INITIAL_STATE);
        setPlacedEquipment([]);
        setSelectedEquipment(null);
        setHints([]);
        setErrors([]);
        setCompletedSteps([]);
    }, []);

    // Toggle practice/exam mode
    const toggleMode = useCallback(() => {
        setPracticeMode((prev) => !prev);
        reset();
    }, [reset]);

    return {
        state,
        placedEquipment,
        selectedEquipment,
        titrationMode,
        hints,
        errors,
        practiceMode,
        completedSteps,
        addEquipment,
        selectEquipment,
        fillBurette,
        fillFlask,
        addIndicator,
        openValve,
        closeValve,
        setValveSpeed,
        reset,
        toggleMode,
    };
}
