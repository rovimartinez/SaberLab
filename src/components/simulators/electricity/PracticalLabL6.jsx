import React, { useState, useEffect } from 'react';
import { 
    GitFork, Award, CheckCircle2, XCircle, RotateCcw, 
    Zap, Eye, HelpCircle, Layers, ShieldCheck, Activity, ChevronRight
} from 'lucide-react';
import '../../../styles/ElectricitySimulators.css';

// Parámetros analíticos exactos del circuito del Examen 1
const EXAM_ITEMS = {
    // Parámetros Totales (10 pts)
    rt: { id: 'rt', label: 'Resistencia Total (Req)', expected: 360, unit: 'Ω', tol: 1.0, pts: 5, hint: 'Req = R1 + (R2 // (R4 + (R5 // R6 // (R7+R8)))) + R3 = 55 + 255 + 50 = 360 Ω' },
    it: { id: 'it', label: 'Corriente Total (IT)', expected: 0.0667, unit: 'A', tol: 0.003, pts: 5, hint: 'IT = Vf / Req = 24V / 360Ω = 0.0667 A' },

    // Voltajes (40 pts)
    vr1: { id: 'vr1', label: 'Voltaje en R1 (55Ω)', expected: 3.67, unit: 'V', tol: 0.1, pts: 5, hint: 'VR1 = IT × R1 = (1/15 A) × 55Ω = 3.67 V' },
    vr2: { id: 'vr2', label: 'Voltaje en R2 (340Ω)', expected: 17.00, unit: 'V', tol: 0.2, pts: 5, hint: 'VR2 = Vf - VR1 - VR3 = 24 - 3.67 - 3.33 = 17.0 V' },
    vr3: { id: 'vr3', label: 'Voltaje en R3 (50Ω)', expected: 3.33, unit: 'V', tol: 0.1, pts: 5, hint: 'VR3 = IT × R3 = (1/15 A) × 50Ω = 3.33 V' },
    vr4: { id: 'vr4', label: 'Voltaje en R4 (600Ω)', expected: 10.00, unit: 'V', tol: 0.2, pts: 5, hint: 'VR4 = IR4 × R4 = 0.01667 A × 600Ω = 10.0 V' },
    vr5: { id: 'vr5', label: 'Voltaje en R5 (1.8kΩ)', expected: 7.00, unit: 'V', tol: 0.2, pts: 5, hint: 'VR5 = VR2 - VR4 = 17.0V - 10.0V = 7.0 V' },
    vr6: { id: 'vr6', label: 'Voltaje en R6 (1.4kΩ)', expected: 7.00, unit: 'V', tol: 0.2, pts: 5, hint: 'R6 está en paralelo con R5 => VR6 = 7.0 V' },
    vr7: { id: 'vr7', label: 'Voltaje en R7 (400Ω)', expected: 3.11, unit: 'V', tol: 0.15, pts: 5, hint: 'VR7 = I78 × R7 = (7/900 A) × 400Ω = 3.11 V' },
    vr8: { id: 'vr8', label: 'Voltaje en R8 (500Ω)', expected: 3.89, unit: 'V', tol: 0.15, pts: 5, hint: 'VR8 = I78 × R8 = (7/900 A) × 500Ω = 3.89 V' },

    // Corrientes en Amperios (40 pts)
    ir1: { id: 'ir1', label: 'Corriente en R1 (55Ω)', expected: 0.0667, unit: 'A', tol: 0.003, pts: 5, hint: 'IR1 = IT = 0.0667 A' },
    ir2: { id: 'ir2', label: 'Corriente en R2 (340Ω)', expected: 0.050, unit: 'A', tol: 0.003, pts: 5, hint: 'IR2 = VR2 / R2 = 17V / 340Ω = 0.05 A' },
    ir3: { id: 'ir3', label: 'Corriente en R3 (50Ω)', expected: 0.0667, unit: 'A', tol: 0.003, pts: 5, hint: 'IR3 = IT = 0.0667 A' },
    ir4: { id: 'ir4', label: 'Corriente en R4 (600Ω)', expected: 0.0167, unit: 'A', tol: 0.002, pts: 5, hint: 'IR4 = IT - IR2 = 0.0667A - 0.050A = 0.0167 A' },
    ir5: { id: 'ir5', label: 'Corriente en R5 (1.8kΩ)', expected: 0.0039, unit: 'A', tol: 0.0006, pts: 5, hint: 'IR5 = 7V / 1800Ω = 0.00389 A' },
    ir6: { id: 'ir6', label: 'Corriente en R6 (1.4kΩ)', expected: 0.0050, unit: 'A', tol: 0.0006, pts: 5, hint: 'IR6 = 7V / 1400Ω = 0.005 A' },
    ir7: { id: 'ir7', label: 'Corriente en R7 (400Ω)', expected: 0.0078, unit: 'A', tol: 0.0006, pts: 5, hint: 'I78 = 7V / (400 + 500)Ω = 7V / 900Ω = 0.00778 A' },
    ir8: { id: 'ir8', label: 'Corriente en R8 (500Ω)', expected: 0.0078, unit: 'A', tol: 0.0006, pts: 5, hint: 'R8 está en serie con R7 => IR8 = IR7 = 0.00778 A' }
};

