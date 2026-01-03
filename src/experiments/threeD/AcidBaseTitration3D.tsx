import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, Droplet } from 'lucide-react';

// Lab Equipment Components

const Burette = ({ fillLevel, isOpen }: { fillLevel: number; isOpen: boolean }) => {
    return (
        <group position={[0, 4, 0]}>
            {/* Glass Tube */}
            <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 8, 32]} />
                <meshPhysicalMaterial
                    transmission={0.95}
                    roughness={0}
                    thickness={0.5}
                    clearcoat={1}
                    color="#ffffff"
                    opacity={0.3}
                    transparent
                />
            </mesh>

            {/* Liquid inside Burette */}
            <mesh position={[0, 2 - (1 - fillLevel) * 4, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 8 * fillLevel, 32]} />
                <meshStandardMaterial color="#a5f3fc" transparent opacity={0.6} />
            </mesh>

            {/* Stopcock */}
            <group position={[0, -2.2, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
                    <meshStandardMaterial color={isOpen ? "#22c55e" : "#ef4444"} />
                </mesh>
                <mesh position={[0, -0.5, 0]}>
                    <coneGeometry args={[0.1, 1, 16]} />
                    <meshPhysicalMaterial
                        transmission={0.9}
                        opacity={0.5}
                        transparent
                        color="#ffffff"
                    />
                </mesh>
            </group>
        </group>
    );
};

const Flask = ({ color, liquidHeight = 0.5 }: { color: string, liquidHeight?: number }) => {
    return (
        <group position={[0, 0, 0]}>
            {/* Flask Body */}
            <mesh position={[0, 0.8, 0]}>
                {/* Simplified Erlenmeyer shape using a cone mostly */}
                <cylinderGeometry args={[0.3, 1.2, 2.5, 32, 1, true]} />
                <meshPhysicalMaterial
                    transmission={0.9}
                    roughness={0.1}
                    thickness={2}
                    clearcoat={1}
                    color="#ffffff"
                    opacity={0.4}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh position={[0, 2.3, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 1.5, 32, 1, true]} />
                <meshPhysicalMaterial
                    transmission={0.9}
                    roughness={0.1}
                    thickness={2}
                    clearcoat={1}
                    color="#ffffff"
                    opacity={0.4}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Liquid inside Flask */}
            <mesh position={[0, 0.1 + (liquidHeight * 1), 0]}>
                {/* Using a cylinder for simplicity, ideally would match flask shape */}
                <cylinderGeometry args={[0.4, 1.1, 2 * liquidHeight, 32]} />
                <meshStandardMaterial color={color} transparent opacity={0.8} />
            </mesh>
        </group>
    );
};

const DropletParticle = ({ position, remove }: { position: [number, number, number], remove: () => void }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.y -= delta * 5;
            if (ref.current.position.y < 2) { // Hits Liquid
                remove();
            }
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#a5f3fc" />
        </mesh>
    )
}

const TitrationScene = ({ state, setState }: any) => {
    const [drops, setDrops] = useState<{ id: number, pos: [number, number, number] }[]>([]);

    useFrame((_, delta) => {
        if (state.isValveOpen) {
            if (Math.random() < 0.2) { // Random drop generation rate based on frame
                setDrops(prev => [...prev, { id: Math.random(), pos: [0, 1.8, 0] }]);
            }
        }
    });

    const removeDrop = (id: number) => {
        setDrops(prev => prev.filter(d => d.id !== id));
    };

    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Environment preset="city" />

            {/* Stand */}
            <mesh position={[-2, 3, 0]}>
                <boxGeometry args={[0.2, 8, 0.2]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[-2, -0.1, 0]}>
                <boxGeometry args={[4, 0.2, 3]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-1, 5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 2.2, 16]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>

            <Burette
                fillLevel={(50 - state.volumeAdded) / 50}
                isOpen={state.isValveOpen}
            />

            {/* Drops */}
            {drops.map(drop => (
                <DropletParticle key={drop.id} position={drop.pos as any} remove={() => removeDrop(drop.id)} />
            ))}

            <Flask
                color={state.indicatorColor}
                liquidHeight={0.3 + (state.volumeAdded / 100)} // Height increases slightly
            />

            <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            <OrbitControls target={[0, 2, 0]} maxPolarAngle={Math.PI / 2} minDistance={3} maxDistance={15} />

            <Html position={[2, 4, 0]}>
                <div className="bg-slate-900/80 text-white p-2 rounded backdrop-blur-sm whitespace-nowrap text-xs border border-white/10">
                    <p>Volume: {state.volumeAdded.toFixed(1)} mL</p>
                    <p>pH: {state.ph.toFixed(2)}</p>
                </div>
            </Html>
        </group>
    );
};

export default function AcidBaseTitration3D() {
    const [state, setState] = useState({
        volumeAdded: 0,
        isValveOpen: false,
        indicatorColor: '#ffffff', // Hex for Three.js
        ph: 1.0
    });

    // Reusing logic from 2D roughly
    const updatePhysics = () => {
        const molsAcid = 2.5; // Fixed for demo
        const molsBase = state.volumeAdded * 0.1;
        const vol = 25 + state.volumeAdded;
        let ph = 7;

        if (molsBase < molsAcid) {
            ph = -Math.log10((molsAcid - molsBase) / vol) + 2; // Offset for demo visual
        } else if (molsBase > molsAcid) {
            ph = 14 + Math.log10((molsBase - molsAcid) / vol) - 2;
        }

        // Color check
        let color = '#ffffff'; // Clear-ish
        if (ph >= 8.2) {
            // Simple Pink
            color = '#ff69b4';
        }

        return { ph, color };
    };

    useEffect(() => {
        if (state.isValveOpen && state.volumeAdded < 50) {
            const interval = setInterval(() => {
                setState(prev => {
                    if (prev.volumeAdded >= 50) return { ...prev, isValveOpen: false };

                    const { ph, color } = updatePhysics();

                    return {
                        ...prev,
                        volumeAdded: prev.volumeAdded + 0.1,
                        ph: Math.min(14, ph + (prev.volumeAdded * 0.05)), // Pseudo-sim for smoothness
                        indicatorColor: (prev.volumeAdded > 24) ? '#ff1493' : '#ffffff' // Hardcoded endpoint for 3D visual simplicity
                    };
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [state.isValveOpen]);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-border shadow-2xl min-h-[500px]">
                <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
                    <TitrationScene state={state} setState={setState} />
                </Canvas>
            </div>

            <div className="mt-4 p-4 bg-card rounded-xl border border-border flex justify-between items-center">
                <Button
                    onClick={() => setState(prev => ({ ...prev, isValveOpen: !prev.isValveOpen }))}
                    variant={state.isValveOpen ? "destructive" : "default"}
                    className="w-32 gap-2"
                >
                    <Droplet className="h-4 w-4" />
                    {state.isValveOpen ? "Stop" : "Titrate"}
                </Button>

                <Button
                    variant="outline"
                    onClick={() => setState({ volumeAdded: 0, isValveOpen: false, indicatorColor: '#ffffff', ph: 1.0 })}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </div>
        </div>
    );
}
