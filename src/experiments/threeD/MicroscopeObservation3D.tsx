"use client";

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Eye } from 'lucide-react';

const PlantCell = ({ scale, showLabels }: { scale: number; showLabels: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Cell Wall (outer cube) */}
            <mesh>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial
                    color="#86efac"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(2, 2, 2)]} />
                <lineBasicMaterial color="#22543d" linewidth={2} />
            </lineSegments>

            {/* Cell Membrane (slightly smaller cube) */}
            <mesh>
                <boxGeometry args={[1.9, 1.9, 1.9]} />
                <meshStandardMaterial
                    color="#d1fae5"
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Nucleus */}
            <mesh position={[0.2, 0.1, 0]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color="#7c3aed" roughness={0.3} />
                {showLabels && (
                    <Html distanceFactor={10}>
                        <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                            Nucleus
                        </div>
                    </Html>
                )}
            </mesh>

            {/* Nucleolus */}
            <mesh position={[0.25, 0.15, 0.1]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#5b21b6" />
            </mesh>

            {/* Chloroplasts */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 0.6;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = (Math.random() - 0.5) * 0.4;

                return (
                    <mesh key={i} position={[x, y, z]} rotation={[Math.random(), Math.random(), Math.random()]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshStandardMaterial color="#22c55e" roughness={0.4} />
                        {showLabels && i === 0 && (
                            <Html distanceFactor={10}>
                                <div className="bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                    Chloroplast
                                </div>
                            </Html>
                        )}
                    </mesh>
                );
            })}

            {/* Central Vacuole */}
            <mesh position={[0, -0.3, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    color="#fbbf24"
                    transparent
                    opacity={0.4}
                    roughness={0.2}
                />
                {showLabels && (
                    <Html distanceFactor={10}>
                        <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                            Vacuole
                        </div>
                    </Html>
                )}
            </mesh>

            {/* Mitochondria */}
            {[...Array(4)].map((_, i) => {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                const radius = 0.5;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (
                    <mesh key={`mito-${i}`} position={[x, 0.3, z]} rotation={[0, angle, Math.PI / 2]}>
                        <capsuleGeometry args={[0.08, 0.25, 8, 16]} />
                        <meshStandardMaterial color="#f97316" roughness={0.5} />
                    </mesh>
                );
            })}

            {showLabels && (
                <Html position={[0, -1.2, 0]} center>
                    <div className="bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                        Plant Cell
                    </div>
                </Html>
            )}
        </group>
    );
};

const AnimalCell = ({ scale, showLabels }: { scale: number; showLabels: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Cell Membrane (irregular sphere) */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial
                    color="#fecaca"
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                    roughness={0.5}
                />
            </mesh>

            {/* Nucleus (larger and more prominent) */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="#6366f1" roughness={0.3} />
                {showLabels && (
                    <Html distanceFactor={10}>
                        <div className="bg-indigo-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                            Nucleus
                        </div>
                    </Html>
                )}
            </mesh>

            {/* Nucleolus */}
            <mesh position={[0.1, 0.1, 0.1]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#3730a3" />
            </mesh>

            {/* Mitochondria (more prominent) */}
            {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 0.8;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = (Math.random() - 0.5) * 0.6;

                return (
                    <mesh key={i} position={[x, y, z]} rotation={[Math.random(), angle, Math.PI / 2]}>
                        <capsuleGeometry args={[0.12, 0.35, 8, 16]} />
                        <meshStandardMaterial color="#fb923c" roughness={0.4} />
                        {showLabels && i === 0 && (
                            <Html distanceFactor={10}>
                                <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                    Mitochondria
                                </div>
                            </Html>
                        )}
                    </mesh>
                );
            })}

            {/* Ribosomes (tiny dots on ER) */}
            {[...Array(20)].map((_, i) => {
                const phi = Math.acos(2 * Math.random() - 1);
                const theta = 2 * Math.PI * Math.random();
                const radius = 1.2;
                const x = radius * Math.sin(phi) * Math.cos(theta);
                const y = radius * Math.sin(phi) * Math.sin(theta);
                const z = radius * Math.cos(phi);

                return (
                    <mesh key={`ribo-${i}`} position={[x, y, z]}>
                        <sphereGeometry args={[0.04, 8, 8]} />
                        <meshStandardMaterial color="#94a3b8" />
                    </mesh>
                );
            })}

            {/* Lysosomes */}
            {[...Array(5)].map((_, i) => {
                const angle = (i / 5) * Math.PI * 2;
                const radius = 0.9;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(angle * 2) * 0.3;

                return (
                    <mesh key={`lyso-${i}`} position={[x, y, z]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshStandardMaterial color="#a855f7" roughness={0.3} />
                    </mesh>
                );
            })}

            {showLabels && (
                <Html position={[0, -1.8, 0]} center>
                    <div className="bg-red-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                        Animal Cell
                    </div>
                </Html>
            )}
        </group>
    );
};

const CellScene = ({ cellType, scale, showLabels }: { cellType: 'plant' | 'animal'; scale: number; showLabels: boolean }) => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Environment preset="city" />

            {cellType === 'plant' ? (
                <PlantCell scale={scale} showLabels={showLabels} />
            ) : (
                <AnimalCell scale={scale} showLabels={showLabels} />
            )}

            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={2}
                maxDistance={10}
            />
        </>
    );
};

