import React, { useState, useMemo } from 'react';
import { 
    Calculator, Flame, FlaskConical, Award, Users, Clock, 
    Calendar, CheckCircle2, MessageCircle, ArrowRight, ShieldCheck, 
    Layers, BookOpen, ChevronRight, X 
} from 'lucide-react';
import '../../styles/SimiServices.css';

export default function SimiQuoteModal({
    isOpen = false,
    onClose = () => {},
    profile = null,
    defaultTab = 'fabricacion' // 'fabricacion' | 'capacitacion'
}) {
    const [quoteType, setQuoteType] = useState(defaultTab);

    React.useEffect(() => {
        if (defaultTab) {
            setQuoteType(defaultTab);
        }
    }, [defaultTab, isOpen]);

    // ── 1. ESTADO COTIZADOR DE FABRICACIÓN / IMPRESIÓN 3D ──
    const [calcGrams, setCalcGrams] = useState(60);
    const [calcMaterial, setCalcMaterial] = useState('pla');
    const [calcInfill, setCalcInfill] = useState(20);
    const [calcUnits, setCalcUnits] = useState(1);

    const MATERIAL_COSTS = {
        pla: { name: 'PLA+ Estándar', pricePerGram: 80, minOrder: 10000, tech: 'FDM (Filamento)', icon: Flame, color: '#f59e0b' },
        petg: { name: 'PETG Mecánico', pricePerGram: 100, minOrder: 12000, tech: 'FDM (Alta Resistencia)', icon: Flame, color: '#06b6d4' },
        tpu: { name: 'TPU Flexible 95A', pricePerGram: 140, minOrder: 15000, tech: 'FDM (Goma / Elástico)', icon: Flame, color: '#ec4899' },
        resina: { name: 'Resina Fotosensible UV 4K', pricePerGram: 180, minOrder: 20000, tech: 'SLA (Ultra Precisión)', icon: FlaskConical, color: '#8b5cf6' }
    };

    const calculatedFabPrice = useMemo(() => {
        const mat = MATERIAL_COSTS[calcMaterial] || MATERIAL_COSTS.pla;
        const baseCost = calcGrams * mat.pricePerGram * calcUnits;
        return Math.max(mat.minOrder * calcUnits, Math.round(baseCost / 1000) * 1000);
    }, [calcGrams, calcMaterial, calcUnits]);

    // ── 2. ESTADO COTIZADOR DE CAPACITACIONES & TALLERES STEAM ──
    const [capTrack, setCapTrack] = useState('junior'); // 'junior', 'secundaria', 'universitaria', 'docente'
    const [capStudents, setCapStudents] = useState(20);
    const [capHours, setCapHours] = useState(4);
    const [capModality, setCapModality] = useState('presencial'); // 'presencial', 'virtual'

    const CAPACITACION_TRACKS = {
        junior: {
            id: 'junior',
            name: 'Semillero Junior (Primaria · 7-11 años)',
            software: 'Tinkercad 3D & Geometría',
            baseHourlyPerStudent: 12000,
            badge: 'Junior Makers',
            color: '#f97316'
        },
        secundaria: {
            id: 'secundaria',
            name: 'Creativos STEAM (Secundaria · 12-17 años)',
            software: 'Blender 3D & Cura/Orca Slicers',
            baseHourlyPerStudent: 15000,
            badge: 'STEAM Bachillerato',
            color: '#ec4899'
        },
        universitaria: {
            id: 'universitaria',
            name: 'Formación Técnica & Universitaria',
            software: 'Autodesk Fusion 360 Paramétrico & DFAM',
            baseHourlyPerStudent: 20000,
            badge: 'CAD Avanzado',
            color: '#06b6d4'
        },
        docente: {
            id: 'docente',
            name: 'Formación Docente (Train the Trainers)',
            software: 'Aulas Maker, Currículo STEM & Mantenimiento',
            baseHourlyPerStudent: 25000,
            badge: 'Acreditación Docente',
            color: '#10b981'
        }
    };

    const calculatedCapPrice = useMemo(() => {
        const track = CAPACITACION_TRACKS[capTrack] || CAPACITACION_TRACKS.junior;
        const discountFactor = capStudents >= 30 ? 0.75 : capStudents >= 15 ? 0.85 : 1.0;
        const modalityFactor = capModality === 'virtual' ? 0.8 : 1.0;
        const raw = capStudents * capHours * track.baseHourlyPerStudent * discountFactor * modalityFactor;
        return Math.max(150000, Math.round(raw / 10000) * 10000);
    }, [capTrack, capStudents, capHours, capModality]);

    if (!isOpen) return null;

    const userName = profile?.full_name || profile?.name || 'Maker Solicitante';
    const userEmail = profile?.email || '';

    // Enlace de WhatsApp para Fabricación 3D
    const generateFabWhatsApp = () => {
        const mat = MATERIAL_COSTS[calcMaterial] || MATERIAL_COSTS.pla;
        const msg = encodeURIComponent(
            `👋 *¡Hola Semillero SIMI3D!*\n` +
            `Deseo cotizar un servicio de *Fabricación / Impresión 3D*:\n\n` +
            `⚙️ *Material:* ${mat.name} (${mat.tech})\n` +
            `⚖️ *Peso Estimado:* ~${calcGrams}g por unidad\n` +
            `📦 *Cantidad de Piezas:* ${calcUnits} unidad(es)\n` +
            `📊 *Relleno (Infill):* ${calcInfill}%\n` +
            `💰 *Presupuesto Orientativo:* $${calculatedFabPrice.toLocaleString()} COP\n` +
            `👤 *Solicitante:* ${userName} (${userEmail})\n\n` +
            `Adjunto mi archivo .STL / .STEP para validar tiempo y geometría final.`
        );
        return `https://wa.me/573000000000?text=${msg}`;
    };

    // Enlace de WhatsApp para Capacitaciones STEAM
    const generateCapWhatsApp = () => {
        const track = CAPACITACION_TRACKS[capTrack] || CAPACITACION_TRACKS.junior;
        const msg = encodeURIComponent(
            `👋 *¡Hola Semillero SIMI3D!*\n` +
            `Deseo cotizar un *Taller / Capacitación STEAM*:\n\n` +
            `🎓 *Programa:* ${track.name}\n` +
            `💻 *Enfoque / Software:* ${track.software}\n` +
            `👥 *Número de Estudiantes / Participantes:* ${capStudents} personas\n` +
            `⏱️ *Intensidad Horaria:* ${capHours} horas\n` +
            `🏫 *Modalidad:* ${capModality === 'presencial' ? 'Presencial en Institución / Aula Maker' : 'Virtual en Vivo'}\n` +
            `💰 *Presupuesto Orientativo Estimado:* $${calculatedCapPrice.toLocaleString()} COP\n` +
            `👤 *Solicitante / Institución:* ${userName} (${userEmail})\n\n` +
            `¿Podrían indicarme disponibilidad de agenda y temario detallado? ¡Muchas gracias!`
        );
        return `https://wa.me/573000000000?text=${msg}`;
    };

    return (
        <div className="simi-modal-backdrop" onClick={onClose}>
            <div 
                className="simi-modal-card simi-quote-modal-card animate-fade-in" 
                onClick={e => e.stopPropagation()}
            >
                {/* Cabecera del Modal */}
                <div className="simi-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="simi-quote-modal-icon-badge">
                            <Calculator size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.22rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                                Cotizador Orientativo <span className="simi-services-gradient-text">SIMI3D</span>
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Estimación rápida para Fabricación Digital y Capacitaciones STEAM
                            </span>
                        </div>
                    </div>
                    <button className="simi-modal-close-btn" onClick={onClose} title="Cerrar Cotizador">
                        <X size={20} />
                    </button>
                </div>

                {/* Selector de Tipo de Cotización (Tabs Superiores) */}
                <div className="simi-quote-type-selector">
                    <button
                        className={`simi-quote-type-btn ${quoteType === 'fabricacion' ? 'active' : ''}`}
                        onClick={() => setQuoteType('fabricacion')}
                    >
                        <Flame size={16} />
                        <span>🖨️ Fabricación & Prototipado 3D</span>
                    </button>
                    <button
                        className={`simi-quote-type-btn ${quoteType === 'capacitacion' ? 'active' : ''}`}
                        onClick={() => setQuoteType('capacitacion')}
                    >
                        <Award size={16} />
                        <span>🎓 Talleres & Capacitaciones STEAM</span>
                    </button>
                </div>

                <div className="simi-quote-modal-body">
                    {/* ── 1. COTIZADOR DE FABRICACIÓN ── */}
                    {quoteType === 'fabricacion' && (
                        <div className="simi-quote-section-grid animate-fade-in">
                            {/* Material */}
                            <div className="simi-calc-field">
                                <label className="simi-calc-label">1. Selecciona Material & Tecnología:</label>
                                <div className="simi-quote-materials-grid">
                                    {Object.entries(MATERIAL_COSTS).map(([key, mat]) => (
                                        <button
                                            key={key}
                                            className={`simi-calc-mat-pill ${calcMaterial === key ? 'active' : ''}`}
                                            onClick={() => setCalcMaterial(key)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ fontSize: '0.85rem' }}>{key === 'resina' ? '🧪' : '🔥'}</span>
                                                <strong>{mat.name}</strong>
                                            </div>
                                            <small>{mat.tech} · ${mat.pricePerGram}/g</small>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Gramos y Cantidad */}
                            <div className="simi-form-row-2">
                                <div className="simi-calc-field">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="simi-calc-label">2. Peso Estimado:</label>
                                        <span className="simi-calc-val-highlight">{calcGrams} gramos / pieza</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min={5}
                                        max={500}
                                        step={5}
                                        value={calcGrams}
                                        onChange={(e) => setCalcGrams(Number(e.target.value))}
                                        className="simi-calc-range-slider"
                                    />
                                    <div className="simi-calc-slider-scale">
                                        <span>5g (Llavero)</span>
                                        <span>120g (Carcasa)</span>
                                        <span>500g (Ensamble)</span>
                                    </div>
                                </div>

                                <div className="simi-calc-field">
                                    <label className="simi-calc-label">3. Cantidad de Piezas:</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input 
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={calcUnits}
                                            onChange={(e) => setCalcUnits(Math.max(1, Number(e.target.value)))}
                                            style={{
                                                width: '100%',
                                                padding: '0.48rem 0.8rem',
                                                borderRadius: '8px',
                                                border: '1.5px solid var(--border-default)',
                                                background: 'var(--surface-card)',
                                                color: 'var(--text-heading)',
                                                fontWeight: 800,
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>unidad(es)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Relleno */}
                            <div className="simi-calc-field">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="simi-calc-label">4. Densidad de Relleno (Infill):</label>
                                    <span className="simi-calc-val-highlight">{calcInfill}%</span>
                                </div>
                                <div className="simi-calc-infill-pills">
                                    {[15, 20, 30, 50, 100].map(inf => (
                                        <button
                                            key={inf}
                                            className={`simi-calc-inf-btn ${calcInfill === inf ? 'active' : ''}`}
                                            onClick={() => setCalcInfill(inf)}
                                        >
                                            {inf}% {inf === 20 ? '(Estándar)' : inf === 100 ? '(Sólido)' : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Banner de Presupuesto */}
                            <div className="simi-quote-summary-banner">
                                <div>
                                    <span className="simi-quote-summary-sub">Presupuesto Estimado ({calcUnits} pieza{calcUnits > 1 ? 's' : ''}):</span>
                                    <div className="simi-quote-summary-price">
                                        ${calculatedFabPrice.toLocaleString()} <small>COP</small>
                                    </div>
                                    <p className="simi-calc-res-disclaimer">
                                        *Incluye post-procesado básico. El valor final se valida con el archivo 3D.
                                    </p>
                                </div>

                                <a 
                                    href={generateFabWhatsApp()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="simi-quote-whatsapp-submit"
                                >
                                    <MessageCircle size={17} />
                                    <span>Enviar Cotización a WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* ── 2. COTIZADOR DE CAPACITACIONES STEAM ── */}
                    {quoteType === 'capacitacion' && (
                        <div className="simi-quote-section-grid animate-fade-in">
                            {/* Nivel / Programa */}
                            <div className="simi-calc-field">
                                <label className="simi-calc-label">1. Selecciona el Programa o Nivel:</label>
                                <div className="simi-quote-tracks-grid">
                                    {Object.entries(CAPACITACION_TRACKS).map(([key, track]) => (
                                        <button
                                            key={key}
                                            className={`simi-calc-mat-pill ${capTrack === key ? 'active' : ''}`}
                                            onClick={() => setCapTrack(key)}
                                        >
                                            <strong style={{ color: track.color }}>{track.name}</strong>
                                            <small>{track.software}</small>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="simi-form-row-2">
                                {/* Número de Estudiantes */}
                                <div className="simi-calc-field">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="simi-calc-label">2. Número de Participantes:</label>
                                        <span className="simi-calc-val-highlight">{capStudents} personas</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min={5}
                                        max={60}
                                        step={5}
                                        value={capStudents}
                                        onChange={(e) => setCapStudents(Number(e.target.value))}
                                        className="simi-calc-range-slider"
                                    />
                                    <div className="simi-calc-slider-scale">
                                        <span>5 cupos</span>
                                        <span>25 (Salón)</span>
                                        <span>60 (Auditorio)</span>
                                    </div>
                                </div>

                                {/* Horas */}
                                <div className="simi-calc-field">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="simi-calc-label">3. Intensidad Horaria:</label>
                                        <span className="simi-calc-val-highlight">{capHours} horas</span>
                                    </div>
                                    <div className="simi-calc-infill-pills">
                                        {[2, 4, 8, 16].map(hrs => (
                                            <button
                                                key={hrs}
                                                className={`simi-calc-inf-btn ${capHours === hrs ? 'active' : ''}`}
                                                onClick={() => setCapHours(hrs)}
                                            >
                                                {hrs}h {hrs === 4 ? '(1 Jornada)' : hrs === 8 ? '(2 Jornadas)' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modalidad */}
                            <div className="simi-calc-field">
                                <label className="simi-calc-label">4. Modalidad del Taller:</label>
                                <div className="simi-quote-modality-pills">
                                    <button
                                        className={`simi-quote-mod-btn ${capModality === 'presencial' ? 'active' : ''}`}
                                        onClick={() => setCapModality('presencial')}
                                    >
                                        🏫 Presencial en Institución / Laboratorio
                                    </button>
                                    <button
                                        className={`simi-quote-mod-btn ${capModality === 'virtual' ? 'active' : ''}`}
                                        onClick={() => setCapModality('virtual')}
                                    >
                                        🌐 Virtual en Vivo con Guías Maker
                                    </button>
                                </div>
                            </div>

                            {/* Banner de Presupuesto Capacitación */}
                            <div className="simi-quote-summary-banner">
                                <div>
                                    <span className="simi-quote-summary-sub">Presupuesto Estimado ({capStudents} alumnos · {capHours}h):</span>
                                    <div className="simi-quote-summary-price">
                                        ${calculatedCapPrice.toLocaleString()} <small>COP</small>
                                    </div>
                                    <p className="simi-calc-res-disclaimer">
                                        *Incluye guías digitales y certificado. Descuento institucional aplicado por grupo.
                                    </p>
                                </div>

                                <a 
                                    href={generateCapWhatsApp()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="simi-quote-whatsapp-submit"
                                >
                                    <MessageCircle size={17} />
                                    <span>Solicitar Propuesta a WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
