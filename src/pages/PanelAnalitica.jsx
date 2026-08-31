import React, { useState, useEffect, useMemo } from 'react';
import {
    Activity,
    Users,
    Award,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Search,
    TrendingUp,
    Brain,
    Layers,
    ChevronRight,
    ChevronLeft,
    RotateCcw,
    X,
    Filter,
    BarChart3,
    ArrowLeft,
    Sparkles,
    ShieldAlert,
    Cpu,
    Download,
    BookOpen,
    Grid,
    Flame,
    HelpCircle,
    UserCheck,
    AlertCircle,
    CheckCircle,
    CircleDashed,
    FolderKanban
} from 'lucide-react';
import { api } from '../lib/api';
import '../styles/PanelAnalitica.css';

export const COURSE_MODULES_MAP = {
    ee: [
        {
            id: 'm1',
            title: 'Módulo 1 · Fundamentos Eléctricos',
            short: 'M1',
            lessons: [
                { id: 'ee-m1-l1', short: 'L1', title: 'Carga Eléctrica y Átomos' },
                { id: 'ee-m1-l2', short: 'L2', title: 'Ley de Ohm y Potencia' },
                { id: 'ee-m1-l3', short: 'L3', title: 'Circuitos en Serie' },
                { id: 'ee-m1-l4', short: 'L4', title: 'Circuitos en Paralelo' },
                { id: 'ee-m1-l5', short: 'L5', title: 'Circuitos Mixtos' },
                { id: 'ee-m1-l6', short: 'L6', title: 'Examen M1 (Integral)' }
            ]
        },
        {
            id: 'm2',
            title: 'Módulo 2 · Componentes Electrónicos',
            short: 'M2',
            lessons: [
                { id: 'ee-m2-l7', short: 'L7', title: 'Capacitores y Energía' },
                { id: 'ee-m2-l8', short: 'L8', title: 'Bobinas y Diodos 1N4007' },
                { id: 'ee-m2-l9', short: 'L9', title: 'Transistores BJT NPN/PNP' },
                { id: 'ee-m2-l10', short: 'L10', title: 'Examen M2 (Componentes)' }
            ]
        },
        {
            id: 'm3',
            title: 'Módulo 3 · Circuitos Integrados y AC',
            short: 'M3',
            lessons: [
                { id: 'ee-m3-l11', short: 'L11', title: 'Temporizador NE555' },
                { id: 'ee-m3-l12', short: 'L12', title: 'Contadores y Lógica Digital' },
                { id: 'ee-m3-l13', short: 'L13', title: 'Visualización y Displays' },
                { id: 'ee-m3-l14', short: 'L14', title: 'Examen M3 (Integrados)' }
            ]
        },
        {
            id: 'm4',
            title: 'Módulo 4 · Proyectos y Potencia',
            short: 'M4',
            lessons: [
                { id: 'ee-m4-l15', short: 'L15', title: 'Fuentes Reguladas de DC' },
                { id: 'ee-m4-l16', short: 'L16', title: 'Examen Final de Proyecto' }
            ]
        }
    ],
    re: [
        {
            id: 'm1',
            title: 'Módulo 1 · Introducción a Robótica',
            short: 'M1',
            lessons: [
                { id: 're-m1-l1', short: 'L1', title: 'Mi primer parpadeo' },
                { id: 're-m1-l2', short: 'L2', title: 'Semáforos y Variables' },
                { id: 're-m1-l3', short: 'L3', title: 'Entradas digitales y pulsadores' },
                { id: 're-m1-l4', short: 'L4', title: 'Monitor serie y depuración' },
                { id: 're-m1-l5', short: 'L5', title: 'Entradas analógicas y resolución' }
            ]
        },
        {
            id: 'm2',
            title: 'Módulo 2 · Sensores y Entorno',
            short: 'M2',
            lessons: [
                { id: 're-m2-l1', short: 'L1', title: 'Sensores de Distancia' },
                { id: 're-m2-l2', short: 'L2', title: 'Sensores de Luz (LDR)' },
                { id: 're-m2-l3', short: 'L3', title: 'Sensores de Temperatura' },
                { id: 're-m2-l4', short: 'L4', title: 'Sensor de Humedad y Suelo' }
            ]
        },
        {
            id: 'm3',
            title: 'Módulo 3 · Actuadores y Control',
            short: 'M3',
            lessons: [
                { id: 're-m3-l1', short: 'L1', title: 'Servomotores' },
                { id: 're-m3-l2', short: 'L2', title: 'Motores DC (Driver L298N)' },
                { id: 're-m3-l3', short: 'L3', title: 'Pantallas LCD' },
                { id: 're-m3-l4', short: 'L4', title: 'Joystick y Control' }
            ]
        },
        {
            id: 'm4',
            title: 'Módulo 4 · Proyectos Integradores',
            short: 'M4',
            lessons: [
                { id: 're-m4-l1', short: 'L1', title: 'Robot Seguidor de Línea' },
                { id: 're-m4-l2', short: 'L2', title: 'Sistema Domótico Básico' },
                { id: 're-m4-l3', short: 'L3', title: 'Brazo Robótico Pro' },
                { id: 're-m4-l4', short: 'L4', title: 'Proyecto Integrador Final' }
            ]
        }
    ]
};

