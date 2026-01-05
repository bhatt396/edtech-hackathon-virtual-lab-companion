"use client";

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    RotateCcw,
    Droplet,
    Eye,
    Beaker
} from 'lucide-react';

// --- Types ---
interface SimulationState {
    volumeAdded: number; // mL
    isValveOpen: boolean;
    indicatorColor: string;
    ph: number;
    showLabels: boolean;
    isPlaying: boolean;
    speed: number;
}

// --- 3D Components ---

const LabStand = () => {
    return (
        <group position={[-2, 0, 0]}>
            {/* Base */}
            <mesh position={[0, 0.15, 0]} receiveShadow>
                <boxGeometry args={[4, 0.3, 2.5]} />
                <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.4} />
            </mesh>
            {/* Rod */}
            <mesh position={[1, 4, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 8, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Clamp */}
            <group position={[1, 5, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.09, 0.09, 2.2, 16]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>
                <mesh position={[-1.1, 0, 0]}>
                    <boxGeometry args={[0.3, 0.3, 0.4]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                {/* Claw */}
                <group position={[-1.5, 0, 0]} rotation={[0, 0, 0]}>
                    <mesh position={[0, 0, 0.15]} rotation={[0.5, 0, 0]}>
                        <boxGeometry args={[0.5, 0.1, 0.05]} />
                        <meshStandardMaterial color="#ef4444" /> {/* Rubber grip color */}
                    </mesh>
                    <mesh position={[0, 0, -0.15]} rotation={[-0.5, 0, 0]}>
                        <boxGeometry args={[0.5, 0.1, 0.05]} />
                        <meshStandardMaterial color="#ef4444" />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

const Burette = ({ fillLevel, isOpen, showLabels }: { fillLevel: number; isOpen: boolean; showLabels: boolean }) => {
    return (
        <group position={[-0.5, 4.5, 0]}>
            {showLabels && (
                <Html position={[0.5, 1, 0]} distanceFactor={8}>
                    <div className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-md shadow-lg border border-white/20">
                        Burette (Titrant)
                    </div>
                </Html>
            )}

            {/* Glass Tube */}
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 6, 32, 1, true]} />
                <meshPhysicalMaterial
                    transmission={0.95}
                    thickness={0.2}
                    roughness={0}
                    clearcoat={1}
                    color="#ffffff"
                    opacity={0.3}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Scale Markings (Text or Texture - simplified with rings for now) */}
            {[...Array(10)].map((_, i) => (
                <mesh key={i} position={[0, 2.5 - i * 0.5, 0]}>
                    <torusGeometry args={[0.151, 0.005, 16, 32]} />
                    <meshBasicMaterial color="#000000" opacity={0.3} transparent />
                </mesh>
            ))}

            {/* Liquid inside Burette */}
            {fillLevel > 0 && (
                <mesh position={[0, -3 + (3 * fillLevel), 0]}>
                    <cylinderGeometry args={[0.13, 0.13, 6 * fillLevel, 32]} />
                    <meshStandardMaterial color="#a5f3fc" transparent opacity={0.7} />
                </mesh>
            )}

            {/* Stopcock mechanism */}
            <group position={[0, -3.2, 0]}>
                {showLabels && (
                    <Html position={[0.5, 0, 0]} distanceFactor={8}>
                        <div className="bg-slate-700/90 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-md shadow-lg border border-white/20">
                            Stopcock
                        </div>
                    </Html>
                )}
                <mesh>
                    <cylinderGeometry args={[0.08, 0.05, 0.8, 16]} />
                    <meshPhysicalMaterial color="#e2e8f0" transmission={0.5} opacity={0.8} transparent />
                </mesh>

                {/* Valve Handle */}
                <group rotation={[0, 0, isOpen ? 0 : Math.PI / 2]}>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} rotation={[Math.PI / 2, 0, 0]} />
                        <meshStandardMaterial color={isOpen ? "#22c55e" : "#ef4444"} />
                    </mesh>
                    <mesh position={[0, 0.35, 0]}>
                        <boxGeometry args={[0.1, 0.4, 0.05]} />
                        <meshStandardMaterial color={isOpen ? "#22c55e" : "#ef4444"} />
                    </mesh>
                </group>

                {/* Tip */}
                <mesh position={[0, -0.6, 0]}>
                    <coneGeometry args={[0.05, 0.8, 16]} />
                    <meshPhysicalMaterial
                        transmission={0.95}
                        roughness={0}
                        color="#ffffff"
                        opacity={0.4}
                        transparent
                    />
                </mesh>
            </group>
        </group>
    );
};

