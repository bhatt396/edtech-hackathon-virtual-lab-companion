import * as THREE from 'three';
import { useMemo } from 'react';
import { Text } from '@react-three/drei';

type Props = {
    resistance: number;
};

export default function Resistor3D({ resistance }: Props) {
    const bandColors = useMemo(() => {
        // Simple logic for bands based on resistance value
        // Real color coding usually involves 4-5 bands, we'll simulate 4
        if (resistance < 50) return ['#ef4444', '#f97316', '#eab308', '#854d0e'];
        if (resistance < 200) return ['#f97316', '#eab308', '#22c55e', '#854d0e'];
        return ['#eab308', '#22c55e', '#3b82f6', '#854d0e'];
    }, [resistance]);

    return (
        <group>
            {/* Metallic Leads (Wires) */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 1.2, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.3} />
            </mesh>

            {/* Ceramic Resistor Body (Beige/Tan color common for carbon film) */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
                <meshStandardMaterial color="#fef3c7" roughness={0.8} />
            </mesh>

            {/* Body Ends (Slightly tapered) */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[0.25, 0.3, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#fef3c7" roughness={0.8} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.25, 0.3, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#fef3c7" roughness={0.8} />
            </mesh>

            {/* Color Bands */}
            {bandColors.map((c, i) => (
                <mesh key={i} rotation={[0, 0, Math.PI / 2]} position={[-0.15 + i * 0.1, 0.3, 0.01]}>
                    <cylinderGeometry args={[0.105, 0.105, 0.05, 16]} />
                    <meshStandardMaterial color={c} metalness={0.2} roughness={0.5} />
                </mesh>
            ))}

            <Text
                position={[0, -0.1, 0]}
                fontSize={0.15}
                color="#0ea5e9"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {`${resistance}Ω`}
            </Text>
        </group>
    );
}
