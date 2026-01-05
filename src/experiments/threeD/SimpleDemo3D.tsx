"use client";

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Play, Pause } from 'lucide-react';

// Types
interface Component {
  id: string;
  type: 'battery' | 'resistor' | 'capacitor' | 'led' | 'multimeter';
  position: [number, number, number];
  rotation: number;
  isDragging: boolean;
  properties: {
    voltage?: number;
    resistance?: number;
    capacitance?: number;
    current?: number;
  };
}

interface Wire {
  id: string;
  from: string;
  to: string;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  isActive: boolean;
}

// Hyper-realistic Breadboard
function Breadboard3D() {
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#f1f5f9',
  }), []);
  
  const holeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#cbd5e1',
  }), []);
  
  return (
    <group>
      {/* Main breadboard base - matte plastic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[10, 6, 0.2]} />
        <primitive object={material} />
      </mesh>
      
      {/* Precise metallic contact holes grid */}
      {Array.from({ length: 20 }, (_, i) => (
        Array.from({ length: 30 }, (_, j) => (
          <mesh
            key={`hole-${i}-${j}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-4.5 + j * 0.3, 0.11, -3 + i * 0.3]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
            <primitive object={holeMaterial} />
          </mesh>
        ))
      ))}
      
      {/* Power rails - red and blue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.12, 0]}>
        <boxGeometry args={[0.15, 6, 0.08]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.2, 0.12, 0]}>
        <boxGeometry args={[0.15, 6, 0.08]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      
      {/* Labels */}
      <Text
        position={[-5.2, 0.15, 0]}
        fontSize={0.15}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
      >
        +
      </Text>
      <Text
        position={[5.2, 0.15, 0]}
        fontSize={0.15}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
      >
        -
      </Text>
    </group>
  );
}

// 9V Battery - Hyper-realistic
function Battery9V({ position, voltage, isSelected, onClick }: {
  position: [number, number, number];
  voltage: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const batteryRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={batteryRef} position={position} onClick={onClick}>
      {/* Battery body - matte plastic */}
      <mesh>
        <boxGeometry args={[0.5, 0.7, 0.25]} />
        <meshBasicMaterial 
          color={isSelected ? '#0ea5e9' : '#1e293b'}
        />
      </mesh>
      
      {/* Battery label */}
      <mesh position={[0, 0, 0.13]}>
        <planeGeometry args={[0.4, 0.6]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>
      
      {/* Positive terminal */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshBasicMaterial 
          color="#ef4444"
        />
      </mesh>
      
      {/* Negative terminal */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshBasicMaterial 
          color="#3b82f6"
        />
      </mesh>
      
      {/* Voltage label */}
      <Text
        position={[0, 0, 0.14]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {voltage}V
      </Text>
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Resistor - Realistic with color bands
function Resistor3D({ position, resistance, isSelected, onClick }: {
  position: [number, number, number];
  resistance: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const bandColors = useMemo(() => {
    if (resistance < 50) return ['#ef4444', '#f97316', '#eab308', '#000000'];
    if (resistance < 200) return ['#f97316', '#eab308', '#22c55e', '#000000'];
    return ['#eab308', '#22c55e', '#3b82f6', '#000000'];
  }, [resistance]);
  
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]} onClick={onClick}>
      {/* Resistor body - ceramic */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
        <meshBasicMaterial 
          color={isSelected ? '#0ea5e9' : '#f8fafc'}
        />
      </mesh>
      
      {/* Color bands */}
      {bandColors.map((color, i) => (
        <mesh key={i} position={[-0.2 + i * 0.13, 0, 0.13]}>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      
      {/* Wire leads - copper */}
      <mesh position={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
        <meshBasicMaterial 
          color="#b87333"
        />
      </mesh>
      <mesh position={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
        <meshBasicMaterial 
          color="#b87333"
        />
      </mesh>
      
      {/* Resistance label */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.08}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
      >
        {resistance}Ω
      </Text>
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Capacitor
function Capacitor3D({ position, capacitance, isSelected, onClick }: {
  position: [number, number, number];
  capacitance: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <group position={position} onClick={onClick}>
      {/* Capacitor body */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />
        <meshBasicMaterial 
          color={isSelected ? '#0ea5e9' : '#f1f5f9'}
        />
      </mesh>
      
      {/* Leads */}
      <mesh position={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshBasicMaterial color="#b87333" />
      </mesh>
      <mesh position={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshBasicMaterial color="#b87333" />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, -0.35, 0]}
        fontSize={0.07}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
      >
        {capacitance}µF
      </Text>
      
      {isSelected && (
        <mesh position={[0, 0, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.25, 32]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// LED
function LED3D({ position, isSelected, onClick, isActive, current }: {
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
  isActive?: boolean;
  current?: number;
}) {
  const ledRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (ledRef.current) {
      // Simple color change based on active state
      if (ledRef.current.material instanceof THREE.MeshBasicMaterial) {
        ledRef.current.material.color.setHex(isActive && current && current > 0 ? 0x22c55e : 0x1e293b);
      }
    }
  });
  
  return (
    <group position={position} onClick={onClick}>
      {/* LED body */}
      <mesh ref={ledRef}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
        <meshBasicMaterial 
          color={isSelected ? '#0ea5e9' : '#22c55e'}
        />
      </mesh>
      
      {/* Leads */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.012, 0.012, 0.15, 8]} />
        <meshBasicMaterial color="#b87333" />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.012, 0.012, 0.15, 8]} />
        <meshBasicMaterial color="#b87333" />
      </mesh>
      
      {isSelected && (
        <mesh position={[0, 0, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.15, 32]} />
          <meshStandardMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Digital Multimeter - Hyper-realistic with LCD backlight
function Multimeter3D({ position, value, unit, isSelected, onClick }: {
  position: [number, number, number];
  value: number | string;
  unit: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const displayRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (displayRef.current) {
      // Simple display
      if (displayRef.current.material instanceof THREE.MeshBasicMaterial) {
        displayRef.current.material.color.setHex(0x0f172a);
      }
    }
  });
  
  return (
    <group position={position} onClick={onClick}>
      {/* Multimeter body - industrial design */}
      <mesh>
        <boxGeometry args={[0.8, 0.6, 0.25]} />
        <meshBasicMaterial 
          color={isSelected ? '#0ea5e9' : '#ffffff'}
        />
      </mesh>
      
      {/* LCD screen with soft backlight */}
      <mesh position={[0, 0.1, 0.13]} ref={displayRef}>
        <planeGeometry args={[0.65, 0.35]} />
        <meshBasicMaterial 
          color="#0f172a"
        />
      </mesh>
      
      {/* Display text - LCD style */}
      <Text
        position={[0, 0.1, 0.14]}
        fontSize={0.12}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
      >
        {typeof value === 'number' ? value.toFixed(2) : value} {unit}
      </Text>
      
      {/* Label */}
      <Text
        position={[0, -0.25, 0.13]}
        fontSize={0.06}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
      >
        MULTIMETER
      </Text>
      
      {/* Probes */}
      <mesh position={[-0.4, -0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.4, -0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      
      {isSelected && (
        <mesh position={[0, 0.1, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.5, 32]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Realistic Current Flow Particles (Electrons)
function CurrentFlowParticles({ 
  curve, 
  current, 
  isActive,
  direction = 1 
}: { 
  curve: THREE.CatmullRomCurve3; 
  current: number;
  isActive: boolean;
  direction?: number;
}) {
  const particlesRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const particleCount = Math.max(8, Math.min(20, Math.floor(current * 200))); // More particles for higher current
  
  useFrame((state, delta) => {
    if (!particlesRef.current || !isActive) return;
    
    // Speed based on current (higher current = faster flow)
    const speed = current * 0.5 * direction;
    timeRef.current += delta * speed;
    
    particlesRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        // Distribute particles along the curve
        const t = ((timeRef.current + i * (1 / particleCount)) % 1);
        const pos = curve.getPoint(t);
        child.position.copy(pos);
        
        // Add slight vertical offset to show they're inside the wire
        child.position.y += 0.02;
      }
    });
  });
  
  if (!isActive) return null;
  
  return (
    <group ref={particlesRef}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial 
            color="#fbbf24"
          />
        </mesh>
      ))}
    </group>
  );
}

// Flexible Jumper Wire - Realistic with copper tips and current flow
function JumperWire({ 
  wire, 
  isActive, 
  current = 0 
}: { 
  wire: Wire; 
  isActive: boolean;
  current?: number;
}) {
  const curve = useMemo(() => {
    const mid1 = new THREE.Vector3().lerpVectors(wire.fromPos, wire.toPos, 0.33);
    const mid2 = new THREE.Vector3().lerpVectors(wire.fromPos, wire.toPos, 0.67);
    mid1.y += 0.1;
    mid2.y += 0.1;
    return new THREE.CatmullRomCurve3([wire.fromPos, mid1, mid2, wire.toPos]);
  }, [wire]);
  
  return (
    <group>
      {/* Wire insulation with current glow */}
      <mesh>
        <tubeGeometry args={[curve, 30, 0.025, 8, false]} />
        <meshBasicMaterial 
          color={isActive ? '#fbbf24' : '#1e293b'}
        />
      </mesh>
      
      {/* Inner wire core - shows current flow */}
      {isActive && (
        <mesh>
          <tubeGeometry args={[curve, 30, 0.015, 8, false]} />
          <meshBasicMaterial 
            color="#fbbf24"
          />
        </mesh>
      )}
      {/* Current flow particles (electrons) */}
      <CurrentFlowParticles 
        curve={curve} 
        current={current} 
        isActive={isActive}
        direction={1}
      />
      
      {/* Copper tips */}
      <mesh position={wire.fromPos}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
        <meshBasicMaterial 
          color={isActive ? '#fbbf24' : '#b87333'}
        />
      </mesh>
      <mesh position={wire.toPos}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
        <meshBasicMaterial 
          color={isActive ? '#fbbf24' : '#b87333'}
        />
      </mesh>
    </group>
  );
}

// Draggable Component Wrapper
function DraggableComponent({ 
  children, 
  position, 
  onDrag,
  isSelected 
}: { 
  children: React.ReactNode;
  position: [number, number, number];
  onDrag: (newPos: [number, number, number]) => void;
  isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { raycaster, camera } = useThree();
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.3), []);
  const offsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  
  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    setIsDragging(true);
    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(e, camera);
    raycaster.ray.intersectPlane(dragPlane, intersection);
    
    if (groupRef.current && intersection) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      offsetRef.current.subVectors(intersection, worldPos);
    }
  }, [raycaster, camera, dragPlane]);
  
  const handlePointerMove = useCallback((e: any) => {
    if (!isDragging || !groupRef.current) return;
    
    e.stopPropagation();
    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(e, camera);
    raycaster.ray.intersectPlane(dragPlane, intersection);
    
    if (intersection) {
      intersection.sub(offsetRef.current);
      const newPos: [number, number, number] = [
        Math.max(-4, Math.min(4, intersection.x)),
        0.3,
        Math.max(-2.5, Math.min(2.5, intersection.z))
      ];
      
      groupRef.current.position.set(...newPos);
      onDrag(newPos);
    }
  }, [isDragging, raycaster, camera, dragPlane, onDrag]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  React.useEffect(() => {
    if (groupRef.current && !isDragging) {
      groupRef.current.position.set(...position);
    }
  }, [position, isDragging]);
  
  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {children}
    </group>
  );
}

// Main Scene
function Scene3D({ 
  components, 
  wires,
  selectedComponent,
  onComponentClick,
  onComponentDrag,
  isRunning,
  current
}: {
  components: Component[];
  wires: Wire[];
  selectedComponent: string | null;
  onComponentClick: (id: string) => void;
  onComponentDrag: (id: string, newPos: [number, number, number]) => void;
  isRunning: boolean;
  current: number;
}) {
  return (
    <>
      {/* Cinematic studio lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[8, 10, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <pointLight position={[0, 8, 0]} intensity={0.6} />
      

      {/* Breadboard */}
      <Breadboard3D />
      
      {/* Components */}
      {components.map((comp) => {
        const isSelected = selectedComponent === comp.id;
        const commonProps = {
          position: comp.position,
          isSelected,
          onClick: () => onComponentClick(comp.id),
        };
        
        let component3D;
        switch (comp.type) {
          case 'battery':
            component3D = (
              <DraggableComponent
                position={comp.position}
                onDrag={(newPos) => onComponentDrag(comp.id, newPos)}
                isSelected={isSelected}
              >
                <Battery9V {...commonProps} voltage={comp.properties.voltage || 9} />
              </DraggableComponent>
            );
            break;
          case 'resistor':
            component3D = (
              <DraggableComponent
                position={comp.position}
                onDrag={(newPos) => onComponentDrag(comp.id, newPos)}
                isSelected={isSelected}
              >
                <Resistor3D {...commonProps} resistance={comp.properties.resistance || 100} />
              </DraggableComponent>
            );
            break;
          case 'capacitor':
            component3D = (
              <DraggableComponent
                position={comp.position}
                onDrag={(newPos) => onComponentDrag(comp.id, newPos)}
                isSelected={isSelected}
              >
                <Capacitor3D {...commonProps} capacitance={comp.properties.capacitance || 10} />
              </DraggableComponent>
            );
            break;
          case 'led':
            component3D = (
              <DraggableComponent
                position={comp.position}
                onDrag={(newPos) => onComponentDrag(comp.id, newPos)}
                isSelected={isSelected}
              >
                <LED3D {...commonProps} isActive={isRunning} current={current} />
              </DraggableComponent>
            );
            break;
          case 'multimeter':
            component3D = (
              <Multimeter3D 
                {...commonProps} 
                value={comp.properties.resistance || 100}
                unit="Ω"
              />
            );
            break;
          default:
            return null;
        }
        
        return <React.Fragment key={comp.id}>{component3D}</React.Fragment>;
      })}
      
      {/* Wires with realistic current flow */}
      {wires.map((wire) => (
        <JumperWire 
          key={wire.id} 
          wire={wire} 
          isActive={isRunning}
          current={current}
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={20}
        target={[0, 0.3, 0]}
      />
    </>
  );
}

export default function SimpleDemo3D() {
  const [components, setComponents] = useState<Component[]>([
    {
      id: 'battery-1',
      type: 'battery',
      position: [-3, 0.3, -1],
      rotation: 0,
      isDragging: false,
      properties: { voltage: 9 },
    },
    {
      id: 'resistor-1',
      type: 'resistor',
      position: [0, 0.3, -1],
      rotation: 0,
      isDragging: false,
      properties: { resistance: 100 },
    },
    {
      id: 'capacitor-1',
      type: 'capacitor',
      position: [1.5, 0.3, -1],
      rotation: 0,
      isDragging: false,
      properties: { capacitance: 10 },
    },
    {
      id: 'led-1',
      type: 'led',
      position: [3, 0.3, -1],
      rotation: 0,
      isDragging: false,
      properties: {},
    },
    {
      id: 'multimeter-1',
      type: 'multimeter',
      position: [0, 0.3, 1.5],
      rotation: 0,
      isDragging: false,
      properties: { resistance: 100 },
    },
  ]);
  
  const [wires, setWires] = useState<Wire[]>([
    {
      id: 'wire-1',
      from: 'battery-1',
      to: 'resistor-1',
      fromPos: new THREE.Vector3(-3, 0.7, -1),
      toPos: new THREE.Vector3(0, 0.3, -0.7),
      isActive: false,
    },
    {
      id: 'wire-2',
      from: 'resistor-1',
      to: 'multimeter-1',
      fromPos: new THREE.Vector3(0, 0.3, -0.7),
      toPos: new THREE.Vector3(0, 0.3, 1.2),
      isActive: false,
    },
  ]);
  
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [voltage, setVoltage] = useState(9);
  const [resistance, setResistance] = useState(100);
  const [current, setCurrent] = useState(0.09);
  
  const calculateCurrent = useCallback((v: number, r: number) => {
    return r > 0 ? v / r : 0;
  }, []);
  
  const handleComponentDrag = useCallback((id: string, newPos: [number, number, number]) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, position: newPos } : comp
    ));
    
    // Update wire positions
    setWires(prev => prev.map(wire => {
      if (wire.from === id) {
        const comp = components.find(c => c.id === id);
        if (comp) {
          return { ...wire, fromPos: new THREE.Vector3(newPos[0], newPos[1] + 0.4, newPos[2]) };
        }
      }
      if (wire.to === id) {
        const comp = components.find(c => c.id === id);
        if (comp) {
          return { ...wire, toPos: new THREE.Vector3(newPos[0], newPos[1] + 0.4, newPos[2]) };
        }
      }
      return wire;
    }));
  }, [components]);
  
  const handleVoltageChange = (value: number[]) => {
    const newVoltage = value[0];
    setVoltage(newVoltage);
    const newCurrent = calculateCurrent(newVoltage, resistance);
    setCurrent(newCurrent);
    
    setComponents(prev => prev.map(comp => 
      comp.id === 'battery-1' 
        ? { ...comp, properties: { ...comp.properties, voltage: newVoltage } }
        : comp
    ));
  };
  
  const handleResistanceChange = (value: number[]) => {
    const newResistance = value[0];
    setResistance(newResistance);
    const newCurrent = calculateCurrent(voltage, newResistance);
    setCurrent(newCurrent);
    
    setComponents(prev => prev.map(comp => 
      comp.id === 'resistor-1' 
        ? { ...comp, properties: { ...comp.properties, resistance: newResistance } }
        : comp.id === 'multimeter-1'
        ? { ...comp, properties: { ...comp.properties, resistance: newResistance } }
        : comp
    ));
  };
  
  const toggleSimulation = () => {
    setIsRunning(prev => !prev);
    setWires(prev => prev.map(w => ({ ...w, isActive: !prev[0]?.isActive })));
  };
  
  const resetSimulation = () => {
    setVoltage(9);
    setResistance(100);
    setCurrent(0.09);
    setIsRunning(false);
    
    setComponents([
      {
        id: 'battery-1',
        type: 'battery',
        position: [-3, 0.3, -1],
        rotation: 0,
        isDragging: false,
        properties: { voltage: 9 },
      },
      {
        id: 'resistor-1',
        type: 'resistor',
        position: [0, 0.3, -1],
        rotation: 0,
        isDragging: false,
        properties: { resistance: 100 },
      },
      {
        id: 'capacitor-1',
        type: 'capacitor',
        position: [1.5, 0.3, -1],
        rotation: 0,
        isDragging: false,
        properties: { capacitance: 10 },
      },
      {
        id: 'led-1',
        type: 'led',
        position: [3, 0.3, -1],
        rotation: 0,
        isDragging: false,
        properties: {},
      },
      {
        id: 'multimeter-1',
        type: 'multimeter',
        position: [0, 0.3, 1.5],
        rotation: 0,
        isDragging: false,
        properties: { resistance: 100 },
      },
    ]);
  };
  
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-border shadow-2xl" style={{ minHeight: '80vh', height: '80vh' }}>
        <Canvas
          camera={{ position: [10, 6, 10], fov: 45 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
        >
          <Scene3D
            components={components}
            wires={wires}
            selectedComponent={selectedComponent}
            onComponentClick={setSelectedComponent}
            onComponentDrag={handleComponentDrag}
            isRunning={isRunning}
            current={current}
          />
        </Canvas>
      </div>
      
      <div className="mt-4 space-y-3 p-4 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            onClick={toggleSimulation}
            variant={isRunning ? "destructive" : "default"}
            className="gap-2"
            size="default"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Run'}
          </Button>
          <Button variant="outline" onClick={resetSimulation} className="gap-2" size="default">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current (I = V/R)</p>
              <p className="text-xl font-display font-bold text-primary">
                {current.toFixed(4)} A
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Voltage (V)</span>
              <span className="text-primary font-mono font-semibold text-sm">{voltage} V</span>
            </label>
            <Slider
              value={[voltage]}
              onValueChange={handleVoltageChange}
              min={1}
              max={12}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Resistance (Ω)</span>
              <span className="text-primary font-mono font-semibold text-sm">{resistance} Ω</span>
            </label>
            <Slider
              value={[resistance]}
              onValueChange={handleResistanceChange}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
