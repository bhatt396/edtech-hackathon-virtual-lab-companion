import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Play, Pause } from 'lucide-react';

const PendulumScene = ({ state, setState }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    const lineRef = useRef<THREE.Line>(null);

    // Physics Loop for 3D
    useFrame((_, delta) => {
        if (state.isRunning) {
            // Very simplified Euler integration for visual purposes
            // In a real app, you might want to sync this with the 2D state or use a shared physics engine
            const dt = Math.min(delta, 0.1);
            setState((prev: any) => {
                const angleRad = prev.angle * Math.PI / 180;
                const angularAccel = -(prev.gravity / prev.length) * Math.sin(angleRad);

                let newVelocity = prev.velocity + angularAccel * dt;
                newVelocity *= prev.damping;

                let newAngle = prev.angle + (newVelocity * dt * 180 / Math.PI);

                return {
                    ...prev,
                    angle: newAngle,
                    velocity: newVelocity
                };
            });
        }
    });

    const bobPosition = useMemo(() => {
        const angleRad = state.angle * Math.PI / 180;
        const x = Math.sin(angleRad) * state.length * 3; // Scale up for visual
        const y = -Math.cos(angleRad) * state.length * 3;
        return new THREE.Vector3(x, y, 0);
    }, [state.angle, state.length]);

    // Update Line geometry to match bob position
    useEffect(() => {
        if (lineRef.current) {
            const points = [new THREE.Vector3(0, 0, 0), bobPosition];
            lineRef.current.geometry.setFromPoints(points);
        }
    }, [bobPosition]);


    return (
        <group position={[0, 4, 0]}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Environment preset="studio" />

            {/* Ceiling / Support */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[4, 0.4, 2]} />
                <meshStandardMaterial color="#334155" />
            </mesh>

            {/* String */}
            <line ref={lineRef as any}>
                <bufferGeometry />
                <lineBasicMaterial color="black" linewidth={2} />
            </line>

            {/* Bob */}
            <mesh position={bobPosition} castShadow receiveShadow>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                    color="#ef4444"
                    roughness={0.1}
                    metalness={0.5}
                />
            </mesh>

            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={10} blur={2} far={10} />
            <OrbitControls target={[0, -2, 0]} minDistance={5} maxDistance={20} />
        </group>
    );
};

export default function SimplePendulum3D() {
    const [state, setState] = useState({
        length: 1.0,
        gravity: 9.8,
        angle: 45,
        velocity: 0,
        isRunning: false,
        damping: 0.995,
    });

    const reset = () => {
        setState(prev => ({ ...prev, angle: 45, velocity: 0, isRunning: false }));
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-border shadow-2xl min-h-[500px]">
                <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
                    <PendulumScene state={state} setState={setState} />
                </Canvas>
            </div>

            <div className="mt-4 space-y-4 p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                        variant={state.isRunning ? "secondary" : "default"}
                    >
                        {state.isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {state.isRunning ? "Pause" : "Start"}
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>Length (L)</span>
                            <span className="font-mono text-primary">{state.length.toFixed(1)}m</span>
                        </label>
                        <Slider
                            value={[state.length]}
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            onValueChange={([val]) => setState(prev => ({ ...prev, length: val }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between">
                            <span>Gravity (g)</span>
                            <span className="font-mono text-primary">{state.gravity.toFixed(1)}m/s²</span>
                        </label>
                        <Slider
                            value={[state.gravity]}
                            min={1.6}
                            max={20.0}
                            step={0.1}
                            onValueChange={([val]) => setState(prev => ({ ...prev, gravity: val }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
