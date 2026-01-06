"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei';
import Battery3D from './components/Battery3D';
import Resistor3D from './components/Resistor3D';
import Bulb3D from './components/Bulb3D';
import Transistor3D from './components/Transistor3D';
import Switch3D from './components/Switch3D';
import Wire3D from './components/Wire3D';
import DraggableComponent from './components/DraggableComponent';
import { CircuitNode, Wire, computeCircuit } from './utils/circuitHelpers';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Lock, Unlock, RotateCcw, Activity, Power, PowerOff, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Mode = 'explore' | 'challenge' | 'quiz';
type Preset = 'torch' | 'charger' | 'bulb' | 'heater' | 'custom';

export default function OhmsLawLabInteractive() {
    // ----- State -----
    const [mode, setMode] = useState<Mode>('explore');
    const [preset, setPreset] = useState<Preset>('custom');
    const [showGraph, setShowGraph] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // Initial nodes with realistic starting positions
    const [nodes, setNodes] = useState<CircuitNode[]>([
        { id: 'battery-1', type: 'battery', position: [-2.5, 0, -1], data: { voltage: 9 } },
        { id: 'resistor-1', type: 'resistor', position: [0, 0, -1], data: { resistance: 100 } },
        { id: 'switch-1', type: 'switch', position: [2.5, 0, -1], data: { isOpen: true } },
        { id: 'bulb-1', type: 'bulb', position: [1.5, 0, 1.5], data: { resistance: 50 } },
        { id: 'transistor-1', type: 'transistor', position: [-1.5, 0, 1.5], data: { resistance: 30 } },
    ]);

    // Loop configuration: Battery -> Resistor -> Switch -> Bulb -> Transistor -> Battery
    const [wires] = useState<Wire[]>([
        { id: 'w1', from: 'battery-1', to: 'resistor-1' },
        { id: 'w2', from: 'resistor-1', to: 'switch-1' },
        { id: 'w3', from: 'switch-1', to: 'bulb-1' },
        { id: 'w4', from: 'bulb-1', to: 'transistor-1' },
        { id: 'w5', from: 'transistor-1', to: 'battery-1' },
    ]);

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isVLocked, setIsVLocked] = useState(false);
    const [isRLocked, setIsRLocked] = useState(false);

    // Challenge state
    const [targetCurrent, setTargetCurrent] = useState<number>(0);
    const [challengeStatus, setChallengeStatus] = useState<'idle' | 'success'>('idle');

    // Quiz state
    const [quizQuestion, setQuizQuestion] = useState<{ v: number, r: number, answer: number } | null>(null);
    const [quizGuess, setQuizGuess] = useState('');
    const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

    // ----- Helpers & Calculations -----
    const circuit = useMemo(() => computeCircuit(nodes, wires), [nodes, wires]);
    const { V, I, totalR, fault, isSwitchOpen } = circuit;

    const updateNodePos = useCallback((id: string, newPos: [number, number, number]) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, position: newPos } : n));
    }, []);

    const updateNodeData = useCallback((id: string, newData: Record<string, any>) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...newData } } : n));
    }, []);

    const toggleSwitch = () => {
        const sw = nodes.find(n => n.type === 'switch');
        if (sw) {
            updateNodeData(sw.id, { isOpen: !sw.data.isOpen });
        }
    };

    // Set Presets
    const handlePresetChange = (val: string) => {
        const p = val as Preset;
        setPreset(p);
        const presets: Record<Exclude<Preset, 'custom'>, { v: number, r: number }> = {
            torch: { v: 3, r: 30 },
            charger: { v: 5, r: 10 },
            bulb: { v: 9, r: 100 },
            heater: { v: 12, r: 5 }
        };
        if (p !== 'custom') {
            const { v, r } = presets[p];
            setNodes(prev => prev.map(n => {
                if (n.type === 'battery') return { ...n, data: { ...n.data, voltage: v } };
                if (n.type === 'resistor') return { ...n, data: { ...n.data, resistance: r } };
                return n;
            }));
        }
    };

    // Challenge Logic
    useEffect(() => {
        if (mode === 'challenge' && targetCurrent === 0) {
            setTargetCurrent(Number((Math.random() * 1.5 + 0.1).toFixed(2)));
            setChallengeStatus('idle');
        }
    }, [mode, targetCurrent]);

    useEffect(() => {
        if (mode === 'challenge' && !isSwitchOpen && Math.abs(I - targetCurrent) < 0.05) {
            setChallengeStatus('success');
        } else {
            setChallengeStatus('idle');
        }
    }, [I, targetCurrent, mode, isSwitchOpen]);

    const resetChallenge = () => {
        setTargetCurrent(Number((Math.random() * 1.5 + 0.1).toFixed(2)));
        setChallengeStatus('idle');
    };

    // Quiz Logic
    const startQuiz = () => {
        const qV = Math.floor(Math.random() * 10) + 2;
        const qR = Math.floor(Math.random() * 50) + 10;
        setQuizQuestion({ v: qV, r: qR, answer: Number((qV / qR).toFixed(2)) });
        setQuizGuess('');
        setQuizFeedback(null);
    };

    const checkQuiz = () => {
        if (!quizQuestion) return;
        if (Math.abs(parseFloat(quizGuess) - quizQuestion.answer) < 0.02) {
            setQuizFeedback('Correct! 🎉');
        } else {
            setQuizFeedback(`Wrong. Correct answer: ${quizQuestion.answer}A`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-800 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Realistic Virtual Circuit Lab</h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Physics Experiment</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {(['explore', 'challenge', 'quiz'] as Mode[]).map(m => (
                            <Button
                                key={m}
                                variant="ghost"
                                size="sm"
                                className={`text-[10px] uppercase h-7 px-3 ${mode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                                onClick={() => setMode(m)}
                            >
                                {m}
                            </Button>
                        ))}
                    </div>

                    <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-700 bg-slate-900 text-slate-200" onClick={() => setShowInfo(true)}>
                        <Info className="h-4 w-4" /> Help
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 relative">
                {/* 3D Simulation View */}
                <div className="absolute inset-0 z-10">
                    <Canvas shadows camera={{ position: [0, 6, 8], fov: 40 }}>
                        <ambientLight intensity={0.7} />
                        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
                        <spotLight position={[-5, 8, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
                        <OrbitControls enableZoom={true} minDistance={4} maxDistance={15} />
                        <Environment preset="studio" />
                        <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={20} blur={2.5} far={4} />

                        {/* Grid/Table Surface */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                            <planeGeometry args={[20, 20]} />
                            <meshStandardMaterial color="#1e293b" />
                        </mesh>
                        <gridHelper args={[20, 20, "#334155", "#1e293b"]} position={[0, 0.01, 0]} />

                        {nodes.map(node => (
                            <DraggableComponent
                                key={node.id}
                                nodeId={node.id}
                                position={node.position as [number, number, number]}
                                onDrag={updateNodePos}
                                isSelected={selectedNodeId === node.id}
                                onClick={() => setSelectedNodeId(node.id)}
                            >
                                {node.type === 'battery' && <Battery3D voltage={node.data.voltage} />}
                                {node.type === 'resistor' && <Resistor3D resistance={node.data.resistance} />}
                                {node.type === 'bulb' && <Bulb3D current={I} isOn={!isSwitchOpen} />}
                                {node.type === 'transistor' && <Transistor3D resistance={node.data.resistance} />}
                                {node.type === 'switch' && <Switch3D isOpen={node.data.isOpen} onClick={toggleSwitch} />}
                            </DraggableComponent>
                        ))}

                        {wires.map(w => {
                            const from = nodes.find(n => n.id === w.from);
                            const to = nodes.find(n => n.id === w.to);
                            if (!from || !to) return null;
                            return <Wire3D key={w.id} from={from.position as [number, number, number]} to={to.position as [number, number, number]} current={I} />;
                        })}

                        {fault && (
                            <Html fullscreen>
                                <div className="flex items-center justify-center h-full pb-44 pointer-events-none">
                                    <div className="bg-red-500/20 text-red-500 px-8 py-4 rounded-3xl border border-red-500/50 backdrop-blur-2xl animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                                        <p className="text-2xl font-black uppercase italic tracking-tighter">
                                            {fault === 'short' ? '⚠️ DANGER: SHORT CIRCUIT!' : '⚠️ WARNING: COMPONENTS OVERHEATING!'}
                                        </p>
                                    </div>
                                </div>
                            </Html>
                        )}
                    </Canvas>
                </div>

                {/* Status Bar (Floating) */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 pointer-events-none">
                    <div className={`px-4 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 transition-all duration-500 ${isSwitchOpen ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isSwitchOpen ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isSwitchOpen ? 'text-red-400' : 'text-green-400'}`}>
                            Circuit {isSwitchOpen ? 'Open (OFF)' : 'Closed (ON)'}
                        </span>
                    </div>
                </div>

                {/* Left controls and data overlay omitted for brevity but should be merged from previous version */}
                <div className="absolute left-4 top-4 z-20 w-72 flex flex-col gap-4 pointer-events-none">
                    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl pointer-events-auto shadow-xl">
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs text-slate-400 uppercase tracking-widest">Circuit Data</CardTitle>
                            <Button
                                size="sm"
                                className={`h-8 w-14 rounded-full transition-all ${isSwitchOpen ? 'bg-slate-700 hover:bg-slate-600' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20'}`}
                                onClick={toggleSwitch}
                            >
                                {isSwitchOpen ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                                    <span className="text-[8px] text-slate-500 uppercase block mb-1">Current</span>
                                    <span className={`text-lg font-black ${isSwitchOpen ? 'text-slate-600' : 'text-blue-400'}`}>{I.toFixed(2)}A</span>
                                </div>
                                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                                    <span className="text-[8px] text-slate-500 uppercase block mb-1">Voltage</span>
                                    <span className="text-lg font-black text-blue-400">{V}V</span>
                                </div>
                            </div>

                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                                        <span>Supply Voltage</span>
                                        <span className="text-white">{V}V</span>
                                    </div>
                                    <Slider
                                        min={0} max={12} step={0.1} value={[V]}
                                        onValueChange={(val) => updateNodeData('battery-1', { voltage: val[0] })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                                        <span>Resistance</span>
                                        <span className="text-white">{totalR.toFixed(0)}Ω</span>
                                    </div>
                                    <Slider
                                        min={1} max={500} step={1} value={[nodes.find(n => n.type === 'resistor')?.data.resistance || 100]}
                                        onValueChange={(val) => updateNodeData('resistor-1', { resistance: val[0] })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Help/Explain Dialog */}
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-yellow-400">Mastering the Circuit Lab</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                        <p>This lab uses realistic 3D models to simulate a real hardware setup:</p>
                        <ul className="space-y-2 list-disc pl-4 text-slate-300">
                            <li><strong>9V Battery:</strong> Drag to position, slide to change voltage.</li>
                            <li><strong>Resistor:</strong> Realistic color bands indicate resistance value.</li>
                            <li><strong>The Switch:</strong> Flip the knife-lever or use the UI button to "ON" the circuit.</li>
                            <li><strong>Light Bulb:</strong> Brightness responds to current levels (I = V/R).</li>
                            <li><strong>Safety:</strong> Don't short-circuit! High current will trigger an overload warning.</li>
                        </ul>
                        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-300 text-xs">
                            Tip: Connect all elements in a loop. Data only shows when the switch is closed (ON).
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