export const calculatePracticalScore = (practicalAnswers = {}) => {
    let score = 0;
    const itemResults = {};
    Object.keys(EXAM_ITEMS).forEach(k => {
        const item = EXAM_ITEMS[k];
        const raw = practicalAnswers[k];
        const valStr = raw !== undefined && raw !== null ? String(raw).trim().replace(',', '.') : '';
        let v = parseFloat(valStr);
        if (valStr !== '' && !isNaN(v)) {
            if (item.unit === 'A' && v > 1) v = v / 1000;
            const relErr = Math.abs(v - item.expected) / (item.expected || 1);
            const ok = Math.abs(v - item.expected) <= (item.tol || 0.1) || 
                       relErr <= 0.08 || 
                       (item.unit === 'V' && Math.abs(v - item.expected) <= 0.15) || 
                       (item.unit === 'A' && Math.abs(v - item.expected) <= 0.0015) ||
                       (item.unit === 'Ω' && Math.abs(v - item.expected) <= 2.5);
            itemResults[k] = { ok, pts: ok ? item.pts : 0, expected: item.expected, unit: item.unit, isFilled: true };
            if (ok) score += item.pts;
        } else {
            itemResults[k] = { ok: false, pts: 0, expected: item.expected, unit: item.unit, isFilled: false };
        }
    });
    return { score: Math.min(90, score), itemResults };
};

