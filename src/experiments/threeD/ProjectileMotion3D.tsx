"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface ProjectileState {
  initialVelocity: number;
  launchAngle: number;
  initialHeight: number;
  gravity: number;
  isRunning: boolean;
  time: number;
}

// Projectile Component
function Projectile({ position, time }: { position: THREE.Vector3; time: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.1;
      meshRef.current.rotation.y += 0.1;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial 
        color="#ef4444"
        emissive="#fbbf24"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

// Trajectory Line
function TrajectoryLine({ points, isVisible }: { points: THREE.Vector3[]; isVisible: boolean }) {
  if (!isVisible || points.length < 2) return null;
  
  const curve = new THREE.CatmullRomCurve3(points);
  
  return (
    <mesh>
      <tubeGeometry args={[curve, 100, 0.05, 8, false]} />
      <meshStandardMaterial 
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// Ground Plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#84cc16" roughness={0.8} />
    </mesh>
  );
}

// Cannon/Launcher
function Cannon({ angle, position }: { angle: number; position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, -angle * Math.PI / 180]}>
      <mesh castShadow>
        <boxGeometry args={[1, 0.5, 0.5]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

// Scene Component
function Scene3D({ state, onStateChange }: {
  state: ProjectileState;
  onStateChange: (updates: Partial<ProjectileState>) => void;
}) {
  const trajectoryPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    const timeOfFlight = (2 * vy) / state.gravity;
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * timeOfFlight;
      const x = vx * t;
      const y = state.initialHeight + vy * t - 0.5 * state.gravity * t * t;
      if (y >= 0) {
        points.push(new THREE.Vector3(x, y, 0));
      }
    }
    
    return points;
  }, [state]);
  
  const projectilePosition = useMemo(() => {
    if (!state.isRunning || state.time < 0) return null;
    
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    
    const x = vx * state.time;
    const y = state.initialHeight + vy * state.time - 0.5 * state.gravity * state.time * state.time;
    
    if (y >= 0) {
      return new THREE.Vector3(x, y, 0);
    }
    return null;
  }, [state]);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      <Environment preset="sunset" />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={50} blur={2} />
      
      <Ground />
      
      <Cannon 
        angle={state.launchAngle} 
        position={[0, state.initialHeight, 0]} 
      />
      
      <TrajectoryLine points={trajectoryPoints} isVisible={!state.isRunning} />
      
      {projectilePosition && (
        <Projectile position={projectilePosition} time={state.time} />
      )}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        target={[trajectoryPoints[trajectoryPoints.length - 1]?.x / 2 || 0, 5, 0]}
      />
    </>
  );
}

export default function ProjectileMotion3D() {
  const [state, setState] = useState<ProjectileState>({
    initialVelocity: 20,
    launchAngle: 45,
    initialHeight: 0,
    gravity: 9.8,
    isRunning: false,
    time: 0,
  });
  
  const animationRef = useRef<number>();
  
  const calculateMetrics = useCallback(() => {
    const angleRad = (state.launchAngle * Math.PI) / 180;
    const vx = state.initialVelocity * Math.cos(angleRad);
    const vy = state.initialVelocity * Math.sin(angleRad);
    const timeOfFlight = (2 * vy) / state.gravity;
    const maxHeight = state.initialHeight + (vy * vy) / (2 * state.gravity);
    const range = vx * timeOfFlight;
    return { timeOfFlight, maxHeight, range };
  }, [state]);
  
  useEffect(() => {
    if (state.isRunning) {
      const startTime = Date.now();
      const metrics = calculateMetrics();
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = elapsed * 2;
        
        if (newTime <= metrics.timeOfFlight + 0.5) {
          setState(prev => ({ ...prev, time: newTime }));
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setState(prev => ({ ...prev, isRunning: false, time: 0 }));
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isRunning, calculateMetrics]);
  
  const metrics = calculateMetrics();
  
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-border shadow-2xl" style={{ minHeight: '80vh', height: '80vh' }}>
        <Canvas
          camera={{ position: [15, 10, 15], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <Scene3D state={state} onStateChange={(updates) => setState(prev => ({ ...prev, ...updates }))} />
        </Canvas>
      </div>
      
      <div className="mt-4 space-y-3 p-4 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            onClick={() => setState(prev => ({ ...prev, isRunning: !prev.isRunning, time: 0 }))}
            variant={state.isRunning ? "destructive" : "default"}
            className="gap-2"
            size="default"
          >
            {state.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {state.isRunning ? 'Pause' : 'Launch'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setState(prev => ({ ...prev, isRunning: false, time: 0 }))}
            className="gap-2"
            size="default"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Initial Velocity (m/s)</span>
              <span className="text-primary font-mono text-sm">{state.initialVelocity}</span>
            </label>
            <Slider
              value={[state.initialVelocity]}
              onValueChange={(val) => setState(prev => ({ ...prev, initialVelocity: val[0] }))}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Launch Angle (°)</span>
              <span className="text-primary font-mono text-sm">{state.launchAngle}</span>
            </label>
            <Slider
              value={[state.launchAngle]}
              onValueChange={(val) => setState(prev => ({ ...prev, launchAngle: val[0] }))}
              min={0}
              max={90}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Initial Height (m)</span>
              <span className="text-primary font-mono text-sm">{state.initialHeight}</span>
            </label>
            <Slider
              value={[state.initialHeight]}
              onValueChange={(val) => setState(prev => ({ ...prev, initialHeight: val[0] }))}
              min={0}
              max={20}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground">Range</p>
            <p className="text-xl font-display font-bold text-primary">{metrics.range.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Height</p>
            <p className="text-xl font-display font-bold text-primary">{metrics.maxHeight.toFixed(2)} m</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time of Flight</p>
            <p className="text-xl font-display font-bold text-primary">{metrics.timeOfFlight.toFixed(2)} s</p>
          </div>
        </div>
      </div>
    </div>
  );
}

