import React, { useState, useEffect } from 'react';
import BlenderViewport from './BlenderViewport';
import {
    CheckCircle2,
    Award,
    RotateCcw,
    Sparkles,
    ChevronRight,
    HelpCircle,
    Target,
    Compass,
    Eye,
    Move,
    Maximize,
    Box
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CHALLENGES = [
    {
        id: 1,
        title: 'Reto 1: Dominio de la Vista Frontal y Ortográfica',
        desc: 'En modelado 3D con Blender, la vista Frontal Ortográfica (Numpad 1 + 5) permite alinear siluetas sin distorsión de perspectiva.',
        objective: 'Presiona "Frente" (o tecla 1) y activa el modo "Orto" (o tecla 5).',
        hint: 'Usa los botones "Frente" y "Orto" en la barra superior del viewport.',
        check: (state) => state.isOrtho
    },
    {
        id: 2,
        title: 'Reto 2: Inspección en Modo Wireframe (Alambre)',
        desc: 'El modo de sombreado Wireframe revela la malla poligonal subyacente de cualquier objeto 3D.',
        objective: 'Alterna el modo de sombreado a "Wire" (Wireframe).',
        hint: 'Haz clic en el botón "Wire" en la sección de sombreado (arriba a la derecha).',
        check: (state) => state.shading === 'wireframe'
    },
    {
        id: 3,
        title: 'Reto 3: Traslación y Restricción de Eje X (G + X)',
        desc: 'Mover objetos con precisión requiere trasladar a lo largo de un eje específico.',
        objective: 'Mueve el objeto en el Eje X hasta una posición de al menos +1.5 unidades.',
        hint: 'Haz clic en "X: ..." en el panel de telemetría o presiona el botón X varias veces.',
        check: (state) => state.pos.x >= 1.5
    },
    {
        id: 4,
        title: 'Reto 4: Escala de Precisión (S)',
        desc: 'Escalar un objeto permite adaptar sus proporciones al tamaño requerido por el proyecto.',
        objective: 'Aumenta la escala del objeto en cualquier eje a 1.6× o superior.',
        hint: 'Haz clic en "Scl (S)" para aumentar la escala del objeto.',
        check: (state) => state.scale.x >= 1.6 || state.scale.y >= 1.6 || state.scale.z >= 1.6
    },
    {
        id: 5,
        title: 'Reto 5: Exploración de Primitivas (Esfera UV)',
        desc: 'Cada objeto complejo en 3D comienza a partir de una primitiva básica.',
        objective: 'Cambia la primitiva activa a "Esfera UV".',
        hint: 'Abre el selector desplegable de primitivas (arriba a la izquierda) y elige "Esfera UV".',
        check: (state) => state.primitive === 'sphere'
    }
];

export default function PracticalLabMA1() {
    const lessonId = 'ma-m1-l1';
    const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState({});
    const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'sandbox'

    // Estado simulado recibido del viewport para validar retos
    const [viewportTelemetry, setViewportTelemetry] = useState({
        primitive: 'cube',
        shading: 'solid',
        isOrtho: false,
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    });

    // Cargar progreso guardado
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

    // Guardar progreso al completar retos
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
            particleCount: 70,
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

        // Validar reto actual
        const currentChallenge = CHALLENGES[currentChallengeIdx];
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
    const progressPercent = Math.round((completedCount / CHALLENGES.length) * 100);

    return (
        <div style={{ width: '100%', maxWidth: '1050px', margin: '0 auto', color: '#f8fafc' }}>
            {/* Cabecera del Laboratorio */}
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
                            <Compass size={28} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                                Laboratorio Práctico: Espacio Cartesiano y Navegación
                            </h3>
                            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                                Resuelve los 5 retos guiados de navegación y manipulación 3D para dominar los fundamentos de Blender.
                            </p>
                        </div>
                    </div>

                    {/* Barra de Progreso y Puntuación */}
                    <div style={{ textAlign: 'right', minWidth: '180px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Progreso de Retos:</span>
                            <strong style={{ color: '#ec4899' }}>{completedCount}/{CHALLENGES.length} ({progressPercent}%)</strong>
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

                {/* Selector de Pestañas: Retos vs Sandbox */}
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
                        <Target size={15} /> Retos Guiados (5)
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
                        <Sparkles size={15} /> Sandbox 3D Libre
                    </button>
                </div>
            </div>

            {/* Contenido Principal */}
            {activeTab === 'challenges' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
                    {/* Columna Izquierda: Viewport 3D */}
                    <div>
                        <BlenderViewport
                            height="500px"
                            onTransformChange={handleTransformChange}
                        />

                        {/* Botón de validación manual / forzar chequeo */}
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                💡 Tip: Puedes usar tanto los botones en pantalla como los atajos en el teclado.
                            </span>
                            <button
                                onClick={() => {
                                    const c = CHALLENGES[currentChallengeIdx];
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

                    {/* Columna Derecha: Tarjeta de Reto Activo y Lista */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Tarjeta del Reto Activo */}
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
                                    Misión Activa ({currentChallengeIdx + 1} de {CHALLENGES.length})
                                </span>
                                {completedChallenges[CHALLENGES[currentChallengeIdx].id] && (
                                    <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle2 size={12} /> Completado
                                    </span>
                                )}
                            </div>

                            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 800 }}>
                                {CHALLENGES[currentChallengeIdx].title}
                            </h4>

                            <p style={{ margin: '0 0 10px', color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.5 }}>
                                {CHALLENGES[currentChallengeIdx].desc}
                            </p>

                            <div style={{ background: 'rgba(0,0,0,0.3)', borderLeft: '3px solid #38bdf8', padding: '8px 10px', borderRadius: '4px', marginBottom: '10px' }}>
                                <strong style={{ color: '#38bdf8', fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>
                                    Objetivo:
                                </strong>
                                <span style={{ color: '#f8fafc', fontSize: '0.82rem' }}>
                                    {CHALLENGES[currentChallengeIdx].objective}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.76rem', background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                                <HelpCircle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                <span>{CHALLENGES[currentChallengeIdx].hint}</span>
                            </div>

                            {/* Botones de Navegación entre Retos */}
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
                                    disabled={currentChallengeIdx === CHALLENGES.length - 1}
                                    onClick={() => setCurrentChallengeIdx(prev => prev + 1)}
                                    style={{
                                        background: 'rgba(236, 72, 153, 0.2)',
                                        color: currentChallengeIdx === CHALLENGES.length - 1 ? '#64748b' : '#f8fafc',
                                        border: '1px solid rgba(236, 72, 153, 0.4)',
                                        borderRadius: '6px',
                                        padding: '4px 12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: currentChallengeIdx === CHALLENGES.length - 1 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    Siguiente <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Lista de Todos los Retos con Estado */}
                        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
                                Hoja de Ruta de Práctica
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {CHALLENGES.map((ch, idx) => (
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
                /* Sandbox 3D Libre */
                <div style={{ background: '#1e293b', border: '1.5px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
                    <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#38bdf8' }}>
                            Modo Sandbox Libre
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1' }}>
                            Aquí no hay límites ni misiones: prueba todas las primitivas de Blender, rota la cámara con libertad, cambia los modos de sombreado y practica las transformaciones antes de tu examen.
                        </p>
                    </div>
                    <BlenderViewport height="550px" />
                </div>
            )}
        </div>
    );
}