export default function MicroscopeObservation3D() {
    const [state, setState] = useState({
        cellType: 'plant' as 'plant' | 'animal',
        zoom: 1.5,
        showLabels: true,
    });

    const reset = () => {
        setState({
            cellType: 'plant',
            zoom: 1.5,
            showLabels: true,
        });
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-border shadow-2xl min-h-[500px]">
                <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
                    <CellScene
                        cellType={state.cellType}
                        scale={state.zoom}
                        showLabels={state.showLabels}
                    />
                </Canvas>

                {/* Info overlay */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-2 rounded-lg border border-white/20">
                    <div className="text-white text-sm space-y-1">
                        <p className="font-semibold">
                            {state.cellType === 'plant' ? 'Plant Cell (Onion)' : 'Animal Cell (Cheek)'}
                        </p>
                        <p className="text-xs text-gray-300">
                            Use mouse to rotate and zoom
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-4 p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-4 flex-wrap">
                    <Button
                        onClick={() => setState(prev => ({
                            ...prev,
                            cellType: prev.cellType === 'plant' ? 'animal' : 'plant'
                        }))}
                        variant="default"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {state.cellType === 'plant' ? 'Switch to Animal Cell' : 'Switch to Plant Cell'}
                    </Button>
                    <Button
                        onClick={() => setState(prev => ({ ...prev, showLabels: !prev.showLabels }))}
                        variant={state.showLabels ? "secondary" : "outline"}
                    >
                        {state.showLabels ? 'Hide Labels' : 'Show Labels'}
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex justify-between">
                        <span>Zoom Level</span>
                        <span className="font-mono text-primary">{state.zoom.toFixed(1)}x</span>
                    </label>
                    <Slider
                        value={[state.zoom]}
                        min={0.8}
                        max={2.5}
                        step={0.1}
                        onValueChange={([val]) => setState(prev => ({ ...prev, zoom: val }))}
                    />
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">
                        Key Differences: {state.cellType === 'plant' ? 'Plant Cell' : 'Animal Cell'}
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        {state.cellType === 'plant' ? (
                            <>
                                <li>✓ Rigid cell wall (green cube)</li>
                                <li>✓ Chloroplasts for photosynthesis (green spheres)</li>
                                <li>✓ Large central vacuole (yellow sphere)</li>
                                <li>✓ Regular rectangular shape</li>
                            </>
                        ) : (
                            <>
                                <li>✓ No cell wall, only cell membrane</li>
                                <li>✓ No chloroplasts</li>
                                <li>✓ Smaller vacuoles</li>
                                <li>✓ Irregular, rounded shape</li>
                                <li>✓ More mitochondria visible</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