const Flask = ({ color, liquidHeight, showLabels }: { color: string, liquidHeight: number, showLabels: boolean }) => {
    // Generate flask profile
    const points = useMemo(() => {
        const points = [];
        // Neck
        points.push(new THREE.Vector2(0.3, 2.5));
        points.push(new THREE.Vector2(0.3, 1.5));
        // Body (Cone-ish)
        points.push(new THREE.Vector2(1.2, 0.2));
        // Base rounded
        points.push(new THREE.Vector2(1.0, 0));
        points.push(new THREE.Vector2(0, 0));
        return points;
    }, []);

    return (
        <group position={[-0.5, 0, 0]}>
            {showLabels && (
                <Html position={[1.4, 1, 0]} distanceFactor={8}>
                    <div className="bg-purple-600/90 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-md shadow-lg border border-white/20">
                        Conical Flask (Analyte)
                    </div>
                </Html>
            )}

            {/* Flask Glass */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <latheGeometry args={[points, 32]} />
                <meshPhysicalMaterial
                    transmission={0.95}
                    roughness={0.05}
                    thickness={0.5}
                    clearcoat={1}
                    color="#ffffff"
                    opacity={0.3}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Liquid Content */}
            {/* Simplified liquid shape matching the bottom of the flask */}
            <mesh position={[0, liquidHeight * 0.8, 0]}>
                <cylinderGeometry args={[0.3 + (liquidHeight * 0.7), 1.0, liquidHeight * 1.5, 32]} />
                <meshPhysicalMaterial
                    color={color}
                    transparent
                    opacity={0.85}
                    transmission={0.2}
                    roughness={0.1}
                />
            </mesh>
            {/* Liquid Surface */}
            <mesh position={[0, liquidHeight * 1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.3 + (liquidHeight * 0.7), 32]} />
                <meshStandardMaterial color={color} transparent opacity={0.9} />
            </mesh>
        </group>
    );
};

