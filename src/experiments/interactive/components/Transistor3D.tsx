import * as THREE from 'three';
import { Text } from '@react-three/drei';

type Props = {
    resistance: number;
};

export default function Transistor3D({ resistance }: Props) {
    return (
        <group>
            {/* 3 Metallic Leads */}
            <mesh position={[-0.1, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} />
            </mesh>
            <mesh position={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} />
            </mesh>

            {/* TO-92 Body (Semi-cylindrical black plastic) */}
            <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 0.3, 32, 1, false, Math.PI, Math.PI]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.35, 0]} castShadow>
                <boxGeometry args={[0.3, 0.3, 0.01]} />
                <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>

            <Text
                position={[0, 0.6, 0]}
                fontSize={0.08}
                color="#64748b"
                anchorX="center"
                anchorY="middle"
            >
                BC547
            </Text>
        </group>
    );
}
