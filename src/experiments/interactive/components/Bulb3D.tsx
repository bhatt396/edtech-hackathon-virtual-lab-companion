import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

type Props = {
    current: number; // amps
    isOn?: boolean;
};

export default function Bulb3D({ current, isOn = true }: Props) {
    const filamentRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.PointLight>(null);

    // Intensity depends on current AND the switch state
    const intensity = isOn ? Math.min(current / 1.5, 1.2) : 0;

    useFrame((state) => {
        if (filamentRef.current && isOn && current > 0) {
            // Tiny flicker effect for realism
            const flicker = 0.95 + Math.random() * 0.1;
            (filamentRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * 5 * flicker;
            if (glowRef.current) {
                glowRef.current.intensity = intensity * 2 * flicker;
            }
        } else if (filamentRef.current) {
            (filamentRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
            if (glowRef.current) glowRef.current.intensity = 0;
        }
    });

    return (
        <group>
            {/* Metallic Screw Base (E10 style) */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.3} />
            </mesh>

            {/* Thread detail */}
            {[0.05, 0.1, 0.15, 0.2, 0.25].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <torusGeometry args={[0.15, 0.01, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
                    <meshStandardMaterial color="#64748b" metalness={1} />
                </mesh>
            ))}

            {/* Glass Bulb Body */}
            <mesh position={[0, 0.6, 0]} castShadow>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    metalness={0.1}
                    roughness={0}
                    envMapIntensity={1}
                />
            </mesh>

            {/* Filament Support Wires */}
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
                <meshStandardMaterial color="#475569" />
            </mesh>

            {/* Filament (The part that glows) */}
            <mesh ref={filamentRef} position={[0, 0.6, 0]}>
                <torusGeometry args={[0.08, 0.005, 8, 16]} />
                <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#fbbf24"
                    emissiveIntensity={0}
                />
            </mesh>

            {/* Internal Glow Light */}
            <pointLight
                ref={glowRef}
                position={[0, 0.6, 0]}
                color="#fbbf24"
                intensity={0}
                distance={5}
                decay={2}
            />
        </group>
    );
}
