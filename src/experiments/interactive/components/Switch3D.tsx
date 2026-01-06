import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

type Props = {
    isOpen: boolean;
    onClick: () => void;
};

export default function Switch3D({ isOpen, onClick }: Props) {
    const leverRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (leverRef.current) {
            // Smoothly rotate the lever between open (off) and closed (on) states
            const targetRotation = isOpen ? -Math.PI / 4 : 0;
            leverRef.current.rotation.z += (targetRotation - leverRef.current.rotation.z) * 0.2;
        }
    });

    return (
        <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {/* Plastic Base */}
            <mesh position={[0, 0.1, 0]} castShadow>
                <boxGeometry args={[0.5, 0.2, 0.4]} />
                <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>

            {/* Brass Terminals */}
            <mesh position={[-0.2, 0.2, 0]} castShadow>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color="#b45309" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0.2, 0.2, 0]} castShadow>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color="#b45309" metalness={1} roughness={0.2} />
            </mesh>

            {/* Switch Lever (Knife switch style) */}
            <group ref={leverRef} position={[-0.2, 0.25, 0]}>
                <mesh position={[0.2, 0, 0]} castShadow>
                    <boxGeometry args={[0.45, 0.05, 0.05]} />
                    <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.2} />
                </mesh>
                {/* Insulated Handle (Red) */}
                <mesh position={[0.45, 0, 0]} castShadow>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial color="#ef4444" roughness={0.5} />
                </mesh>
            </group>

            <Text
                position={[0, -0.2, 0]}
                fontSize={0.12}
                color={isOpen ? "#ef4444" : "#10b981"}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {isOpen ? "OFF" : "ON"}
            </Text>
        </group>
    );
}
