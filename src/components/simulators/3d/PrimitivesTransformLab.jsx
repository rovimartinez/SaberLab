import React, { useState, useEffect } from 'react';
import BlenderViewport from './BlenderViewport';
import {
    Target,
    Compass,
    Sparkles,
    CheckCircle2,
    RotateCcw,
    Layers,
    Box,
    Move,
    Maximize,
    RotateCw,
    HelpCircle,
    ChevronRight,
    Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CHALLENGES_L2 = [
    {
        id: 1,
        title: 'Reto 1: Selección de Primitiva (Cilindro)',
        desc: 'Las primitivas son la base de partida en Blender. Para crear columnas, tubos o ruedas se parte de un cilindro.',
        objective: 'Cambia la primitiva activa a "Cilindro" desde el selector superior.',
        hint: 'Usa el menú desplegable en la barra superior izquierda y selecciona "Cilindro".',
        check: (state) => state.primitive === 'cylinder'
    },
    {
        id: 2,
        title: 'Reto 2: Elevación en Altura sobre el Piso (G + Z)',
        desc: 'El Eje Z (Azul) controla la altura vertical. Mover hacia arriba eleva el objeto sobre la rejilla de referencia.',
        objective: 'Traslada el objeto en el Eje Z a una altura de al menos +1.5 unidades.',
        hint: 'Haz clic en el botón azul "Z: ..." de Pos (G) hasta que Z >= 1.5.',
        check: (state) => state.pos.z >= 1.5
    },
    {
        id: 3,
        title: 'Reto 3: Rotación Angular en Eje Z (R + Z)',
        desc: 'Rotar alrededor del eje vertical (Z) hace que el objeto gire como un carrusel sin inclinarse.',
        objective: 'Aplica una rotación en el Eje Z de al menos 90°.',
        hint: 'Haz clic en el botón "Rot (R) -> Z: ..." hasta alcanzar 90° o más.',
        check: (state) => state.rot.z >= 90
    },
    {
        id: 4,
        title: 'Reto 4: Escala No Uniforme (Aplanamiento o Estiramiento)',
        desc: 'En Blender puedes escalar solo un eje para deformar la primitiva (ej: crear una moneda o poste).',
        objective: 'Aumenta la escala en X a 1.6× o más mientras mantienes los otros ejes.',
        hint: 'Haz clic en el botón "Scl (S) -> X: ..." varias veces.',
        check: (state) => state.scale.x >= 1.6
    },
    {
        id: 5,
        title: 'Reto 5: Primitiva Compleja (Toroide / Dona)',
        desc: 'El toroide es una forma geométrica con agujero central fundamental para juntas, ruedas, salvavidas y cadenas.',
        objective: 'Selecciona la primitiva "Toroide (Dona)" y activa el sombreado "Render" o "Wire".',
        hint: 'Elige "Toroide" en primitivas y pulsa "Wire" o "Render" arriba a la derecha.',
        check: (state) => state.primitive === 'torus' && (state.shading === 'wireframe' || state.shading === 'rendered')
    }
];

export default function PrimitivesTransformLab() {
    const lessonId = 'ma-m1-l2';
    const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState({});
    const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'sandbox'

    const [viewportTelemetry, setViewportTelemetry] = useState({
        primitive: 'cube',
        shading: 'solid',
        isOrtho: false,
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(`practical_progress_${lessonId}`);
            if (saved) {
                setCompletedChallenges(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Error cargando progreso práctico:', e);
        }
    }, [lessonId]);

    const markCompleted = (challengeId) => {
        setCompletedChallenges(prev => {
            const next = { ...prev, [challengeId]: true };
            try {
                localStorage.setItem(`practical_progress_${lessonId}`, JSON.stringify(next));
            } catch (e) {
                console.error('Error guardando progreso:', e);
            }
            return next;
        });

        confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.7 }
        });
    };

    const handleTransformChange = (nextData) => {
        setViewportTelemetry(prev => ({
            ...prev,
            pos: nextData.pos,
            rot: nextData.rot,
            scale: nextData.scale
        }));

        const currentChallenge = CHALLENGES_L2[currentChallengeIdx];
        if (currentChallenge && !completedChallenges[currentChallenge.id]) {
            const currentTotalState = {
                ...viewportTelemetry,
                pos: nextData.pos,
                rot: nextData.rot,
                scale: nextData.scale
            };
            if (currentChallenge.check(currentTotalState)) {
                markCompleted(currentChallenge.id);
            }
        }
    };

    const completedCount = Object.keys(completedChallenges).length;
    const progressPercent = Math.round((completedCount / CHALLENGES_L2.length) * 100);

    return (
        <div style={{ width: '100%', maxWidth: '1050px', margin: '0 auto', color: '#f8fafc' }}>
            {/* Header del Laboratorio */}
            <div
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    border: '1.5px solid rgba(236, 72, 153, 0.4)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '10px', borderRadius: '12px', color: '#ec4899' }}>
                            <Box size={28} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                                Laboratorio: Primitivas y Transformaciones de Precisión
                            </h3>
                            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                                Domina las operaciones fundamentales de Blender: selección de primitivas, traslación (G), rotación (R) y escala (S) restringidas por eje.
                            </p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '180px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Misiones Completadas:</span>
                            <strong style={{ color: '#ec4899' }}>{completedCount}/{CHALLENGES_L2.length} ({progressPercent}%)</strong>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${progressPercent}%`,
                                    background: 'linear-gradient(90deg, #ec4899 0%, #38bdf8 100%)',
                                    transition: 'width 0.4s ease'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Pestañas: Retos vs Sandbox */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('challenges')}
                        style={{
                            background: activeTab === 'challenges' ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'challenges' ? '#f8fafc' : '#94a3b8',
                            border: `1px solid ${activeTab === 'challenges' ? '#ec4899' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Target size={15} /> Retos de Modelado (5)
                    </button>
                    <button
                        onClick={() => setActiveTab('sandbox')}
                        style={{
                            background: activeTab === 'sandbox' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === 'sandbox' ? '#f8fafc' : '#94a3b8',
                            border: `1px solid ${activeTab === 'sandbox' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Sparkles size={15} /> Sandbox de Primitivas Libre
                    </button>
                </div>
            </div>

            {/* Panel Principal */}
            {activeTab === 'challenges' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
                    <div>
                        <BlenderViewport
                            height="500px"
                            onTransformChange={handleTransformChange}
                        />

                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                💡 Tip: Puedes usar el teclado presionando G, R o S seguido de X, Y o Z, o los botones del panel inferior.
                            </span>
                            <button
                                onClick={() => {
                                    const c = CHALLENGES_L2[currentChallengeIdx];
                                    markCompleted(c.id);
                                }}
                                style={{
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    border: '1px solid #38bdf8',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Validar Reto {currentChallengeIdx + 1}
                            </button>
                        </div>
                    </div>

                    {/* Misión y Lista de Retos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div
                            style={{
                                background: '#1e293b',
                                border: '1.5px solid rgba(236, 72, 153, 0.4)',
                                borderRadius: '16px',
                                padding: '1.25rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase' }}>
                                    Misión Activa ({currentChallengeIdx + 1} de {CHALLENGES_L2.length})
                                </span>
                                {completedChallenges[CHALLENGES_L2[currentChallengeIdx].id] && (
                                    <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle2 size={12} /> Completado
                                    </span>
                                )}
                            </div>

                            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 800 }}>
                                {CHALLENGES_L2[currentChallengeIdx].title}
                            </h4>

                            <p style={{ margin: '0 0 10px', color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.5 }}>
                                {CHALLENGES_L2[currentChallengeIdx].desc}
                            </p>

                            <div style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #38bdf8', padding: '8px 10px', borderRadius: '4px', marginBottom: '10px' }}>
                                <strong style={{ color: '#38bdf8', fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>
                                    Objetivo:
                                </strong>
                                <span style={{ color: '#f8fafc', fontSize: '0.82rem' }}>
                                    {CHALLENGES_L2[currentChallengeIdx].objective}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.76rem', background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <HelpCircle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                <span>{CHALLENGES_L2[currentChallengeIdx].hint}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                                <button
                                    disabled={currentChallengeIdx === 0}
                                    onClick={() => setCurrentChallengeIdx(prev => prev - 1)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        color: currentChallengeIdx === 0 ? '#64748b' : '#cbd5e1',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        fontSize: '0.75rem',
                                        cursor: currentChallengeIdx === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Anterior
                                </button>
                                <button
                                    disabled={currentChallengeIdx === CHALLENGES_L2.length - 1}
                                    onClick={() => setCurrentChallengeIdx(prev => prev + 1)}
                                    style={{
                                        background: 'rgba(236, 72, 153, 0.2)',
                                        color: currentChallengeIdx === CHALLENGES_L2.length - 1 ? '#64748b' : '#f8fafc',
                                        border: '1px solid rgba(236, 72, 153, 0.4)',
                                        borderRadius: '6px',
                                        padding: '4px 12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: currentChallengeIdx === CHALLENGES_L2.length - 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    Siguiente <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Hoja de Ruta */}
                        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
                                Hoja de Ruta de Práctica
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {CHALLENGES_L2.map((ch, idx) => (
                                    <div
                                        key={ch.id}
                                        onClick={() => setCurrentChallengeIdx(idx)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            background: idx === currentChallengeIdx ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                                            border: `1px solid ${idx === currentChallengeIdx ? 'rgba(236, 72, 153, 0.4)' : 'transparent'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.78rem', color: idx === currentChallengeIdx ? '#f8fafc' : '#94a3b8', fontWeight: idx === currentChallengeIdx ? 700 : 500 }}>
                                            {idx + 1}. {ch.title.split(':')[1] || ch.title}
                                        </span>
                                        {completedChallenges[ch.id] ? (
                                            <CheckCircle2 size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ background: '#1e293b', border: '1.5px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#38bdf8' }}>
                            Sandbox Libre de Primitivas y Transformación
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1' }}>
                            Experimenta alternando entre mallas básicas, estirando vértices, rotando en ángulos oblicuos y observando las coordenadas en vivo.
                        </p>
                    </div>
                    <BlenderViewport height="550px" />
                </div>
            )}
        </div>
    );
}
