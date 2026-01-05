"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { MeshStandardMaterial } from 'three';

/**
 * Animated Solar System – a lightweight animated view using Three.js.
 * This component is used when the user selects the "animated" mode for the
 * Solar System experiment. It re‑uses the same geometry as the 3D view but
 * adds a subtle rotation animation to the whole scene, giving a continuous
 * orbital motion without user interaction.
 */
export default function SolarSystemAnimated() {
    const groupRef = useRef<any>(null);

    // Simple rotation animation using requestAnimationFrame
    useEffect(() => {
        let frameId: number;
        const animate = (time: number) => {
            if (groupRef.current) {
                groupRef.current.rotation.y = time * 0.00005; // slow spin
            }
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, []);

    return (
        <Canvas shadows camera={{ position: [0, 5, 12], fov: 45 }}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight castShadow position={[5, 10, 5]} intensity={1.2} />

            {/* Sun */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial emissive="#ffdd00" emissiveIntensity={1.5} color="#ffb74d" />
            </mesh>

            {/* Planets – static positions for demo */}
            <group ref={groupRef}>
                <mesh position={[4, 0, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#2e7d32" metalness={0.1} roughness={0.8} />
                </mesh>
                <mesh position={[6, 0, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshStandardMaterial color="#b71c1c" metalness={0.1} roughness={0.8} />
                </mesh>
                <mesh position={[9, 0, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#6d4c41" metalness={0.1} roughness={0.8} />
                </mesh>
            </group>

            {/* Star field background */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

            {/* Controls – disabled for animated view */}
            <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
    );
}
