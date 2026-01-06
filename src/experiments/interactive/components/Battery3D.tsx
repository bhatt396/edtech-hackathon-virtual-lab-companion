import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

type Props = {
    voltage: number;
};

export default function Battery3D({ voltage }: Props) {
    const ref = useRef<THREE.Group>(null);

    return (
        <group ref={ref}>
            {/* Main Battery Body (9V Style) */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.5, 0.8, 0.3]} />
                <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
            </mesh>

            {/* Battery Top Plate */}
            <mesh position={[0, 0.8, 0]} castShadow>
                <boxGeometry args={[0.5, 0.05, 0.3]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>

            {/* Label/Wrapper */}
            <mesh position={[0, 0.4, 0.155]}>
                <planeGeometry args={[0.4, 0.6]} />
                <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.2} />
            </mesh>

            {/* Negative Terminal (Hexagonal top) */}
            <mesh position={[-0.12, 0.85, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.1, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} />
            </mesh>

            {/* Positive Terminal (Circular top) */}
            <mesh position={[0.12, 0.85, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} />
            </mesh>

            {/* Terminal Indicators */}
            <Text position={[-0.12, 0.92, 0]} fontSize={0.1} color="#ef4444" rotation={[-Math.PI / 2, 0, 0]}>-</Text>
            <Text position={[0.12, 0.92, 0]} fontSize={0.1} color="#10b981" rotation={[-Math.PI / 2, 0, 0]}>+</Text>

            <Text
                position={[0, 0.4, 0.17]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {`${voltage}V`}
            </Text>

            <Text
                position={[0, 0.2, 0.17]}
                fontSize={0.06}
                color="#93c5fd"
                anchorX="center"
                anchorY="middle"
            >
                Heavy Duty
            </Text>
        </group>
    );
}