export default function PracticalLabL6({ showFeedback = false }) {
    const lessonId = 'ee-m1-l6';
    const [userAnswers, setUserAnswers] = useState(() => {
        try {
            const saved = localStorage.getItem(`practical_answers_${lessonId}`) || localStorage.getItem('practical_answers_EE-M1-L6');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [results, setResults] = useState({});
    const [selectedResistor, setSelectedResistor] = useState(null);

    // Cargar progreso desde D1 como respaldo
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/practice?lessonId=${lessonId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.answers) {
                        setUserAnswers(prev => {
                            const merged = { ...data.answers, ...prev };
                            localStorage.setItem(`practical_answers_${lessonId}`, JSON.stringify(merged));
                            return merged;
                        });
                    }
                }
            } catch (err) {
                console.error("Error cargando práctica L6:", err);
            }
        };
        fetchProgress();
    }, [lessonId]);

    // Calcular validaciones
    const practicalCalc = calculatePracticalScore(userAnswers);

    const handleInputChange = async (field, val) => {
        if (showFeedback) return;
        const nextAnswers = { ...userAnswers, [field]: val };
        setUserAnswers(nextAnswers);
        localStorage.setItem(`practical_answers_${lessonId}`, JSON.stringify(nextAnswers));
        localStorage.setItem('practical_answers_EE-M1-L6', JSON.stringify(nextAnswers));

        const calc = calculatePracticalScore(nextAnswers);
        setResults(calc.itemResults);

        try {
            await fetch('/api/practice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    type: 'challenge_attempt',
                    answers: nextAnswers,
                    score: calc.score
                })
            });
        } catch {
            // Silencioso
        }
    };

    const handleReset = () => {
        if (showFeedback) return;
        if (window.confirm('¿Deseas reiniciar todas tus respuestas de la práctica?')) {
            setUserAnswers({});
            setResults({});
            localStorage.removeItem(`practical_answers_${lessonId}`);
            localStorage.removeItem('practical_answers_EE-M1-L6');
        }
    };

    // Calcular puntaje total obtenido
    const totalScore = practicalCalc.score;
    const maxScore = 90;

    const renderInputCell = (fieldKey, unit, placeholder) => {
        const item = EXAM_ITEMS[fieldKey];
        const val = userAnswers[fieldKey];
        const isFilled = val !== undefined && val !== null && String(val).trim() !== '';
        const itemRes = practicalCalc.itemResults[fieldKey];
        const isOk = itemRes?.ok;

        let cellBg = isFilled ? 'rgba(14, 165, 233, 0.22)' : 'rgba(0, 0, 0, 0.5)';
        let cellBorder = isFilled ? '1.5px solid #38bdf8' : '1.5px solid rgba(255, 255, 255, 0.18)';
        let cellShadow = isFilled ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none';
        let unitColor = isFilled ? '#38bdf8' : '#94a3b8';
        let textColor = isFilled ? '#38bdf8' : 'white';

        if (showFeedback) {
            if (isOk) {
                cellBg = '#10b981'; // SÓLIDO 100%
                cellBorder = '2px solid #059669';
                cellShadow = '0 0 14px rgba(16, 185, 129, 0.6)';
                unitColor = '#ffffff';
                textColor = '#ffffff';
            } else {
                cellBg = '#ef4444'; // SÓLIDO 100%
                cellBorder = '2px solid #b91c1c';
                cellShadow = '0 0 14px rgba(239, 68, 68, 0.6)';
                unitColor = '#ffffff';
                textColor = '#ffffff';
            }
        }

        return (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '38px',
                    background: cellBg,
                    border: cellBorder,
                    borderRadius: '8px',
                    padding: '0 6px',
                    width: '100%',
                    boxSizing: 'border-box',
                    boxShadow: cellShadow,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <input
                        type="text"
                        inputMode="decimal"
                        disabled={showFeedback}
                        placeholder={placeholder || unit}
                        value={val || ''}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        style={{
                            width: '100%',
                            minWidth: 0,
                            height: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: textColor,
                            opacity: 1,
                            fontSize: '0.92rem',
                            fontFamily: 'monospace',
                            fontWeight: '900',
                            textAlign: 'center',
                            outline: 'none',
                            padding: 0
                        }}
                    />
                    <span style={{ fontSize: '0.74rem', color: unitColor, marginLeft: '3px', fontWeight: 900 }}>
                        {unit}
                    </span>
                </div>
            </div>
        );
    };

    const renderGivenCell = (text) => (
        <div style={{
            background: 'rgba(30, 41, 59, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {text}
            </span>
        </div>
    );

    return (
        <div className="practical-lab-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
            
            {/* Header del Laboratorio de Examen */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '20px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <ShieldCheck size={22} color="#f59e0b" />
                    <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                        EXAMEN 1 · FASE 2: RED MIXTA PRÁCTICA (90 PUNTOS)
                    </span>
                </div>
                <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                    Análisis Integral de Red Mixta de 8 Resistores
                </h2>
                <p style={{ color: '#94a3b8', margin: '0.4rem 0 0', fontSize: '0.88rem' }}>
                    Calcula los voltajes, corrientes y la resistencia equivalente total de la red con fuente de 24V.
                </p>
            </div>

            {/* ── CIRCUITO ESQUEMÁTICO SVG INTERACTIVO ── */}
            <div style={{
                background: 'radial-gradient(circle at center, #0f172a 0%, #060911 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '18px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>
                        ⚡ ESQUEMA OFICIAL DEL CIRCUITO DE EXAMEN
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Haz clic en un resistor para resaltar sus variables
                    </span>
                </div>

                <svg viewBox="0 0 820 380" width="100%" height="100%" style={{ maxHeight: '380px' }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="sourceGradL6" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <filter id="glowGlowL6">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* ── RIELES PRINCIPALES (AZUL ELÉCTRICO) ── */}
                    {/* Riel superior principal */}
                    <line x1="80" y1="60" x2="158" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="242" y1="60" x2="348" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="432" y1="60" x2="520" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="520" y1="60" x2="640" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="640" y1="60" x2="750" y2="60" stroke="#38bdf8" strokeWidth="2.5" />

                    {/* Riel inferior principal */}
                    <line x1="80" y1="320" x2="158" y2="320" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="242" y1="320" x2="520" y2="320" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="520" y1="320" x2="640" y2="320" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="640" y1="320" x2="750" y2="320" stroke="#38bdf8" strokeWidth="2.5" />

                    {/* Conexión de Fuente DC izquierda */}
                    <line x1="80" y1="60" x2="80" y2="152" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="80" y1="228" x2="80" y2="320" stroke="#38bdf8" strokeWidth="2.5" />

                    {/* Símbolo Fuente DC Vt = 24V */}
                    <g transform="translate(80, 190)">
                        <circle cx="0" cy="0" r="38" fill="url(#sourceGradL6)" stroke="#f59e0b" strokeWidth="2.5" />
                        <text x="0" y="-10" textAnchor="middle" fill="#ef4444" fontSize="20" fontWeight="900">+</text>
                        <text x="0" y="24" textAnchor="middle" fill="#38bdf8" fontSize="22" fontWeight="900">−</text>
                        <text x="-48" y="-5" textAnchor="end" fill="#f8fafc" fontSize="14" fontWeight="800">Vt</text>
                        <text x="-48" y="16" textAnchor="end" fill="#fbbf24" fontSize="14" fontWeight="900">24V</text>
                    </g>

                    {/* ── NODOS DE UNIÓN (AZUL ELÉCTRICO) ── */}
                    <circle cx="295" cy="60" r="4.5" fill="#38bdf8" />
                    <circle cx="295" cy="320" r="4.5" fill="#38bdf8" />
                    <circle cx="520" cy="60" r="4.5" fill="#38bdf8" />
                    <circle cx="520" cy="320" r="4.5" fill="#38bdf8" />
                    <circle cx="640" cy="60" r="4.5" fill="#38bdf8" />
                    <circle cx="640" cy="320" r="4.5" fill="#38bdf8" />
                    <circle cx="750" cy="60" r="4.5" fill="#38bdf8" />
                    <circle cx="750" cy="320" r="4.5" fill="#38bdf8" />

                    {/* ── RESISTOR R1 (55Ω - Superior Izq) ── */}
                    <g 
                        transform="translate(200, 60)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r1' ? null : 'r1')}
                    >
                        <rect x="-42" y="-18" width="84" height="36" rx="6" 
                              fill={selectedResistor === 'r1' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-3" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="900">R₁</text>
                        <text x="0" y="12" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">55 Ω</text>
                    </g>

                    {/* ── RESISTOR R3 (50Ω - Inferior Izq) ── */}
                    <g 
                        transform="translate(200, 320)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r3' ? null : 'r3')}
                    >
                        <rect x="-42" y="-18" width="84" height="36" rx="6" 
                              fill={selectedResistor === 'r3' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-3" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="900">R₃</text>
                        <text x="0" y="12" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">50 Ω</text>
                    </g>

                    {/* ── RESISTOR R2 (340Ω - Vertical 1) ── */}
                    <line x1="295" y1="60" x2="295" y2="155" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="295" y1="225" x2="295" y2="320" stroke="#38bdf8" strokeWidth="2.5" />
                    <g 
                        transform="translate(295, 190)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r2' ? null : 'r2')}
                    >
                        <rect x="-22" y="-35" width="44" height="70" rx="6" 
                              fill={selectedResistor === 'r2' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-5" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="900">R₂</text>
                        <text x="0" y="14" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontWeight="800">340 Ω</text>
                    </g>

                    {/* ── RESISTOR R4 (600Ω - Horizontal Superior 2) ── */}
                    <g 
                        transform="translate(390, 60)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r4' ? null : 'r4')}
                    >
                        <rect x="-42" y="-18" width="84" height="36" rx="6" 
                              fill={selectedResistor === 'r4' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-3" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="900">R₄</text>
                        <text x="0" y="12" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="800">600 Ω</text>
                    </g>

                    {/* ── RESISTOR R5 (1.8kΩ - Vertical 2) ── */}
                    <line x1="520" y1="60" x2="520" y2="155" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="520" y1="225" x2="520" y2="320" stroke="#38bdf8" strokeWidth="2.5" />
                    <g 
                        transform="translate(520, 190)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r5' ? null : 'r5')}
                    >
                        <rect x="-24" y="-35" width="48" height="70" rx="6" 
                              fill={selectedResistor === 'r5' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-5" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="900">R₅</text>
                        <text x="0" y="14" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontWeight="800">1.8 kΩ</text>
                    </g>

                    {/* ── RESISTOR R6 (1.4kΩ - Vertical 3) ── */}
                    <line x1="640" y1="60" x2="640" y2="155" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="640" y1="225" x2="640" y2="320" stroke="#38bdf8" strokeWidth="2.5" />
                    <g 
                        transform="translate(640, 190)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r6' ? null : 'r6')}
                    >
                        <rect x="-24" y="-35" width="48" height="70" rx="6" 
                              fill={selectedResistor === 'r6' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-5" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="900">R₆</text>
                        <text x="0" y="14" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontWeight="800">1.4 kΩ</text>
                    </g>

                    {/* ── RAMA DERECHA EN SERIE: R7 (400Ω) + R8 (500Ω) ── */}
                    <line x1="750" y1="60" x2="750" y2="107" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="750" y1="163" x2="750" y2="217" stroke="#38bdf8" strokeWidth="2.5" />
                    <line x1="750" y1="273" x2="750" y2="320" stroke="#38bdf8" strokeWidth="2.5" />

                    {/* R7 */}
                    <g 
                        transform="translate(750, 135)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r7' ? null : 'r7')}
                    >
                        <rect x="-22" y="-28" width="44" height="56" rx="6" 
                              fill={selectedResistor === 'r7' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-3" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="900">R₇</text>
                        <text x="0" y="13" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="800">400 Ω</text>
                    </g>

                    {/* R8 */}
                    <g 
                        transform="translate(750, 245)" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedResistor(selectedResistor === 'r8' ? null : 'r8')}
                    >
                        <rect x="-22" y="-28" width="44" height="56" rx="6" 
                              fill={selectedResistor === 'r8' ? '#0284c7' : '#1e293b'} 
                              stroke="#38bdf8" strokeWidth="2" />
                        <text x="0" y="-3" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="900">R₈</text>
                        <text x="0" y="13" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="800">500 Ω</text>
                    </g>

                </svg>
            </div>

            {/* ── CONTENIDO PRINCIPAL: EVALUACIÓN Y RESOLUCIÓN ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Barra de Control y Progreso de la Tabla */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '0.9rem 1.25rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{
                                background: 'rgba(56, 189, 248, 0.15)',
                                color: '#38bdf8',
                                padding: '0.5rem 1rem',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                border: '1px solid rgba(56, 189, 248, 0.3)'
                            }}>
                                📝 Campos Completados: {Object.keys(EXAM_ITEMS).filter(k => userAnswers[k] !== undefined && userAnswers[k] !== null && String(userAnswers[k]).trim() !== '').length} de {Object.keys(EXAM_ITEMS).length}
                            </div>
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '12px',
                                padding: '0.5rem 1rem',
                                color: '#fbbf24',
                                fontWeight: 800,
                                fontSize: '0.92rem'
                            }}>
                                ⚡ 18 campos × 5 pts = 90 Pts
                            </div>
                        </div>
                    </div>

                    {/* ── TABLA MATRIZ DE MAGNITUDES ELÉCTRICAS ── */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        borderRadius: '18px',
                        padding: '1rem'
                    }}>
                        <table style={{
                            width: '100%',
                            tableLayout: 'fixed',
                            borderCollapse: 'separate',
                            borderSpacing: '0.35rem',
                            textAlign: 'center'
                        }}>
                            <thead>
                                <tr>
                                    {['TOTAL', 'R₁', 'R₂', 'R₃', 'R₄', 'R₅', 'R₆', 'R₇', 'R₈'].map((header, idx) => (
                                        <th 
                                            key={idx} 
                                            style={{
                                                background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                                color: '#0f172a',
                                                height: '38px',
                                                padding: '0 0.2rem',
                                                borderRadius: '8px',
                                                fontSize: '0.88rem',
                                                fontWeight: 900,
                                                border: 'none',
                                                boxShadow: '0 2px 10px rgba(56, 189, 248, 0.4)',
                                                verticalAlign: 'middle'
                                            }}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* ── FILA 1: RESISTENCIA (Ω) ── */}
                                <tr>
                                    <td>{renderInputCell('rt', 'Ω', 'Req')}</td>
                                    <td>{renderGivenCell('55 Ω')}</td>
                                    <td>{renderGivenCell('340 Ω')}</td>
                                    <td>{renderGivenCell('50 Ω')}</td>
                                    <td>{renderGivenCell('600 Ω')}</td>
                                    <td>{renderGivenCell('1800 Ω')}</td>
                                    <td>{renderGivenCell('1400 Ω')}</td>
                                    <td>{renderGivenCell('400 Ω')}</td>
                                    <td>{renderGivenCell('500 Ω')}</td>
                                </tr>

                                {/* ── FILA 2: VOLTAJE (V) ── */}
                                <tr>
                                    <td>{renderGivenCell('24 V')}</td>
                                    <td>{renderInputCell('vr1', 'V', 'VR1')}</td>
                                    <td>{renderInputCell('vr2', 'V', 'VR2')}</td>
                                    <td>{renderInputCell('vr3', 'V', 'VR3')}</td>
                                    <td>{renderInputCell('vr4', 'V', 'VR4')}</td>
                                    <td>{renderInputCell('vr5', 'V', 'VR5')}</td>
                                    <td>{renderInputCell('vr6', 'V', 'VR6')}</td>
                                    <td>{renderInputCell('vr7', 'V', 'VR7')}</td>
                                    <td>{renderInputCell('vr8', 'V', 'VR8')}</td>
                                </tr>

                                {/* ── FILA 3: CORRIENTE (A) ── */}
                                <tr>
                                    <td>{renderInputCell('it', 'A', 'IT')}</td>
                                    <td>{renderInputCell('ir1', 'A', 'IR1')}</td>
                                    <td>{renderInputCell('ir2', 'A', 'IR2')}</td>
                                    <td>{renderInputCell('ir3', 'A', 'IR3')}</td>
                                    <td>{renderInputCell('ir4', 'A', 'IR4')}</td>
                                    <td>{renderInputCell('ir5', 'A', 'IR5')}</td>
                                    <td>{renderInputCell('ir6', 'A', 'IR6')}</td>
                                    <td>{renderInputCell('ir7', 'A', 'IR7')}</td>
                                    <td>{renderInputCell('ir8', 'A', 'IR8')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
        </div>
    );
}
