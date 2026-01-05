"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Battery, Zap } from 'lucide-react';

/**
 * Simple interactive Ohm's Law lab component.
 * Users can drag a battery and a resistor onto a "circuit board" and click
 * "Connect" to see the calculated current (I = V / R).
 * This is a lightweight demonstration – it does not aim to be a full physics
 * engine, but provides a clear visual of connecting components.
 */
export default function OhmsLawLabInteractive() {
    const [batteryVoltage, setBatteryVoltage] = useState(9); // volts
    const [resistance, setResistance] = useState(1000); // ohms
    const [connected, setConnected] = useState(false);

    const current = connected ? batteryVoltage / resistance : 0;

    return (
        <div className="p-4 bg-card rounded-xl shadow-lg">
            <h3 className="font-display text-lg mb-4">Ohm's Law Interactive Lab</h3>
            <div className="flex gap-8 items-center mb-6">
                {/* Battery */}
                <div className="flex flex-col items-center">
                    <Battery className="h-12 w-12 text-primary" />
                    <input
                        type="range"
                        min={1}
                        max={12}
                        value={batteryVoltage}
                        onChange={e => setBatteryVoltage(Number(e.target.value))}
                        className="w-24"
                    />
                    <span>{batteryVoltage} V</span>
                </div>
                {/* Arrow */}
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                {/* Resistor */}
                <div className="flex flex-col items-center">
                    <Zap className="h-12 w-12 text-secondary" />
                    <input
                        type="range"
                        min={100}
                        max={5000}
                        step={100}
                        value={resistance}
                        onChange={e => setResistance(Number(e.target.value))}
                        className="w-24"
                    />
                    <span>{resistance} Ω</span>
                </div>
            </div>
            <Button
                variant={connected ? 'secondary' : 'default'}
                onClick={() => setConnected(!connected)}
                className="mb-4"
            >
                {connected ? 'Disconnect' : 'Connect'}
            </Button>
            <div className="text-lg">
                {connected ? (
                    <Badge variant="outline" className="text-primary">
                        Current: {current.toFixed(2)} A
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">No circuit connected.</span>
                )}
            </div>
        </div>
    );
}
