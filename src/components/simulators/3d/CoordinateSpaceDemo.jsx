import React, { useState } from 'react';
import BlenderViewport from './BlenderViewport';
import { Compass, Eye, Move, Layers, Info, CheckCircle2, RefreshCw } from 'lucide-react';

/**
 * CoordinateSpaceDemo
 * Demostrador interactivo para la Lección 1 (Espacio 3D y Navegación en Blender).
 * Permite explorar los ejes X, Y, Z, planos de proyección y vistas ortográficas.
 */
export default function CoordinateSpaceDemo() {
    const [selectedPlane, setSelectedPlane] = useState('all'); // 'all' | 'xy' | 'xz' | 'yz'
    const [activeAxis, setActiveAxis] = useState('all'); // 'all' | 'x' | 'y' | 'z'
    const [targetObject, setTargetObject] = useState('cube');

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                border: '1.5px solid rgba(236, 72, 153, 0.35)',
                borderRadius: '20px',
                padding: '1.5rem',
                margin: '2rem 0',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)'
            }}
        >
            {/* Header del Laboratorio */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>🧭</span>
                        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontWeight: 800 }}>
                            Laboratorio Interactivo del Espacio Cartesiano 3D (Blender 4.x)
                        </h4>
                    </div>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Interactúa con la cámara 3D: rota, haz zoom, alterna entre proyección Perspectiva y Ortográfica, y observa cómo responden los ejes cartesianos.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid #ec4899', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                        Simulador WebGL
                    </span>
                </div>
            </div>

            {/* Viewport 3D Activo */}
            <BlenderViewport initialPrimitive={targetObject} height="420px" />

            {/* Tarjetas de Guía de los 3 Ejes de Blender */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '1.25rem' }}>
                {/* Eje X */}
                <div
                    style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '1.1rem' }}>Eje X · Rojo</span>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1px 6px', borderRadius: '4px' }}>
                            Horizontal
                        </span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                        Controla el <strong>Ancho</strong> (Izquierda a Derecha). En vista frontal se extiende de forma horizontal.
                    </p>
                </div>

                {/* Eje Y */}
                <div
                    style={{
                        background: 'rgba(34, 197, 94, 0.08)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#22c55e', fontWeight: 900, fontSize: '1.1rem' }}>Eje Y · Verde</span>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', padding: '1px 6px', borderRadius: '4px' }}>
                            Profundidad
                        </span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                        Controla la <strong>Profundidad</strong> (Adelante a Atrás). En Blender define el fondo del escenario.
                    </p>
                </div>

                {/* Eje Z */}
                <div
                    style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 900, fontSize: '1.1rem' }}>Eje Z · Azul</span>
                        <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '1px 6px', borderRadius: '4px' }}>
                            Altura (Z-Up)
                        </span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                        Controla la <strong>Altura</strong> (Arriba a Abajo). Blender utiliza la convención industrial <em>Z-Up</em>.
                    </p>
                </div>
            </div>

            {/* Cuadro Pedagógico: Perspectiva vs Ortográfica */}
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    marginTop: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                }}
            >
                <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '8px', borderRadius: '8px', color: '#ec4899', marginTop: '2px' }}>
                    <Info size={20} />
                </div>
                <div>
                    <h5 style={{ margin: '0 0 4px', color: '#f8fafc', fontSize: '0.95rem', fontWeight: 700 }}>
                        Diferencia Fundamental: Perspectiva vs Vista Ortográfica
                    </h5>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6 }}>
                        En <strong>Perspectiva</strong> los objetos lejanos se ven más pequeños debido a los puntos de fuga (como el ojo humano).  
                        En cambio, en <strong>Ortográfica</strong> (tecla <kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '1px 5px', color: '#f8fafc' }}>5</kbd> o <kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '1px 5px', color: '#f8fafc' }}>Numpad 5</kbd>) no hay distorsión de fuga: las líneas paralelas permanecen perfectamente paralelas. Esta vista es vital para alinear vértices y modelar con precisión milimétrica.
                    </p>
                </div>
            </div>
        </div>
    );
}
