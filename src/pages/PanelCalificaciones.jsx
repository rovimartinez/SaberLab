import React, { useState, useEffect, useMemo } from 'react';
import { 
    Award, CheckCircle2, Clock, AlertCircle, Eye, Play,
    BookOpen, Calendar, TrendingUp, ShieldCheck, GraduationCap, Download, 
    ExternalLink, Users, Search, Filter, RefreshCw, X, FileSpreadsheet, ShieldAlert,
    ChevronDown, UserCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { COURSES_DEFINITION } from '../data/coursesData.jsx';
import '../styles/PanelEvaluaciones.css';
import '../styles/PanelCalificaciones.css';

const PanelCalificaciones = () => {
    const { user, profile, enrolledCourses, isStaff } = useAuth();
    const navigate = useNavigate();
    
    // Modo de vista: 'cohort' (Sábana de notas docente) | 'personal' (Libreta personal)
    // Los estudiantes SIEMPRE ven solo su vista personal
    const [viewMode, setViewMode] = useState(isStaff ? 'cohort' : 'personal');
    // Guardia de seguridad: si no es staff, forzar vista personal
    const effectiveViewMode = isStaff ? viewMode : 'personal';

    // Estados para vista estudiante
    const [myAttempts, setMyAttempts] = useState([]);
    const [loadingPersonal, setLoadingPersonal] = useState(true);

    // Estados para vista docente / cohorte
    const [cohortData, setCohortData] = useState({ 
        students: [], 
        groups: [], 
        totalMaxPoints: 500 
    });
    const [loadingCohort, setLoadingCohort] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('all');

    // Estado del modal de auditoría
    const [auditModal, setAuditModal] = useState({ open: false, student: null, moduleKey: null, evalData: null });

    const userMetadata = user?.user_metadata || {};
    const fullName = profile?.full_name || userMetadata.full_name || 'Estudiante';

    // ── 1. Cargar calificaciones personales (Estudiante) ──
    useEffect(() => {
        const fetchPersonalAttempts = async () => {
            if (!user) return;
            try {
                const { data } = await api('/attempts');
                if (data && Array.isArray(data)) {
                    setMyAttempts(data);
                }
            } catch (err) {
                console.error('Error al cargar historial personal:', err);
            } finally {
                setLoadingPersonal(false);
            }
        };

        fetchPersonalAttempts();
    }, [user]);

    // ── 2. Cargar sábana de calificaciones y vincular grupos reales de DB (Docente / Admin) ──
    const fetchCohortGrades = async () => {
        if (!isStaff) return;
        setLoadingCohort(true);
        try {
            // Consultar plataforma (perfiles, grupos, grupos_usuario, inscripciones) e intentos en paralelo
            const [platRes, gradesRes, attemptsRes] = await Promise.allSettled([
                api('/admin/plataforma'),
                api('/admin/grades'),
                api('/attempts?all_users=1')
            ]);

            const platData = platRes.status === 'fulfilled' ? platRes.value?.data : null;
            const gradesData = gradesRes.status === 'fulfilled' ? gradesRes.value?.data : null;
            const attemptsData = attemptsRes.status === 'fulfilled' ? attemptsRes.value?.data : [];

            // 1. Grupos reales
            const rawGroups = platData?.grupos || [];
            const groupMap = {};
            const courseGroupMap = {};
            rawGroups.forEach(g => {
                groupMap[g.id] = g.name;
                groupMap[String(g.id)] = g.name;
                if (g.course_id) {
                    courseGroupMap[g.course_id] = g.name;
                    courseGroupMap[String(g.course_id)] = g.name;
                }
                if (g.name?.includes('EE') || g.name?.includes('Electricidad')) {
                    courseGroupMap[1] = g.name;
                    courseGroupMap['1'] = g.name;
                }
                if (g.name?.includes('RE') || g.name?.includes('Robótica')) {
                    courseGroupMap[5] = g.name;
                    courseGroupMap['5'] = g.name;
                }
            });

            const defaultEEGroup = courseGroupMap[1] || 'EE-2026II';
            const defaultREGroup = courseGroupMap[5] || 'RE-2026II';

            // 2. Mapeos de grupos de usuario
            const userGroupsRaw = platData?.grupos_usuario || [];
            const inscripcionesRaw = platData?.inscripciones || [];

            // 3. Perfiles de estudiantes
            const rawPerfiles = platData?.perfiles || gradesData?.students || [];
            const rawAttempts = Array.isArray(attemptsData) ? attemptsData : [];

            // Función de matching flexible de usuario
            const matchesUser = (st, recordUserId) => {
                if (!recordUserId) return false;
                const rId = String(recordUserId).trim().toLowerCase();
                const sId = String(st.id || '').trim().toLowerCase();
                const sEmail = String(st.email || '').trim().toLowerCase();
                const sEmailUser = sEmail.includes('@') ? sEmail.split('@')[0] : '';
                return (
                    rId === sId ||
                    rId === sEmail ||
                    (sId && (rId.includes(sId) || sId.includes(rId))) ||
                    (sEmail && (rId.includes(sEmail) || sEmail.includes(rId))) ||
                    (sEmailUser && sEmailUser.length > 3 && (rId.includes(sEmailUser) || sEmailUser.includes(rId)))
                );
            };

            // Filtrar administradores
            const studentProfiles = rawPerfiles.filter(p => !['admin', 'docente', 'profesor'].includes(p.role?.toLowerCase()));
            const targetList = studentProfiles.length > 0 ? studentProfiles : rawPerfiles;

            const processedStudents = targetList.map(st => {
                // A. Resolver Grupo Real (fidelidad estricta a DB)
                let resolvedGroup = null;

                // 1. Buscar en grupos_usuario (prioridad directa)
                const guMatch = userGroupsRaw.find(gu => matchesUser(st, gu.user_id));
                if (guMatch && groupMap[guMatch.group_id]) {
                    resolvedGroup = groupMap[guMatch.group_id];
                }

                // 2. Si no, buscar en inscripciones
                if (!resolvedGroup) {
                    const insMatch = inscripcionesRaw.find(ins => matchesUser(st, ins.user_id));
                    if (insMatch && insMatch.group_id && groupMap[insMatch.group_id]) {
                        resolvedGroup = groupMap[insMatch.group_id];
                    }
                }

                // 3. Si no tiene grupo en DB, dejar como Sin Grupo Asignado
                if (!resolvedGroup) {
                    resolvedGroup = 'Sin Grupo Asignado';
                }

                // B. Resolver Evaluaciones e Intentos
                let evals = st.evaluations || {};

                // Buscar si tiene datos ya calculados de /admin/grades
                if (gradesData?.students) {
                    const gradeMatch = gradesData.students.find(gs => matchesUser(st, gs.id) || matchesUser(st, gs.email));
                    if (gradeMatch?.evaluations) {
                        evals = gradeMatch.evaluations;
                    }
                }

                // Si no, buscar directamente en intentos de evaluación
                if (!evals['ee-m1-l6']) {
                    const studentAttempts = rawAttempts.filter(a => matchesUser(st, a.user_id));
                    const l6Attempt = studentAttempts.find(a => String(a.evaluation_key).toLowerCase().includes('ee-m1-l6') || String(a.evaluation_key).toLowerCase().endsWith('-l6'));
                    
                    if (l6Attempt) {
                        let parsed = {};
                        try {
                            parsed = typeof l6Attempt.answers === 'string' ? JSON.parse(l6Attempt.answers) : (l6Attempt.answers || {});
                        } catch {}

                        const totalPts = l6Attempt.score || 0;
                        evals['ee-m1-l6'] = {
                            submitted: true,
                            totalPoints: totalPts,
                            maxPoints: 150,
                            theoryScore: Math.round(totalPts * 0.4),
                            maxTheory: 60,
                            practicalScore: Math.round(totalPts * 0.6),
                            maxPractical: 90,
                            percentage: Math.round((totalPts / 150) * 100),
                            passed: totalPts >= 90,
                            completedAt: l6Attempt.completed_at || l6Attempt.created_at,
                            antiCheat: parsed.anti_cheat || null
                        };
                    } else {
                        evals['ee-m1-l6'] = { submitted: false, maxPoints: 150, maxTheory: 60, maxPractical: 90 };
                    }
                }

                const totalEarned = (evals['ee-m1-l6']?.totalPoints || 0) + (evals['ee-m2-l10']?.totalPoints || 0) + (evals['ee-m3-l14']?.totalPoints || 0) + (evals['ee-m4-l16']?.totalPoints || 0);

                return {
                    id: st.id,
                    fullName: st.full_name || st.name || st.email?.split('@')[0] || 'Estudiante',
                    email: st.email,
                    avatarUrl: st.avatar_url || st.avatarUrl || null,
                    groupName: resolvedGroup,
                    evaluations: evals,
                    totalEarnedPoints: totalEarned,
                    totalMaxPoints: 500,
                    overallPercentage: Math.round((totalEarned / 500) * 100)
                };
            });

            // Extraer lista de grupos única
            const allGroupsList = Array.from(new Set([
                defaultEEGroup,
                defaultREGroup,
                ...rawGroups.map(g => g.name),
                ...processedStudents.map(s => s.groupName)
            ])).filter(Boolean);

            setCohortData({
                students: processedStudents,
                groups: allGroupsList,
                totalMaxPoints: 500
            });

        } catch (err) {
            console.error('Error al sincronizar sábana docente:', err);
        } finally {
            setLoadingCohort(false);
        }
    };

    useEffect(() => {
        if (isStaff) {
            fetchCohortGrades();
        }
    }, [isStaff]);

    // ── Escala de colores institucional para notas ──
    const getScoreColor = (score, max = 500) => {
        const normalized = max > 0 ? (score / max) * 500 : score;
        if (normalized < 300) return '#ef4444'; // Rojo
        if (normalized < 350) return '#f59e0b'; // Amarillo
        if (normalized < 450) return '#10b981'; // Verde
        return '#0284c7'; // Azul institucional
    };

    // ── Filtrar estudiantes en la vista docente ──
    const filteredStudents = useMemo(() => {
        return cohortData.students.filter(st => {
            const matchesGroup = selectedGroup === 'all' || st.groupName === selectedGroup;
            const query = searchQuery.toLowerCase().trim();
            const matchesQuery = !query || 
                (st.fullName && st.fullName.toLowerCase().includes(query)) ||
                (st.email && st.email.toLowerCase().includes(query));
            return matchesGroup && matchesQuery;
        });
    }, [cohortData.students, selectedGroup, searchQuery]);

    // ── Estadísticas de cohorte ──
    const cohortStats = useMemo(() => {
        const listToCalc = filteredStudents.length > 0 ? filteredStudents : cohortData.students;
        const totalSt = listToCalc.length;
        if (totalSt === 0) return { totalSt: 0, avgPoints: 0, m1Completed: 0, cleanRate: 100 };

        let sumPoints = 0;
        let m1CompCount = 0;
        let cleanCount = 0;
        let totalSubmitted = 0;

        listToCalc.forEach(st => {
            sumPoints += (st.totalEarnedPoints || 0);
            const m1 = st.evaluations?.['ee-m1-l6'];
            if (m1?.submitted) {
                m1CompCount++;
                totalSubmitted++;
                if (!m1.antiCheat?.strikes || m1.antiCheat.strikes === 0) {
                    cleanCount++;
                }
            }
        });

        const avgPoints = totalSt > 0 ? Math.round(sumPoints / totalSt) : 0;
        const cleanRate = totalSubmitted > 0 ? Math.round((cleanCount / totalSubmitted) * 100) : 100;

        return { totalSt, avgPoints, m1Completed: m1CompCount, cleanRate };
    }, [cohortData.students, filteredStudents]);

    // ── Exportar Planilla a CSV / Excel ──
    const exportToCSV = () => {
        if (!filteredStudents || filteredStudents.length === 0) return;

        const headers = [
            'Estudiante',
            'Correo',
            'Grupo',
            'M1_Total (150pts)',
            'M1_Teoria (60pts)',
            'M1_Practica (90pts)',
            'M1_Integridad',
            'M2_Total (125pts)',
            'M3_Total (125pts)',
            'M4_Total (100pts)',
            'Total_Acumulado (500pts)',
            'Porcentaje_Final',
            'Estado'
        ];

        const rows = filteredStudents.map(st => {
            const m1 = st.evaluations?.['ee-m1-l6'];
            const m2 = st.evaluations?.['ee-m2-l10'];
            const m3 = st.evaluations?.['ee-m3-l14'];
            const m4 = st.evaluations?.['ee-m4-l16'];

            return [
                `"${st.fullName}"`,
                `"${st.email}"`,
                `"${st.groupName}"`,
                m1?.submitted ? m1.totalPoints : 'Pendiente',
                m1?.submitted ? (m1.theoryScore ?? 0) : 0,
                m1?.submitted ? (m1.practicalScore ?? 0) : 0,
                m1?.submitted ? (m1.antiCheat?.strikes ? `${m1.antiCheat.strikes} Strikes` : 'Íntegro') : '—',
                m2?.submitted ? m2.totalPoints : 'Pendiente',
                m3?.submitted ? m3.totalPoints : 'Pendiente',
                m4?.submitted ? m4.totalPoints : 'Pendiente',
                st.totalEarnedPoints,
                `${st.overallPercentage}%`,
                st.overallPercentage >= 60 ? 'Aprobado' : 'En Curso'
            ];
        });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `SaberLab_Planilla_${selectedGroup === 'all' ? 'Todos_Grupos' : selectedGroup.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ── Abrir Auditoría de Examen ──
    const handleOpenAudit = (student, moduleKey) => {
        const evalData = student.evaluations?.[moduleKey];
        if (!evalData || !evalData.submitted) return;
        setAuditModal({
            open: true,
            student,
            moduleKey,
            evalData
        });
    };

    // ── Mapeo para vista de estudiante individual ──
    const coursesGrades = enrolledCourses.map(c => {
        const def = COURSES_DEFINITION.find(d => d.id === c.id || d.abbr === c.abbr || d.id === c.slug) || c;
        const modules = def.modules || [];

        const evaluations = modules.map((m, idx) => {
            const courseAbbr = (c.abbr || def.abbr || '').toLowerCase();
            let evalKey = m.evaluation?.id;
            if (!evalKey) {
                if (courseAbbr === 'ee') {
                    evalKey = idx === 0 ? 'ee-m1-l6' : `ee-m${idx + 1}-l${idx === 1 ? 10 : (idx === 2 ? 14 : 16)}`;
                } else {
                    evalKey = `${courseAbbr}-m${idx + 1}-eval`;
                }
            }
            const evalData = m.evaluation || {
                title: `Examen ${idx + 1}`,
                points: idx === 0 ? 150 : (idx === 3 ? 100 : 125),
                date: 'Pendiente'
            };

            const attempt = myAttempts.find(a => 
                (a.evaluation_key && a.evaluation_key.toLowerCase() === evalKey.toLowerCase()) && 
                a.completed_at
            ) || null;

            const isSubmitted = !!attempt;
            const pointsObtained = attempt ? (attempt.points_obtained ?? attempt.totalPts ?? attempt.score ?? 0) : null;
            const maxPoints = evalData.points || 150;
            const percentage = isSubmitted ? Math.round((pointsObtained / maxPoints) * 100) : 0;
            const passed = isSubmitted ? (percentage >= 60) : null;

            let antiCheat = null;
            let theoryPts = null;
            let practicalPts = null;

            if (attempt?.answers) {
                try {
                    const parsed = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;
                    antiCheat = parsed?.anti_cheat || null;
                    if (evalKey === 'ee-m1-l6') {
                        practicalPts = attempt.practicalScore ?? (parsed.practical ? 88 : 0);
                        theoryPts = isSubmitted ? Math.max(0, pointsObtained - (practicalPts || 0)) : null;
                    }
                } catch {}
            }

            const rawTitle = evalData.title || `Examen ${idx + 1}`;
            const cleanTitle = rawTitle
                .replace(/^Evaluaci[oó]n\s*\d*\s*:?\s*/i, '')
                .replace(/^Examen\s*\d*\s*:?\s*/i, '')
                .trim();
            const formattedTitle = `Evaluación Módulo ${idx + 1}: ${cleanTitle || m.name || rawTitle}`;

            return {
                id: evalKey,
                title: formattedTitle,
                moduleName: m.name,
                date: evalData.date,
                maxPoints,
                pointsObtained,
                theoryPts,
                practicalPts,
                percentage,
                isSubmitted,
                passed,
                antiCheat,
                submittedAt: attempt?.completed_at || attempt?.timestamp
            };
        });

        const totalMaxCoursePoints = evaluations.reduce((acc, e) => acc + e.maxPoints, 0);
        const totalPointsEarned = evaluations.reduce((acc, e) => acc + (e.pointsObtained || 0), 0);
        const coursePercentage = totalMaxCoursePoints > 0 ? Math.round((totalPointsEarned / totalMaxCoursePoints) * 100) : 0;

        return {
            ...c,
            ...def,
            evaluations,
            totalMaxCoursePoints,
            totalPointsEarned,
            coursePercentage
        };
    });

    return (
        <div className="grades-container">
            
            {/* ── ENCABEZADO ESTÁNDAR SABERLAB ── */}
            <div className="page-header blue" style={{ marginBottom: '0.25rem' }}>
                <div className="header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <GraduationCap size={32} className="text-gradient" />
                        <div>
                            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>
                                {effectiveViewMode === 'cohort' ? 'Sábana de Calificaciones de la Cohorte' : 'Libreta de Calificaciones'}
                            </h1>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Periodo Académico: <strong style={{ color: '#0284c7' }}>2026-II</strong>{isStaff && (<> • {selectedGroup === 'all' ? (
                                    <span>Vista General: <strong style={{ color: 'var(--text-primary)' }}>Todos los Grupos de la Cohorte</strong></span>
                                ) : selectedGroup.includes('EE') || selectedGroup.toLowerCase().includes('electricidad') ? (
                                    <span>Curso: <strong style={{ color: 'var(--text-primary)' }}>Fundamentos de Electricidad y Electrónica (EE)</strong> · Grupo: <strong style={{ color: '#0284c7' }}>{selectedGroup}</strong></span>
                                ) : selectedGroup.includes('RE') || selectedGroup.toLowerCase().includes('robótica') ? (
                                    <span>Curso: <strong style={{ color: 'var(--text-primary)' }}>Robótica Educativa (RE)</strong> · Grupo: <strong style={{ color: '#0284c7' }}>{selectedGroup}</strong></span>
                                ) : (
                                    <span>Grupo Seleccionado: <strong style={{ color: 'var(--text-primary)' }}>{selectedGroup}</strong></span>
                                )}</>)}
                            </p>
                        </div>
                    </div>

                    {/* Conmutador de vista para Docente / Admin */}
                    {isStaff && (
                        <div className="grades-view-tabs">
                            <button 
                                className={`grades-tab-btn ${viewMode === 'cohort' ? 'active' : ''}`}
                                onClick={() => setViewMode('cohort')}
                            >
                                <Users size={16} />
                                Planilla de Cohorte
                            </button>
                            <button 
                                className={`grades-tab-btn ${viewMode === 'personal' ? 'active' : ''}`}
                                onClick={() => setViewMode('personal')}
                            >
                                <Award size={16} />
                                Mi Libreta Personal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── VISTA 1: PLANILLA / SÁBANA DE CALIFICACIONES (DOCENTE/ADMIN) ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {effectiveViewMode === 'cohort' && isStaff && (
                <>
                    {/* Tarjetas de Métricas de la Cohorte */}
                    <div className="grades-stats-grid">
                        <div className="grades-stat-card">
                            <div className="grades-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7' }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <div className="grades-stat-val">{cohortStats.totalSt}</div>
                                <div className="grades-stat-lbl">
                                    {selectedGroup === 'all' ? 'Estudiantes en la Cohorte' : `Estudiantes en ${selectedGroup}`}
                                </div>
                            </div>
                        </div>

                        <div className="grades-stat-card">
                            <div className="grades-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                <Award size={24} />
                            </div>
                            <div>
                                <div className="grades-stat-val" style={{ color: cohortStats.avgPoints > 0 ? getScoreColor(cohortStats.avgPoints) : '#0284c7' }}>
                                    {cohortStats.avgPoints} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ 500 pts</span>
                                </div>
                                <div className="grades-stat-lbl">Promedio del Grupo</div>
                            </div>
                        </div>

                        <div className="grades-stat-card">
                            <div className="grades-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <div className="grades-stat-val">{cohortStats.m1Completed} / {cohortStats.totalSt}</div>
                                <div className="grades-stat-lbl">Módulo 1 Completado</div>
                            </div>
                        </div>

                        <div className="grades-stat-card">
                            <div className="grades-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <div className="grades-stat-val">{cohortStats.cleanRate}%</div>
                                <div className="grades-stat-lbl">Tasa de Integridad Anti-Fraude</div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de Herramientas: Buscador, Filtros y Descarga */}
                    <div className="grades-toolbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                            
                            {/* SELECTOR DE GRUPO DESTACADO */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Filter size={16} color="#0284c7" /> Grupo:
                                </span>
                                <select 
                                    className="grades-filter-select"
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    style={{ 
                                        minWidth: '220px', 
                                        fontWeight: 800, 
                                        borderColor: '#0284c7',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    <option value="all">👥 Todos los Grupos ({cohortData.students.length} estudiantes)</option>
                                    {cohortData.groups.map((g, idx) => {
                                        const count = cohortData.students.filter(s => s.groupName === g).length;
                                        return (
                                            <option key={idx} value={g}>
                                                📁 {g} ({count} estudiantes)
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Buscador en tiempo real */}
                            <div className="grades-search-box">
                                <Search size={18} color="#64748b" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nombre o correo de estudiante..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <X size={16} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
                                )}
                            </div>

                            <button 
                                onClick={fetchCohortGrades}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    padding: '0.55rem 0.85rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                                title="Actualizar notas"
                            >
                                <RefreshCw size={15} className={loadingCohort ? 'animate-spin' : ''} />
                                Actualizar
                            </button>
                        </div>

                        <button className="grades-export-btn" onClick={exportToCSV} disabled={filteredStudents.length === 0}>
                            <FileSpreadsheet size={18} />
                            Exportar {selectedGroup === 'all' ? 'Cohorte' : selectedGroup} a CSV / Excel
                        </button>
                    </div>

                    {/* Sábana de Notas (Matriz de Calificaciones) */}
                    <div className="grades-table-card">
                        
                        {/* Sub-barra informativa de conteo */}
                        <div style={{
                            padding: '0.75rem 1.25rem',
                            background: 'var(--bg-secondary)',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <span>
                                Mostrando <strong style={{ color: '#0284c7' }}>{filteredStudents.length}</strong> estudiante(s) en <strong style={{ color: 'var(--text-primary)' }}>{selectedGroup === 'all' ? 'Todos los Grupos' : selectedGroup}</strong>
                            </span>
                            <span style={{ fontSize: '0.8rem' }}>
                                Haz clic en la nota del <strong>Módulo 1</strong> para auditar el examen
                            </span>
                        </div>

                        <div className="grades-table-wrapper">
                            <table className="grades-matrix-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '24%' }}>ESTUDIANTE</th>
                                        <th style={{ width: '13%' }}>GRUPO</th>
                                        <th style={{ width: '16%' }}>
                                            MÓDULO 1 (150 pts)
                                            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
                                                {selectedGroup.includes('RE') ? 'Robótica y Mecanismos' : 'T: 60 pts · P: 90 pts'}
                                            </div>
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            MÓDULO 2 (125 pts)
                                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                                                {selectedGroup.includes('RE') ? 'Sensores y Actuadores' : '28 Sep 2026'}
                                            </div>
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            MÓDULO 3 (125 pts)
                                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                                                {selectedGroup.includes('RE') ? 'Controladores y Código' : '21 Oct 2026'}
                                            </div>
                                        </th>
                                        <th style={{ width: '11%' }}>
                                            MÓDULO 4 (100 pts)
                                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                                                {selectedGroup.includes('RE') ? 'Proyecto Final' : '18 Nov 2026'}
                                            </div>
                                        </th>
                                        <th style={{ width: '12%', textAlign: 'center' }}>TOTAL (500 pts)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingCohort ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#0284c7' }} />
                                                Cargando sábana de calificaciones en tiempo real...
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                                {selectedGroup === 'all' 
                                                    ? 'No hay estudiantes registrados en la base de datos de la plataforma.' 
                                                    : `No hay estudiantes asignados al grupo "${selectedGroup}".`}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map(st => {
                                            const m1 = st.evaluations?.['ee-m1-l6'];
                                            const m2 = st.evaluations?.['ee-m2-l10'];
                                            const m3 = st.evaluations?.['ee-m3-l14'];
                                            const m4 = st.evaluations?.['ee-m4-l16'];
                                            const totalColor = getScoreColor(st.totalEarnedPoints, st.totalMaxPoints);

                                            return (
                                                <tr key={st.id}>
                                                    {/* Estudiante */}
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                            {st.avatarUrl ? (
                                                                <img 
                                                                    src={st.avatarUrl} 
                                                                    alt={st.fullName} 
                                                                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(56, 189, 248, 0.4)' }} 
                                                                />
                                                            ) : (
                                                                <div style={{ 
                                                                    width: '38px', 
                                                                    height: '38px', 
                                                                    borderRadius: '50%', 
                                                                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                                                                    color: '#fff', 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    justifyContent: 'center',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.9rem'
                                                                }}>
                                                                    {st.fullName.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                                    {st.fullName}
                                                                </div>
                                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                                    {st.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Grupo */}
                                                    <td>
                                                        <span style={{ 
                                                            display: 'inline-block',
                                                            padding: '3px 10px', 
                                                            borderRadius: '8px', 
                                                            background: 'rgba(56, 189, 248, 0.12)', 
                                                            color: '#0284c7', 
                                                            border: '1px solid rgba(56, 189, 248, 0.3)', 
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700 
                                                        }}>
                                                            {st.groupName}
                                                        </span>
                                                    </td>

                                                    {/* Módulo 1 (EE-M1-L6) */}
                                                    <td>
                                                        {m1?.submitted ? (
                                                            <div 
                                                                className="module-grade-cell" 
                                                                onClick={() => handleOpenAudit(st, 'ee-m1-l6')}
                                                                style={{ cursor: 'pointer' }}
                                                                title="Clic para ver desglose y auditoría completa"
                                                            >
                                                                <div className="module-grade-main">
                                                                    <span style={{ color: m1.passed ? '#10b981' : '#f87171' }}>
                                                                        {m1.totalPoints} / {m1.maxPoints} pts
                                                                    </span>
                                                                    {m1.antiCheat?.strikes > 0 ? (
                                                                        <ShieldAlert size={14} color="#f59e0b" title={`${m1.antiCheat.strikes} Advertencias anti-fraude`} />
                                                                    ) : (
                                                                        <ShieldCheck size={14} color="#10b981" title="Examen 100% íntegro" />
                                                                    )}
                                                                </div>
                                                                <div className="module-grade-breakdown">
                                                                    <span className="breakdown-t">T: {m1.theoryScore ?? 0}</span>
                                                                    <span>·</span>
                                                                    <span className="breakdown-p">P: {m1.practicalScore ?? 0}</span>
                                                                    <Eye size={12} color="#64748b" style={{ marginLeft: '2px' }} />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="grade-pending-pill">
                                                                <Clock size={12} /> Pendiente
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Módulo 2 (EE-M2-L10) */}
                                                    <td>
                                                        {m2?.submitted ? (
                                                            <div className="module-grade-cell">
                                                                <div className="module-grade-main" style={{ color: '#10b981' }}>
                                                                    {m2.totalPoints} / {m2.maxPoints} pts
                                                                </div>
                                                                <div className="module-grade-breakdown">
                                                                    <span className="breakdown-t">T: {m2.theoryScore ?? 0}</span>
                                                                    <span>·</span>
                                                                    <span className="breakdown-p">P: {m2.practicalScore ?? 0}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="grade-pending-pill">
                                                                <Clock size={12} /> 28 Sep
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Módulo 3 (EE-M3-L14) */}
                                                    <td>
                                                        {m3?.submitted ? (
                                                            <div className="module-grade-cell">
                                                                <div className="module-grade-main" style={{ color: '#10b981' }}>
                                                                    {m3.totalPoints} / {m3.maxPoints} pts
                                                                </div>
                                                                <div className="module-grade-breakdown">
                                                                    <span className="breakdown-t">T: {m3.theoryScore ?? 0}</span>
                                                                    <span>·</span>
                                                                    <span className="breakdown-p">P: {m3.practicalScore ?? 0}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="grade-pending-pill">
                                                                <Clock size={12} /> 21 Oct
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Módulo 4 (EE-M4-L16) */}
                                                    <td>
                                                        {m4?.submitted ? (
                                                            <div className="module-grade-cell">
                                                                <div className="module-grade-main" style={{ color: '#10b981' }}>
                                                                    {m4.totalPoints} / {m4.maxPoints} pts
                                                                </div>
                                                                <div className="module-grade-breakdown">
                                                                    <span className="breakdown-t">T: {m4.theoryScore ?? 0}</span>
                                                                    <span>·</span>
                                                                    <span className="breakdown-p">P: {m4.practicalScore ?? 0}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="grade-pending-pill">
                                                                <Clock size={12} /> 18 Nov
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Total Acumulado */}
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div style={{ fontWeight: 900, fontSize: '1.05rem', color: totalColor }}>
                                                            {st.totalEarnedPoints} / {st.totalMaxPoints}
                                                        </div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                                            {st.overallPercentage}%
                                                        </div>
                                                        <div style={{ 
                                                            width: '70px', 
                                                            height: '4px', 
                                                            background: 'rgba(0,0,0,0.08)', 
                                                            borderRadius: '4px', 
                                                            margin: '4px auto 0 auto',
                                                            overflow: 'hidden' 
                                                        }}>
                                                            <div style={{ 
                                                                width: `${Math.min(100, st.overallPercentage)}%`, 
                                                                height: '100%', 
                                                                background: totalColor,
                                                                borderRadius: '4px' 
                                                            }} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── VISTA 2: LIBRETA PERSONAL DEL ESTUDIANTE ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {effectiveViewMode === 'personal' && (
                coursesGrades.map(course => {
                    const courseScoreColor = getScoreColor(course.totalPointsEarned, course.totalMaxCoursePoints || 500);
                    return (
                    <div key={course.id || course.slug} className="glass-panel" style={{
                        padding: '2rem',
                        borderRadius: '24px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        {/* Encabezado del Curso */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            borderBottom: '1px solid var(--glass-border)',
                            paddingBottom: '1.25rem'
                        }}>
                            <div>
                                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', margin: '0 0 0.3rem 0', fontWeight: 800 }}>
                                    {course.name}
                                </h2>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                                    Docente: <strong style={{ color: 'var(--text-primary)' }}>{course.teacher || 'Ronny Martinez Reyes'}</strong>
                                </span>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: courseScoreColor }}>
                                    {course.totalPointsEarned} / {course.totalMaxCoursePoints} pts ({course.coursePercentage}%)
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Ponderación acumulada
                                </span>
                            </div>
                        </div>

                        {/* Tabla de Evaluaciones */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '0.75rem 1rem' }}>EVALUACIÓN</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>FECHA OFICIAL</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>PESO</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>PUNTAJE (TOTAL / T / P)</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ESTADO</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>INTEGRIDAD</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {course.evaluations.map((ev, idx) => (
                                        <tr key={ev.id || idx} style={{
                                            borderBottom: '1px solid var(--glass-border)',
                                            transition: 'background 0.2s'
                                        }}>
                                            <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                                                {ev.title}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {ev.date}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: '#f59e0b', fontWeight: 800, fontSize: '0.9rem' }}>
                                                {ev.maxPoints} pts
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {ev.isSubmitted ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                        <span style={{
                                                            color: ev.passed ? '#10b981' : '#f87171',
                                                            fontWeight: 900,
                                                            fontSize: '1.05rem'
                                                        }}>
                                                            {ev.pointsObtained} pts
                                                        </span>
                                                        {ev.id === 'ee-m1-l6' && ev.isSubmitted && (ev.theoryPts != null || ev.practicalPts != null) && (
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                                                (T: <strong style={{ color: '#0284c7' }}>{ev.theoryPts ?? 0}</strong> · P: <strong style={{ color: '#10b981' }}>{ev.practicalPts ?? 0}</strong>)
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {ev.isSubmitted ? (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        minWidth: '110px',
                                                        height: '34px',
                                                        boxSizing: 'border-box',
                                                        padding: '0 0.9rem',
                                                        borderRadius: '9px',
                                                        background: 'rgba(16, 185, 129, 0.15)',
                                                        color: '#10b981',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <CheckCircle2 size={15} />
                                                        Realizado
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        minWidth: '110px',
                                                        height: '34px',
                                                        boxSizing: 'border-box',
                                                        padding: '0 0.9rem',
                                                        borderRadius: '9px',
                                                        background: 'var(--glass-bg)',
                                                        color: 'var(--text-secondary)',
                                                        border: '1px solid var(--glass-border)',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <Clock size={15} />
                                                        Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {ev.isSubmitted ? (
                                                    ev.antiCheat?.strikes > 0 ? (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            minWidth: '115px',
                                                            height: '34px',
                                                            boxSizing: 'border-box',
                                                            padding: '0 0.9rem',
                                                            borderRadius: '9px',
                                                            background: ev.antiCheat.strikes >= 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                            border: `1px solid ${ev.antiCheat.strikes >= 3 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                                                            fontSize: '0.82rem',
                                                            fontWeight: 800,
                                                            color: ev.antiCheat.strikes >= 3 ? '#ef4444' : '#f59e0b',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            <ShieldCheck size={15} />
                                                            {ev.antiCheat.strikes >= 3 ? 'Infracción (3/3)' : `${ev.antiCheat.strikes} Advertencia(s)`}
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            minWidth: '115px',
                                                            height: '34px',
                                                            boxSizing: 'border-box',
                                                            padding: '0 0.9rem',
                                                            borderRadius: '9px',
                                                            background: 'rgba(16, 185, 129, 0.12)',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 800,
                                                            color: '#10b981',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            <ShieldCheck size={15} />
                                                            100% Íntegro
                                                        </span>
                                                    )
                                                ) : (
                                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {ev.isSubmitted ? (
                                                    <button
                                                        onClick={() => navigate(`/dashboard/evaluations/${ev.id}/play?review=true`)}
                                                        style={{
                                                            minWidth: '125px',
                                                            height: '34px',
                                                            boxSizing: 'border-box',
                                                            padding: '0 1rem',
                                                            borderRadius: '9px',
                                                            background: 'rgba(56, 189, 248, 0.15)',
                                                            border: '1px solid rgba(56, 189, 248, 0.35)',
                                                            color: '#0284c7',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            whiteSpace: 'nowrap',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <Eye size={15} />
                                                        Ver Examen
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL DE AUDITORÍA Y DESGLOSE DETALLADO DEL EXAMEN ── */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {auditModal.open && auditModal.student && auditModal.evalData && (
                <div className="audit-modal-backdrop" onClick={() => setAuditModal({ open: false, student: null, moduleKey: null, evalData: null })}>
                    <div className="audit-modal-card" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Encabezado del Modal */}
                        <div className="audit-modal-header">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                                        Auditoría de Examen · {auditModal.moduleKey === 'ee-m1-l6' ? 'Módulo 1: Fundamentos Eléctricos' : auditModal.moduleKey}
                                    </h3>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Estudiante: <strong style={{ color: '#0284c7' }}>{auditModal.student.fullName}</strong> ({auditModal.student.groupName}) • Finalizado: {auditModal.evalData.completedAt ? new Date(auditModal.evalData.completedAt).toLocaleString() : 'Fecha registrada'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setAuditModal({ open: false, student: null, moduleKey: null, evalData: null })}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Cuerpo del Modal */}
                        <div className="audit-modal-body">
                            
                            {/* Resumen de Puntajes en 3 Cajas */}
                            <div className="audit-score-summary">
                                <div className="audit-score-box" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.06)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>PUNTAJE TOTAL</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                                        {auditModal.evalData.totalPoints} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {auditModal.evalData.maxPoints} pts</span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: auditModal.evalData.passed ? '#10b981' : '#f87171' }}>
                                        {auditModal.evalData.percentage}% ({auditModal.evalData.passed ? 'Aprobado ✓' : 'Reprobado ✗'})
                                    </div>
                                </div>

                                <div className="audit-score-box" style={{ border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>TEORÍA (T)</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                                        {auditModal.evalData.theoryScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {auditModal.evalData.maxTheory} pts</span>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        30 Preguntas conceptuales
                                    </div>
                                </div>

                                <div className="audit-score-box" style={{ border: '1px solid rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.05)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>PRÁCTICA (P)</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                                        {auditModal.evalData.practicalScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {auditModal.evalData.maxPractical} pts</span>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        Laboratorio esquemático SVG (8 resistores)
                                    </div>
                                </div>
                            </div>

                            {/* Panel de Seguridad y Anti-Fraude */}
                            <div style={{
                                background: auditModal.evalData.antiCheat?.strikes > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                border: `1px solid ${auditModal.evalData.antiCheat?.strikes > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                borderRadius: '14px',
                                padding: '1rem 1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {auditModal.evalData.antiCheat?.strikes > 0 ? (
                                        <ShieldAlert size={26} color="#f59e0b" />
                                    ) : (
                                        <ShieldCheck size={26} color="#10b981" />
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                            {auditModal.evalData.antiCheat?.strikes > 0 ? 'Incidencias Anti-Copia Detectadas' : 'Auditoría de Integridad: 100% Limpio'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {auditModal.evalData.antiCheat?.strikes > 0 
                                                ? `El alumno registró ${auditModal.evalData.antiCheat.strikes} advertencias durante la sesión de examen.`
                                                : 'El alumno permaneció en pantalla completa durante toda la sesión sin cambiar de pestaña.'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                                    <div>Pestañas: <strong>{auditModal.evalData.antiCheat?.tab_switches ?? 0}</strong></div>
                                    <div>Salidas Pantalla: <strong>{auditModal.evalData.antiCheat?.fullscreen_exits ?? 0}</strong></div>
                                </div>
                            </div>

                            {/* Desglose de Mediciones Prácticas (si existen) */}
                            {auditModal.evalData.practicalItems && Object.keys(auditModal.evalData.practicalItems).length > 0 && (
                                <div>
                                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                                        Desglose de Mediciones en Circuito Esquemático:
                                    </h4>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
                                        gap: '0.6rem',
                                        maxHeight: '220px',
                                        overflowY: 'auto'
                                    }}>
                                        {Object.entries(auditModal.evalData.practicalItems).map(([k, item]) => (
                                            <div key={k} style={{
                                                background: item.ok ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                                border: `1px solid ${item.ok ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                                                borderRadius: '10px',
                                                padding: '0.6rem 0.8rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                                        {k.toUpperCase()}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        Ingresado: <strong style={{ color: item.ok ? '#10b981' : '#f87171' }}>{item.value !== null ? item.value : '—'} {item.unit}</strong>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ 
                                                        fontWeight: 800, 
                                                        fontSize: '0.85rem', 
                                                        color: item.ok ? '#10b981' : '#ef4444' 
                                                    }}>
                                                        {item.pts} pts
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PanelCalificaciones;
