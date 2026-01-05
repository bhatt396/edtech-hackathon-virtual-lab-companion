"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef } from 'react';
import { MeshStandardMaterial } from 'three';

/**
 * Simple Solar System 3‑D visualization.
 * - Sun at the center (emissive material).
 * - Earth, Mars, Jupiter orbiting with different radii & speeds.
 * - Ambient + directional light for realistic shading.
 * - OrbitControls for user interaction.
 */
export default function SolarSystem3D() {
    const earthRef = useRef<any>(null);
    const marsRef = useRef<any>(null);
    const jupiterRef = useRef<any>(null);

    // Simple animation loop for orbital motion
    const animate = (t: number) => {
        if (earthRef.current) earthRef.current.rotation.y = t * 0.5;
        if (marsRef.current) marsRef.current.rotation.y = t * 0.4;
        if (jupiterRef.current) jupiterRef.current.rotation.y = t * 0.3;
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

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

            {/* Earth */}
            <group ref={earthRef} position={[4, 0, 0]}>
                <mesh castShadow receiveShadow>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#2e7d32" metalness={0.1} roughness={0.8} />
                </mesh>
            </group>

            {/* Mars */}
            <group ref={marsRef} position={[6, 0, 0]}>
                <mesh castShadow receiveShadow>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshStandardMaterial color="#b71c1c" metalness={0.1} roughness={0.8} />
                </mesh>
            </group>

            {/* Jupiter */}
            <group ref={jupiterRef} position={[9, 0, 0]}>
                <mesh castShadow receiveShadow>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#6d4c41" metalness={0.1} roughness={0.8} />
                </mesh>
            </group>

            {/* Star field background */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

            {/* Controls */}
            <OrbitControls enablePan={false} enableZoom={true} />
        </Canvas>
    );
}
