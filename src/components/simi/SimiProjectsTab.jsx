import { useState, useEffect } from 'react';
import { 
    Plus, X, Edit3, Trash2, Box, ExternalLink, Globe, Link2, Youtube, 
    FolderGit2, HelpCircle, Sparkles, ChevronRight, Info, Lock, Unlock, 
    Users, UserCheck, Shield, Check, Archive, CheckCircle2, RotateCcw
} from 'lucide-react';
import { SIMI_PROJECTS } from '../../data/simiData';
import { api } from '../../lib/api';
import { useAuth } from '../../context/useAuth';

// ── Definición Canónica de las 7 Etapas de Desarrollo de Proyectos SIMI3D ──
export const PROJECT_STAGES = [
    {
        id: '1',
        name: 'Investigación y Diagnóstico',
        color: '#0284c7',
        bg: '#e0f2fe',
        border: '#bae6fd',
        shortDesc: 'Estudio de necesidades, estado del arte (sensores vs visión) y trabajo de campo con la comunidad usuaria.',
        details: [
            'Estudio y alcance: Definir el dialecto/variante específica (ej: LSC, ASL) y alcance (alfabeto dactilológico vs gestos completos).',
            'Estado del arte: Evaluar soluciones existentes (sensores de flexión vs visión artificial) y limitaciones previas.',
            'Trabajo de campo: Consulta con usuarios finales e intérpretes para validar la ergonomía y pertinencia comunicativa.'
        ]
    },
    {
        id: '2',
        name: 'Conceptualización y Definición Técnica',
        color: '#7c3aed',
        bg: '#ede9fe',
        border: '#ddd6fe',
        shortDesc: 'Selección de variables sensoriales (flexión, IMU, tacto) y arquitectura hardware/software embebida.',
        details: [
            'Selección de variables: Flexión articular, orientación espacial 6-DOF (IMU MPU6050) y contacto capacitivo.',
            'Arquitectura de hardware: Microcontrolador (ESP32, Nano, RP2040) y protocolo de enlace (Bluetooth BLE / Wi-Fi).',
            'Método de procesamiento: Clasificación inteligente con algoritmos Machine Learning (SVM, Random Forest, TinyML).'
        ]
    },
    {
        id: '3',
        name: 'Diseño',
        color: '#2563eb',
        bg: '#dbeafe',
        border: '#bfdbfe',
        shortDesc: 'Diseño del circuito electrónico, placa PCB, patronaje textil ergonómico e interfaz de salida (App/Audio).',
        details: [
            'Diseño electrónico: Esquema, gestión de energía (batería LiPo, reguladores) y diseño de PCB o conexionado flexible.',
            'Diseño textil y ergonómico: Selección de tejido elástico transpirable y rutado de cables anti-tensión.',
            'Diseño de interfaz: UI de app móvil o pantalla/parlante con síntesis de voz (Text-to-Speech).'
        ]
    },
    {
        id: '4',
        name: 'Prototipado',
        color: '#9333ea',
        bg: '#f5e8ff',
        border: '#B541FA',
        shortDesc: 'De la prueba de concepto (PoC en protoboard) al prototipo funcional (MVP con dataset y modelo entrenado).',
        details: [
            'PoC (Baja Fidelidad): Montaje en protoboard de sensores de flexión y verificación de lecturas analógicas por serial.',
            'MVP (Prototipo Funcional): 5 sensores integrados sobre guante base y sensor inercial.',
            'Entrenamiento inicial: Captura de dataset de gestos (30–50 repeticiones por seña) y despliegue del clasificador.'
        ]
    },
    {
        id: '5',
        name: 'Pruebas y Validación',
        color: '#d97706',
        bg: '#fefce8',
        border: '#f59e0b',
        shortDesc: 'Medición de latencia, precisión del modelo clasificador y pruebas de usabilidad con usuarios señantes nativos.',
        details: [
            'Métricas técnicas: Latencia de respuesta, precisión (accuracy / matriz de confusión) y autonomía de batería.',
            'Validación de usabilidad: Pruebas con señantes nativos evaluando fluidez, comodidad y velocidad natural de gesticulación.'
        ]
    },
    {
        id: '6',
        name: 'Implementación y Refinamiento',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#10b981',
        shortDesc: 'Carcasas protectoras impresas en 3D, PCB a medida, cableado final y app móvil empaquetada con TTS.',
        details: [
            'Carcasas 3D: Impresión 3D de chasis ergonómicos para la electrónica de muñeca y antebrazo.',
            'Integración final: Placa PCB definitiva, soldaduras protegidas e integración robusta con síntesis de voz.'
        ]
    },
    {
        id: '7',
        name: 'Evaluación y Cierre',
        color: '#0d9488',
        bg: '#ccfbf1',
        border: '#5eead4',
        shortDesc: 'Medición de impacto real en la comunicación cotidiana, documentación técnica abierta y manuales.',
        details: [
            'Medición de impacto: Evaluación del cumplimiento de objetivos de inclusión comunicativa.',
            'Documentación técnica: Diagramas esquemáticos, código fuente, dataset de señas y manual de mantenimiento.'
        ]
    }
];

