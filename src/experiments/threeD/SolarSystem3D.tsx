"use client";

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line, Billboard } from '@react-three/drei';
import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { TextureLoader, EllipseCurve, Vector3 } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RefreshCw, Pause, Play, Maximize, Minimize } from 'lucide-react';

/**
 * SolarSystemContent contains the actual 3D logic and R3F hooks.
 * It must be rendered inside a <Canvas>.
 */
function SolarSystemContent({
    controlsRef,
    isPaused
}: {
    controlsRef: any,
    isPaused: boolean
}) {
    const earthRef = useRef<THREE.Group>(null);
    const earthMeshRef = useRef<THREE.Mesh>(null);

    // Time tracking for manual pause/resume
    const timeRef = useRef(0);

    // Load Earth texture
    const earthTexture = useLoader(TextureLoader, '/earth_texture.png');

    // Ellipse parameters
    const xRadius = 18; // Major axis (semi-major)
    const zRadius = 12; // Minor axis (semi-minor)

    useFrame((state, delta) => {
        if (!isPaused) {
            timeRef.current += delta;
        }
        const t = timeRef.current;

        // Earth revolution (Year) - Elliptical Orbit
        if (earthRef.current) {
            const speed = 0.5; // Revolution speed
            earthRef.current.position.x = Math.cos(t * speed) * xRadius;
            earthRef.current.position.z = Math.sin(t * speed) * zRadius;
        }

        // Earth rotation (Day)
        if (earthMeshRef.current && !isPaused) {
            // Spin around its own LOCAL Y axis
            earthMeshRef.current.rotation.y += 0.02;
        }
    });

    // Create elliptical orbit path points
    const ellipsePoints = useMemo(() => {
        const curve = new EllipseCurve(
            0, 0,            // ax, aY
            xRadius, zRadius,// xRadius, yRadius
            0, 2 * Math.PI,  // aStartAngle, aEndAngle
            false,           // aClockwise
            0                // aRotation
        );
        const points = curve.getPoints(100);
        return points.map(p => new Vector3(p.x, 0, p.y));
    }, [xRadius, zRadius]);

    return (
        <>
            {/* Ambient light simulates starlight/scattered light - very low to allow for true night side */}
            <ambientLight intensity={0.1} />

            {/* Sun: The Main Light Source */}
            <pointLight
                position={[0, 0, 0]}
                intensity={800}
                distance={100}
                decay={2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            {/* Sun Mesh - Original Simple Version */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[3, 32, 32]} />
                <meshStandardMaterial emissive="#ffdd00" emissiveIntensity={2} color="#ffb74d" />
            </mesh>

            {/* Earth Elliptical Orbit Path Visualization */}
            <Line
                points={ellipsePoints}
                color="white"
                opacity={0.15}
                transparent
                lineWidth={1}
            />

            {/* Season Labels */}
            <Billboard position={[xRadius + 4, 0, 0]}>
                <Text fontSize={1.2} color="#fbbf24" anchorX="center" anchorY="middle">
                    Northern Summer
                </Text>
            </Billboard>
            <Billboard position={[-xRadius - 4, 0, 0]}>
                <Text fontSize={1.2} color="#60a5fa" anchorX="center" anchorY="middle">
                    Northern Winter
                </Text>
            </Billboard>
            <Billboard position={[0, 0, zRadius + 3]}>
                <Text fontSize={1.2} color="#fb923c" anchorX="center" anchorY="middle">
                    Northern Autumn
                </Text>
            </Billboard>
            <Billboard position={[0, 0, -zRadius - 3]}>
                <Text fontSize={1.2} color="#4ade80" anchorX="center" anchorY="middle">
                    Northern Spring
                </Text>
            </Billboard>

            {/* Earth Group: Handles position and fixed axis tilt */}
            <group ref={earthRef}>
                {/* 
                  Tilt wrapper: Rotates the container to axial tilt (23.5 deg = ~0.41 rad).
                  We tilt around Z axis so poles point left/right relative to orbit plane temporarily.
                */}
                <group rotation={[0, 0, 23.5 * (Math.PI / 180)]}>
                    <mesh ref={earthMeshRef} castShadow receiveShadow>
                        <sphereGeometry args={[2.5, 64, 64]} />
                        <meshStandardMaterial
                            map={earthTexture}
                            metalness={0.1}
                            roughness={0.7}
                        />
                    </mesh>

                    {/* Equator Line */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[2.52, 0.03, 16, 100]} />
                        <meshBasicMaterial color="#ef4444" />
                    </mesh>

                    {/* Axis Visualizer */}
                    <mesh position={[0, 3.5, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
                        <meshStandardMaterial color="white" opacity={0.5} transparent />
                    </mesh>
                    <mesh position={[0, -3.5, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
                        <meshStandardMaterial color="white" opacity={0.5} transparent />
                    </mesh>

                    {/* Hemisphere Labels */}
                    <Text
                        position={[0, 4.0, 0]}
                        fontSize={1.0}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        N
                    </Text>
                    <Text
                        position={[0, -4.0, 0]}
                        fontSize={1.0}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        S
                    </Text>
                </group>
            </group>

            {/* Star field background */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

            {/* Controls */}
            <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                minDistance={10}
                maxDistance={80}
            />
        </>
    );
}

/**
 * Solar System Visualization
 */
export default function SolarSystem3D() {
    const controlsRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const resetView = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full bg-black/90 rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col ${isFullscreen ? 'h-screen' : 'h-[75vh]'}`}
        >
            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/50 border-white/20 text-white hover:bg-white/20"
                    onClick={togglePause}
                    title={isPaused ? "Resume" : "Pause"}
                >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/50 border-white/20 text-white hover:bg-white/20"
                    onClick={resetView}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset View
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/50 border-white/20 text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            </div>

            <Canvas
                shadows
                camera={{ position: [0, 30, 40], fov: 35 }}
                gl={{ powerPreference: 'high-performance', alpha: true, antialias: true }}
            >
                <Suspense fallback={null}>
                    <SolarSystemContent controlsRef={controlsRef} isPaused={isPaused} />
                </Suspense>
            </Canvas>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 text-xs md:text-sm text-slate-200">
                <div className="flex flex-col md:flex-row gap-x-6 gap-y-1 items-center justify-center text-center">
                    <div className="font-semibold text-white/50 mb-1 md:mb-0 md:mr-2">Hemisphere Seasons:</div>
                    <div className="flex gap-2">
                        <span className="text-yellow-400">N. Summer</span> = <span className="text-blue-400">S. Winter</span>
                    </div>
                    <div className="hidden md:block text-white/20">|</div>
                    <div className="flex gap-2">
                        <span className="text-orange-400">N. Autumn</span> = <span className="text-green-400">S. Spring</span>
                    </div>
                    <div className="hidden md:block text-white/20">|</div>
                    <div className="flex gap-2">
                        <span className="text-blue-400">N. Winter</span> = <span className="text-yellow-400">S. Summer</span>
                    </div>
                    <div className="hidden md:block text-white/20">|</div>
                    <div className="flex gap-2">
                        <span className="text-green-400">N. Spring</span> = <span className="text-orange-400">S. Autumn</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
