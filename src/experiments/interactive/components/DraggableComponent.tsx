import { useRef, useState, useCallback, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
    nodeId: string;
    position: [number, number, number];
    onDrag: (id: string, newPos: [number, number, number]) => void;
    children: React.ReactNode;
    isSelected: boolean;
    onClick?: () => void;
};

export default function DraggableComponent({
    nodeId,
    position,
    onDrag,
    children,
    isSelected,
    onClick,
}: Props) {
    const ref = useRef<THREE.Group>(null);
    const { raycaster, camera } = useThree();
    const dragPlane = useMemo(
        () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
        []
    );
    const offset = useRef<THREE.Vector3>(new THREE.Vector3());
    const [dragging, setDragging] = useState(false);

    const onPointerDown = useCallback(
        (e: any) => {
            e.stopPropagation();
            setDragging(true);
            const intersect = new THREE.Vector3();
            raycaster.setFromCamera(e, camera);
            raycaster.ray.intersectPlane(dragPlane, intersect);
            if (ref.current) {
                const worldPos = new THREE.Vector3();
                ref.current.getWorldPosition(worldPos);
                offset.current.subVectors(intersect, worldPos);
            }
        },
        [raycaster, camera, dragPlane]
    );

    const onPointerMove = useCallback(
        (e: any) => {
            if (!dragging || !ref.current) return;
            e.stopPropagation();
            const intersect = new THREE.Vector3();
            raycaster.setFromCamera(e, camera);
            raycaster.ray.intersectPlane(dragPlane, intersect);
            intersect.sub(offset.current);
            const newPos: [number, number, number] = [
                Math.max(-5, Math.min(5, intersect.x)),
                0,
                Math.max(-5, Math.min(5, intersect.z)),
            ];
            ref.current.position.set(...newPos);
            onDrag(nodeId, newPos);
        },
        [dragging, raycaster, camera, dragPlane, onDrag, nodeId]
    );

    const onPointerUp = useCallback(() => setDragging(false), []);

    return (
        <group
            ref={ref}
            position={position}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onClick={onClick}
        >
            {isSelected && (
                <mesh position={[0, 0.2, 0]}>
                    <torusGeometry args={[0.4, 0.02, 8, 32]} />
                    <meshBasicMaterial color="#0ea5e9" />
                </mesh>
            )}
            {children}
        </group>
    );
}