export default function PanelAnalitica() {
    const [activeTab, setActiveTab] = useState('cohort'); // 'cohort' | 'individual'
    const [cohortView, setCohortView] = useState('matrix'); // 'matrix' | 'difficulties' | 'students'
    const [loading, setLoading] = useState(true);

    const [overview, setOverview] = useState({
        courses: [],
        groups: [],
        students: [],
        topDifficultFlashcards: [],
        topFailedChallenges: [],
        totalEvaluationsRecorded: 0
    });

    // Filtros Jerárquicos
    const [selectedCourse, setSelectedCourse] = useState('ee');   // 'ee' | 're' | 'all'
    const [selectedModule, setSelectedModule] = useState('m1');   // 'm1' | 'm2' | 'm3' | 'm4' | 'all'
    const [selectedGroup, setSelectedGroup] = useState('all');    // 'all' | group_name
    const [riskFilter, setRiskFilter] = useState('all');          // 'all' | 'safe' | 'warning' | 'danger'
    const [searchTerm, setSearchTerm] = useState('');

    // Estado del expediente individual
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [studentDetail, setStudentDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        loadCohortOverview();
    }, []);

    const loadCohortOverview = async () => {
        setLoading(true);
        try {
            const { data } = await api('/admin/analytics');
            if (data?.success) {
                setOverview({
                    courses: data.courses || [],
                    groups: data.groups || [],
                    students: data.students || [],
                    topDifficultFlashcards: data.topDifficultFlashcards || [],
                    topFailedChallenges: data.topFailedChallenges || [],
                    totalEvaluationsRecorded: data.totalEvaluationsRecorded || 0
                });
            }
        } catch (err) {
            console.error('Error cargando analítica de cohorte:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentDetail = async (userId) => {
        if (!userId) return;
        setSelectedStudentId(userId);
        setActiveTab('individual');

        // Actualización inmediata con los datos ya disponibles para que el cambio de alumno sea INSTANTÁNEO
        const targetStudent = (overview.students || []).find(s => String(s.id).toLowerCase() === String(userId).toLowerCase()) ||
                              (filteredStudents || []).find(s => String(s.id).toLowerCase() === String(userId).toLowerCase());

        if (targetStudent) {
            setStudentDetail({
                student: {
                    id: targetStudent.id,
                    name: targetStudent.name,
                    email: targetStudent.email,
                    avatar_url: targetStudent.avatar_url,
                    group_name: targetStudent.group_name
                },
                lessons: Object.entries(targetStudent.lessons_status || {}).map(([lid, dat]) => ({
                    lesson_id: lid,
                    status: dat.status,
                    progress: dat.progress,
                    completed_at: dat.completed_at,
                    score: dat.score
                })),
                flashcards: [],
                challenges: [],
                attemptsByEvaluation: {}
            });
        }

        setLoadingDetail(true);
        try {
            const { data, error } = await api(`/admin/analytics?user_id=${encodeURIComponent(userId)}`);
            if (data?.success && data.student) {
                setStudentDetail(data);
            }
        } catch (err) {
            console.error('Error cargando expediente del estudiante:', err);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Módulos disponibles según el curso
    const availableModules = useMemo(() => {
        const courseKey = selectedCourse === 're' ? 're' : 'ee';
        return COURSE_MODULES_MAP[courseKey] || COURSE_MODULES_MAP.ee;
    }, [selectedCourse]);

    // Lecciones a mostrar en la matriz según Curso y Módulo seleccionado
    const matrixLessons = useMemo(() => {
        const courseKey = selectedCourse === 're' ? 're' : 'ee';
        const modules = COURSE_MODULES_MAP[courseKey] || COURSE_MODULES_MAP.ee;

        if (selectedModule === 'all') {
            return modules.flatMap(m => m.lessons);
        }

        const currentMod = modules.find(m => m.id === selectedModule) || modules[0];
        return currentMod.lessons;
    }, [selectedCourse, selectedModule]);

    // Función auxiliar para determinar si un grupo corresponde a un curso
    const isGroupMatchingCourse = (groupOrName, courseKey) => {
        if (!groupOrName || courseKey === 'all') return true;
        
        let courseId = '';
        let groupName = '';

        if (typeof groupOrName === 'object') {
            courseId = String(groupOrName.course_id || '').toLowerCase();
            groupName = String(groupOrName.name || '').toLowerCase();
        } else {
            groupName = String(groupOrName).toLowerCase();
            const foundG = (overview.groups || []).find(g => String(g.name).toLowerCase() === groupName);
            if (foundG) courseId = String(foundG.course_id || '').toLowerCase();
        }

        if (courseKey === 're') {
            return courseId === '2' || courseId === 're' || courseId.includes('robot') || 
                   groupName.startsWith('re') || groupName.includes('robot');
        }

        if (courseKey === 'ee') {
            return courseId === '1' || courseId === 'ee' || courseId.includes('electr') || 
                   groupName.startsWith('ee') || groupName.includes('electr');
        }

        return true;
    };

    // Grupos filtrados según el curso seleccionado
    const availableGroupsForCourse = useMemo(() => {
        const setOfNames = new Set();

        // 1. Agregar desde overview.groups
        (overview.groups || []).forEach(g => {
            if (isGroupMatchingCourse(g, selectedCourse)) {
                setOfNames.add(g.name);
            }
        });

        // 2. Agregar desde estudiantes asociados a este curso
        (overview.students || []).forEach(s => {
            if (s.group_name && s.group_name !== 'Sin Grupo') {
                if (isGroupMatchingCourse(s.group_name, selectedCourse)) {
                    setOfNames.add(s.group_name);
                }
            }
        });

        return Array.from(setOfNames);
    }, [overview.groups, overview.students, selectedCourse]);

    // Filtrar lista de estudiantes
    const filteredStudents = useMemo(() => {
        return (overview.students || []).filter(st => {
            // Filtro de Curso
            let matchesCourse = selectedCourse === 'all';
            if (!matchesCourse) {
                const sCourses = Array.isArray(st.courses) ? st.courses.map(c => String(c).toLowerCase()) : [];
                const gName = String(st.group_name || '').toLowerCase();
                
                if (selectedCourse === 're') {
                    matchesCourse = sCourses.some(c => c === 're' || c === '2' || c.includes('robot')) ||
                                    gName.startsWith('re') || gName.includes('robot');
                } else if (selectedCourse === 'ee') {
                    matchesCourse = sCourses.some(c => c === 'ee' || c === '1' || c.includes('electr')) ||
                                    gName.startsWith('ee') || gName.includes('electr');
                }
            }

            // Filtro de Grupo
            const matchesGroup = selectedGroup === 'all' || st.group_name === selectedGroup;

            // Filtro de Riesgo Académico
            const matchesRisk = riskFilter === 'all' || st.risk_level === riskFilter;

            // Búsqueda por texto
            const matchesSearch = !searchTerm.trim() ||
                (st.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (st.email || '').toLowerCase().includes(searchTerm.toLowerCase());

            return matchesCourse && matchesGroup && matchesRisk && matchesSearch;
        });
    }, [overview.students, selectedCourse, selectedGroup, riskFilter, searchTerm]);

    // Índice del estudiante actual en el expediente
    const currentStudentIndex = useMemo(() => {
        if (!selectedStudentId || filteredStudents.length === 0) return -1;
        return filteredStudents.findIndex(s => String(s.id).toLowerCase() === String(selectedStudentId).toLowerCase());
    }, [selectedStudentId, filteredStudents]);

    // Navegación entre alumnos
    const handlePrevStudent = () => {
        if (currentStudentIndex > 0) {
            const prev = filteredStudents[currentStudentIndex - 1];
            loadStudentDetail(prev.id);
        }
    };

    const handleNextStudent = () => {
        if (currentStudentIndex >= 0 && currentStudentIndex < filteredStudents.length - 1) {
            const next = filteredStudents[currentStudentIndex + 1];
            loadStudentDetail(next.id);
        } else if (currentStudentIndex === -1 && filteredStudents.length > 0) {
            loadStudentDetail(filteredStudents[0].id);
        }
    };

    // KPIs Dinámicos Recalculados
    const dynamicKPIs = useMemo(() => {
        const total = filteredStudents.length;
        if (total === 0) {
            return {
                totalStudents: 0,
                avgScore: 0,
                passRate: 0,
                atRiskCount: 0,
                totalLessonsCompletedAvg: 0
            };
        }

        const scoredStudents = filteredStudents.filter(s => s.averageScore > 0);
        const avgScore = scoredStudents.length > 0
            ? Math.round(scoredStudents.reduce((acc, s) => acc + s.averageScore, 0) / scoredStudents.length)
            : 0;

        const passedStudents = filteredStudents.filter(s => s.averageScore >= 80).length;
        const passRate = Math.round((passedStudents / total) * 100);

        const atRiskCount = filteredStudents.filter(s => s.risk_level === 'danger' || s.risk_level === 'warning').length;
        const totalLessonsCompletedAvg = (filteredStudents.reduce((acc, s) => acc + (s.lessonsCompletedCount || 0), 0) / total).toFixed(1);

        return {
            totalStudents: total,
            avgScore,
            passRate,
            atRiskCount,
            totalLessonsCompletedAvg
        };
    }, [filteredStudents]);

    // Exportar datos a CSV
    const handleExportCSV = () => {
        if (filteredStudents.length === 0) {
            alert('No hay estudiantes para exportar con los filtros seleccionados.');
            return;
        }

        const headers = ['Nombre Completo', 'Correo Electrónico', 'Grupo', 'Lecciones Aprobadas', 'Promedio (%)', 'Total Intentos', 'Nivel de Riesgo'];
        const rows = filteredStudents.map(st => [
            `"${(st.name || '').replace(/"/g, '""')}"`,
            `"${st.email || ''}"`,
            `"${st.group_name || 'Sin Grupo'}"`,
            st.lessonsCompletedCount || 0,
            st.averageScore || 0,
            st.attemptsCount || 0,
            st.risk_level === 'danger' ? 'Alto Riesgo (<60%)' : st.risk_level === 'warning' ? 'Requiere Refuerzo' : 'Buen Rendimiento'
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
            [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        const groupSuffix = selectedGroup !== 'all' ? `_Grupo_${selectedGroup}` : '';
        link.setAttribute('download', `SaberLab_Planilla_Notas${groupSuffix}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Diagnóstico Neurocognitivo
    const studentDiagnosis = useMemo(() => {
        if (!studentDetail) return null;
        const { flashcards = [], challenges = [], attemptsByEvaluation = {} } = studentDetail;

        const hardCards = flashcards.filter(f => f.unknown_count > 0);
        const hardChallenges = challenges.filter(c => c.failures_count > 1);

        let totalAttemptsCount = 0;
        let totalEvaluationsCount = Object.keys(attemptsByEvaluation).length;
        Object.values(attemptsByEvaluation).forEach(list => {
            totalAttemptsCount += list.length;
        });

        const avgAttempts = totalEvaluationsCount > 0 
            ? (totalAttemptsCount / totalEvaluationsCount).toFixed(1) 
            : 1.0;

        let tone = 'positive';
        let recommendation = '';

        if (avgAttempts > 2.2 || hardCards.length >= 4) {
            tone = 'warning';
            recommendation = `El estudiante requiere refuerzo conceptual activo. Ha necesitado un promedio de ${avgAttempts} intentos para superar las pruebas. Se recomienda programar una sesión de repaso en los conceptos con mayores dudas (${hardCards.slice(0, 2).map(c => c.card_id).join(', ')}).`;
        } else if (hardCards.length > 0) {
            tone = 'moderate';
            recommendation = `El estudiante avanza a buen ritmo (promedio de ${avgAttempts} intentos por evaluación). Muestra dudas puntuales en conceptos específicos de flashcards que superó con perseverancia.`;
        } else {
            tone = 'excellent';
            recommendation = `Excelente retención y asimilación conceptual. El estudiante ha superado sus retos en el primer o segundo intento con una sólida base nemotécnica.`;
        }

        return { tone, recommendation, avgAttempts, hardCardsCount: hardCards.length, hardChallengesCount: hardChallenges.length };
    }, [studentDetail]);

    return (
        <div className="analytics-page animate-fade-in">
            {/* ENCABEZADO ESTÁNDAR SABERLAB */}
            <div className="page-header blue" style={{ marginBottom: '1rem' }}>
                <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <Activity size={30} className="text-gradient" />
                        <div>
                            <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>Analítica y Rendimiento Grupal</h1>
                            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Monitoreo pedagógico: matrices de avance por lección, alertas de riesgo, diagnóstico nemotécnico y notas.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="btn-export-csv"
                        title="Descargar planilla de notas y avance en formato CSV/Excel"
                    >
                        <Download size={16} />
                        <span>Exportar Planilla (.CSV)</span>
                    </button>
                </div>
            </div>

            {/* ── BARRA DE CONTROL Y SELECTOR MAESTRO DE FILTROS ── */}
            <div className="analytics-filter-bar glass-panel">
                <div className="filter-group-item">
                    <label><BookOpen size={14} color="#38bdf8" /> Curso:</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setSelectedModule('m1');
                            setSelectedGroup('all');
                        }}
                    >
                        <option value="ee">Electricidad y Electrónica</option>
                        <option value="re">Robótica Educativa</option>
                        <option value="all">Todos los Cursos</option>
                    </select>
                </div>

                <div className="filter-group-item">
                    <label><FolderKanban size={14} color="#a855f7" /> Módulo:</label>
                    <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                    >
                        {availableModules.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.title}
                            </option>
                        ))}
                        <option value="all">Ver Todos los Módulos</option>
                    </select>
                </div>

                <div className="filter-group-item">
                    <label><Users size={14} color="#10b981" /> Grupo:</label>
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        <option value="all">
                            Todos los Grupos ({availableGroupsForCourse.length})
                        </option>
                        {availableGroupsForCourse.map(grp => {
                            const count = (overview.students || []).filter(s => s.group_name === grp).length;
                            return (
                                <option key={grp} value={grp}>
                                    {grp} ({count} alumnos)
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="filter-group-item">
                    <label><ShieldAlert size={14} color="#f59e0b" /> Estado:</label>
                    <select
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="safe">🟢 Buen Rendimiento (≥80%)</option>
                        <option value="warning">🟡 Requiere Refuerzo</option>
                        <option value="danger">🔴 Alto Riesgo / Sin Avance</option>
                    </select>
                </div>

                <div className="filter-search-box">
                    <Search size={15} color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Buscar alumno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <X size={14} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />
                    )}
                </div>
            </div>

            {/* ── KPIS REACTIVOS SEGÚN EL GRUPO Y FILTRO ── */}
            <div className="analytics-kpis-grid">
                <div className="analytics-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                        <Users size={24} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value">{dynamicKPIs.totalStudents}</span>
                        <span className="kpi-label">
                            {selectedGroup !== 'all' ? `Alumnos en ${selectedGroup}` : 'Alumnos Filtrados'}
                        </span>
                    </div>
                </div>

                <div className="analytics-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                        <Award size={24} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value">{dynamicKPIs.avgScore > 0 ? `${dynamicKPIs.avgScore}%` : '—'}</span>
                        <span className="kpi-label">Promedio General del Grupo</span>
                    </div>
                </div>

                <div className="analytics-kpi-card">
                    <div className="kpi-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value">{dynamicKPIs.passRate}%</span>
                        <span className="kpi-label">Tasa Aprobación (≥80%)</span>
                    </div>
                </div>

                <div className="analytics-kpi-card">
                    <div className="kpi-icon-wrapper" style={{
                        background: dynamicKPIs.atRiskCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                        color: dynamicKPIs.atRiskCount > 0 ? '#ef4444' : '#10b981'
                    }}>
                        {dynamicKPIs.atRiskCount > 0 ? <AlertTriangle size={24} /> : <UserCheck size={24} />}
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value" style={{ color: dynamicKPIs.atRiskCount > 0 ? '#ef4444' : 'inherit' }}>
                            {dynamicKPIs.atRiskCount}
                        </span>
                        <span className="kpi-label">Alumnos en Alerta / Refuerzo</span>
                    </div>
                </div>
            </div>

            {/* ── PESTAÑAS PRINCIPALES ── */}
            <div className="analytics-tabs-nav">
                <button
                    className={`analytics-tab-btn ${activeTab === 'cohort' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cohort')}
                >
                    <Layers size={18} />
                    <span>Panorama del Grupo</span>
                </button>
                <button
                    className={`analytics-tab-btn ${activeTab === 'individual' ? 'active' : ''}`}
                    onClick={() => {
                        if (!selectedStudentId && filteredStudents.length > 0) {
                            loadStudentDetail(filteredStudents[0].id);
                        } else {
                            setActiveTab('individual');
                        }
                    }}
                >
                    <Brain size={18} />
                    <span>
                        Expediente Individual {currentStudentIndex >= 0 ? `(${currentStudentIndex + 1}/${filteredStudents.length}: ${studentDetail?.student?.name || ''})` : ''}
                    </span>
                </button>
            </div>

            {/* TAB 1: PANORAMA DEL GRUPO */}
            {activeTab === 'cohort' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Sub-selector de vistas en Panorama */}
                    <div className="cohort-subviews-nav">
                        <button
                            className={`subview-btn ${cohortView === 'matrix' ? 'active' : ''}`}
                            onClick={() => setCohortView('matrix')}
                        >
                            <Grid size={16} />
                            <span>1. Matriz de Lecciones ({matrixLessons.length} lecciones)</span>
                        </button>
                        <button
                            className={`subview-btn ${cohortView === 'students' ? 'active' : ''}`}
                            onClick={() => setCohortView('students')}
                        >
                            <Users size={16} />
                            <span>2. Lista Detallada de Estudiantes ({filteredStudents.length})</span>
                        </button>
                        <button
                            className={`subview-btn ${cohortView === 'difficulties' ? 'active' : ''}`}
                            onClick={() => setCohortView('difficulties')}
                        >
                            <Flame size={16} />
                            <span>3. Dificultades Críticas y Retos Fallados</span>
                        </button>
                    </div>

                    {/* VISTA 1: MATRIZ DE CALOR / LECCIONES */}
                    {cohortView === 'matrix' && (
                        <div className="cohort-card glass-panel animate-fade-in">
                            <div className="cohort-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div>
                                    <h3>
                                        <Grid size={20} color="#38bdf8" />
                                        <span>
                                            Matriz de Avance: {selectedModule === 'all' ? 'Todos los Módulos' : (availableModules.find(m => m.id === selectedModule)?.title || 'Módulo')}
                                        </span>
                                    </h3>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        Visualiza qué lecciones ha superado cada estudiante del grupo en tiempo real.
                                    </p>
                                </div>

                                <div className="matrix-legend">
                                    <span className="legend-item"><span className="dot dot-completed"></span> Aprobada</span>
                                    <span className="legend-item"><span className="dot dot-progress"></span> En Progreso</span>
                                    <span className="legend-item"><span className="dot dot-pending"></span> No iniciada</span>
                                </div>
                            </div>

                            <div className="students-table-container">
                                <table className="students-table matrix-table">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: '200px' }}>Estudiante</th>
                                            <th>Grupo</th>
                                            {matrixLessons.map(l => (
                                                <th key={l.id} style={{ textAlign: 'center', minWidth: '85px' }} title={l.title}>
                                                    <div>{l.short}</div>
                                                    <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.8 }}>{l.title.split(' ')[0]}</div>
                                                </th>
                                            ))}
                                            <th style={{ textAlign: 'center' }}>Avance Módulo</th>
                                            <th style={{ textAlign: 'center' }}>Expediente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={matrixLessons.length + 4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                                                    No se encontraron estudiantes para los filtros seleccionados.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(st => {
                                                const studentInitial = (st.name || st.email || 'E')[0].toUpperCase();
                                                const displayName = (st.name && st.name !== 'Estudiante') ? st.name : (st.email ? st.email.split('@')[0] : 'Estudiante');
                                                const ls = st.lessons_status || {};

                                                // Contar cuántas de las lecciones visibles en esta matriz están completadas
                                                let completedInMatrix = 0;
                                                matrixLessons.forEach(l => {
                                                    const lookupKey = l.id.toLowerCase();
                                                    const record = ls[lookupKey] || ls[l.id] || ls[lookupKey.replace('ee-m1-', '')] || ls[lookupKey.replace('re-m1-', '')];
                                                    if (record?.status === 'completed' || (record?.progress >= 80)) {
                                                        completedInMatrix++;
                                                    }
                                                });

                                                return (
                                                    <tr key={st.id}>
                                                        <td>
                                                            <div className="student-cell">
                                                                {st.avatar_url ? (
                                                                    <img src={st.avatar_url} alt={displayName} className="student-avatar" />
                                                                ) : (
                                                                    <div className="student-avatar-placeholder">
                                                                        {studentInitial}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                                                        {displayName}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                                        {st.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="group-badge">
                                                                {st.group_name || 'Sin Grupo'}
                                                            </span>
                                                        </td>
                                                        {matrixLessons.map(l => {
                                                            const lookupKey = l.id.toLowerCase();
                                                            const record = ls[lookupKey] || ls[l.id] || ls[lookupKey.replace('ee-m1-', '')] || ls[lookupKey.replace('re-m1-', '')];
                                                            const isCompleted = record?.status === 'completed' || (record?.progress >= 80);
                                                            const isInProgress = record?.status === 'in_progress' || (record?.progress > 0 && !isCompleted);

                                                            return (
                                                                <td key={l.id} style={{ textAlign: 'center' }}>
                                                                    {isCompleted ? (
                                                                        <span className="matrix-badge completed" title={`Aprobada (${record?.score ? record.score + '%' : '100%'})`}>
                                                                            ✓ {record?.score ? `${record.score}%` : ''}
                                                                        </span>
                                                                    ) : isInProgress ? (
                                                                        <span className="matrix-badge in-progress" title={`En progreso (${record?.progress || 50}%)`}>
                                                                            ⏳
                                                                        </span>
                                                                    ) : (
                                                                        <span className="matrix-badge pending" title="No iniciada">
                                                                            —
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span style={{
                                                                fontWeight: 800,
                                                                color: completedInMatrix === matrixLessons.length ? '#10b981' : completedInMatrix > 0 ? '#38bdf8' : 'var(--text-secondary)'
                                                            }}>
                                                                {completedInMatrix} / {matrixLessons.length}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                className="btn-view-dossier"
                                                                onClick={() => loadStudentDetail(st.id)}
                                                            >
                                                                Ver →
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* VISTA 2: LISTA DETALLADA CON ALERTAS Y NOTAS */}
                    {cohortView === 'students' && (
                        <div className="cohort-card glass-panel animate-fade-in">
                            <div className="cohort-card-header">
                                <div>
                                    <h3>
                                        <Users size={20} color="#10b981" />
                                        <span>Listado Completo de Estudiantes y Expedientes</span>
                                    </h3>
                                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        Haz clic en "Ver Expediente" para abrir el diagnóstico neurocognitivo detallado de cada alumno.
                                    </p>
                                </div>
                            </div>

                            <div className="students-table-container">
                                <table className="students-table">
                                    <thead>
                                        <tr>
                                            <th>Estudiante</th>
                                            <th>Grupo</th>
                                            <th>Estado / Riesgo</th>
                                            <th>Lecciones Aprobadas</th>
                                            <th>Promedio General</th>
                                            <th>Intentos Examen</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                                                    No se encontraron estudiantes con los filtros seleccionados.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(st => {
                                                const studentInitial = (st.name || st.email || 'E')[0].toUpperCase();
                                                const displayName = (st.name && st.name !== 'Estudiante') ? st.name : (st.email ? st.email.split('@')[0] : 'Estudiante');

                                                return (
                                                    <tr key={st.id}>
                                                        <td>
                                                            <div className="student-cell">
                                                                {st.avatar_url ? (
                                                                    <img src={st.avatar_url} alt={displayName} className="student-avatar" />
                                                                ) : (
                                                                    <div className="student-avatar-placeholder">
                                                                        {studentInitial}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                                                        {displayName}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                                        {st.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="group-badge">
                                                                {st.group_name || 'Sin Grupo'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {st.risk_level === 'danger' ? (
                                                                <span className="risk-badge danger">
                                                                    🔴 Alto Riesgo
                                                                </span>
                                                            ) : st.risk_level === 'warning' ? (
                                                                <span className="risk-badge warning">
                                                                    🟡 Requiere Refuerzo
                                                                </span>
                                                            ) : (
                                                                <span className="risk-badge safe">
                                                                    🟢 Buen Rendimiento
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span style={{ fontWeight: 800, color: st.lessonsCompletedCount > 0 ? '#10b981' : 'var(--text-secondary)' }}>
                                                                {st.lessonsCompletedCount} lecciones
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                fontWeight: 800,
                                                                color: st.averageScore >= 80 ? '#10b981' : st.averageScore > 0 ? '#f59e0b' : 'var(--text-secondary)'
                                                            }}>
                                                                {st.averageScore > 0 ? `${st.averageScore}%` : 'Sin nota'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{st.attemptsCount} intentos</span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn-view-dossier"
                                                                onClick={() => loadStudentDetail(st.id)}
                                                            >
                                                                Ver Expediente →
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* VISTA 3: DIFICULTADES CRÍTICAS */}
                    {cohortView === 'difficulties' && (
                        <div className="cohort-grid animate-fade-in">
                            {/* Top Flashcards con dificultad */}
                            <div className="cohort-card glass-panel">
                                <div className="cohort-card-header">
                                    <h3>
                                        <Brain size={20} color="#f59e0b" />
                                        <span>Conceptos con Mayor Dificultad (Flashcards)</span>
                                    </h3>
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Duda recurrente ("No lo sabía")</span>
                                </div>

                                {overview.topDifficultFlashcards.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                        No se registran tarjetas con dificultad persistente en este momento.
                                    </p>
                                ) : (
                                    overview.topDifficultFlashcards.map((card, idx) => {
                                        const parts = (card.lesson_id || '').toLowerCase().split('-');
                                        const c = (parts[0] || '').toUpperCase();
                                        const m = (parts[1] || '').toUpperCase();
                                        const l = (parts[2] || '').toUpperCase();
                                        const rawId = (card.card_id || '').toLowerCase();
                                        let sfx;
                                        if (rawId.startsWith('pr')) sfx = 'Pr' + rawId.slice(2);
                                        else if (rawId.startsWith('p')) sfx = 'P' + rawId.slice(1);
                                        else if (rawId.startsWith('f')) sfx = 'F' + rawId.slice(1);
                                        else sfx = card.card_id;
                                        const label = c && m && l ? `${c}-${m}-${l}-${sfx}` : card.card_id;
                                        return (
                                            <div key={idx} className="difficult-concept-item">
                                                <div className="concept-info">
                                                    <span className="concept-title">{label}</span>
                                                    <span className="concept-meta">Lección: {card.lesson_id} • {card.students_affected} estudiante(s) tuvieron dudas</span>
                                                </div>
                                                <span className="concept-badge">
                                                    {card.total_unknowns} fallos
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Top Retos de Práctica con errores previos */}
                            <div className="cohort-card glass-panel">
                                <div className="cohort-card-header">
                                    <h3>
                                        <Cpu size={20} color="#38bdf8" />
                                        <span>Retos de Práctica más Desafiantes</span>
                                    </h3>
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Fallos antes de acertar</span>
                                </div>

                                {overview.topFailedChallenges.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                        Los estudiantes han superado los retos del simulador sin errores acumulados.
                                    </p>
                                ) : (
                                    overview.topFailedChallenges.map((ch, idx) => (
                                        <div key={idx} className="difficult-concept-item">
                                            <div className="concept-info">
                                                <span className="concept-title">{ch.exercise_title || `Reto #${ch.exercise_id}`}</span>
                                                <span className="concept-meta">{ch.concept || ch.lesson_id} • {ch.students_struggled} estudiante(s)</span>
                                            </div>
                                            <span className="concept-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                                {ch.total_failures} intentos previos
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: EXPEDIENTE DIAGNÓSTICO INDIVIDUAL */}
            {activeTab === 'individual' && (
                <div>
                    {loadingDetail ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <Activity size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#38bdf8' }} />
                            <p>Cargando expediente neurocognitivo del estudiante...</p>
                        </div>
                    ) : !studentDetail ? (
                        <div className="dossier-card glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Selecciona un estudiante de la lista para ver su diagnóstico detallado.</p>
                            <button className="btn-view-dossier" onClick={() => setActiveTab('cohort')}>
                                Volver al panorama grupal
                            </button>
                        </div>
                    ) : (
                        <div className="dossier-card glass-panel animate-fade-in">
                            {/* Barra de Navegación Rápida entre Estudiantes */}
                            <div className="dossier-nav-bar">
                                <div className="dossier-nav-controls">
                                    <button
                                        className="btn-nav-student"
                                        onClick={handlePrevStudent}
                                        disabled={currentStudentIndex <= 0}
                                        title="Estudiante anterior"
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Anterior</span>
                                    </button>

                                    <div className="dossier-student-picker">
                                        <Users size={14} color="#38bdf8" />
                                        <select
                                            value={selectedStudentId || ''}
                                            onChange={(e) => loadStudentDetail(e.target.value)}
                                        >
                                            {filteredStudents.map((st, idx) => (
                                                <option key={st.id} value={st.id}>
                                                    {idx + 1} de {filteredStudents.length}: {st.name} ({st.group_name || 'Sin grupo'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        className="btn-nav-student"
                                        onClick={handleNextStudent}
                                        disabled={currentStudentIndex < 0 || currentStudentIndex >= filteredStudents.length - 1}
                                        title="Siguiente estudiante"
                                    >
                                        <span>Siguiente</span>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <button
                                    className="btn-view-dossier"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                    onClick={() => setActiveTab('cohort')}
                                >
                                    <ArrowLeft size={16} />
                                    <span>Volver a la lista</span>
                                </button>
                            </div>

                            {/* Cabecera del expediente */}
                            <div className="dossier-header">
                                <div className="dossier-student-info">
                                    {studentDetail.student.avatar_url ? (
                                        <img src={studentDetail.student.avatar_url} alt={studentDetail.student.name} className="dossier-avatar" />
                                    ) : (
                                        <div className="student-avatar-placeholder" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                                            {(studentDetail.student.name || 'E').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
                                            {studentDetail.student.name}
                                        </h2>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                            <span>Email: <strong style={{ color: 'var(--text-primary)' }}>{studentDetail.student.email}</strong></span>
                                            <span>•</span>
                                            <span>Grupo: <strong style={{ color: '#38bdf8' }}>{studentDetail.student.group_name}</strong></span>
                                            <span>•</span>
                                            <span>Estudiante: <strong style={{ color: 'var(--text-primary)' }}>{currentStudentIndex + 1} de {filteredStudents.length}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DIAGNÓSTICO AUTOMATIZADO */}
                            {studentDiagnosis && (
                                <div className="dossier-ai-insight">
                                    <Sparkles size={24} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem', color: '#0284c7', fontSize: '0.95rem', fontWeight: 800 }}>
                                            Diagnóstico Pedagógico y Recomendación de Refuerzo
                                        </h4>
                                        <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                            {studentDiagnosis.recommendation}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── DESGLOSE DETALLADO POR MÓDULOS Y LECCIONES ── */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FolderKanban size={20} color="#a855f7" />
                                    <span>Desglose de Avance por Módulos y Lecciones</span>
                                </h3>

                                <div className="dossier-modules-grid">
                                    {(() => {
                                        const gName = String(studentDetail?.student?.group_name || '').toLowerCase();
                                        const sCourse = gName.startsWith('re') || gName.includes('robot') || selectedCourse === 're' ? 're' : 'ee';
                                        const studentModules = COURSE_MODULES_MAP[sCourse] || COURSE_MODULES_MAP.ee;

                                        return studentModules.map(mod => {
                                            const totalModLessons = mod.lessons.length;
                                            // Buscar estado en las lecciones del estudiante
                                            const lessonsWithStatus = mod.lessons.map(l => {
                                                const lId = l.id.toLowerCase();
                                                // Buscar en studentDetail.lessons
                                                const found = (studentDetail.lessons || []).find(sl => String(sl.lesson_id).toLowerCase() === lId);
                                                // Buscar en intentos de evaluación
                                                const attempts = studentDetail.attemptsByEvaluation?.[lId] || studentDetail.attemptsByEvaluation?.[l.id] || [];
                                                const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

                                                const isCompleted = Boolean(
                                                    found?.status === 'completed' ||
                                                    (typeof found?.progress === 'number' && found?.progress >= 80) ||
                                                    attempts.some(a => a.passed || (a.score >= 80))
                                                );

                                                const isInProgress = !isCompleted && Boolean(
                                                    found?.status === 'in_progress' ||
                                                    (found?.progress > 0) ||
                                                    attempts.length > 0
                                                );

                                                return {
                                                    ...l,
                                                    isCompleted,
                                                    isInProgress,
                                                    score: lastAttempt?.score || null,
                                                    completedAt: found?.completed_at || lastAttempt?.completed_at || null,
                                                    attemptsCount: attempts.length
                                                };
                                            });

                                            const completedCount = lessonsWithStatus.filter(l => l.isCompleted).length;
                                            const modPercent = totalModLessons > 0 ? Math.round((completedCount / totalModLessons) * 100) : 0;

                                            return (
                                                <div key={mod.id} className="dossier-mod-card">
                                                    <div className="dossier-mod-header">
                                                        <div>
                                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                                                {mod.title}
                                                            </h4>
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                                {completedCount} de {totalModLessons} lecciones aprobadas ({modPercent}%)
                                                            </span>
                                                        </div>
                                                        <span className={`mod-status-pill ${modPercent === 100 ? 'complete' : modPercent > 0 ? 'progress' : 'empty'}`}>
                                                            {modPercent === 100 ? 'Completado ✓' : modPercent > 0 ? `${modPercent}%` : 'Pendiente'}
                                                        </span>
                                                    </div>

                                                    {/* Barra de Progreso */}
                                                    <div className="dossier-mod-progress-bar">
                                                        <div
                                                            className="dossier-mod-progress-fill"
                                                            style={{ width: `${modPercent}%`, background: modPercent === 100 ? '#10b981' : modPercent > 0 ? '#38bdf8' : 'transparent' }}
                                                        />
                                                    </div>

                                                    {/* Lista de Lecciones del Módulo */}
                                                    <div className="dossier-lessons-list">
                                                        {lessonsWithStatus.map(les => (
                                                            <div key={les.id} className="dossier-lesson-row">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                                    {les.isCompleted ? (
                                                                        <CheckCircle size={16} color="#10b981" />
                                                                    ) : les.isInProgress ? (
                                                                        <Clock size={16} color="#f59e0b" />
                                                                    ) : (
                                                                        <CircleDashed size={16} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                                                                    )}
                                                                    <div>
                                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: les.isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                                                            {les.short}: {les.title}
                                                                        </span>
                                                                        {les.completedAt && (
                                                                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                                                Aprobada el {new Date(les.completedAt).toLocaleDateString()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div style={{ textAlign: 'right' }}>
                                                                    {les.isCompleted ? (
                                                                        <span className="lesson-badge-completed">
                                                                            {les.score !== null ? `${les.score}% ✓` : 'Aprobada ✓'}
                                                                        </span>
                                                                    ) : les.isInProgress ? (
                                                                        <span className="lesson-badge-progress">
                                                                            {les.attemptsCount > 0 ? `${les.attemptsCount} intento(s)` : 'En curso ⏳'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="lesson-badge-pending">
                                                                            No iniciada
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            {/* CURVA DE INTENTOS Y EVALUACIONES */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrendingUp size={20} color="#10b981" />
                                    <span>Historial de Intentos por Prueba / Examen</span>
                                </h3>

                                {Object.keys(studentDetail.attemptsByEvaluation).length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>El estudiante aún no ha completado intentos de prueba registrados.</p>
                                ) : (
                                    <div className="dossier-attempts-timeline">
                                        {Object.entries(studentDetail.attemptsByEvaluation).map(([evalKey, attempts]) => {
                                            const isApproved = attempts.some(a => a.score >= 80);

                                            return (
                                                <div key={evalKey} className="attempt-eval-group">
                                                    <div className="eval-group-title">
                                                        <span>{evalKey.toUpperCase()}</span>
                                                        <span style={{ fontSize: '0.8rem', color: isApproved ? '#10b981' : '#ef4444' }}>
                                                            {isApproved ? 'Aprobado (≥80%) ✓' : 'En progreso (Requiere reintento)'}
                                                        </span>
                                                    </div>

                                                    <div className="attempts-pills">
                                                        {attempts.map((att, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`attempt-pill ${att.score >= 80 ? 'passed' : 'failed'}`}
                                                            >
                                                                <span>Intento #{att.attempt_number}:</span>
                                                                <strong>{att.score ?? 0}%</strong>
                                                                <span>{att.score >= 80 ? '✓' : '✗'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CONCEPTOS CRÍTICOS EN FLASHCARDS */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Brain size={20} color="#f59e0b" />
                                    <span>Dificultades en Repaso de Flashcards</span>
                                </h3>

                                {studentDetail.flashcards.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No hay registros de dificultad en tarjetas nemotécnicas.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
                                        {studentDetail.flashcards.map((fc, idx) => {
                                            const formatItemId = (lessonId, cardId) => {
                                                if (!lessonId || !cardId) return cardId;
                                                const parts = lessonId.toLowerCase().split('-');
                                                const course = (parts[0] || '').toUpperCase();
                                                const mod = (parts[1] || '').toUpperCase();
                                                const les = (parts[2] || '').toUpperCase();
                                                const id = cardId.toLowerCase();
                                                let suffix;
                                                if (id.startsWith('pr')) suffix = 'Pr' + id.slice(2);
                                                else if (id.startsWith('p')) suffix = 'P' + id.slice(1);
                                                else if (id.startsWith('f')) suffix = 'F' + id.slice(1);
                                                else suffix = cardId.toUpperCase();
                                                return `${course}-${mod}-${les}-${suffix}`;
                                            };
                                            return (
                                                <div key={idx} className="difficult-concept-item" style={{ margin: 0 }}>
                                                    <div className="concept-info">
                                                        <span className="concept-title">{formatItemId(fc.lesson_id, fc.card_id)}</span>
                                                        <span className="concept-meta">Lección: {fc.lesson_id} • Total repasos: {fc.attempts_count}</span>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span className="concept-badge" style={{
                                                            background: fc.unknown_count > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: fc.unknown_count > 0 ? '#ef4444' : '#10b981',
                                                            borderColor: fc.unknown_count > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                        }}>
                                                            {fc.unknown_count > 0 ? `${fc.unknown_count} veces dudó` : 'Dominada ✓'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* RETOS DE PRÁCTICA */}
                            <div>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Cpu size={20} color="#38bdf8" />
                                    <span>Perseverancia en Retos del Simulador</span>
                                </h3>

                                {studentDetail.challenges.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>El estudiante no registra fallos previos en retos prácticos.</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
                                        {studentDetail.challenges.map((ch, idx) => (
                                            <div key={idx} className="difficult-concept-item" style={{ margin: 0 }}>
                                                <div className="concept-info">
                                                    <span className="concept-title">{ch.exercise_title || `Reto #${ch.exercise_id}`}</span>
                                                    <span className="concept-meta">{ch.concept || ch.lesson_id} • Total intentos: {ch.attempts_count}</span>
                                                </div>
                                                <span className="concept-badge" style={{
                                                    background: ch.failures_count > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                    color: ch.failures_count > 0 ? '#f59e0b' : '#10b981',
                                                    borderColor: ch.failures_count > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                }}>
                                                    {ch.failures_count > 0 ? `${ch.failures_count} fallos previos` : 'A la primera ✓'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