const DropletSystem = ({ isOpen, color }: { isOpen: boolean, color: string }) => {
    const drops = useRef<{ pos: THREE.Vector3, speed: number, active: boolean }[]>([]);
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Init drops pool
    useMemo(() => {
        drops.current = Array.from({ length: 20 }, () => ({
            pos: new THREE.Vector3(0, -10, 0),
            speed: 0,
            active: false
        }));
    }, []);

    useFrame((_, delta) => {
        // Spawn drops
        if (isOpen && Math.random() > 0.8) {
            const inactiveDrop = drops.current.find(d => !d.active);
            if (inactiveDrop) {
                inactiveDrop.active = true;
                inactiveDrop.pos.set(-0.5, 0.7, 0); // Spout position
                inactiveDrop.speed = 2 + Math.random() * 2;
            }
        }

        // Update drops
        drops.current.forEach((drop, i) => {
            if (drop.active) {
                drop.pos.y -= drop.speed * delta;
                drop.speed += 9.8 * delta; // Gravity

                if (drop.pos.y < 0.5) { // Hit liquid
                    drop.active = false;
                    drop.pos.set(0, -10, 0);
                }
            }

            dummy.position.copy(drop.pos);
            dummy.scale.setScalar(drop.active ? 1 : 0);
            dummy.updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current!.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 20]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={color} />
        </instancedMesh>
    );
};

const TitrationScene = ({ state }: { state: SimulationState }) => {
    return (
        <group>
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <spotLight position={[-5, 5, 0]} intensity={0.5} angle={0.5} />
            <Environment preset="city" />

            <LabStand />
            <Burette
                fillLevel={Math.max(0, (50 - state.volumeAdded) / 50)}
                isOpen={state.isValveOpen}
                showLabels={state.showLabels}
            />
            <DropletSystem isOpen={state.isValveOpen} color="#a5f3fc" />
            <Flask
                color={state.indicatorColor}
                liquidHeight={0.2 + (state.volumeAdded / 150)}
                showLabels={state.showLabels}
            />

            <ContactShadows position={[0, 0.16, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
            <gridHelper args={[20, 20, 0x1e293b, 0x1e293b]} position={[0, 0, 0]} />
        </group>
    );
};

// --- Main Layout ---

export default function AcidBaseTitration3D() {
    const [state, setState] = useState<SimulationState>({
        volumeAdded: 0,
        isValveOpen: false,
        indicatorColor: '#ffffff', // Starting clear
        ph: 1.0, // Strong Acid start
        showLabels: true,
        isPlaying: false,
        speed: 1
    });

    // Physics Update Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state.isValveOpen) {
            interval = setInterval(() => {
                setState(prev => {
                    if (prev.volumeAdded >= 50) return { ...prev, isValveOpen: false };

                    const newVol = prev.volumeAdded + 0.1 * prev.speed;

                    // Simple Titration Curve Logic (Strong Acid - Strong Base)
                    // Vol Acid = 25mL, Conc = 0.1M -> 2.5mmol H+
                    // Base Conc = 0.1M. Equivalence at 25mL added.
                    const volAcid = 25;
                    const cAcid = 0.1;
                    const cBase = 0.1;
                    const totalVol = volAcid + newVol;

                    const molsH = volAcid * cAcid;
                    const molsOH = newVol * cBase;

                    let newPh = 7;
                    let newColor = '#ffffff';

                    if (molsH > molsOH) {
                        const excessH = (molsH - molsOH) / totalVol;
                        newPh = -Math.log10(excessH);
                    } else if (molsOH > molsH) {
                        const excessOH = (molsOH - molsH) / totalVol;
                        const pOH = -Math.log10(excessOH);
                        newPh = 14 - pOH;
                    } else {
                        newPh = 7;
                    }

                    // Indicator (Phenolphthalein)
                    // Range 8.2 - 10.0
                    if (newPh < 8.2) newColor = '#ffffff'; // Clear
                    else if (newPh >= 8.2 && newPh < 10) {
                        // Blend to pink
                        newColor = '#fbcfe8'; // Light pink
                    } else {
                        newColor = '#db2777'; // Deep Pink/Magenta
                    }

                    return {
                        ...prev,
                        volumeAdded: Math.min(50, newVol),
                        ph: Math.min(14, Math.max(0, newPh)),
                        indicatorColor: newColor
                    };
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [state.isValveOpen, state.speed]);

    const resetSimulation = () => {
        setState({
            volumeAdded: 0,
            isValveOpen: false,
            indicatorColor: '#ffffff',
            ph: 1.0,
            showLabels: true,
            isPlaying: false,
            speed: 1
        });
    };

    return (
        <div className="flex flex-col h-full w-full gap-4">
            {/* 3D Viewport */}
            <div className="flex-1 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl min-h-[500px]">
                {/* Overlay UI */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-lg border border-white/10 text-white max-w-xs">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Beaker className="h-5 w-5 text-blue-400" />
                            Acid-Base Titration
                        </h2>
                        <p className="text-xs text-slate-300 mt-1">
                            Observe the neutralization reaction between a strong acid (HCl) and a strong base (NaOH).
                        </p>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 text-white w-40">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Live Data</div>
                        <div className="flex justify-between items-center text-sm">
                            <span>pH:</span>
                            <span className="font-mono font-bold text-yellow-400">{state.ph.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                            <span>Vol:</span>
                            <span className="font-mono font-bold text-blue-400">{state.volumeAdded.toFixed(1)} mL</span>
                        </div>
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-10">
                    <Button
                        variant={state.showLabels ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setState(s => ({ ...s, showLabels: !s.showLabels }))}
                        className="bg-black/50 backdrop-blur hover:bg-black/70 text-white border border-white/10"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {state.showLabels ? 'Labels On' : 'Labels Off'}
                    </Button>
                </div>

                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[3, 4, 6]} fov={45} />
                    <TitrationScene state={state} />
                    <OrbitControls
                        target={[0, 2, 0]}
                        maxPolarAngle={Math.PI / 1.8}
                        minDistance={4}
                        maxDistance={12}
                        enablePan={false}
                    />
                </Canvas>
            </div>

            {/* Controls */}
            <Card className="p-4 bg-slate-900 border-slate-800 text-slate-200">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button
                            size="lg"
                            className={`w-36 font-semibold transition-all ${state.isValveOpen
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 shadow-lg'
                                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg'
                                }`}
                            onClick={() => setState(s => ({ ...s, isValveOpen: !s.isValveOpen }))}
                        >
                            <Droplet className={`mr-2 h-5 w-5 ${state.isValveOpen ? 'animate-bounce' : ''}`} />
                            {state.isValveOpen ? 'Stop' : 'Titrate'}
                        </Button>
                        <Button variant="outline" size="icon" onClick={resetSimulation} title="Reset">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 w-full max-w-sm px-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>Titration Speed</span>
                            <span>{state.speed.toFixed(1)}x</span>
                        </div>
                        <Slider
                            value={[state.speed]}
                            min={0.1}
                            max={5}
                            step={0.1}
                            onValueChange={([val]) => setState(s => ({ ...s, speed: val }))}
                            className="w-full"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-slate-400 border-slate-700">
                            Volume: 50mL
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-700">
                            0.1M NaOH
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-700">
                            0.1M HCl
                        </Badge>
                    </div>
                </div>
            </Card>
        </div>
    );
}