// ── Utilidad para Formatear y Generar IDs Hexadecimales SIMI (ej: SIMI0001, SIMI000A, SIMI0010) ──
export function formatSimiHexId(id, fallbackIndex = 1) {
    if (!id) {
        return `SIMI${fallbackIndex.toString(16).toUpperCase().padStart(4, '0')}`;
    }
    const str = String(id).trim();
    if (/^SIMI[0-9A-Fa-f]{4,}$/i.test(str)) {
        return str.toUpperCase();
    }
    const digits = str.replace(/\D/g, '');
    if (digits) {
        const num = parseInt(digits, 10);
        if (!isNaN(num)) {
            return `SIMI${num.toString(16).toUpperCase().padStart(4, '0')}`;
        }
    }
    return str;
}

export function generateNextSimiHexId(existingProjects = []) {
    let maxHexNum = 0;
    existingProjects.forEach(p => {
        if (p && p.id) {
            const m = String(p.id).match(/^SIMI([0-9A-Fa-f]+)$/i);
            if (m) {
                const parsed = parseInt(m[1], 16);
                if (!isNaN(parsed) && parsed > maxHexNum) {
                    maxHexNum = parsed;
                }
            }
        }
    });
    const nextNum = maxHexNum + 1;
    return `SIMI${nextNum.toString(16).toUpperCase().padStart(4, '0')}`;
}

