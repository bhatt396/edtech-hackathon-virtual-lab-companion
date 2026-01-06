import * as THREE from 'three';
import { useMemo } from 'react';

type Props = {
    from: [number, number, number];
    to: [number, number, number];
    current: number; // amps
};

export default function Wire3D({ from, to, current }: Props) {
    // Create a curved path to look like a hanging wire
    const curve = useMemo(() => {
        const start = new THREE.Vector3(...from);
        const end = new THREE.Vector3(...to);
        const middle = new THREE.Vector3().lerpVectors(start, end, 0.5);
        // Add a slight dip for gravity effect
        middle.y -= 0.5;
        middle.x += (Math.random() - 0.5) * 0.2;

        return new THREE.CatmullRomCurve3([
            start,
            new THREE.Vector3(start.x, start.y - 0.2, start.z), // curve down from terminal
            middle,
            new THREE.Vector3(end.x, end.y - 0.2, end.z), // curve up to terminal
            end
        ]);
    }, [from, to]);

    // Color based on current and wire type (standard color coding)
    const baseColor = current > 0 ? (current < 0.5 ? '#10b981' : current < 1.5 ? '#f59e0b' : '#ef4444') : '#475569';

    return (
        <group>
            {/* Wire Insulation */}
            <mesh>
                <tubeGeometry args={[curve, 32, 0.03, 8, false]} />
                <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.2} />
            </mesh>

            {/* Wire Tips (Metallic connecters) */}
            <mesh position={from}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} />
            </mesh>
            <mesh position={to}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} />
            </mesh>

            {/* Pulsing light effect when current flows */}
            {current > 0 && (
                <mesh>
                    <tubeGeometry args={[curve, 32, 0.035, 8, false]} />
                    <meshStandardMaterial
                        color={baseColor}
                        transparent
                        opacity={0.3}
                        emissive={baseColor}
                        emissiveIntensity={0.5 + Math.sin(Date.now() * 0.01) * 0.2}
                    />
                </mesh>
            )}
        </group>
    );
}
