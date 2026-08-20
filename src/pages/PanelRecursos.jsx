import React, { useState, useMemo } from 'react';
import { 
    FolderOpen, FileText, Video, ExternalLink, Play, 
    Book, Link as LinkIcon, Zap, Bot, Search, 
    Layers, Sparkles, X, Globe, Cpu, Wrench, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import '../styles/PanelRecursos.css';

// ── BANCO DE RECURSOS EXTERNOS OFICIALES, CANALES Y FUENTES CONFIABLES ──
const OFFICIAL_EXTERNAL_RESOURCES = [
    // ════════════════════════════════════════════════════════════════════
    // ⚡ ELECTRICIDAD Y ELECTRÓNICA BÁSICA (EE)
    // ════════════════════════════════════════════════════════════════════
    {
        id: 'ee-vid-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Ley de Ohm y Conceptos Fundamentales de Circuitos',
        source: 'Khan Academy en Español',
        sourceType: 'YouTube',
        description: 'Explicación conceptual y matemática de la relación entre Voltaje (V), Corriente (I) y Resistencia (R) con demostraciones visuales y ejercicios.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=m7hyE1Tq-o8',
        videoId: 'm7hyE1Tq-o8',
        tags: ['Ley de Ohm', 'Khan Academy', 'Voltaje', 'Corriente']
    },
    {
        id: 'ee-vid-2',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Leyes de Kirchhoff: Método de Mallas y Nodos',
        source: 'JulioProfe Oficial',
        sourceType: 'YouTube',
        description: 'Resolución paso a paso de circuitos eléctricos complejos aplicando la Ley de Corrientes de Kirchhoff (LCK) y Ley de Voltajes de Kirchhoff (LVK).',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=0k0w6l7oYmE',
        videoId: '0k0w6l7oYmE',
        tags: ['Kirchhoff', 'Mallas', 'Nodos', 'JulioProfe']
    },
    {
        id: 'ee-vid-3',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Laboratorio de Multímetro: Medición de Voltaje, Corriente y Resistencia',
        source: 'El Profe García',
        sourceType: 'YouTube',
        description: 'Guía práctica para medir voltaje DC en paralelo, corriente en serie sin fundir el fusible, y pruebas de continuidad y resistencia.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=R9Z8X7e9r4w',
        videoId: 'R9Z8X7e9r4w',
        tags: ['Multímetro', 'Protoboard', 'El Profe García', 'Mediciones']
    },
    {
        id: 'ee-sim-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'PhET: Kit de Construcción de Circuitos DC',
        source: 'Universidad de Colorado Boulder',
        sourceType: 'Simulador PhET',
        description: 'Laboratorio virtual interactivo de física para armar circuitos serie, paralelo y mixtos con baterías, bombillas, interruptores y voltímetros en tiempo real.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://phet.colorado.edu/es/simulations/circuit-construction-kit-dc',
        tags: ['PhET Colorado', 'Simulación DC', 'Interactivo']
    },
    {
        id: 'ee-sim-2',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Falstad Circuit Simulator Online',
        source: 'Paul Falstad Simulator',
        sourceType: 'Simulador Web',
        description: 'Potente simulador electrónico en tiempo real con animación de corrientes eléctricas, osciloscopio virtual y cientos de esquemas electrónicos.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://www.falstad.com/circuit/',
        tags: ['Falstad', 'Osciloscopio', 'Electrónica Analógica']
    },
    {
        id: 'ee-sim-3',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Autodesk Tinkercad Circuits',
        source: 'Autodesk',
        sourceType: 'Plataforma 3D',
        description: 'Simulador de protoboards 3D interactivo con componentes electrónicos reales, multímetros digitales, fuentes de alimentación y osciloscopios.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://www.tinkercad.com/circuits',
        tags: ['Tinkercad', 'Autodesk', 'Protoboard 3D']
    },
    {
        id: 'ee-tool-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Calculadora Oficial de Código de Colores de Resistencias',
        source: 'Digi-Key Electronics',
        sourceType: 'Calculadora Técnica',
        description: 'Herramienta interactiva de Digi-Key para decodificar resistencias de 4, 5 y 6 bandas con valores comerciales de tolerancia y multiplicadores.',
        category: 'tools',
        type: 'Calculadora',
        url: 'https://www.digikey.com/es/resources/conversion-calculators/conversion-calculator-resistor-color-code',
        tags: ['Digi-Key', 'Código de Colores', 'Calculadora']
    },
    {
        id: 'ee-doc-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Libro Abierto de Circuitos de Corriente Continua (DC)',
        source: 'All About Circuits',
        sourceType: 'Documentación Oficial',
        description: 'Tratado completo de teoría eléctrica: Teoremas de Thevenin y Norton, divisor de tensión, divisor de corriente y análisis de potencia.',
        category: 'docs',
        type: 'Documentación',
        url: 'https://www.allaboutcircuits.com/textbook/direct-current/',
        tags: ['All About Circuits', 'Teoría DC', 'Thevenin']
    },
    {
        id: 'ee-doc-2',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Base de Datos Oficial de Datasheets de Semiconductores',
        source: 'ALLDATASHEET',
        sourceType: 'Hojas Técnicas',
        description: 'Búsqueda y descarga directa de hojas de datos oficiales de fabricantes para diodos 1N4007, transistores 2N2222, BC547, BC557 y CI 555.',
        category: 'docs',
        type: 'Datasheet',
        url: 'https://www.alldatasheet.com/',
        tags: ['Datasheets', '1N4007', '2N2222', 'NE555']
    },

    // ════════════════════════════════════════════════════════════════════
    // 🤖 ROBÓTICA EDUCATIVA (RE)
    // ════════════════════════════════════════════════════════════════════
    {
        id: 're-vid-1',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Curso de Arduino Desde Cero: Primeros Pasos',
        source: 'El Profe García',
        sourceType: 'YouTube',
        description: 'Introducción completa a la placa Arduino Uno R3: instalación del IDE, estructura básica de código setup(), loop() y control de pines digitales.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=nL34zDTPkcs',
        videoId: 'nL34zDTPkcs',
        tags: ['Arduino', 'El Profe García', 'C++', 'Primeros Pasos']
    },
    {
        id: 're-vid-2',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Control de Motores DC con Driver Puente H L298N',
        source: 'Bitwise Ar',
        sourceType: 'YouTube',
        description: 'Esquemas de conexión de potencia, control de velocidad por modulación de ancho de pulso (PWM) y cambio de sentido de giro con Arduino.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=F_4HkL5r5L8',
        videoId: 'F_4HkL5r5L8',
        tags: ['L298N', 'Motores DC', 'PWM', 'Bitwise Ar']
    },
    {
        id: 're-vid-3',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Sensor Ultrasónico HC-SR04: Medición de Distancia',
        source: 'El Profe García',
        sourceType: 'YouTube',
        description: 'Funcionamiento de las señales Trigger y Echo, cálculo de tiempo de vuelo de la onda acústica y conversión matemática a centímetros.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=PGXgL0I47C8',
        videoId: 'PGXgL0I47C8',
        tags: ['HC-SR04', 'Ultrasonido', 'Sensores', 'Distancia']
    },
    {
        id: 're-vid-4',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Construcción de Robot Seguidor de Línea 2WD',
        source: 'MakerZone',
        sourceType: 'YouTube',
        description: 'Guía de armado de chasis móvil de 2 ruedas motrices, conexión de sensores infrarrojos TCRT5000 y algoritmo de seguimiento en pista.',
        category: 'videos',
        type: 'YouTube',
        url: 'https://www.youtube.com/watch?v=yY4gS9Yt6q0',
        videoId: 'yY4gS9Yt6q0',
        tags: ['Seguidor de Línea', 'TCRT5000', 'Robótica Móvil']
    },
    {
        id: 're-sim-1',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Wokwi: Simulador Online de Arduino y ESP32',
        source: 'Wokwi Cloud Simulator',
        sourceType: 'Simulador Web',
        description: 'Simulador online de microcontroladores Arduino Uno, Mega y ESP32 con soporte para código C++, pantallas LCD I2C, pulsadores, servos y sensores.',
        category: 'simulators',
        type: 'Simulador',
        url: 'https://wokwi.com/',
        tags: ['Wokwi', 'Simulador Arduino', 'C++', 'Nube']
    },
    {
        id: 're-doc-1',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Referencia Oficial del Lenguaje de Programación Arduino',
        source: 'Arduino Official Docs (arduino.cc)',
        sourceType: 'Documentación Oficial',
        description: 'Documentación técnica oficial de funciones (pinMode, digitalWrite, analogRead, millis), estructuras de control y tipos de variables en C++.',
        category: 'docs',
        type: 'Documentación',
        url: 'https://www.arduino.cc/reference/en/',
        tags: ['Arduino Docs', 'Referencia C++', 'Funciones']
    },
    {
        id: 're-doc-2',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Pinout y Especificaciones Oficiales de Arduino Uno R3',
        source: 'Arduino Hardware Reference',
        sourceType: 'Documentación Oficial',
        description: 'Guía oficial de hardware con esquemático del microcontrolador ATmega328P, consumo eléctrico, pines de alimentación e interfaces I2C/SPI.',
        category: 'docs',
        type: 'Documentación',
        url: 'https://docs.arduino.cc/hardware/uno-rev3/',
        tags: ['Hardware', 'Pinout', 'ATmega328P']
    },
    {
        id: 're-doc-3',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Repositorio Oficial de Librerías Arduino',
        source: 'Arduino Library Hub',
        sourceType: 'Librerías',
        description: 'Buscador y catálogo oficial de librerías verificadas para pantallas LCD I2C (LiquidCrystal), servomotores (Servo.h) y sensores.',
        category: 'docs',
        type: 'Librerías',
        url: 'https://www.arduino.cc/reference/en/libraries/',
        tags: ['Librerías', 'Servo.h', 'LiquidCrystal']
    }
];

const PanelRecursos = () => {
    const { profile, enrolledCourses } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
    const [activeVideoModal, setActiveVideoModal] = useState(null);

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);

    // Mapear cursos en los que está inscrito el estudiante
    const enrolledAbbrs = useMemo(() => {
        return (enrolledCourses || []).map(c => (c.abbr || '').toUpperCase());
    }, [enrolledCourses]);

    // Filtrar recursos según cursos permitidos para el usuario
    const userAllowedResources = useMemo(() => {
        if (isStaff) {
            return OFFICIAL_EXTERNAL_RESOURCES;
        }
        return OFFICIAL_EXTERNAL_RESOURCES.filter(r => enrolledAbbrs.includes(r.courseAbbr));
    }, [isStaff, enrolledAbbrs]);

    // Opciones de filtro por curso
    const availableCourseFilters = useMemo(() => {
        const list = [{ id: 'all', label: 'Todos los Cursos', icon: <Layers size={15} /> }];
        
        const hasEE = isStaff || enrolledAbbrs.includes('EE');
        const hasRE = isStaff || enrolledAbbrs.includes('RE');

        if (hasEE) {
            list.push({ id: 'EE', label: 'Electricidad (EE)', color: '#f59e0b', icon: <Zap size={15} /> });
        }
        if (hasRE) {
            list.push({ id: 'RE', label: 'Robótica (RE)', color: '#a855f7', icon: <Bot size={15} /> });
        }

        return list;
    }, [isStaff, enrolledAbbrs]);

    const categories = [
        { id: 'all', name: 'Todos los Recursos', icon: <FolderOpen size={18} /> },
        { id: 'videos', name: 'Videos y Clases (YouTube)', icon: <Video size={18} /> },
        { id: 'simulators', name: 'Simuladores Interactivos', icon: <Globe size={18} /> },
        { id: 'docs', name: 'Documentación y Datasheets', icon: <FileText size={18} /> },
        { id: 'tools', name: 'Calculadoras y Herramientas', icon: <Wrench size={18} /> }
    ];

    const filteredResources = useMemo(() => {
        return userAllowedResources.filter(resource => {
            const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resource.tags && resource.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
            
            const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
            const matchesCourse = selectedCourseFilter === 'all' || resource.courseAbbr === selectedCourseFilter;

            return matchesSearch && matchesCategory && matchesCourse;
        });
    }, [userAllowedResources, searchTerm, selectedCategory, selectedCourseFilter]);

    const getTypeBadgeStyle = (type) => {
        switch (type) {
            case 'YouTube': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
            case 'Simulador': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
            case 'Documentación': return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
            case 'Datasheet': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
            case 'Calculadora': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
            default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: 'rgba(255, 255, 255, 0.2)' };
        }
    };

    const handleOpenResource = (resource) => {
        if (resource.category === 'videos' && resource.videoId) {
            setActiveVideoModal(resource);
        } else if (resource.url) {
            window.open(resource.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="resources-page">
            <div className="page-header" style={{ marginBottom: '0.5rem' }}>
                <div className="header-title">
                    <Globe size={28} color="#38bdf8" />
                    <div>
                        <h1 style={{ margin: 0 }}>Centro de Recursos y Fuentes Oficiales</h1>
                        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Canales educativos verificados (YouTube), simuladores online, documentación oficial de fabricantes y calculadoras técnicas.
                        </p>
                    </div>
                </div>
            </div>

            {/* BARRA DE FILTRO POR CURSO */}
            {availableCourseFilters.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {availableCourseFilters.map(cf => (
                        <button
                            key={cf.id}
                            onClick={() => setSelectedCourseFilter(cf.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 1rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: selectedCourseFilter === cf.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                                background: selectedCourseFilter === cf.id ? 'rgba(56,189,248,0.15)' : 'rgba(15,23,42,0.6)',
                                color: selectedCourseFilter === cf.id ? '#38bdf8' : '#cbd5e1',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {cf.icon}
                            <span>{cf.label}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="search-and-filter">
                <div className="search-box glass-panel">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por tema, canal o herramienta (ej. Khan Academy, PhET, Arduino, L298N, Falstad)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="resources-layout">
                <aside className="categories-sidebar glass-panel">
                    <h3>Categorías</h3>
                    <nav className="categories-nav">
                        {categories.map(category => {
                            const count = userAllowedResources.filter(r => 
                                (category.id === 'all' || r.category === category.id) &&
                                (selectedCourseFilter === 'all' || r.courseAbbr === selectedCourseFilter)
                            ).length;

                            return (
                                <button
                                    key={category.id}
                                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.icon}
                                    <span>{category.name}</span>
                                    <span className="category-count">{count}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="resources-grid-container">
                    {userAllowedResources.length === 0 ? (
                        <div className="empty-state glass-panel">
                            <Layers size={48} color="#64748b" />
                            <h3>No tienes cursos con recursos activos</h3>
                            <p style={{ maxWidth: '420px', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
                                Únete a un curso como <strong>Electricidad y Electrónica Básica</strong> o <strong>Robótica Educativa</strong> para acceder a los videos y recursos oficiales.
                            </p>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="empty-state glass-panel">
                            <Search size={48} color="#64748b" />
                            <h3>No se encontraron recursos</h3>
                            <p>Intenta con otro término de búsqueda o categoría.</p>
                        </div>
                    ) : (
                        <div className="resources-grid">
                            {filteredResources.map(resource => {
                                const badgeStyle = getTypeBadgeStyle(resource.type);
                                const isVideo = resource.category === 'videos';

                                return (
                                    <div key={resource.id} className="resource-card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div className="resource-header">
                                            <div 
                                                className="resource-type-badge"
                                                style={{ 
                                                    backgroundColor: badgeStyle.bg, 
                                                    color: badgeStyle.color,
                                                    border: `1px solid ${badgeStyle.border}`
                                                }}
                                            >
                                                {isVideo ? <Video size={14} /> : <ExternalLink size={14} />}
                                                <span>{resource.type}</span>
                                            </div>
                                            <span 
                                                className="resource-subject"
                                                style={{ 
                                                    fontWeight: 700, 
                                                    fontSize: '0.78rem',
                                                    color: resource.courseColor,
                                                    background: `${resource.courseColor}15`,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                {resource.courseAbbr}
                                            </span>
                                        </div>

                                        <h3 className="resource-title" style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>
                                            {resource.title}
                                        </h3>

                                        {/* Fuente y Autor */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                {resource.source}
                                            </span>
                                        </div>

                                        <p className="resource-description">{resource.description}</p>

                                        {resource.tags && resource.tags.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                {resource.tags.map(tag => (
                                                    <span 
                                                        key={tag} 
                                                        style={{ 
                                                            fontSize: '0.72rem', 
                                                            color: '#94a3b8', 
                                                            background: 'rgba(255,255,255,0.05)', 
                                                            padding: '2px 7px', 
                                                            borderRadius: '5px' 
                                                        }}
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="resource-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {resource.sourceType}
                                            </span>
                                            <div className="resource-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                                {isVideo ? (
                                                    <button 
                                                        onClick={() => handleOpenResource(resource)}
                                                        className="action-btn"
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.4rem', 
                                                            padding: '0.4rem 0.85rem', 
                                                            width: 'auto',
                                                            borderRadius: '8px',
                                                            background: 'rgba(239, 68, 68, 0.15)', 
                                                            color: '#f87171',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem'
                                                        }}
                                                        title="Reproducir Video"
                                                    >
                                                        <Play size={14} fill="#f87171" />
                                                        <span>Ver Video</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleOpenResource(resource)}
                                                        className="action-btn external" 
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '0.4rem', 
                                                            padding: '0.4rem 0.85rem', 
                                                            width: 'auto',
                                                            borderRadius: '8px',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem'
                                                        }}
                                                        title="Abrir enlace oficial"
                                                    >
                                                        <ExternalLink size={14} />
                                                        <span>Abrir</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE REPRODUCTOR DE VIDEO YOUTUBE */}
            {activeVideoModal && (
                <div 
                    className="join-modal-overlay" 
                    onClick={() => setActiveVideoModal(null)}
                    style={{ zIndex: 100000 }}
                >
                    <div 
                        className="join-modal-content" 
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '780px', width: '92%', padding: '1.5rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>
                                    {activeVideoModal.title}
                                </h3>
                                <p style={{ margin: '0.2rem 0 0', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Canal: {activeVideoModal.source}
                                </p>
                            </div>
                            <button 
                                onClick={() => setActiveVideoModal(null)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Contenedor Iframe YouTube Responsivo */}
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <iframe 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.videoId}?autoplay=1`}
                                title={activeVideoModal.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', flex: 1, paddingRight: '1rem' }}>
                                {activeVideoModal.description}
                            </p>
                            <button
                                onClick={() => window.open(activeVideoModal.url, '_blank', 'noopener,noreferrer')}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                            >
                                <ExternalLink size={14} />
                                <span>Abrir en YouTube</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelRecursos;