// Subcomponente de Banco de Proyectos & Prototipos 3D (Editable para líder/admin)
export default function SimiProjectsTab({ isLeader, profile, members = [], initialProjects, onProjectsChange }) {
    const { refreshNotifications } = useAuth();
    const currentUserId = (profile?.id || profile?.email || '').toLowerCase();
    const currentUserEmail = (profile?.email || '').toLowerCase();

    // Función auxiliar para deduplicar y normalizar proyectos
    const normalizeAndDeduplicate = (list) => {
        if (!Array.isArray(list) || list.length === 0) return [];
        const seenIds = new Set();
        const seenTitles = new Set();
        const result = [];
        let runningIdx = 1;

        for (const p of list) {
            if (!p) continue;
            let currentId = formatSimiHexId(p.id, runningIdx);
            const titleKey = (p.title || '').trim().toLowerCase();

            // Si ya existe un proyecto con exactamente el mismo ID o el mismo título idéntico duplicado
            if (seenIds.has(currentId) || (titleKey && seenTitles.has(titleKey))) {
                continue;
            }

            seenIds.add(currentId);
            if (titleKey) seenTitles.add(titleKey);

            let assignedMembers = [];
            if (p.assignedMembers) {
                assignedMembers = Array.isArray(p.assignedMembers) ? p.assignedMembers : [];
            } else if (p.assigned_members) {
                try {
                    assignedMembers = typeof p.assigned_members === 'string' ? JSON.parse(p.assigned_members) : p.assigned_members;
                } catch {
                    assignedMembers = [];
                }
            }

            const isPrivate = p.isPrivate === true || p.is_private === 1 || p.is_private === true;

            result.push({
                ...p,
                id: currentId,
                isPrivate,
                is_private: isPrivate ? 1 : 0,
                assignedMembers,
                assigned_members: assignedMembers
            });
            runningIdx++;
        }
        return result;
    };

    const [projects, setProjects] = useState(() => {
        let list = SIMI_PROJECTS;
        if (initialProjects && initialProjects.length > 0) {
            list = initialProjects;
        } else {
            const saved = localStorage.getItem('simi_projects_list');
            if (saved) {
                try { list = JSON.parse(saved); } catch (e) { }
            }
        }
        return normalizeAndDeduplicate(list || SIMI_PROJECTS);
    });

    useEffect(() => {
        if (initialProjects && initialProjects.length > 0) {
            const normalized = normalizeAndDeduplicate(initialProjects);
            setProjects(normalized);
        }
    }, [initialProjects]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isStageGuideOpen, setIsStageGuideOpen] = useState(false);
    const [activeStageDetail, setActiveStageDetail] = useState(PROJECT_STAGES[0]);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // Filtro para el líder: 'all' | 'my_assigned' | 'public' | 'private'
    const [privacyFilter, setPrivacyFilter] = useState('all');

    // Estados del formulario
    const [formTitle, setFormTitle] = useState('');
    const [formAuthor, setFormAuthor] = useState('');
    const [formStatus, setFormStatus] = useState('Prototipado');
    const [formCadTool, setFormCadTool] = useState('Fusion 360');
    const [formMaterial, setFormMaterial] = useState('');
    const [formPrintTime, setFormPrintTime] = useState('');
    const [formWeightGrams, setFormWeightGrams] = useState(100);
    const [formDescription, setFormDescription] = useState('');
    
    // Privacidad y Miembros Asignados
    const [formIsPrivate, setFormIsPrivate] = useState(false);
    const [formAssignedMembers, setFormAssignedMembers] = useState([]);
    
    // 3 Enlaces de Ejemplo / Fuentes
    const [formCadUrl, setFormCadUrl] = useState('');
    const [formRepoUrl, setFormRepoUrl] = useState('');
    const [formVideoUrl, setFormVideoUrl] = useState('');

    const persistProjects = (updated) => {
        setProjects(updated);
        localStorage.setItem('simi_projects_list', JSON.stringify(updated));
        if (onProjectsChange) onProjectsChange(updated);
    };

    const handleOpenAdd = () => {
        setEditingProject(null);
        setFormTitle('');
        setFormAuthor('Semillero SIMI3D');
        setFormStatus('Investigación y Diagnóstico');
        setFormCadTool('Fusion 360');
        setFormMaterial('PLA+ / PETG');
        setFormPrintTime('5h 30m');
        setFormWeightGrams(120);
        setFormDescription('');
        setFormIsPrivate(false);
        setFormAssignedMembers([]);
        setFormCadUrl('');
        setFormRepoUrl('');
        setFormVideoUrl('');
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (proj) => {
        setEditingProject(proj);
        setFormTitle(proj.title || '');
        setFormAuthor(proj.author || 'Semillero SIMI3D');

        // Normalizar etapa al nombre canónico exacto
        const rawStatus = (proj.status || '').trim();
        const matched = PROJECT_STAGES.find(s => {
            const sName = s.name.toLowerCase();
            const rStatus = rawStatus.toLowerCase();
            return rStatus === sName ||
                   rStatus === `${s.id}. ${sName}` ||
                   rStatus.startsWith(`${s.id}.`) ||
                   rStatus.startsWith(`${s.id} `) ||
                   rStatus.includes(sName) ||
                   sName.includes(rStatus);
        });

        if (matched) {
            setFormStatus(matched.name);
        } else if (rawStatus === 'Completado y Validado' || rawStatus === 'Pausado') {
            setFormStatus(rawStatus);
        } else {
            setFormStatus(rawStatus || 'Investigación y Diagnóstico');
        }

        setFormCadTool(proj.cadTool || proj.cad_tool || 'Fusion 360');
        setFormMaterial(proj.material || '');
        setFormPrintTime(proj.printTime || proj.print_time || '');
        setFormWeightGrams(proj.weightGrams || proj.weight_grams || 100);
        setFormDescription(proj.description || '');
        
        const isPriv = proj.isPrivate === true || proj.is_private === 1 || proj.is_private === true;
        setFormIsPrivate(isPriv);
        const currentMembers = Array.isArray(proj.assignedMembers) ? proj.assignedMembers : (Array.isArray(proj.assigned_members) ? proj.assigned_members : []);
        setFormAssignedMembers(currentMembers);
        setFormCadUrl(proj.cadUrl || proj.cad_url || '');
        setFormRepoUrl(proj.repoUrl || proj.repo_url || '');
        setFormVideoUrl(proj.videoUrl || proj.video_url || '');
        setIsAddModalOpen(true);
    };

    const handleToggleMember = (member) => {
        const exists = formAssignedMembers.some(m => (m.id && m.id === member.id) || (m.email && m.email === member.email));
        if (exists) {
            setFormAssignedMembers(prev => prev.filter(m => !((m.id && m.id === member.id) || (m.email && m.email === member.email))));
        } else {
            setFormAssignedMembers(prev => [
                ...prev,
                {
                    id: member.id,
                    name: member.full_name || member.name || member.email,
                    email: member.email,
                    avatarUrl: member.avatar_url || null
                }
            ]);
        }
    };

    const handleDeletePrompt = (proj) => {
        setProjectToDelete(proj);
    };

    const executeDelete = async () => {
        if (!projectToDelete) return;
        const id = projectToDelete.id;
        const updated = projects.filter(p => p.id !== id);
        persistProjects(updated);
        setProjectToDelete(null);
        try {
            await api('/simi', {
                method: 'POST',
                body: { action: 'delete-project', id }
            });
        } catch (err) {
            console.warn('[SIMI] Fallback local delete project:', err);
        }
    };

    const handleSaveForm = async (e) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        const projectPayload = {
            title: formTitle.trim(),
            author: (formAuthor || 'Semillero SIMI3D').trim(),
            status: formStatus,
            cadTool: formCadTool || 'Fusion 360',
            cad_tool: formCadTool || 'Fusion 360',
            material: formMaterial || '',
            printTime: formPrintTime || '',
            print_time: formPrintTime || '',
            weightGrams: Number(formWeightGrams) || 100,
            weight_grams: Number(formWeightGrams) || 100,
            description: formDescription.trim(),
            isPrivate: formIsPrivate,
            is_private: formIsPrivate ? 1 : 0,
            assignedMembers: formAssignedMembers,
            assigned_members: formAssignedMembers,
            cadUrl: formCadUrl.trim(),
            cad_url: formCadUrl.trim(),
            repoUrl: formRepoUrl.trim(),
            repo_url: formRepoUrl.trim(),
            videoUrl: formVideoUrl.trim(),
            video_url: formVideoUrl.trim()
        };

        if (editingProject) {
            const updated = projects.map(p => p.id === editingProject.id ? {
                ...p,
                ...projectPayload
            } : p);
            persistProjects(updated);
            setIsAddModalOpen(false);
            setEditingProject(null);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-project', id: editingProject.id, ...projectPayload }
                });
                if (refreshNotifications) refreshNotifications();
            } catch (err) {
                console.warn('[SIMI] Fallback local save project:', err);
            }
        } else {
            const newId = generateNextSimiHexId(projects);
            const newProj = {
                id: newId,
                ...projectPayload
            };
            const updated = [newProj, ...projects];
            persistProjects(updated);
            setIsAddModalOpen(false);
            setEditingProject(null);
            try {
                await api('/simi', {
                    method: 'POST',
                    body: { action: 'save-project', id: newId, ...projectPayload }
                });
                if (refreshNotifications) refreshNotifications();
            } catch (err) {
                console.warn('[SIMI] Fallback local add project:', err);
            }
        }
    };

    // Función para cambiar de estado rápidamente (Finalizar / Archivar / Reactivar)
    const handleQuickStatusChange = async (proj, newStatus, e) => {
        if (e) e.stopPropagation();
        if (!isLeader) return;
        const updated = projects.map(p => p.id === proj.id ? { ...p, status: newStatus } : p);
        persistProjects(updated);
        try {
            await api('/simi', {
                method: 'POST',
                body: { action: 'save-project', id: proj.id, ...proj, status: newStatus }
            });
        } catch (err) {
            console.warn('[SIMI] Fallback local update status:', err);
        }
    };

    // Lógica de filtrado según rol y ordenamiento de menor a mayor por ID
    const visibleProjects = projects
        .filter(proj => {
            const isPriv = proj.isPrivate === true || proj.is_private === 1 || proj.is_private === true;
            const assigned = Array.isArray(proj.assignedMembers) ? proj.assignedMembers : (Array.isArray(proj.assigned_members) ? proj.assigned_members : []);
            
            // Si es líder / docente: puede ver todos los proyectos o filtrar
            if (isLeader) {
                if (privacyFilter === 'public') return !isPriv;
                if (privacyFilter === 'private') return isPriv;
                return true;
            }

            // Si es estudiante:
            // Si el proyecto es público (!isPriv), lo ven todos los estudiantes.
            if (!isPriv) return true;

            // Si el proyecto es privado/restringido (isPriv), SOLO lo ven quienes fueron asignados
            const isAssigned = assigned.some(m => {
                if (!m) return false;
                const mId = (m.id || '').toString().toLowerCase();
                const mEmail = (m.email || '').toString().toLowerCase();
                const mName = (m.name || m.full_name || '').toString().toLowerCase();
                
                return (mId && currentUserId && (mId === currentUserId || currentUserId.includes(mId) || mId.includes(currentUserId))) || 
                       (mEmail && currentUserEmail && (mEmail === currentUserEmail || currentUserEmail.includes(mEmail))) ||
                       (mName && profile?.name && mName === profile.name.toLowerCase());
            });

            return isAssigned;
        })
        .sort((a, b) => {
            // Ordenar de MENOR a MAYOR por ID Hexadecimal (SIMI0001 < SIMI0002 < SIMI000A ...)
            const parseHex = (idStr) => {
                if (!idStr) return 0;
                const m = String(idStr).match(/^SIMI([0-9A-Fa-f]+)$/i);
                if (m) return parseInt(m[1], 16) || 0;
                const num = parseInt(String(idStr).replace(/\D/g, ''), 10);
                return isNaN(num) ? 0 : num;
            };
            return parseHex(a.id) - parseHex(b.id);
        });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Contenedor Superior del Banco de Proyectos */}
            <div className="simi-projects-header-card">
                <div className="simi-projects-header-info">
                    <div className="simi-projects-header-icon">
                        <Box size={22} />
                    </div>
                    <div>
                        <h3 className="simi-projects-header-title">
                            Banco de Proyectos & Prototipos 3D
                        </h3>
                        <p className="simi-projects-header-desc">
                            Modelos CAD, carcasas electrónicas, biomodelos y ensambles funcionales desarrollados en el semillero.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isLeader && (
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '3px' }}>
                            <button
                                type="button"
                                onClick={() => setPrivacyFilter('all')}
                                style={{
                                    background: privacyFilter === 'all' ? '#ffffff' : 'transparent',
                                    color: privacyFilter === 'all' ? '#0f172a' : '#64748b',
                                    border: privacyFilter === 'all' ? '1px solid #cbd5e1' : 'none',
                                    padding: '4px 10px',
                                    borderRadius: '7px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                Todos ({projects.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacyFilter('public')}
                                style={{
                                    background: privacyFilter === 'public' ? '#ffffff' : 'transparent',
                                    color: privacyFilter === 'public' ? '#16a34a' : '#64748b',
                                    border: privacyFilter === 'public' ? '1px solid #bbf7d0' : 'none',
                                    padding: '4px 10px',
                                    borderRadius: '7px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                🌐 Públicos
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacyFilter('private')}
                                style={{
                                    background: privacyFilter === 'private' ? '#ffffff' : 'transparent',
                                    color: privacyFilter === 'private' ? '#ef4444' : '#64748b',
                                    border: privacyFilter === 'private' ? '1px solid #fecaca' : 'none',
                                    padding: '4px 10px',
                                    borderRadius: '7px',
                                    fontSize: '0.74rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                🔒 Con Invitación
                            </button>
                        </div>
                    )}

                    {isLeader && (
                        <button 
                            onClick={handleOpenAdd}
                            className="simi-desktop-add-btn simi-projects-add-btn"
                            title="Agregar Proyecto 3D"
                        >
                            <Plus size={16} /> Agregar Proyecto 3D
                        </button>
                    )}
                </div>
            </div>

            {/* Empty state si el estudiante no tiene proyectos asignados */}
            {visibleProjects.length === 0 && (
                <div style={{
                    background: '#ffffff',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: '#06b6d4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Lock size={24} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {isLeader ? 'No hay proyectos en esta categoría' : 'Proyectos de Acceso Restringido'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.4 }}>
                        {isLeader 
                            ? 'Crea un nuevo proyecto o ajusta los filtros de visibilidad superior.' 
                            : 'Solo puedes visualizar los proyectos de investigación a los que tu líder o docente te ha asignado como integrante.'}
                    </p>
                </div>
            )}

            {/* Lista de Proyectos Organizados a lo Largo (Uno debajo de otro) */}
            <div className="simi-projects-list-container">
                {visibleProjects.map(proj => {
                    const isPriv = proj.isPrivate === true || proj.is_private === 1 || proj.is_private === true;
                    const assigned = Array.isArray(proj.assignedMembers) ? proj.assignedMembers : (Array.isArray(proj.assigned_members) ? proj.assigned_members : []);
                    const rawStatus = (proj.status || '').trim();
                    const matchedStage = PROJECT_STAGES.find(s => {
                        const sName = s.name.toLowerCase();
                        const rStatus = rawStatus.toLowerCase();
                        return rStatus === sName || 
                               rStatus === `${s.id}. ${sName}` || 
                               rStatus.startsWith(`${s.id}.`) ||
                               rStatus.startsWith(`${s.id} `) ||
                               rStatus === s.id ||
                               rStatus.includes(sName) || 
                               sName.includes(rStatus);
                    });
                    const isFinished = rawStatus === 'Completado y Validado' || rawStatus === '7. Evaluación y Cierre';
                    const isArchived = rawStatus === 'Archivado' || rawStatus === 'Pausado';

                    return (
                        <div 
                            key={proj.id} 
                            className={`simi-project-card ${isLeader ? 'clickable-admin' : ''}`}
                            onClick={() => {
                                if (isLeader) {
                                    handleOpenEdit(proj);
                                }
                            }}
                            style={{
                                cursor: isLeader ? 'pointer' : 'default',
                                opacity: isArchived ? 0.78 : 1,
                                background: isArchived ? 'var(--surface-sunken, #f8fafc)' : '#ffffff'
                            }}
                            title={isLeader ? "Haz clic para editar este proyecto" : undefined}
                        >
                            <div className="simi-project-main-col">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (matchedStage) {
                                                    setActiveStageDetail(matchedStage);
                                                    setIsStageGuideOpen(true);
                                                }
                                            }}
                                            style={{
                                                background: isFinished ? '#ecfdf5' : isArchived ? '#f1f5f9' : (matchedStage ? matchedStage.bg : '#ecfdf5'),
                                                color: isFinished ? '#059669' : isArchived ? '#64748b' : (matchedStage ? matchedStage.color : '#059669'),
                                                border: `1.5px solid ${isFinished ? '#10b981' : isArchived ? '#cbd5e1' : (matchedStage ? matchedStage.border : '#10b981')}`,
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                cursor: matchedStage ? 'pointer' : 'default',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            title={matchedStage ? `Etapa ${matchedStage.id}: ${matchedStage.shortDesc} (Clic para ver detalles)` : rawStatus}
                                        >
                                            {isFinished && <CheckCircle2 size={12} color="#059669" />}
                                            {isArchived && <Archive size={12} color="#64748b" />}
                                            <span>{matchedStage ? `Etapa ${matchedStage.id}: ${matchedStage.name}` : rawStatus}</span>
                                            {matchedStage && <HelpCircle size={10} style={{ opacity: 0.7 }} />}
                                        </button>

                                        <span className={`simi-project-privacy-badge ${isPriv ? 'private' : 'public'}`}>
                                            {isPriv ? (
                                                <>
                                                    <Lock size={11} /> <span>Acceso Restringido</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Globe size={11} /> <span>Público</span>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {/* A la DERECHA: Botoncitos de enlaces (CAD, STL, Video) e ID */}
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                        {((proj.cadUrl || proj.cad_url) || (proj.repoUrl || proj.repo_url) || (proj.videoUrl || proj.video_url)) && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                {(proj.cadUrl || proj.cad_url) && (
                                                    <a 
                                                        href={proj.cadUrl || proj.cad_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="simi-project-link-badge cad"
                                                        title="Abrir Modelo CAD 3D / Visor"
                                                    >
                                                        <Globe size={12} />
                                                        <span>Modelo CAD</span>
                                                        <ExternalLink size={10} />
                                                    </a>
                                                )}
                                                {(proj.repoUrl || proj.repo_url) && (
                                                    <a 
                                                        href={proj.repoUrl || proj.repo_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="simi-project-link-badge repo"
                                                        title="Ver Repositorio STL / GitHub / Printables"
                                                    >
                                                        <FolderGit2 size={12} />
                                                        <span>Archivos STL / Docs</span>
                                                        <ExternalLink size={10} />
                                                    </a>
                                                )}
                                                {(proj.videoUrl || proj.video_url) && (
                                                    <a 
                                                        href={proj.videoUrl || proj.video_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="simi-project-link-badge video"
                                                        title="Ver Demostración / Video del Funcionamiento"
                                                    >
                                                        <Youtube size={12} />
                                                        <span>Video / Demo</span>
                                                        <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                            ID: <code>{formatSimiHexId(proj.id)}</code>
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                        {proj.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ fontWeight: 800, color: 'var(--text-heading)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={13} color="#06b6d4" />
                                            <span>Responsables / Asignados:</span>
                                        </span>
                                        {assigned.length > 0 ? (
                                            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '5px' }}>
                                                {assigned.map((m, mIdx) => (
                                                    <span 
                                                        key={m.id || m.email || mIdx} 
                                                        style={{ 
                                                             background: '#ecfeff', 
                                                            color: '#0891b2', 
                                                            border: '1px solid #cffafe', 
                                                            padding: '2px 8px', 
                                                            borderRadius: '6px', 
                                                            fontWeight: 800, 
                                                            fontSize: '0.74rem', 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: '4px' 
                                                        }}
                                                    >
                                                        {(m.avatar_url || m.avatarUrl) && (
                                                            <img 
                                                                src={m.avatar_url || m.avatarUrl} 
                                                                alt="" 
                                                                style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover' }} 
                                                            />
                                                        )}
                                                        <span>{m.name || m.full_name || m.email}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : isPriv ? (
                                            <span style={{ 
                                                fontStyle: 'italic', 
                                                color: '#ef4444', 
                                                background: '#fef2f2', 
                                                border: '1px solid #fecaca', 
                                                padding: '1px 7px', 
                                                borderRadius: '5px', 
                                                fontSize: '0.72rem',
                                                fontWeight: 700 
                                            }}>
                                                Sin estudiantes asignados (Solo líder)
                                            </span>
                                        ) : (
                                            <span style={{ fontStyle: 'italic', color: '#64748b' }}>
                                                {proj.author || 'Todo el Semillero SIMI3D'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {proj.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal para Agregar / Editar Proyecto */}
            {isAddModalOpen && (
                <div className="simi-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
                    <div className="simi-modal-card simi-project-modal-card" style={{ maxWidth: '1080px', width: '96vw', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="simi-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                    {editingProject ? '✏️ Editar Proyecto 3D' : '🚀 Registrar Nuevo Proyecto 3D'}
                                </h3>
                                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Ingresa los datos técnicos, asigna estudiantes y enlaces de fuentes.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="simi-modal-close-btn"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.35rem' }}>
                            <div className="simi-form-group">
                                <label className="simi-form-label">Nombre del Proyecto o Ensamble:</label>
                                <input 
                                    type="text" 
                                    className="simi-form-input" 
                                    placeholder="Ej: Guante Traductor de Lengua de Señas..." 
                                    value={formTitle} 
                                    onChange={e => setFormTitle(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                                <div className="simi-form-group">
                                    <label className="simi-form-label">Responsable o Autor:</label>
                                    <input 
                                        type="text" 
                                        className="simi-form-input" 
                                        placeholder="Ej: Semillero SIMI3D..." 
                                        value={formAuthor} 
                                        onChange={e => setFormAuthor(e.target.value)} 
                                    />
                                </div>

                                <div className="simi-form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className="simi-form-label" style={{ marginBottom: 0 }}>Etapa del Proyecto:</label>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const currentStage = PROJECT_STAGES.find(s => s.name === formStatus) || PROJECT_STAGES[0];
                                                setActiveStageDetail(currentStage);
                                                setIsStageGuideOpen(true);
                                            }}
                                            style={{
                                                background: 'rgba(6, 182, 212, 0.1)',
                                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                                color: '#0891b2',
                                                borderRadius: '6px',
                                                padding: '2px 7px',
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            title="Ver guía y detalle de cada etapa"
                                        >
                                            <HelpCircle size={12} />
                                            <span>¿Qué es cada etapa?</span>
                                        </button>
                                    </div>
                                    <select 
                                        className="simi-form-input" 
                                        value={formStatus} 
                                        onChange={e => setFormStatus(e.target.value)}
                                        style={{ marginTop: '4px' }}
                                    >
                                        {PROJECT_STAGES.map((stg, idx) => (
                                            <option key={stg.id} value={stg.name}>
                                                {idx + 1}. {stg.name}
                                            </option>
                                        ))}
                                        <option value="Completado y Validado">✓ Completado y Validado</option>
                                        <option value="Archivado">📦 Archivado</option>
                                        <option value="Pausado">⏸️ Pausado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="simi-form-group">
                                <label className="simi-form-label">Descripción Técnica o Aplicación:</label>
                                <textarea 
                                    className="simi-form-input" 
                                    rows="2"
                                    placeholder="Detalles del ensamble, sensores, arquitectura o alcances..." 
                                    value={formDescription} 
                                    onChange={e => setFormDescription(e.target.value)} 
                                />
                            </div>

                            {/* ── PRIVACIDAD Y ASIGNACIÓN DE ESTUDIANTES / INTEGRANTES ── */}
                            <div className="simi-privacy-toggle-card">
                                <div className="simi-privacy-toggle-row">
                                    <div className="simi-privacy-label-group">
                                        {formIsPrivate ? <Lock size={18} color="#ef4444" /> : <Globe size={18} color="#16a34a" />}
                                        <div>
                                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)' }}>
                                                {formIsPrivate ? 'Proyecto Privado (Solo Invitados)' : 'Proyecto Público (Todo el Semillero)'}
                                            </strong>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                                {formIsPrivate 
                                                    ? 'Solo tú (líder) y los estudiantes asignados abajo podrán ver y editar este proyecto.' 
                                                    : 'Cualquier estudiante registrado en el semillero podrá ver la ficha de este proyecto.'}
                                            </p>
                                        </div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: formIsPrivate ? '#ef4444' : '#16a34a' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={formIsPrivate} 
                                            onChange={e => setFormIsPrivate(e.target.checked)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#06b6d4' }}
                                        />
                                        <span>Restringir Acceso</span>
                                    </label>
                                </div>

                                {/* Selector de Estudiantes si está en modo privado o para conformar equipo */}
                                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.65rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={13} color="#06b6d4" />
                                            <span>Asignar Integrantes del Semillero ({formAssignedMembers.length} seleccionados):</span>
                                        </label>
                                        {members.length > 0 && (
                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                {members.length} semilleristas disponibles
                                            </span>
                                        )}
                                    </div>

                                    {members.length === 0 ? (
                                        <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                                            No hay otros estudiantes inscritos en el grupo de SIMI3D aún.
                                        </div>
                                    ) : (
                                        <div className="simi-members-selector-list">
                                            {members.map(m => {
                                                const isSelected = formAssignedMembers.some(sel => (sel.id && sel.id === m.id) || (sel.email && sel.email === m.email));
                                                const avatar = m.avatar_url || m.avatarUrl;
                                                return (
                                                    <div 
                                                        key={m.id || m.email} 
                                                        className={`simi-member-select-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleToggleMember(m)}
                                                    >
                                                        <div className="simi-member-select-left">
                                                            {avatar ? (
                                                                <img src={avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                                    👤
                                                                </div>
                                                            )}
                                                            <div style={{ overflow: 'hidden' }}>
                                                                <div style={{ fontWeight: 800, color: isSelected ? '#0e7490' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {m.full_name || m.name || m.email}
                                                                </div>
                                                                <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {m.email} • {m.role === 'leader' || m.role === 'lider' ? 'Líder' : 'Semillerista'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            borderRadius: '5px',
                                                            border: isSelected ? '1.5px solid #06b6d4' : '1.5px solid #cbd5e1',
                                                            background: isSelected ? '#06b6d4' : '#ffffff',
                                                            color: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.7rem',
                                                            flexShrink: 0
                                                        }}>
                                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── 3 OPCIONES DE ENLACES PARA EJEMPLOS O FUENTES EN GRID DE 3 COLUMNAS ── */}
                            <div style={{ background: 'var(--surface-sunken, #f8fafc)', border: '1px solid var(--border-default, #e2e8f0)', borderRadius: '12px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06b6d4', fontWeight: 800, fontSize: '0.82rem' }}>
                                    <Link2 size={15} />
                                    <span>Enlaces de Referencia y Fuentes (Opcionales):</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                    <div className="simi-form-group" style={{ marginBottom: 0 }}>
                                        <label className="simi-form-label" style={{ fontSize: '0.72rem' }}>🌐 Enlace 1: Modelo CAD 3D (Visor Web):</label>
                                        <input 
                                            type="url" 
                                            className="simi-form-input" 
                                            placeholder="https://a360.co/... o Onshape" 
                                            value={formCadUrl} 
                                            onChange={e => setFormCadUrl(e.target.value)} 
                                        />
                                    </div>

                                    <div className="simi-form-group" style={{ marginBottom: 0 }}>
                                        <label className="simi-form-label" style={{ fontSize: '0.72rem' }}>📁 Enlace 2: Repositorio STL / GitHub:</label>
                                        <input 
                                            type="url" 
                                            className="simi-form-input" 
                                            placeholder="https://www.printables.com/..." 
                                            value={formRepoUrl} 
                                            onChange={e => setFormRepoUrl(e.target.value)} 
                                        />
                                    </div>

                                    <div className="simi-form-group" style={{ marginBottom: 0 }}>
                                        <label className="simi-form-label" style={{ fontSize: '0.72rem' }}>🎥 Enlace 3: Video Demostrativo:</label>
                                        <input 
                                            type="url" 
                                            className="simi-form-input" 
                                            placeholder="https://youtube.com/..." 
                                            value={formVideoUrl} 
                                            onChange={e => setFormVideoUrl(e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.6rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-default, #e2e8f0)' }}>
                                {editingProject && isLeader ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                        {/* Finalizar */}
                                        {formStatus !== 'Completado y Validado' && formStatus !== '7. Evaluación y Cierre' && (
                                            <button 
                                                type="button" 
                                                className="simi-res-mini-btn"
                                                style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px' }}
                                                onClick={(e) => {
                                                    handleQuickStatusChange(editingProject, 'Completado y Validado', e);
                                                    setIsAddModalOpen(false);
                                                }}
                                                title="Marcar proyecto como completado y validado"
                                            >
                                                <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Finalizar
                                            </button>
                                        )}

                                        {/* Archivar / Reactivar */}
                                        {formStatus === 'Archivado' || formStatus === 'Pausado' ? (
                                            <button 
                                                type="button" 
                                                className="simi-res-mini-btn"
                                                style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '8px' }}
                                                onClick={(e) => {
                                                    handleQuickStatusChange(editingProject, 'Prototipado', e);
                                                    setIsAddModalOpen(false);
                                                }}
                                                title="Reactivar proyecto"
                                            >
                                                <RotateCcw size={13} style={{ marginRight: '4px' }} /> Reactivar
                                            </button>
                                        ) : (
                                            <button 
                                                type="button" 
                                                className="simi-res-mini-btn"
                                                style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px' }}
                                                onClick={(e) => {
                                                    handleQuickStatusChange(editingProject, 'Archivado', e);
                                                    setIsAddModalOpen(false);
                                                }}
                                                title="Archivar este proyecto"
                                            >
                                                <Archive size={13} style={{ marginRight: '4px' }} /> Archivar
                                            </button>
                                        )}

                                        {/* Eliminar */}
                                        <button 
                                            type="button" 
                                            className="simi-res-mini-btn delete"
                                            style={{ padding: '6px 12px', borderRadius: '8px' }}
                                            onClick={(e) => {
                                                setIsAddModalOpen(false);
                                                handleDeletePrompt(editingProject);
                                            }}
                                            title="Eliminar este proyecto permanentemente"
                                        >
                                            <Trash2 size={13} style={{ marginRight: '4px' }} /> Eliminar
                                        </button>
                                    </div>
                                ) : <div />}

                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button 
                                        type="button" 
                                        className="simi-res-mini-btn"
                                        onClick={() => setIsAddModalOpen(false)}
                                        style={{ padding: '8px 16px', borderRadius: '10px' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        style={{
                                            background: '#06b6d4',
                                            color: '#042f2e',
                                            border: 'none',
                                            padding: '8px 20px',
                                            borderRadius: '10px',
                                            fontWeight: 850,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px -2px rgba(6, 182, 212, 0.4)'
                                        }}
                                    >
                                        {editingProject ? 'Guardar Cambios' : 'Registrar Proyecto'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL GUÍA DE ETAPAS DE PROYECTO ── */}
            {isStageGuideOpen && (
                <div 
                    className="simi-modal-backdrop" 
                    onClick={() => setIsStageGuideOpen(false)}
                    style={{ zIndex: 1000005 }}
                >
                    <div 
                        className="simi-modal-card" 
                        style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ background: '#ecfeff', padding: '6px', borderRadius: '10px', color: '#0891b2' }}>
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                        Etapas de Desarrollo de Proyectos SIMI3D
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Metodología estructurada de ingeniería y prototipado aplicada
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsStageGuideOpen(false)}
                                className="simi-modal-close-btn"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Selector de Etapas en Píldoras Horizontales */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px' }}>
                            {PROJECT_STAGES.map((stg, idx) => {
                                const isSelected = activeStageDetail.id === stg.id;
                                return (
                                    <button
                                        key={stg.id}
                                        type="button"
                                        onClick={() => setActiveStageDetail(stg)}
                                        style={{
                                            background: isSelected ? stg.color : 'var(--surface-sunken, #f8fafc)',
                                            color: isSelected ? '#ffffff' : 'var(--text-primary, #334155)',
                                            border: `1.5px solid ${isSelected ? stg.color : 'var(--border-default, #e2e8f0)'}`,
                                            padding: '5px 10px',
                                            borderRadius: '99px',
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <span>{idx + 1}.</span>
                                        <span>{stg.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Detalle de la Etapa Seleccionada */}
                        {activeStageDetail && (
                            <div style={{
                                background: activeStageDetail.bg,
                                border: `1.5px solid ${activeStageDetail.border}`,
                                borderRadius: '14px',
                                padding: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.65rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 850,
                                        color: activeStageDetail.color,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.4px'
                                    }}>
                                        Etapa {activeStageDetail.id}: {activeStageDetail.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormStatus(activeStageDetail.name);
                                            setIsStageGuideOpen(false);
                                        }}
                                        style={{
                                            background: activeStageDetail.color,
                                            color: '#ffffff',
                                            border: 'none',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Seleccionar esta Etapa ✓
                                    </button>
                                </div>

                                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 650, color: '#1e293b', lineHeight: 1.4 }}>
                                    {activeStageDetail.shortDesc}
                                </p>

                                <div style={{ background: 'rgba(255, 255, 255, 0.75)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                                        Acciones y Entregables Clave:
                                    </span>
                                    {activeStageDetail.details.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.77rem', color: '#334155', lineHeight: 1.35 }}>
                                            <ChevronRight size={13} style={{ color: activeStageDetail.color, flexShrink: 0, marginTop: '2px' }} />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsStageGuideOpen(false)}
                                style={{
                                    background: 'var(--surface-sunken, #f1f5f9)',
                                    color: 'var(--text-primary, #334155)',
                                    border: '1px solid var(--border-default, #cbd5e1)',
                                    padding: '7px 16px',
                                    borderRadius: '10px',
                                    fontWeight: 750,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar Guía
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL ESTILIZADO DE CONFIRMACIÓN DE ELIMINACIÓN ── */}
            {projectToDelete && (
                <div className="simi-modal-backdrop" onClick={() => setProjectToDelete(null)} style={{ zIndex: 1000010 }}>
                    <div 
                        className="simi-modal-card" 
                        style={{ maxWidth: '440px', textAlign: 'center', padding: '1.75rem 1.5rem' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ 
                            width: '54px', 
                            height: '54px', 
                            borderRadius: '50%', 
                            background: '#ffe4e6', 
                            color: '#e11d48', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 1rem auto' 
                        }}>
                            <Trash2 size={26} />
                        </div>
                        
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                            ¿Eliminar este Proyecto 3D?
                        </h3>
                        
                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            Estás a punto de retirar <strong style={{ color: 'var(--text-primary)' }}>"{projectToDelete.title}"</strong> del banco de prototipos del semillero SIMI3D.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="simi-res-mini-btn"
                                onClick={() => setProjectToDelete(null)}
                                style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 750 }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={executeDelete}
                                style={{
                                    background: '#e11d48',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '8px 20px',
                                    borderRadius: '10px',
                                    fontWeight: 850,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                                }}
                            >
                                Sí, Eliminar Proyecto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
