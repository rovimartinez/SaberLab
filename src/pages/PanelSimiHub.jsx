import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
    Home, Layers, Box, Sparkles, Cpu, Flame, FlaskConical, Rocket, 
    School, FileText, Award, Calendar, CheckCircle2, Briefcase,
    ArrowRight, Shield, Download, Users, Plus, ExternalLink, X,
    Edit3, Trash2, MapPin, Clock, BookOpen, Check, AlertCircle, HelpCircle, ChevronRight, ChevronLeft, ChevronDown,
    UserCheck, Zap, Trophy, TrendingUp, Target, Play, Menu, MoreHorizontal, MoreVertical, Compass, Eye, EyeOff, User,
    Lock, Unlock, Bell, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';
import { SIMI_PINS_CATALOG, SIMI_TRACKS, SIMI_SCHOOL_EVENTS, SIMI_PROJECTS, INITIAL_SIMI_RESOURCES, SIMI_WEB_RESOURCES, SIMI_SERVICES_CATALOG } from '../data/simiData';
import { SIMI_TRACKS_LESSONS_DATA } from '../data/simiTracksLessonsData';
import AccessRequests from './AccessRequests';
import SimiEventsTab from '../components/simi/SimiEventsTab';
import SimiProjectsTab from '../components/simi/SimiProjectsTab';
import SimiResourcesTab from '../components/simi/SimiResourcesTab';
import SimiMembersTab from '../components/simi/SimiMembersTab';
import SimiServicesTab from '../components/simi/SimiServicesTab';
import SimiNotificationsModal from '../components/simi/SimiNotificationsModal';
import SimiStudentFlashAttendanceModal from '../components/simi/SimiStudentFlashAttendanceModal';
import SimiAttendanceManagerModal from '../components/simi/SimiAttendanceManagerModal';
import '../styles/PanelSimiHub.css';
import '../styles/SimiAttendance.css';

const ICON_MAP = {
    Box: Box,
    Sparkles: Sparkles,
    Cpu: Cpu,
    Layers: Layers,
    Flame: Flame,
    School: School,
    FileText: FileText,
    FlaskConical: FlaskConical,
    Rocket: Rocket,
    Shield: Shield
};

export function normalizeDirectImageUrl(url) {
    if (!url) return '';
    let clean = url.trim();

    // 1. Convertir enlaces de PostImages visor: https://postimg.cc/xxxx o https://postimg.cc/image/xxxx -> https://i.postimg.cc/xxxx/image.png
    const postimgMatch = clean.match(/https?:\/\/(?:www\.)?postimg\.cc\/(?:image\/)?([a-zA-Z0-9_-]+)/i);
    if (postimgMatch && !clean.includes('i.postimg.cc')) {
        clean = `https://i.postimg.cc/${postimgMatch[1]}/image.png`;
    }

    // 2. Convertir Google Drive: drive.google.com/file/d/ID/view -> drive.google.com/uc?export=view&id=ID
    if (clean.includes('drive.google.com/file/d/')) {
        const match = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            clean = `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
    }

    // 3. Convertir Dropbox: dl=0 -> raw=1
    if (clean.includes('dropbox.com') && clean.includes('dl=0')) {
        clean = clean.replace('dl=0', 'raw=1');
    }

    // 4. Convertir Imgur visor: https://imgur.com/xxxx -> https://i.imgur.com/xxxx.png
    const imgurMatch = clean.match(/https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9_-]+)(?!\.)/i);
    if (imgurMatch && !clean.includes('i.imgur.com')) {
        clean = `https://i.imgur.com/${imgurMatch[1]}.png`;
    }

    return clean;
}

function formatSimiMarkdown(text) {
    if (!text) return '';

    // Limpieza de símbolos LaTeX comunes
    let processed = text
        .replace(/\\mu/g, 'µ')
        .replace(/\\,/g, ' ')
        .replace(/\\circ/g, '°')
        .replace(/\\times/g, '×')
        .replace(/\\approx/g, '≈')
        .replace(/\\pm/g, '±')
        .replace(/\\text\{([^\}]+)\}/g, '$1');

    // Parseo de Tablas Markdown (| Col1 | Col2 | ... |)
    const tableRegex = /((?:^[ \t]*\|[^\n]+\|[ \t]*\n)+)/gm;
    processed = processed.replace(tableRegex, (match) => {
        const rawLines = match.trim().split('\n').map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|'));
        if (rawLines.length < 2) return match;

        // Separar cabecera, divisor y filas
        const headerRow = rawLines[0];
        const hasDivider = rawLines[1].includes('---') || rawLines[1].includes(':---');
        const bodyRows = hasDivider ? rawLines.slice(2) : rawLines.slice(1);

        const parseCells = (rowStr) => rowStr.slice(1, -1).split('|').map(c => c.trim());

        const headers = parseCells(headerRow);
        const headerHtml = `<thead><tr style="background: var(--surface-hover); border-bottom: 2px solid var(--border-default);">${headers.map(h => `<th style="padding: 9px 12px; font-weight: 800; color: var(--text-heading); font-size: 0.8rem; text-align: left;">${h}</th>`).join('')}</tr></thead>`;

        const rowsHtml = bodyRows.map((r, rIdx) => {
            const cells = parseCells(r);
            const isEven = rIdx % 2 === 0;
            return `<tr style="border-bottom: 1px solid var(--border-subtle); background: ${isEven ? 'transparent' : 'rgba(255,255,255,0.02)'};">${cells.map(c => `<td style="padding: 8px 12px; font-size: 0.82rem; color: var(--text-body);">${c}</td>`).join('')}</tr>`;
        }).join('');

        return `\n<div style="overflow-x: auto; margin: 0.85rem 0; border-radius: 10px; border: 1px solid var(--border-default); background: var(--surface-card);"><table style="width: 100%; border-collapse: collapse; text-align: left;">${headerHtml}<tbody>${rowsHtml}</tbody></table></div>\n`;
    });

    return processed
        // Código en bloque triple backtick
        .replace(/\`\`\`([a-z]*)\n([\s\S]*?)\`\`\`/g, '<pre style="background: rgba(15,23,42,0.6); padding: 10px; border-radius: 8px; border: 1px solid var(--border-subtle); overflow-x: auto; font-family: monospace; font-size: 0.8rem; color: #38bdf8;"><code>$2</code></pre>')
        // Negritas **texto**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Cursiva *texto*
        .replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, '$1<em>$2</em>$3')
        // Código inline `código`
        .replace(/\`([^\`]+)\`/g, '<code style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #38bdf8; font-size: 0.85em;">$1</code>')
        // Fórmulas matemáticas $formula$
        .replace(/\$([^\$]+)\$/g, '<span style="font-family: serif; font-style: italic; color: #f59e0b; font-weight: 600;">$1</span>')
        // Listas con viñetas
        .replace(/^\s*\*\s+(.*)$/gm, '<li style="margin-left: 1.2rem; margin-bottom: 4px; list-style-type: disc;">$1</li>')
        // Listas numeradas
        .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li style="margin-left: 1.2rem; margin-bottom: 4px; list-style-type: decimal;">$2</li>')
        // Saltos de línea
        .replace(/\n/g, '<br/>');
}

export default function PanelSimiHub({ 
    headerCourseSelector = null,
    isEmbedded = false
}) {
    const navigate = useNavigate();
    const { 
        profile, 
        isStaff, 
        isStaffUser,
        isLeaderUser,
        isImpersonating,
        toggleViewMode,
        setViewMode,
        pendingAccessRequestsCount = 0 
    } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
    const [simiUnreadCount, setSimiUnreadCount] = useState(0);

    // Estado de sesión activa de asistencia relámpago (2FA)
    const [activeAttendanceSession, setActiveAttendanceSession] = useState(null);
    const [answeredSessionIds, setAnsweredSessionIds] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('simi_answered_sessions') || '[]'); } catch { return []; }
    });

    const fetchSimiUnreadCount = async () => {
        try {
            const res = await api('/notifications?channel=simi');
            const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            const unread = data.filter(n => !n.read && !n.title?.startsWith('📤')).length;
            setSimiUnreadCount(unread);
        } catch {
            setSimiUnreadCount(0);
        }
    };

    useEffect(() => {
        fetchSimiUnreadCount();
    }, []);

    // Polling ligero cada 5 segundos para detectar asistencia relámpago en vivo
    useEffect(() => {
        const checkActiveSession = async () => {
            try {
                const res = await api('/simi');
                if (res?.data?.activeAttendanceSession) {
                    setActiveAttendanceSession(res.data.activeAttendanceSession);
                } else {
                    setActiveAttendanceSession(null);
                }
            } catch {}
        };
        // Ejecutar inmediatamente al montar (no esperar el primer intervalo)
        checkActiveSession();
        const interval = setInterval(checkActiveSession, 5000);
        return () => clearInterval(interval);
    }, []);
    
    // Estado del visor interactivo de contenidos de Ruta / Lección
    const [activeLessonTrack, setActiveLessonTrack] = useState(null);
    const [activeCategoryModal, setActiveCategoryModal] = useState(null);
    const [activeUnitIndex, setActiveUnitIndex] = useState(0);
    const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
    const [quizChecked, setQuizChecked] = useState({});

    // Modal de Insignia Táctica
    const [activePinModal, setActivePinModal] = useState(null);
    const [selectedPinTiers, setSelectedPinTiers] = useState(() => {
        const saved = localStorage.getItem('simi_pin_tiers');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {
            'pin-tinkercad': 'II',
            'pin-blender': 'I',
            'pin-fusion': 'III',
            'pin-slicing': 'II',
            'pin-fdm': 'II',
            'pin-sla': 'I'
        };
    });

    const [failedImageMap, setFailedImageMap] = useState({});
    const isAdminUser = Boolean((isStaff || isStaffUser || isLeaderUser || profile?.role === 'admin' || profile?.role === 'docente' || profile?.role === 'director' || profile?.role === 'lider' || profile?.role === 'leader') && !isImpersonating);

    const handleOpenPinModal = (pinId) => {
        const pin = SIMI_PINS_CATALOG.find(p => p.id === pinId);
        if (pin) {
            setActivePinModal(pin);
        }
    };

    // Función para actualizar grado de insignia personal en Cloudflare D1
    const [isSavingBadgeTier, setIsSavingBadgeTier] = useState(false);
    const handleSetMyBadgeTier = async (pinId, tierLevel) => {
        const myUid = profile?.id || profile?.email;
        if (!myUid) return;
        const tierNum = ['I', 'II', 'III', 'IV', 'V'].indexOf(tierLevel) + 1;
        const exp = tierNum * 100;

        // Actualización optimista inmediata
        setSelectedPinTiers(prev => {
            const up = { ...prev, [pinId]: tierLevel };
            localStorage.setItem('simi_pin_tiers', JSON.stringify(up));
            return up;
        });
        setMemberBadgesMap(prev => {
            const up = { ...prev };
            if (!up[myUid]) up[myUid] = {};
            up[myUid][pinId] = { tier: tierLevel, exp, updatedAt: new Date().toISOString() };
            localStorage.setItem('simi_member_badges_map', JSON.stringify(up));
            return up;
        });

        setIsSavingBadgeTier(true);
        try {
            await api('/simi', {
                method: 'POST',
                body: {
                    action: 'save-badge',
                    targetUserId: myUid,
                    pinId,
                    tier: tierLevel,
                    exp
                }
            });
        } catch (err) {
            console.error('[SIMI] Error al guardar insignia personal:', err);
        } finally {
            setIsSavingBadgeTier(false);
        }
    };

    // Estado de visualización de la vitrina de insignias (acordeón en móviles)
    const [isBadgesExpanded, setIsBadgesExpanded] = useState(false);
    const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

    // Modal de Reglas del Semillero
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

    // Modal de Gestión de Asistencia (Líder / Docente)
    const [attendanceModalEvent, setAttendanceModalEvent] = useState(null);

    // Modal de Solicitudes de Acceso
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

    // Calculadora de Costos de Filamento
    const [calcGrams, setCalcGrams] = useState(85);
    const [calcPricePerKg, setCalcPricePerKg] = useState(65000);

    // Estado para desplegar el submenú de "Más (...)" en navegación móvil estilo Banco
    const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);

    // Estado central sincronizado con Cloudflare D1
    const [simiEvents, setSimiEvents] = useState(() => {
        const saved = localStorage.getItem('simi_events_list');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return SIMI_SCHOOL_EVENTS;
    });

    const [simiProjects, setSimiProjects] = useState(() => {
        const saved = localStorage.getItem('simi_projects_list');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return SIMI_PROJECTS;
    });

    const [simiResources, setSimiResources] = useState(() => {
        const fallback = INITIAL_SIMI_RESOURCES;
        const saved = localStorage.getItem('simi_resources_list');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                return parsed.map(r => {
                    const seed = fallback.find(s => s.id === r.id);
                    return seed ? { ...seed, ...r, imageUrl: r.imageUrl || seed.imageUrl } : r;
                });
            } catch (e) { }
        }
        return fallback;
    });

    const [simiWebResources, setSimiWebResources] = useState(() => {
        const saved = localStorage.getItem('simi_web_resources_list');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) { }
        }
        return SIMI_WEB_RESOURCES;
    });

    const [simiServices, setSimiServices] = useState(() => {
        const saved = localStorage.getItem('simi_services_list');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) { }
        }
        return SIMI_SERVICES_CATALOG;
    });

    const [memberBadgesMap, setMemberBadgesMap] = useState(() => {
        const saved = localStorage.getItem('simi_member_badges_map');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {};
    });

    const [resourcesSubTab, setResourcesSubTab] = useState('inventory');

    // Modo de Edición / Gestión de Bloqueo para Administrador / Docente
    const [isManageModeActive, setIsManageModeActive] = useState(false);

    // Estado de visibilidad de Rutas / Cursos (3 estados: 'unlocked' | 'locked' | 'hidden')
    const [trackVisibilityMap, setTrackVisibilityMap] = useState(() => {
        const saved = localStorage.getItem('simi_track_visibility_map');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        // Compatibilidad con versión previa
        const legacy = localStorage.getItem('simi_locked_tracks_map');
        if (legacy) {
            try {
                const parsed = JSON.parse(legacy);
                const converted = {};
                Object.keys(parsed).forEach(k => { if (parsed[k]) converted[k] = 'locked'; });
                return converted;
            } catch (e) { }
        }
        return {};
    });

    // Estado de visibilidad de Insignias (3 estados: 'unlocked' | 'locked' | 'hidden')
    const [badgeVisibilityMap, setBadgeVisibilityMap] = useState(() => {
        const saved = localStorage.getItem('simi_badge_visibility_map');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        // Compatibilidad con versión previa
        const legacy = localStorage.getItem('simi_locked_badges_map');
        if (legacy) {
            try {
                const parsed = JSON.parse(legacy);
                const converted = {};
                Object.keys(parsed).forEach(k => { if (parsed[k]) converted[k] = 'locked'; });
                return converted;
            } catch (e) { }
        }
        return {};
    });

    // Estado de visibilidad de Eventos / Visitas (3 estados: 'unlocked' | 'locked' | 'hidden')
    const [eventVisibilityMap, setEventVisibilityMap] = useState(() => {
        const saved = localStorage.getItem('simi_event_visibility_map');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {};
    });

    // Ciclo de 3 estados: Desbloqueado (unlocked) -> Bloqueado (locked) -> Oculto (hidden) -> Desbloqueado (unlocked)
    const cycleTrackVisibility = (trackId, e) => {
        e?.stopPropagation();
        setTrackVisibilityMap(prev => {
            const current = prev[trackId] || 'unlocked';
            const nextState = current === 'unlocked' ? 'locked' : current === 'locked' ? 'hidden' : 'unlocked';
            const next = { ...prev, [trackId]: nextState };
            localStorage.setItem('simi_track_visibility_map', JSON.stringify(next));
            return next;
        });
    };

    const cycleBadgeVisibility = (pinId, e) => {
        e?.stopPropagation();
        setBadgeVisibilityMap(prev => {
            const current = prev[pinId] || 'unlocked';
            const nextState = current === 'unlocked' ? 'locked' : current === 'locked' ? 'hidden' : 'unlocked';
            const next = { ...prev, [pinId]: nextState };
            localStorage.setItem('simi_badge_visibility_map', JSON.stringify(next));
            return next;
        });
    };

    const [simiMembers, setSimiMembers] = useState(() => {
        const saved = localStorage.getItem('simi_members_list');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 1) return parsed;
            } catch (e) { }
        }
        return [
            { id: 'usr-1', email: 'carlos.mendoza@unimagdalena.edu.co', full_name: 'Carlos Mendoza', role: 'student', group_name: 'Semillerista SIMI3D' },
            { id: 'usr-2', email: 'laura.gomez@unimagdalena.edu.co', full_name: 'Laura Gómez', role: 'student', group_name: 'Semillerista SIMI3D' },
            { id: 'usr-3', email: 'andres.perez@unimagdalena.edu.co', full_name: 'Andrés Pérez', role: 'student', group_name: 'Semillerista SIMI3D' },
            { id: 'usr-4', email: 'valentina.rodriguez@unimagdalena.edu.co', full_name: 'Valentina Rodríguez', role: 'student', group_name: 'Semillerista SIMI3D' },
            { id: 'usr-5', email: 'mateo.herrera@unimagdalena.edu.co', full_name: 'Mateo Herrera', role: 'student', group_name: 'Semillerista SIMI3D' },
            { id: 'docente-simi', email: 'rovimartinez@gmail.com', full_name: 'Ronny Martinez', role: 'docente', group_name: 'Dirección I+D' }
        ];
    });
    const [isLoadingSimiData, setIsLoadingSimiData] = useState(false);

    const [catalogImageUrlsMap, setCatalogImageUrlsMap] = useState(() => {
        const saved = localStorage.getItem('simi_catalog_image_urls_map');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {};
    });

    // Cargar datos reales desde Cloudflare D1 al montar en ultra-alta velocidad (< 50ms)
    useEffect(() => {
        let isMounted = true;
        async function fetchSimiData() {
            setIsLoadingSimiData(true);
            try {
                const [res, groupsRes] = await Promise.all([
                    api('/simi'),
                    api('/groups')
                ]);

                if (res?.data?.success && isMounted) {
                    const dbEvents = Array.isArray(res.data.events) ? res.data.events : [];
                    if (dbEvents.length > 0) {
                        setSimiEvents(dbEvents);
                        localStorage.setItem('simi_events_list', JSON.stringify(dbEvents));
                        const mapFromEvents = {};
                        dbEvents.forEach(evt => {
                            if (evt && evt.id) {
                                const st = evt.visibility_state || evt.visibilityState || (evt.is_locked || evt.isLocked ? 'locked' : (evt.is_hidden || evt.isHidden ? 'hidden' : 'unlocked'));
                                mapFromEvents[evt.id] = st;
                            }
                        });
                        if (Object.keys(mapFromEvents).length > 0) {
                            setEventVisibilityMap(prev => {
                                const merged = { ...prev, ...mapFromEvents };
                                localStorage.setItem('simi_event_visibility_map', JSON.stringify(merged));
                                return merged;
                            });
                        }
                    } else if (isLeader) {
                        // Respaldo de seguridad: si D1 aún no tiene eventos pero el líder/docente tiene eventos en local,
                        // auto-migrarlos a D1 para que queden disponibles para todos los estudiantes
                        const localSaved = localStorage.getItem('simi_events_list');
                        let localEvents = [];
                        try { if (localSaved) localEvents = JSON.parse(localSaved); } catch (e) {}
                        if (Array.isArray(localEvents) && localEvents.length > 0) {
                            api('/simi', {
                                method: 'POST',
                                body: { action: 'sync-all-events', items: localEvents }
                            }).catch(err => console.warn('[SIMI] Auto-sync local events error:', err));
                        }
                    }
                    if (res.data.projects && res.data.projects.length > 0) {
                        const uniqueProjectsMap = new Map();
                        res.data.projects.forEach(p => {
                            if (p && p.id && !uniqueProjectsMap.has(p.id)) {
                                uniqueProjectsMap.set(p.id, p);
                            }
                        });
                        const uniqueProjects = Array.from(uniqueProjectsMap.values());
                        setSimiProjects(uniqueProjects);
                        localStorage.setItem('simi_projects_list', JSON.stringify(uniqueProjects));
                    }
                    if (res.data.resources && res.data.resources.length > 0) {
                        setSimiResources(res.data.resources);
                        localStorage.setItem('simi_resources_list', JSON.stringify(res.data.resources));
                    }
                    if (res.data.webResources && res.data.webResources.length > 0) {
                        setSimiWebResources(res.data.webResources);
                        localStorage.setItem('simi_web_resources_list', JSON.stringify(res.data.webResources));
                    }
                    if (res.data.services && res.data.services.length > 0) {
                        setSimiServices(res.data.services);
                        localStorage.setItem('simi_services_list', JSON.stringify(res.data.services));
                    }
                    if (res.data.badgeMap && Object.keys(res.data.badgeMap).length > 0) {
                        setSelectedPinTiers(prev => {
                            const updated = { ...prev, ...res.data.badgeMap };
                            localStorage.setItem('simi_pin_tiers', JSON.stringify(updated));
                            return updated;
                        });
                    }
                    if (res.data.memberBadgesMap) {
                        setMemberBadgesMap(res.data.memberBadgesMap);
                        localStorage.setItem('simi_member_badges_map', JSON.stringify(res.data.memberBadgesMap));
                    }
                    if (res.data.catalogImageUrlsMap) {
                        setCatalogImageUrlsMap(res.data.catalogImageUrlsMap);
                        localStorage.setItem('simi_catalog_image_urls_map', JSON.stringify(res.data.catalogImageUrlsMap));
                    }
                    if (res.data.activeAttendanceSession) {
                        setActiveAttendanceSession(res.data.activeAttendanceSession);
                    } else {
                        setActiveAttendanceSession(null);
                    }
                }

                // Sincronizar miembros estrictamente de los grupos activos de SIMI3D en paralelo
                const allGroups = Array.isArray(groupsRes?.data) ? groupsRes.data : [];
                const simiGroups = allGroups.filter(g => 
                    g.course_id === 6 || String(g.course_id) === '6' ||
                    (g.name && (g.name.toUpperCase().includes('SIMI') || g.name.toUpperCase().includes('SEMILLERO')))
                );

                const groupMembersPromises = simiGroups.map(g => api(`/groups?group_id=${g.id}`));
                const groupMembersResults = await Promise.all(groupMembersPromises);

                const memberMap = new Map();
                const directorEmail = 'rovimartinez@gmail.com';
                memberMap.set(directorEmail, {
                    id: profile?.id || 'docente-simi',
                    email: directorEmail,
                    full_name: 'Ronny Martinez',
                    role: 'docente',
                    group_name: 'Dirección I+D'
                });

                simiGroups.forEach((group, idx) => {
                    const studentsInGroup = Array.isArray(groupMembersResults[idx]?.data) ? groupMembersResults[idx].data : [];
                    studentsInGroup.forEach(stu => {
                        const key = (stu.email || stu.id || '').toLowerCase();
                        if (key && key !== directorEmail) {
                            memberMap.set(key, {
                                ...stu,
                                role: stu.role || 'student',
                                group_id: group.id,
                                group_name: group.name || 'SIMI 2026II'
                            });
                        }
                    });
                });

                // Incluir los miembros devueltos directamente por /api/simi (filtrados estrictamente para SIMI3D)
                if (Array.isArray(res?.data?.members)) {
                    res.data.members.forEach(m => {
                        const key = (m.email || m.id || '').toLowerCase();
                        if (key && !memberMap.has(key)) {
                            memberMap.set(key, {
                                id: m.id,
                                email: m.email,
                                full_name: m.full_name || m.name || m.email,
                                avatar_url: m.avatar_url || null,
                                role: m.role || 'student',
                                group_name: m.group_name || 'Semillero SIMI3D'
                            });
                        }
                    });
                }

                const finalMembers = Array.from(memberMap.values());
                if (isMounted) {
                    setSimiMembers(finalMembers);
                    localStorage.setItem('simi_members_list', JSON.stringify(finalMembers));
                }
            } catch (err) {
                console.warn('[SIMI] Usando cache local para SIMI Hub:', err);
            } finally {
                if (isMounted) setIsLoadingSimiData(false);
            }
        }
        fetchSimiData();
        return () => { isMounted = false; };
    }, [profile]);

    // Cálculo en vivo de métricas de permanencia y regla del 80/80 para el usuario actual (ponderando 1.0 asistió, 0.5 incompleto, 0.0 no vino)
    const currentUserId = profile?.id || profile?.email || 'current-user';
    const schoolVisitsList = simiEvents.filter(e => (e.event_type || e.eventType) !== 'capacitacion_tecnica');
    const technicalTrainingsList = simiEvents.filter(e => (e.event_type || e.eventType) === 'capacitacion_tecnica');

    const myVisitsAttended = schoolVisitsList.reduce((acc, evt) => {
        const att = (evt.attendees || []).find(a => a.userId === currentUserId);
        if (!att) return acc;
        if (att.attendedWeight !== undefined && att.attendedWeight !== null) return acc + Number(att.attendedWeight);
        if (att.status === 'asistio') return acc + 1.0;
        if (att.status === 'incompleto') return acc + 0.5;
        if (att.status === 'no_vino') return acc + 0.0;
        return acc + (att.attended || att.status === 'Asistiré' || att.status === 'attending' ? 1.0 : 0.0);
    }, 0);

    const myTrainingsAttended = technicalTrainingsList.reduce((acc, evt) => {
        const att = (evt.attendees || []).find(a => a.userId === currentUserId);
        if (!att) return acc;
        if (att.attendedWeight !== undefined && att.attendedWeight !== null) return acc + Number(att.attendedWeight);
        if (att.status === 'asistio') return acc + 1.0;
        if (att.status === 'incompleto') return acc + 0.5;
        if (att.status === 'no_vino') return acc + 0.0;
        return acc + (att.attended || att.status === 'Asistiré' || att.status === 'attending' ? 1.0 : 0.0);
    }, 0);

    const visitsPercentage = schoolVisitsList.length > 0 ? Math.round((myVisitsAttended / schoolVisitsList.length) * 100) : 0;
    const trainingsPercentage = technicalTrainingsList.length > 0 ? Math.round((myTrainingsAttended / technicalTrainingsList.length) * 100) : 0;

    // Cálculo dinámico en tiempo real de EXP, Nivel y Rango a partir de las Insignias Acreditadas
    const TIER_NUM_MAP = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
    const TIER_RANK_NAMES = { 'I': 'Novato', 'II': 'Aprendiz', 'III': 'Junior', 'IV': 'Especialista', 'V': 'Master' };
    const tierRankName = (tier) => TIER_RANK_NAMES[tier] || 'Novato';

  // Convert tier (Roman numeral) to star icons — with neon pill container (for image badges)
  const tierToStars = (tier) => {
    const num = TIER_NUM_MAP[tier] || 1;
    const color = num >= 5 ? '#fde047' : num >= 3 ? '#e2e8f0' : '#cd7f32';
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1px',
        background: 'rgba(0,0,0,0.55)',
        borderRadius: '99px',
        padding: '1px 5px',
        boxShadow: `0 0 8px 2px ${color}66, inset 0 0 4px rgba(0,0,0,0.4)`,
        border: `1px solid ${color}55`,
      }}>
        {Array.from({ length: num }, (_, i) => (
          <span key={i} style={{ color, textShadow: `0 0 5px ${color}`, fontSize: 'inherit', lineHeight: 1 }}>★</span>
        ))}
      </span>
    );
  };

  // Plain stars (no pill) — used inside the .simi-badge-app-tier chip for no-image badges
  const tierToStarsPlain = (tier) => {
    const num = TIER_NUM_MAP[tier] || 1;
    return '★'.repeat(num);
  };
    const myBadges = memberBadgesMap[currentUserId] || {};

    // ── CÁLCULO DE ★ REALES (solo insignias ganadas, sin asumir tier por defecto) ──
    const totalSimiStars = SIMI_PINS_CATALOG.reduce((acc, pin) => {
        const earned = myBadges[pin.id] || null;
        if (!earned) return acc; // No contar insignias no ganadas
        const tier = earned.tier || selectedPinTiers[pin.id];
        if (!tier) return acc;
        const num = TIER_NUM_MAP[tier] || 0;
        return acc + num;
    }, 0);

    const maxSimiStars = SIMI_PINS_CATALOG.length * 5; // 9 × 5 = 45 ★ máx
    const totalSimiExp = totalSimiStars * 100; // compatibilidad con código existente
    const simiExpPercentage = maxSimiStars > 0 ? Math.min(100, Math.round((totalSimiStars / maxSimiStars) * 100)) : 0;

    // ── SISTEMA DE RANGOS POR ★ REALES (sin inflar con defaults) ──
    const getRankInfo = (stars) => {
        if (stars >= 35) return { level: 6, title: 'Gran Artífice SIMI3D',       rankTier: 'Gran Artífice',             emoji: '👑', color: '#fde047' };
        if (stars >= 23) return { level: 5, title: 'Diseñador Avanzado',          rankTier: 'Diseñador Avanzado',        emoji: '🔴', color: '#f97316' };
        if (stars >= 13) return { level: 4, title: 'Especialista en Manufactura', rankTier: 'Especialista',              emoji: '🟠', color: '#f59e0b' };
        if (stars >= 6)  return { level: 3, title: 'Técnico 3D',                  rankTier: 'Técnico 3D',                emoji: '🟡', color: '#facc15' };
        if (stars >= 1)  return { level: 2, title: 'Aprendiz Maker',              rankTier: 'Aprendiz Maker',            emoji: '🟢', color: '#4ade80' };
        return             { level: 1, title: 'Iniciado SIMI3D',                  rankTier: 'Iniciado',                  emoji: '🔵', color: '#38bdf8' };
    };

    const myMakerInfo = getRankInfo(totalSimiStars);

    const hasLeaderPrivileges = isStaffUser || isLeaderUser || ['admin', 'docente', 'profesor', 'leader', 'lider'].includes((profile?.real_role || profile?.role || '').toLowerCase());
    const isStudentModeActive = isImpersonating;
    const isLeader = hasLeaderPrivileges && !isStudentModeActive;

    return (
        <div className="simi-hub-container">
            {/* MODAL DE REGLAS Y ESTATUTOS DEL SEMILLERO */}
            {isRulesModalOpen && createPortal(
                <div className="simi-modal-backdrop" onClick={() => setIsRulesModalOpen(false)}>
                    <div className="simi-modal-card" style={{ maxWidth: '620px', width: '95vw', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="simi-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: '#ffffff', border: '1.5px solid #4FD2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px', boxShadow: '0 4px 12px rgba(79, 210, 233, 0.25)' }}>
                                    <img src="/badges/Logo_SIMI.webp" alt="SIMI 3D Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                        📜 Estatutos & Reglas del Semillero SIMI3D
                                    </h3>
                                    <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                        Compromiso de Excelencia y Formación STEAM
                                    </span>
                                </div>
                            </div>
                            <button className="simi-modal-close-btn" onClick={() => setIsRulesModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', fontSize: '0.84rem', color: 'var(--text-body)' }}>
                            {/* REGLA DE ORO DESTACADA: 80% ASISTENCIA */}
                            <div style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1.5px solid rgba(6, 182, 212, 0.4)', borderRadius: '14px', padding: '1rem 1.15rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>⚡</span>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 850, color: '#22d3ee' }}>
                                        Requisito Fundamental de Permanencia y Certificación (80 / 80)
                                    </h4>
                                </div>
                                <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                    Para conservar la calidad de miembro activo del semillero, postular a ponencias y recibir certificación institucional, todo semillerista debe cumplir rigurosamente con:
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                                    <div style={{ background: 'var(--surface-card)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#06b6d4' }}>80% Mínimo</div>
                                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Asistencia a Capacitaciones Técnicas & Talleres de Software</div>
                                    </div>
                                    <div style={{ background: 'var(--surface-card)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>80% Mínimo</div>
                                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Asistencia y Acompañamiento a Visitas Pedagógicas Escolares</div>
                                    </div>
                                </div>
                            </div>

                            {/* LISTADO DE REGLAS Y DEBERES */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>1</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-heading)' }}>Puntualidad y Registro de Asistencia:</strong>
                                        <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                            Confirmar asistencia o no asistencia en cada evento del cronograma con al menos 48 horas de anticipación.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>2</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-heading)' }}>Cuidado de Equipos & Bioseguridad en Taller:</strong>
                                        <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                            Uso obligatorio de EPP (guantes de nitrilo, gafas y mascarilla) al manipular resinas SLA, alcohol isopropílico o soldadura. Tratar impresoras 3D y herramientas con máxima responsabilidad.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>3</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-heading)' }}>Desarrollo de Proyectos I+D+i y Trabajo Colaborativo:</strong>
                                        <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                            Participar activamente en el Banco de Proyectos, documentar iteraciones de diseño paramétrico y compartir buenas prácticas con nuevos integrantes.
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', flexShrink: 0 }}>4</span>
                                    <div>
                                        <strong style={{ color: 'var(--text-heading)' }}>Representación Institucional y Vocación STEAM:</strong>
                                        <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                            En las visitas a colegios, mantener una actitud empática, didáctica y respetuosa inspirando a niños y jóvenes hacia la ciencia y la tecnología.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsRulesModalOpen(false)}
                                style={{
                                    marginTop: '0.5rem',
                                    background: '#06b6d4',
                                    color: '#042f2e',
                                    border: 'none',
                                    padding: '10px 18px',
                                    borderRadius: '12px',
                                    fontWeight: 850,
                                    fontSize: '0.86rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px -2px rgba(6, 182, 212, 0.4)',
                                    alignSelf: 'flex-end'
                                }}
                            >
                                Entendido y Aceptado
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 2. Layout Principal con Panel Lateral Izquierdo */}
            <div className="simi-workspace-layout">
                {/* Panel Lateral Izquierdo de Navegación SIMI3D */}
                <aside className="simi-sidebar-nav">
                    {/* Encabezado de Marca SIMI 3D */}
                    <div className="simi-sidebar-brand-header">
                        <div className="simi-sidebar-brand-logo-box">
                            <img 
                                src="/badges/Logo_SIMI.webp" 
                                alt="SIMI 3D Logo" 
                                className="simi-sidebar-brand-img"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="simi-sidebar-brand-fallback" style={{ display: 'none' }}>
                                <Box size={22} className="simi-sidebar-brand-icon" />
                            </div>
                        </div>
                        <div className="simi-sidebar-brand-text">
                            <span className="simi-sidebar-brand-title">SIMI <span className="simi-sidebar-brand-3d">3D</span></span>
                            <span className="simi-sidebar-brand-sub">Semillero de Investigación</span>
                        </div>
                    </div>

                    <div className="simi-sidebar-divider" />

                    <nav className="simi-sidebar-menu">
                        <button 
                            className={`simi-sidebar-item ${activeTab === 'home' ? 'active' : ''}`}
                            onClick={() => setActiveTab('home')}
                            title="Dashboard y logros del semillero"
                        >
                            <div className="simi-sidebar-icon">
                                <Home size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Inicio</span>
                                <span className="simi-sidebar-desc">Dashboard & Logros</span>
                            </div>
                        </button>

                        <button 
                            className={`simi-sidebar-item ${activeTab === 'tracks' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tracks')}
                        >
                            <div className="simi-sidebar-icon">
                                <Box size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Rutas de Modelado</span>
                                <span className="simi-sidebar-desc">Software & CAD 3D</span>
                            </div>
                        </button>

                        <button 
                            className={`simi-sidebar-item ${activeTab === 'events' ? 'active' : ''}`}
                            onClick={() => setActiveTab('events')}
                        >
                            <div className="simi-sidebar-icon">
                                <Calendar size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Cronograma STEAM</span>
                                <span className="simi-sidebar-desc">Talleres, Proyectos & Visitas</span>
                            </div>
                        </button>

                        <button 
                            className={`simi-sidebar-item ${activeTab === 'projects' ? 'active' : ''}`}
                            onClick={() => setActiveTab('projects')}
                        >
                            <div className="simi-sidebar-icon">
                                <Rocket size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Banco de Proyectos</span>
                                <span className="simi-sidebar-desc">Prototipos & Ensambles</span>
                            </div>
                        </button>

                        <button 
                            className={`simi-sidebar-item ${activeTab === 'resources' ? 'active' : ''}`}
                            onClick={() => setActiveTab('resources')}
                        >
                            <div className="simi-sidebar-icon">
                                <Layers size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Nuestros Recursos</span>
                                <span className="simi-sidebar-desc">Impresoras & Insumos</span>
                            </div>
                        </button>

                        <button 
                            className={`simi-sidebar-item ${activeTab === 'services' ? 'active' : ''}`}
                            onClick={() => setActiveTab('services')}
                        >
                            <div className="simi-sidebar-icon">
                                <Briefcase size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Servicios & Portafolio</span>
                                <span className="simi-sidebar-desc">Capacitaciones, FDM & Mant.</span>
                            </div>
                        </button>

                        <button 
                            className={`simi-sidebar-item ${activeTab === 'members' ? 'active' : ''}`}
                            onClick={() => setActiveTab('members')}
                        >
                            <div className="simi-sidebar-icon">
                                <Users size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Miembros Activos</span>
                                <span className="simi-sidebar-desc">Directorio & 80/80</span>
                            </div>
                        </button>

                        <button 
                            className="simi-sidebar-item simi-sidebar-notifs-btn"
                            onClick={() => setIsNotificationsModalOpen(true)}
                            title="Avisos, proyectos asignados y misiones del semillero"
                        >
                            <div className="simi-sidebar-icon">
                                <Bell size={18} />
                            </div>
                            <div className="simi-sidebar-text" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                    <span className="simi-sidebar-title">Avisos & Misiones</span>
                                    {simiUnreadCount > 0 && (
                                        <span className="simi-sidebar-badge-counter" style={{ background: '#06b6d4', color: '#042f2e' }}>
                                            {simiUnreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className="simi-sidebar-desc">Centro de Alertas SIMI</span>
                            </div>
                        </button>

                    </nav>

                    {/* Acciones Secundarias y Gestión al fondo */}
                    <div className="simi-sidebar-secondary-group">
                        {isLeader && (
                            <button 
                                className="simi-sidebar-item simi-sidebar-requests-btn"
                                onClick={() => setIsRequestsModalOpen(true)}
                                title="Gestionar y aprobar solicitudes de acceso a la plataforma"
                            >
                                <div className="simi-sidebar-icon requests-icon">
                                    <UserCheck size={18} />
                                </div>
                                <div className="simi-sidebar-text" style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                        <span className="simi-sidebar-title">Solicitudes</span>
                                        {pendingAccessRequestsCount > 0 && (
                                            <span className="simi-sidebar-badge-counter">
                                                {pendingAccessRequestsCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="simi-sidebar-desc">Gestión de Acceso</span>
                                </div>
                            </button>
                        )}

                        <button 
                            className="simi-sidebar-item simi-sidebar-rules-btn"
                            onClick={() => setIsRulesModalOpen(true)}
                            title="Consultar estatutos y reglamento oficial del semillero"
                        >
                            <div className="simi-sidebar-icon rules-icon">
                                <FileText size={18} />
                            </div>
                            <div className="simi-sidebar-text">
                                <span className="simi-sidebar-title">Reglas del Semillero</span>
                                <span className="simi-sidebar-desc">Estatutos & Compromisos</span>
                            </div>
                        </button>
                    </div>

                    {/* Píldora de Usuario en la parte inferior del panel */}
                    {headerCourseSelector && (
                        <div className="simi-sidebar-user-footer">
                            {headerCourseSelector}
                        </div>
                    )}
                </aside>

                {/* ── BARRA DE NAVEGACIÓN INFERIOR PARA MÓVILES (ESTILO BANCO CON BOTÓN MÁS '...') ── */}
                <nav className="simi-mobile-bottom-nav">
                    <button 
                        className={`simi-mobile-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('home'); setIsMobileMoreMenuOpen(false); }}
                    >
                        <Home size={19} />
                        <span>Inicio</span>
                    </button>

                    <button 
                        className={`simi-mobile-nav-btn ${activeTab === 'tracks' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('tracks'); setIsMobileMoreMenuOpen(false); }}
                    >
                        <Box size={19} />
                        <span>Rutas</span>
                    </button>

                    <button 
                        className={`simi-mobile-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('events'); setIsMobileMoreMenuOpen(false); }}
                    >
                        <Calendar size={19} />
                        <span>Cronograma</span>
                    </button>

                    <button 
                        className={`simi-mobile-nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('projects'); setIsMobileMoreMenuOpen(false); }}
                    >
                        <Rocket size={19} />
                        <span>Proyectos</span>
                    </button>

                    <button 
                        className={`simi-mobile-nav-btn ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('resources'); setIsMobileMoreMenuOpen(false); }}
                    >
                        <Layers size={19} />
                        <span>Recursos</span>
                    </button>

                    <button 
                        className={`simi-mobile-nav-btn ${isMobileMoreMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMobileMoreMenuOpen(!isMobileMoreMenuOpen)}
                    >
                        <MoreHorizontal size={20} />
                        <span>Más</span>
                        {pendingAccessRequestsCount > 0 && <span className="simi-mobile-badge-dot" />}
                    </button>
                </nav>

                {/* ── SHEET / MODAL FLOTANTE DE OPCIONES ADICIONALES PARA MÓVIL ('...') ── */}
                {isMobileMoreMenuOpen && (
                    <div className="simi-mobile-more-backdrop" onClick={() => setIsMobileMoreMenuOpen(false)}>
                        <div className="simi-mobile-more-sheet" onClick={e => e.stopPropagation()}>
                            <div className="simi-mobile-more-handle" />
                            
                            <div className="simi-mobile-more-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#ffffff', border: '1.5px solid #4FD2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '2px', boxShadow: '0 2px 8px rgba(79, 210, 233, 0.25)' }}>
                                        <img src="/badges/Logo_SIMI.webp" alt="SIMI 3D" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                    <span style={{ fontWeight: 900, color: '#192584', fontSize: '1rem' }}>
                                        Opciones & Herramientas SIMI3D
                                    </span>
                                </div>
                                <button className="simi-modal-close-btn" onClick={() => setIsMobileMoreMenuOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="simi-mobile-more-grid">

                                <button 
                                    className="simi-mobile-more-item"
                                    onClick={() => { setIsNotificationsModalOpen(true); setIsMobileMoreMenuOpen(false); }}
                                >
                                    <div className="simi-mobile-more-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                                        <Bell size={20} />
                                    </div>
                                    <div className="simi-mobile-more-text" style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <strong>Avisos & Misiones SIMI</strong>
                                            {simiUnreadCount > 0 && (
                                                <span className="simi-sidebar-badge-counter" style={{ background: '#06b6d4', color: '#042f2e' }}>{simiUnreadCount}</span>
                                            )}
                                        </div>
                                        <small>Proyectos CAD, eventos y badges</small>
                                    </div>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </button>

                                {isLeader && (
                                    <button 
                                        className="simi-mobile-more-item"
                                        onClick={() => { setIsRequestsModalOpen(true); setIsMobileMoreMenuOpen(false); }}
                                    >
                                        <div className="simi-mobile-more-icon" style={{ background: '#faf5ff', color: '#B541FA', border: '1px solid #f3e8ff' }}>
                                            <UserCheck size={20} />
                                        </div>
                                        <div className="simi-mobile-more-text" style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <strong>Solicitudes de Acceso</strong>
                                                {pendingAccessRequestsCount > 0 && (
                                                    <span className="simi-sidebar-badge-counter">{pendingAccessRequestsCount}</span>
                                                )}
                                            </div>
                                            <small>Aprobar y gestionar nuevos integrantes</small>
                                        </div>
                                        <ChevronRight size={16} color="#94a3b8" />
                                    </button>
                                )}

                                <button 
                                    className="simi-mobile-more-item"
                                    onClick={() => { setActiveTab('services'); setIsMobileMoreMenuOpen(false); }}
                                >
                                    <div className="simi-mobile-more-icon" style={{ background: '#fdf4ff', color: '#ec4899', border: '1px solid #fae8ff' }}>
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="simi-mobile-more-text" style={{ flex: 1 }}>
                                        <strong>Servicios & Portafolio</strong>
                                        <small>Capacitaciones, FDM & Mantenimiento</small>
                                    </div>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </button>

                                <button 
                                    className="simi-mobile-more-item"
                                    onClick={() => { setActiveTab('members'); setIsMobileMoreMenuOpen(false); }}
                                >
                                    <div className="simi-mobile-more-icon" style={{ background: '#ecfeff', color: '#06b6d4', border: '1px solid #cffafe' }}>
                                        <Users size={20} />
                                    </div>
                                    <div className="simi-mobile-more-text" style={{ flex: 1 }}>
                                        <strong>Miembros Activos</strong>
                                        <small>Directorio y Regla 80/80</small>
                                    </div>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </button>

                                <button 
                                    className="simi-mobile-more-item"
                                    onClick={() => { setIsRulesModalOpen(true); setIsMobileMoreMenuOpen(false); }}
                                >
                                    <div className="simi-mobile-more-icon" style={{ background: '#f0fdfa', color: '#059669', border: '1px solid #ccfbf1' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="simi-mobile-more-text" style={{ flex: 1 }}>
                                        <strong>Reglas del Semillero</strong>
                                        <small>Estatutos STEAM y Regla del 80%</small>
                                    </div>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </button>
                            </div>

                            {/* Tarjeta de Perfil de Usuario Móvil Rediseñada */}
                            <div className="simi-mobile-sheet-user-card" onClick={() => navigate('/dashboard/profile')}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="simi-mobile-sheet-user-avatar">
                                        {profile?.avatar_url ? (
                                            <img 
                                                src={profile.avatar_url} 
                                                alt={profile?.full_name || 'Usuario'} 
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Users size={20} color="#06b6d4" />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <span className="simi-mobile-sheet-user-name">
                                            {profile?.full_name || 'Maker SIMI3D'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span className="simi-mobile-sheet-role-pill">
                                                {profile?.role === 'leader' || profile?.role === 'lider' ? 'Líder SIMI' : isStaff ? 'Admin' : 'Estudiante'}
                                            </span>
                                            <span className="simi-mobile-sheet-tag-pill">
                                                SIMI 3D
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06b6d4', fontSize: '0.76rem', fontWeight: 800 }}>
                                    <span>Mi Perfil</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <main className="simi-main-content">
                    {/* ── HERO HEROICO DEL ESTUDIANTE / LÍDER SIMI (Visible en todas en desktop, solo en inicio en móvil) ── */}
                    <div className={`simi-home-hero-card ${activeTab !== 'home' ? 'simi-hero-hide-mobile' : ''}`}>
                        {/* Icono de edición (lápiz) exclusivo para Administrador / Docente para habilitar/bloquear cursos e insignias */}
                        {isLeader && (
                            <button 
                                className={`simi-home-admin-edit-btn ${isManageModeActive ? 'active-manage-mode' : ''}`}
                                onClick={() => setIsManageModeActive(!isManageModeActive)}
                                title={isManageModeActive ? "Modo Gestión de Visibilidad Activo: Haz clic para salir" : "Activar Gestión de Habilitar / Bloquear (Solo Admin)"}
                            >
                                <Edit3 size={18} />
                                {isManageModeActive && <span className="simi-manage-badge-dot" />}
                            </button>
                        )}

                        <div className="simi-home-hero-body">
                            <div className="simi-home-avatar-badge">
                                <div className="simi-home-avatar-inner">
                                    {profile?.avatar_url ? (
                                        <img 
                                            src={profile.avatar_url} 
                                            alt={profile?.full_name || 'Semillerista'} 
                                            referrerPolicy="no-referrer"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Users size={40} color="#06b6d4" />
                                    )}
                                </div>
                            </div>

                            <div className="simi-home-hero-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h2 className="simi-home-greeting">
                                        ¡Bienvenido, <span className="simi-home-name-gradient">{profile?.full_name || 'Maker SIMI3D'}</span>! 🚀
                                    </h2>
                                    <span className="simi-home-role-tag">
                                        {profile?.role === 'leader' || profile?.role === 'lider' ? '🛡️ Líder de Semillero' : isStaff ? '🎓 Docente Investigador' : '⚡ Semillerista Activo'}
                                    </span>
                                    <span className="simi-home-tier-badge" title="Rango de Especialista 3D">
                                        ⭐ Rango {profile?.role === 'leader' || profile?.role === 'lider' ? 'Líder I+D' : myMakerInfo.rankTier}
                                    </span>
                                </div>
                                <p className="simi-home-hero-desc">
                                    Progreso táctico en diseño paramétrico, modelado poligonal, laminación y manufactura aditiva FDM/SLA.
                                </p>

                                {/* Barra de Progreso de Rango y EXP Dinámica */}
                                <div className="simi-home-xp-box">
                                    <div className="simi-home-xp-header">
                                        <span>⚡ <strong>Nivel {myMakerInfo.level} Maker</strong><span className="simi-home-xp-subtext"> • {myMakerInfo.title}</span></span>
                                        <span className="simi-home-xp-numbers"><strong>{totalSimiExp.toLocaleString()}</strong> / {(maxSimiStars * 100).toLocaleString()} EXP</span>
                                    </div>
                                    <div className="simi-home-xp-bar-bg">
                                        <div className="simi-home-xp-bar-fill" style={{ width: `${simiExpPercentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── PESTAÑA 0: DASHBOARD PRINCIPAL SIMI3D (SOLO EN INICIO) ── */}
                    {activeTab === 'home' && (
                        <div className="simi-home-dashboard animate-fade-in">
                            {/* ── BARRA DE MÉTRICAS TÁCTICAS (DEBAJO DEL ENCABEZADO) ── */}
                            <div className="simi-standalone-metrics-bar animate-fade-in">
                                <div 
                                    className="simi-home-metric-item simi-metric-interactive"
                                    onClick={() => setIsBadgesModalOpen(true)}
                                    title="Ver todas mis insignias y especialidades tácticas"
                                >
                                    <div className="simi-home-metric-val simi-metric-cyan">{SIMI_PINS_CATALOG.length}</div>
                                    <div className="simi-home-metric-lbl">Insignias Tácticas</div>
                                    <div className="simi-home-metric-sub">Especialidades</div>
                                    <span className="simi-metric-pill-tag neutral">
                                        🎖️ Vitrina 3D
                                    </span>
                                </div>
                                <div className="simi-home-metric-divider" />
                                <div 
                                    className="simi-home-metric-item simi-metric-interactive"
                                    onClick={() => {
                                        if (isLeader) {
                                            const target = technicalTrainingsList[0] || simiEvents.find(e => (e.event_type || e.eventType) === 'capacitacion_tecnica') || simiEvents[0];
                                            if (target) setAttendanceModalEvent(target);
                                            else setIsRulesModalOpen(true);
                                        } else {
                                            setIsRulesModalOpen(true);
                                        }
                                    }}
                                    title={isLeader ? "Tomar o gestionar asistencia a capacitaciones técnicas" : "Asistencia a Capacitaciones Técnicas (Requisito mínimo 80%)"}
                                >
                                    <div className={`simi-home-metric-val ${trainingsPercentage >= 80 ? 'simi-metric-success' : 'simi-metric-blue'}`}>
                                        {trainingsPercentage}%
                                    </div>
                                    <div className="simi-home-metric-lbl">Capacitaciones</div>
                                    <div className="simi-home-metric-sub">
                                        {myTrainingsAttended} de {technicalTrainingsList.length} Lab
                                    </div>
                                    <div className="simi-metric-mini-bar">
                                        <div 
                                            className="simi-metric-mini-fill" 
                                            style={{ 
                                                width: `${Math.min(100, trainingsPercentage)}%`,
                                                background: trainingsPercentage >= 80 ? 'var(--simi-success, #059669)' : '#0284c7'
                                            }} 
                                        />
                                    </div>
                                    <span className={`simi-metric-pill-tag ${trainingsPercentage >= 80 ? 'passed' : 'neutral'}`}>
                                        {trainingsPercentage >= 80 ? '✓ 80% Cumplido' : (isLeader ? '📋 Tomar Lista' : 'Mín. 80%')}
                                    </span>
                                </div>
                                <div className="simi-home-metric-divider" />
                                <div 
                                    className="simi-home-metric-item simi-metric-interactive"
                                    onClick={() => {
                                        if (isLeader) {
                                            const target = schoolVisitsList[0] || simiEvents.find(e => (e.event_type || e.eventType) !== 'capacitacion_tecnica') || simiEvents[0];
                                            if (target) setAttendanceModalEvent(target);
                                            else setIsRulesModalOpen(true);
                                        } else {
                                            setIsRulesModalOpen(true);
                                        }
                                    }}
                                    title={isLeader ? "Tomar o gestionar asistencia a visitas escolares STEAM" : "Acompañamiento a Visitas Escolares (Requisito mínimo 80%)"}
                                >
                                    <div className={`simi-home-metric-val ${visitsPercentage >= 80 ? 'simi-metric-success' : 'simi-metric-indigo'}`}>
                                        {visitsPercentage}%
                                    </div>
                                    <div className="simi-home-metric-lbl">Visitas Escolares</div>
                                    <div className="simi-home-metric-sub">
                                        {myVisitsAttended} de {schoolVisitsList.length} Salidas
                                    </div>
                                    <div className="simi-metric-mini-bar">
                                        <div 
                                            className="simi-metric-mini-fill" 
                                            style={{ 
                                                width: `${Math.min(100, visitsPercentage)}%`,
                                                background: visitsPercentage >= 80 ? 'var(--simi-success, #059669)' : '#2563eb'
                                            }} 
                                        />
                                    </div>
                                    <span className={`simi-metric-pill-tag ${visitsPercentage >= 80 ? 'passed' : 'neutral'}`}>
                                        {visitsPercentage >= 80 ? '✓ 80% Cumplido' : (isLeader ? '📋 Tomar Lista' : 'Mín. 80%')}
                                    </span>
                                </div>
                                <div className="simi-home-metric-divider" />
                                <div 
                                    className="simi-home-metric-item simi-metric-interactive"
                                    onClick={() => setActiveTab('projects')}
                                    title="Ir al Banco de Proyectos STEAM"
                                >
                                    <div className="simi-home-metric-val simi-metric-purple">{simiProjects.length}</div>
                                    <div className="simi-home-metric-lbl">Proyectos I+D</div>
                                    <div className="simi-home-metric-sub">Banco STEAM</div>
                                    <span className="simi-metric-pill-tag neutral" style={{ color: '#7c3aed', borderColor: 'rgba(147, 51, 234, 0.25)', background: 'rgba(147, 51, 234, 0.08)' }}>
                                        🚀 Diseños CAD
                                    </span>
                                </div>
                            </div>

                            {/* ── BARRA DE INSIGNIAS Y LOGOS (ACORDEÓN EN MÓVIL, VISIBLE EN ESCRITORIO) ── */}
                            <div className="simi-badges-ribbon-card animate-fade-in">
                                <div 
                                    className="simi-badges-ribbon-header simi-badges-accordion-toggle"
                                    onClick={() => setIsBadgesExpanded(!isBadgesExpanded)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="simi-badges-ribbon-icon">
                                            <Trophy size={16} />
                                        </div>
                                        <h3 className="simi-badges-ribbon-title">
                                            🎖️ Mis Insignias & Especialidades ({SIMI_PINS_CATALOG.length})
                                        </h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="simi-badges-ribbon-hint">
                                            {isBadgesExpanded ? 'Ocultar insignias' : 'Ver insignias'}
                                        </span>
                                        <div className={`simi-badges-chevron ${isBadgesExpanded ? 'open' : ''}`}>
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className={`simi-badges-ribbon-content ${isBadgesExpanded ? 'is-expanded' : 'is-collapsed'}`}>
                                    <div className="simi-badges-ribbon-items">
                                        {SIMI_PINS_CATALOG
                                            .filter(pin => {
                                                const state = badgeVisibilityMap[pin.id] || 'unlocked';
                                                // Los estudiantes nunca ven los ocultos; el admin/líder los ve siempre (con marca de oculto)
                                                if (!isLeader && state === 'hidden') return false;
                                                return true;
                                            })
                                            .sort((a, b) => {
                                                // Ordenar: Desbloqueados (1) -> Bloqueados (2) -> Ocultos (3)
                                                const stateOrder = { 'unlocked': 1, 'locked': 2, 'hidden': 3 };
                                                const stateA = badgeVisibilityMap[a.id] || 'unlocked';
                                                const stateB = badgeVisibilityMap[b.id] || 'unlocked';
                                                return (stateOrder[stateA] || 1) - (stateOrder[stateB] || 1);
                                            })
                                            .map((pin) => {
                                            const IconComp = ICON_MAP[pin.icon] || Shield;
                                            const currentTier = selectedPinTiers[pin.id] || 'I';
                                            const isPrestige = currentTier === 'V';
                                            const currentPinImg = pin.badgeImageUrl;
                                            const hasImg = Boolean(currentPinImg && !failedImageMap[pin.id]);
                                            const visState = badgeVisibilityMap[pin.id] || 'unlocked';
                                            const isLocked = visState === 'locked';
                                            const isHidden = visState === 'hidden';

                                            return (
                                                <div
                                                    key={pin.id}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <button
                                                        type="button"
                                                        className={`simi-badge-app-item ${isPrestige ? 'prestige' : ''} ${hasImg ? 'has-custom-badge' : ''} ${isLocked ? 'simi-item-locked' : ''} ${isHidden ? 'simi-item-hidden' : ''}`}
                                                        onClick={() => {
                                                            if (isLocked && !isLeader) return;
                                                            handleOpenPinModal(pin.id);
                                                        }}
                                                        style={{ 
                                                            '--badge-color': pin.color,
                                                            padding: hasImg ? '0.4rem 0.25rem 0.2rem 0.25rem' : undefined,
                                                            background: hasImg ? 'transparent' : undefined,
                                                            border: hasImg ? 'none' : undefined,
                                                            boxShadow: hasImg ? 'none' : undefined,
                                                            position: 'relative',
                                                            width: '100%',
                                                            cursor: isLocked && !isLeader ? 'not-allowed' : 'pointer',
                                                            opacity: isHidden ? 0.38 : isLocked ? (isLeader ? 0.65 : 0.45) : 1,
                                                            filter: isHidden ? 'grayscale(1) opacity(0.5)' : isLocked ? 'grayscale(0.7)' : 'none'
                                                        }}
                                                        title={isLocked && !isLeader ? `Insignia Bloqueada: ${pin.name}` : isHidden ? `Insignia Oculta para alumnos: ${pin.name}` : `Insignia: ${pin.name} — ${tierRankName(currentTier)} • Toca para ver requisitos`}
                                                    >
                                                        {/* Nombre Arriba de la Insignia */}
                                                        <span 
                                                            className="simi-badge-app-name"
                                                            style={{
                                                                fontSize: hasImg ? '0.84rem' : '0.8rem',
                                                                fontWeight: 900,
                                                                color: 'var(--text-heading, #0f172a)',
                                                                marginBottom: hasImg ? '2px' : 0
                                                            }}
                                                        >
                                                            {pin.shortName || pin.name}
                                                        </span>

                                                        <div 
                                                            className="simi-badge-app-icon-box" 
                                                            style={{ 
                                                                width: hasImg ? '96px' : '48px',
                                                                height: hasImg ? '96px' : '48px',
                                                                color: pin.color, 
                                                                borderColor: hasImg ? 'transparent' : pin.color, 
                                                                border: hasImg ? 'none' : undefined,
                                                                background: hasImg ? 'transparent' : `color-mix(in srgb, ${pin.color} 15%, #ffffff)`,
                                                                boxShadow: hasImg ? 'none' : undefined,
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            {hasImg ? (
                                                                <>
                                                                    <img 
                                                                        src={currentPinImg} 
                                                                        alt={pin.name} 
                                                                        referrerPolicy="no-referrer"
                                                                        onError={() => setFailedImageMap(prev => ({ ...prev, [pin.id]: true }))}
                                                                        style={{ 
                                                                            width: '100%', 
                                                                            height: '100%', 
                                                                            objectFit: 'contain', 
                                                                            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.18))',
                                                                            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                                        }} 
                                                                    />
                                                                    <span 
                                                                        style={{
                                                                            position: 'absolute',
                                                                            bottom: '10.5px',
                                                                            left: '50%',
                                                                            transform: 'translateX(-50%)',
                                                                            color: '#1e293b',
                                                                            fontSize: '0.76rem',
                                                                            fontWeight: 950,
                                                                            letterSpacing: '0.5px',
                                                                            textShadow: '0 1px 1px rgba(255, 255, 255, 0.5), 0 -1px 1px rgba(0, 0, 0, 0.35)',
                                                                            pointerEvents: 'none'
                                                                        }}
                                                                    >
                                                                        {tierToStars(currentTier)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <IconComp size={24} />
                                                            )}

                                                        </div>
                                                        
                                                        {!hasImg && (
                                                            <span 
                                                                className="simi-badge-app-tier" 
                                                                style={{ 
                                                                    color: pin.color,
                                                                    background: `color-mix(in srgb, ${pin.color} 12%, transparent)`,
                                                                    borderColor: `color-mix(in srgb, ${pin.color} 30%, transparent)`
                                                                }}
                                                            >
                                                                {tierToStarsPlain(currentTier)}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Botón Central Grande de 3 Estados (Visible / Bloqueada / Oculta) en Modo Gestión (Solo Admin/Líder) */}
                                                    {isLeader && isManageModeActive && (
                                                        <button
                                                            type="button"
                                                            className={`simi-manage-center-toggle-btn badge-center-toggle is-state-${visState}`}
                                                            onClick={(e) => cycleBadgeVisibility(pin.id, e)}
                                                            title={`Estado actual: ${visState.toUpperCase()} — Haz clic para alternar`}
                                                        >
                                                            {visState === 'unlocked' && <Eye size={22} className="simi-toggle-icon" />}
                                                            {visState === 'locked' && <Lock size={22} className="simi-toggle-icon" />}
                                                            {visState === 'hidden' && <EyeOff size={22} className="simi-toggle-icon" />}
                                                            <span className="simi-toggle-label">
                                                                {visState === 'unlocked' ? 'Visible' : visState === 'locked' ? 'Bloqueada' : 'Oculta'}
                                                            </span>
                                                        </button>
                                                    )}

                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>


                            {/* 2. FILA: PRÓXIMA VISITA ESCOLAR */}
                            <div className="simi-home-bottom-grid" style={{ gridTemplateColumns: '1fr' }}>
                                {/* Próximas Visitas a Colegios & Eventos */}
                                <div className="simi-home-subcard">
                                    <div className="simi-home-subcard-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <School size={18} color="#06b6d4" />
                                            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                                Próxima Salida de Extensión Escolar STEAM
                                            </h4>
                                        </div>
                                        <button 
                                            className="simi-home-text-link"
                                            onClick={() => setActiveTab('events')}
                                        >
                                            Cronograma <ArrowRight size={13} />
                                        </button>
                                    </div>

                                    {(() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        const nextEvt = (simiEvents || [])
                                            .filter(e => {
                                                const st = (e.status || '').toLowerCase();
                                                const isValidStatus = (st === 'programada' || st === 'en preparación' || st === 'en preparacion')
                                                    && e.date >= today;
                                                if (!isValidStatus) return false;

                                                const visState = eventVisibilityMap[e.id] || e.visibilityState || e.visibility_state || (e.isLocked || e.is_locked ? 'locked' : (e.isHidden || e.is_hidden ? 'hidden' : 'unlocked'));
                                                // Los alumnos nunca ven los eventos ocultos
                                                if (!isLeader && visState === 'hidden') return false;

                                                return true;
                                            })
                                            .sort((a, b) => a.date.localeCompare(b.date))[0];

                                        if (!nextEvt) {
                                            return (
                                                <div style={{
                                                    padding: '1.2rem', borderRadius: '12px',
                                                    background: 'rgba(100,116,139,0.07)',
                                                    border: '1.5px dashed rgba(100,116,139,0.25)',
                                                    textAlign: 'center', color: 'var(--text-secondary)',
                                                    fontSize: '0.82rem'
                                                }}>
                                                    📅 No hay visitas programadas próximamente.<br />
                                                    <button
                                                        onClick={() => setActiveTab('events')}
                                                        style={{
                                                            marginTop: '8px', background: 'none', border: 'none',
                                                            color: '#06b6d4', cursor: 'pointer', fontWeight: 800,
                                                            fontSize: '0.8rem', padding: 0
                                                        }}
                                                    >
                                                        Ver cronograma →
                                                    </button>
                                                </div>
                                            );
                                        }

                                        const isCapacitacion = (nextEvt.event_type || nextEvt.eventType || '') === 'capacitacion_tecnica';
                                        const nextEvtVisState = eventVisibilityMap[nextEvt.id] || nextEvt.visibilityState || nextEvt.visibility_state || (nextEvt.isLocked || nextEvt.is_locked ? 'locked' : (nextEvt.isHidden || nextEvt.is_hidden ? 'hidden' : 'unlocked'));

                                        return (
                                            <div className="simi-home-event-highlight">
                                                <div className="simi-home-event-top">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                        <span className="simi-home-event-badge">
                                                            {isCapacitacion ? '🎓 Capacitación Técnica' : '🏫 Visita Pedagógica'}
                                                        </span>
                                                        {isLeader && nextEvtVisState === 'hidden' && (
                                                            <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                                👁️ Oculto para alumnos
                                                            </span>
                                                        )}
                                                        {isLeader && nextEvtVisState === 'locked' && (
                                                            <span style={{ fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                                                🔒 Bloqueado
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="simi-home-event-date">📅 {nextEvt.date}</span>
                                                </div>
                                                <h4 className="simi-home-event-title">{nextEvt.schoolName || nextEvt.school_name}</h4>
                                                <p className="simi-home-event-desc">{nextEvt.objective}</p>
                                                <div className="simi-home-event-footer">
                                                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                                        👥 <strong>Estudiantes:</strong> {nextEvt.studentsCount || nextEvt.students_count || '—'}
                                                    </span>
                                                    <button 
                                                        className="simi-home-event-btn"
                                                        onClick={() => setActiveTab('events')}
                                                    >
                                                        Ver Detalles
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 1: RUTAS FORMATIVAS DIRECTAS EN GRID SIN CARDS INTERMEDIAS */}
                    {activeTab === 'tracks' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Contenedor Superior de Rutas Formativas */}
                            <div className="simi-tracks-header-card">
                                <div className="simi-tracks-header-info">
                                    <div className="simi-tracks-header-icon">
                                        <Compass size={22} />
                                    </div>
                                    <div>
                                        <h3 className="simi-tracks-header-title">
                                            Rutas Formativas & Especialidades 3D
                                        </h3>
                                        <p className="simi-tracks-header-desc">
                                            Explora software de diseño paramétrico, modelado poligonal, laminación y manufactura aditiva FDM/SLA.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Directo con Todas las Rutas / Cursos Ordenados: Desbloqueados -> Bloqueados -> Ocultos */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
                                {SIMI_TRACKS
                                    .filter(track => {
                                        const state = trackVisibilityMap[track.id] || 'unlocked';
                                        // Los alumnos nunca ven los cursos ocultos; el admin/docente los ve siempre
                                        if (!isLeader && state === 'hidden') return false;
                                        return true;
                                    })
                                    .sort((a, b) => {
                                        // Ordenar: Desbloqueados (1) -> Bloqueados (2) -> Ocultos (3)
                                        const stateOrder = { 'unlocked': 1, 'locked': 2, 'hidden': 3 };
                                        const stateA = trackVisibilityMap[a.id] || 'unlocked';
                                        const stateB = trackVisibilityMap[b.id] || 'unlocked';
                                        return (stateOrder[stateA] || 1) - (stateOrder[stateB] || 1);
                                    })
                                    .map(track => {
                                    const IconComponent = ICON_MAP[track.icon] || Box;
                                    const pin = SIMI_PINS_CATALOG.find(p => p.id === track.pinId);
                                    const currentTier = selectedPinTiers[track.pinId] || 'I';
                                    const isPrestige = currentTier === 'V';
                                    const visState = trackVisibilityMap[track.id] || 'unlocked';
                                    const isLocked = visState === 'locked';
                                    const isHidden = visState === 'hidden';

                                    return (
                                        <div 
                                            key={track.id} 
                                            className={`simi-track-card simi-track-card-showcase simi-track-card-clickable ${isLocked ? 'simi-item-locked' : ''} ${isHidden ? 'simi-item-hidden' : ''}`}
                                            onClick={() => {
                                                if (isLocked && !isLeader) return;
                                                setActiveLessonTrack(track);
                                                setActiveUnitIndex(0);
                                            }}
                                            style={{
                                                position: 'relative',
                                                cursor: isLocked && !isLeader ? 'not-allowed' : 'pointer',
                                                opacity: isHidden ? 0.38 : isLocked ? (isLeader ? 0.72 : 0.48) : 1,
                                                filter: isHidden ? 'grayscale(1) opacity(0.5)' : isLocked ? 'grayscale(0.7)' : 'none'
                                            }}
                                            title={isLocked && !isLeader ? `Ruta Bloqueada: ${track.title}` : isHidden ? `Ruta Oculta para alumnos: ${track.title}` : `Entrar a las unidades de ${track.title}`}
                                        >
                                            {/* Botón Central Grande de 3 Estados (Visible / Bloqueado / Oculto) en Modo Gestión (Solo Admin/Líder) */}
                                            {isLeader && isManageModeActive && (
                                                <button
                                                    type="button"
                                                    className={`simi-manage-center-toggle-btn track-center-toggle is-state-${visState}`}
                                                    onClick={(e) => cycleTrackVisibility(track.id, e)}
                                                    title={`Estado actual: ${visState.toUpperCase()} — Haz clic para alternar`}
                                                >
                                                    <div className="simi-manage-center-icon-wrap">
                                                        {visState === 'unlocked' && <Eye size={36} />}
                                                        {visState === 'locked' && <Lock size={36} />}
                                                        {visState === 'hidden' && <EyeOff size={36} />}
                                                    </div>
                                                    <span className="simi-manage-center-text">
                                                        {visState === 'unlocked' ? 'Visible' : visState === 'locked' ? 'Bloqueado' : 'Oculto'}
                                                    </span>
                                                    <small className="simi-manage-center-sub">
                                                        {visState === 'unlocked' ? 'Toca para Bloquear' : visState === 'locked' ? 'Toca para Ocultar' : 'Toca para Habilitar'}
                                                    </small>
                                                </button>
                                            )}

                                            {/* Overlay de Bloqueado para Estudiantes */}
                                            {!isLeader && isLocked && (
                                                <div className="simi-track-student-blocked-overlay">
                                                    <div className="simi-student-lock-icon-circle">
                                                        <Lock size={36} />
                                                    </div>
                                                    <span className="simi-student-lock-title">Curso Bloqueado</span>
                                                    <small className="simi-student-lock-desc">Próximamente disponible</small>
                                                </div>
                                            )}

                                            {/* Barra superior limpia con Badge y Nivel */}
                                            <div className="simi-track-showcase-top">
                                                <div className="simi-track-meta">
                                                    <span className="simi-track-tag" style={{ color: track.color }}>
                                                        {track.badge}
                                                    </span>
                                                    <span className="simi-track-level-pill">
                                                        {track.level}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Cuerpo Compacto: Icono a un lado de la información */}
                                            <div className="simi-track-compact-body">
                                                <div 
                                                    className="simi-track-compact-avatar"
                                                    style={{
                                                        background: `radial-gradient(circle at center, color-mix(in srgb, ${track.color} 18%, transparent) 0%, color-mix(in srgb, ${track.color} 6%, transparent) 100%)`,
                                                        borderColor: `color-mix(in srgb, ${track.color} 26%, var(--border-subtle))`
                                                    }}
                                                >
                                                    {track.logoUrl ? (
                                                        <img 
                                                            src={track.logoUrl} 
                                                            alt={track.title} 
                                                            className="simi-track-compact-img"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div className="simi-track-hero-icon-fallback" style={{ color: track.color }}>
                                                            <IconComponent size={26} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="simi-track-info" style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                                        <h3 className="simi-track-name">
                                                            {track.title}
                                                        </h3>
                                                        <ArrowRight size={14} color={track.color} className="simi-track-arrow-hint" />
                                                    </div>
                                                    <p className="simi-track-desc">
                                                        {track.subtitle}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

            
            {/* MODAL DE RUTAS FORMATIVAS POR CATEGORÍA */}
            {activeCategoryModal && (
                <div className="simi-modal-backdrop" onClick={() => setActiveCategoryModal(null)}>
                    <div 
                        className="simi-modal-card" 
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '980px', width: '95vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '1.4rem 1.6rem' }}
                    >
                        {/* Cabecera del Modal de Categoría */}
                        <div className="simi-modal-header" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div 
                                    className="simi-shield-emblem"
                                    style={{ 
                                        background: `radial-gradient(circle, color-mix(in srgb, ${activeCategoryModal.color} 25%, var(--surface-card)) 0%, var(--surface-card) 100%)`,
                                        borderColor: activeCategoryModal.color,
                                        color: activeCategoryModal.color
                                    }}
                                >
                                    <activeCategoryModal.icon size={24} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeCategoryModal.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            CATEGORÍA FORMATIVA • SIMI3D
                                        </span>
                                    </div>
                                    <h2 style={{ margin: '2px 0 0 0', fontSize: '1.28rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                        {activeCategoryModal.title}
                                    </h2>
                                </div>
                            </div>

                            <button 
                                className="simi-modal-close-btn" 
                                onClick={() => setActiveCategoryModal(null)}
                                title="Cerrar modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Grid de Rutas dentro del Modal */}
                        <div style={{ overflowY: 'auto', padding: '1rem 0.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
                            {SIMI_TRACKS.filter(t => t.category === activeCategoryModal.category).map(track => {
                                const IconComponent = ICON_MAP[track.icon] || Box;
                                const pin = SIMI_PINS_CATALOG.find(p => p.id === track.pinId);
                                const currentTier = selectedPinTiers[track.pinId] || 'I';
                                const isPrestige = currentTier === 'V';

                                return (
                                    <div key={track.id} className="simi-track-card simi-track-card-showcase">
                                        {/* Barra superior con Badge, Nivel y Rango */}
                                        <div className="simi-track-showcase-top">
                                            <div className="simi-track-meta">
                                                <span className="simi-track-tag" style={{ color: track.color }}>
                                                    {track.badge}
                                                </span>
                                                <span className="simi-track-level-pill">
                                                    {track.level}
                                                </span>
                                            </div>

                                            {pin && (
                                                <button 
                                                    className={`simi-track-pin-trigger ${isPrestige ? 'prestige' : ''}`}
                                                    style={{
                                                        background: isPrestige ? 'rgba(245, 158, 11, 0.15)' : `color-mix(in srgb, ${track.color} 14%, var(--surface-card))`,
                                                        borderColor: isPrestige ? '#f59e0b' : `color-mix(in srgb, ${track.color} 40%, var(--border-subtle))`,
                                                        color: isPrestige ? '#f59e0b' : track.color
                                                    }}
                                                    onClick={() => handleOpenPinModal(track.pinId)}
                                                    title="Ver Insignia y Rango de Maestría"
                                                >
                                                    <Shield size={12} />
                                                    <span>{tierToStars(currentTier)}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Showcase Visual Protagónico de la Imagen / Logo del Equipo o Software */}
                                        <div 
                                            className="simi-track-hero-showcase"
                                            style={{
                                                background: `radial-gradient(ellipse at center, color-mix(in srgb, ${track.color} 18%, transparent) 0%, color-mix(in srgb, ${track.color} 5%, transparent) 60%, transparent 100%)`,
                                                borderColor: `color-mix(in srgb, ${track.color} 22%, var(--border-subtle))`
                                            }}
                                        >
                                            {track.logoUrl ? (
                                                <img 
                                                    src={track.logoUrl} 
                                                    alt={track.title} 
                                                    className="simi-track-hero-img"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div 
                                                    className="simi-track-hero-icon-fallback"
                                                    style={{ color: track.color }}
                                                >
                                                    <IconComponent size={56} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Información y Títulos */}
                                        <div className="simi-track-info">
                                            <h3 className="simi-track-name">
                                                {track.title}
                                            </h3>
                                            <p className="simi-track-desc">
                                                {track.subtitle}
                                            </p>
                                        </div>

                                        {/* Footer de la tarjeta */}
                                        <div className="simi-track-footer">
                                            <div className="simi-track-stats-pill">
                                                <span>{track.units.length} Módulos</span>
                                                <span>•</span>
                                                <span>{track.software}</span>
                                            </div>
                                            <button 
                                                className="simi-track-action-btn"
                                                style={{
                                                    background: `color-mix(in srgb, ${track.color} 14%, var(--surface-card))`,
                                                    borderColor: `color-mix(in srgb, ${track.color} 30%, var(--border-subtle))`,
                                                    color: track.color
                                                }}
                                                onClick={() => {
                                                    setActiveCategoryModal(null);
                                                    setActiveLessonTrack(track);
                                                    setActiveUnitIndex(0);
                                                }}
                                                title={`Entrar a las unidades de ${track.title}`}
                                            >
                                                Ingresar <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL / VISOR INTERACTIVO DE CONTENIDO DE RUTA FORMATIVA */}
            {activeLessonTrack && (() => {
                const trackData = SIMI_TRACKS_LESSONS_DATA[activeLessonTrack.id];
                const unitsList = trackData?.units || activeLessonTrack.units || [];
                const currentUnit = trackData?.units?.[activeUnitIndex] || {
                    title: unitsList[activeUnitIndex]?.title || 'Contenido en desarrollo',
                    type: unitsList[activeUnitIndex]?.type || 'Práctica',
                    duration: unitsList[activeUnitIndex]?.duration || '20 min',
                    summary: 'Módulo formativo en desarrollo para la ruta seleccionada.',
                    sections: [
                        {
                            title: 'Objetivos de la Unidad',
                            content: `Esta unidad cubre los conceptos fundamentales, buenas prácticas y flujos de trabajo de ${activeLessonTrack.title}.`
                        }
                    ]
                };

                const quizKey = `${activeLessonTrack.id}_${activeUnitIndex}`;
                const selectedAns = selectedQuizAnswers[quizKey];
                const isChecked = quizChecked[quizKey];
                const quiz = currentUnit.quiz;

                return (
                    <div className="simi-modal-backdrop" onClick={() => setActiveLessonTrack(null)}>
                        <div 
                            className="simi-modal-card simi-lesson-viewer-modal" 
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '1060px', width: '95vw', height: '88vh', maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '1.4rem 1.6rem' }}
                        >
                            {/* Cabecera del Visor de Lección */}
                            <div className="simi-modal-header" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div 
                                        className="simi-shield-emblem"
                                        style={{ 
                                            background: `radial-gradient(circle, color-mix(in srgb, ${activeLessonTrack.color} 25%, var(--surface-card)) 0%, var(--surface-card) 100%)`,
                                            borderColor: activeLessonTrack.color,
                                            color: activeLessonTrack.color,
                                            boxShadow: `0 0 16px -2px color-mix(in srgb, ${activeLessonTrack.color} 40%, transparent)`
                                        }}
                                    >
                                        <Flame size={24} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeLessonTrack.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {activeLessonTrack.badge} • {activeLessonTrack.level}
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>•</span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                {activeLessonTrack.software}
                                            </span>
                                        </div>
                                        <h2 style={{ margin: '2px 0 0 0', fontSize: '1.28rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                            {activeLessonTrack.title}
                                        </h2>
                                    </div>
                                </div>

                                <button 
                                    className="simi-modal-close-btn" 
                                    onClick={() => setActiveLessonTrack(null)}
                                    title="Cerrar lección"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Pestañas de Unidades de la Ruta */}
                            <div className="simi-lesson-units-bar" style={{ display: 'grid', gridTemplateColumns: `repeat(${unitsList.length}, minmax(0, 1fr))`, gap: '8px', padding: '8px 0', borderBottom: '1.5px solid #e2e8f0', flexShrink: 0 }}>
                                {unitsList.map((u, idx) => {
                                    const isUnitActive = idx === activeUnitIndex;
                                    return (
                                        <button
                                            key={u.id || idx}
                                            onClick={() => setActiveUnitIndex(idx)}
                                            style={{
                                                padding: '9px 6px', width: '100%', justifyContent: 'center',
                                                borderRadius: '10px',
                                                border: '1.5px solid',
                                                borderColor: isUnitActive ? activeLessonTrack.color : '#e2e8f0',
                                                background: isUnitActive ? '#ffffff' : '#f8fafc',
                                                color: isUnitActive ? '#0f172a' : '#64748b',
                                                fontSize: '0.78rem',
                                                fontWeight: isUnitActive ? 850 : 600,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                display: 'flex',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                boxShadow: isUnitActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                                                transition: 'all 0.15s ease'
                                            }}
                                            title={u.fullTitle || u.title}
                                        >
                                            <span>{u.title.split(' y ')[0].split(',')[0].split(' (')[0].split('/')[0].trim()}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Contenido Principal de la Unidad Activa con Scroll Independiente */}
                            <div className="simi-unit-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem', overflowY: 'auto', paddingRight: '6px', flex: 1 }}>
                                {/* Banner de Cabecera de la Unidad */}
                                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.1rem 1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.74rem', fontWeight: 850, color: activeLessonTrack.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            Unidad {activeUnitIndex + 1} • {currentUnit.type || 'Taller Práctico'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                                            <Clock size={13} />
                                            <span>{currentUnit.duration || '25 min'}</span>
                                            <span>•</span>
                                            <span style={{ color: '#059669', fontWeight: 800, background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>+25 EXP</span>
                                        </div>
                                    </div>
                                    <h3 style={{ margin: '6px 0 6px 0', fontSize: '1.2rem', fontWeight: 850, color: '#0f172a', lineHeight: 1.3 }}>
                                        {currentUnit.title}
                                    </h3>
                                    {currentUnit.summary && (
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.55 }}>
                                            {currentUnit.summary}
                                        </p>
                                    )}
                                </div>

                                {/* Secciones Teórico-Prácticas */}
                                {currentUnit.sections?.map((sec, sIdx) => (
                                    <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeLessonTrack.color }}>
                                                <BookOpen size={14} />
                                            </div>
                                            {sec.title}
                                        </h4>
                                        {sec.content && (
                                            <div 
                                                style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.65 }}
                                                dangerouslySetInnerHTML={{ __html: formatSimiMarkdown(sec.content) }}
                                            />
                                        )}

                                        {/* Diagrama Técnico SVG */}
                                        {sec.svgDiagram && (
                                            <div 
                                                style={{ margin: '0.65rem 0', background: '#090d16', border: '1.5px solid #06b6d4', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                                                dangerouslySetInnerHTML={{ __html: sec.svgDiagram }}
                                            />
                                        )}

                                        {sec.imageUrl && (
                                            <div style={{ margin: '0.65rem 0', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#f8fafc' }}>
                                                <img 
                                                    src={sec.imageUrl} 
                                                    alt={sec.imageCaption || sec.title} 
                                                    style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                                                    referrerPolicy="no-referrer"
                                                />
                                                {sec.imageCaption && (
                                                    <div style={{ padding: '8px 12px', width: '100%', fontSize: '0.76rem', color: '#64748b', background: '#ffffff', textAlign: 'center', borderTop: '1px solid #e2e8f0', fontWeight: 600 }}>
                                                        📷 {sec.imageCaption}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Tabla técnica */}
                                        {sec.table && (
                                            <div style={{ overflowX: 'auto', margin: '0.5rem 0', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                                                    <thead>
                                                        <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                                                            {sec.table.headers.map((h, hIdx) => (
                                                                <th key={hIdx} style={{ padding: '9px 12px', fontWeight: 850, color: '#0f172a' }}>
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sec.table.rows.map((row, rIdx) => (
                                                            <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                                {row.map((cell, cIdx) => (
                                                                    <td key={cIdx} style={{ padding: '9px 12px', color: cIdx === 0 ? activeLessonTrack.color : '#334155', fontWeight: cIdx === 0 ? 800 : 500 }}>
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Callout de tip/alerta */}
                                        {sec.callout && (
                                            <div style={{ background: '#f0fdfa', borderLeft: '4px solid #06b6d4', border: '1px solid #ccfbf1', borderLeftWidth: '4px', borderRadius: '10px', padding: '0.85rem 1.1rem', fontSize: '0.84rem', color: '#0f766e', margin: '0.4rem 0' }}>
                                                <strong style={{ color: '#0e7490', fontWeight: 850 }}>💡 {sec.callout.title}: </strong>
                                                <span style={{ color: '#134e4a' }}>{sec.callout.text}</span>
                                            </div>
                                        )}

                                        {/* Pasos ordenados */}
                                        {sec.steps && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0.4rem 0' }}>
                                                {sec.steps.map((st, stIdx) => (
                                                    <div key={stIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                                                        <span style={{ width: '22px', height: '22px', minWidth: '22px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', border: '1.5px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 850 }}>
                                                            {stIdx + 1}
                                                        </span>
                                                        <span style={{ lineHeight: 1.5 }}>{st}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Reto Interactivo de Autoevaluación (Quiz) */}
                                {quiz && (
                                    <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.65rem' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#ffffff', border: '1.5px solid #4FD2E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                                                <HelpCircle size={15} />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 850, color: '#0f172a' }}>
                                                Comprobación de Conocimiento Rápido
                                            </h4>
                                        </div>
                                        <p style={{ margin: '0 0 0.95rem 0', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.5 }}>
                                            {quiz.question}
                                        </p>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {quiz.options.map((opt, oIdx) => {
                                                const isSelected = selectedAns === oIdx;
                                                const isCorrect = oIdx === quiz.correctIndex;
                                                let borderCol = '#e2e8f0';
                                                let bgCol = '#ffffff';
                                                let textCol = '#334155';

                                                if (isChecked) {
                                                    if (isCorrect) {
                                                        borderCol = '#10b981';
                                                        bgCol = '#ecfdf5';
                                                        textCol = '#065f46';
                                                    } else if (isSelected) {
                                                        borderCol = '#f43f5e';
                                                        bgCol = '#fff1f2';
                                                        textCol = '#9f1239';
                                                    }
                                                } else if (isSelected) {
                                                    borderCol = '#B541FA';
                                                    bgCol = '#faf5ff';
                                                    textCol = '#581c87';
                                                }

                                                return (
                                                    <button
                                                        key={oIdx}
                                                        disabled={isChecked}
                                                        onClick={() => {
                                                            setSelectedQuizAnswers(prev => ({ ...prev, [quizKey]: oIdx }));
                                                        }}
                                                        style={{
                                                            padding: '10px 14px',
                                                            borderRadius: '10px',
                                                            border: `1.5px solid ${borderCol}`,
                                                            background: bgCol,
                                                            color: textCol,
                                                            fontSize: '0.84rem',
                                                            fontWeight: isSelected ? 750 : 500,
                                                            textAlign: 'left',
                                                            cursor: isChecked ? 'default' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: '8px',
                                                            boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <span>{opt}</span>
                                                        {isChecked && isCorrect && <Check size={16} style={{ color: '#10b981', minWidth: '16px' }} />}
                                                        {isChecked && isSelected && !isCorrect && <X size={16} style={{ color: '#f43f5e', minWidth: '16px' }} />}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                            {!isChecked ? (
                                                <button
                                                    disabled={selectedAns === undefined}
                                                    onClick={() => {
                                                        setQuizChecked(prev => ({ ...prev, [quizKey]: true }));
                                                    }}
                                                    style={{
                                                        background: selectedAns !== undefined ? 'linear-gradient(135deg, #B541FA 0%, #192584 100%)' : '#e2e8f0',
                                                        color: selectedAns !== undefined ? '#ffffff' : '#94a3b8',
                                                        border: selectedAns !== undefined ? '1.5px solid #4FD2E9' : 'none',
                                                        padding: '8px 18px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.84rem',
                                                        fontWeight: 850,
                                                        cursor: selectedAns !== undefined ? 'pointer' : 'not-allowed',
                                                        boxShadow: selectedAns !== undefined ? '0 4px 14px rgba(181, 65, 250, 0.3)' : 'none'
                                                    }}
                                                >
                                                    Verificar Respuesta
                                                </button>
                                            ) : (
                                                <div style={{ fontSize: '0.84rem', color: selectedAns === quiz.correctIndex ? '#059669' : '#e11d48', fontWeight: 800 }}>
                                                    {selectedAns === quiz.correctIndex ? '✓ ¡Excelente! Respuesta correcta (+25 EXP)' : '✕ Incorrecto. Revisa la explicación:'}
                                                </div>
                                            )}
                                        </div>

                                        {isChecked && quiz.explanation && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: '#ffffff', border: '1.5px solid #e2e8f0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                                                💡 <strong style={{ color: '#0f172a' }}>Explicación Técnica: </strong>{quiz.explanation}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer del Modal con Navegación Anterior / Siguiente */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.75rem' }}>
                                <button
                                    disabled={activeUnitIndex === 0}
                                    onClick={() => setActiveUnitIndex(prev => Math.max(0, prev - 1))}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: '#ffffff',
                                        border: '1.5px solid #cbd5e1',
                                        color: '#334155',
                                        padding: '8px 14px',
                                        borderRadius: '10px',
                                        fontSize: '0.82rem',
                                        fontWeight: 800,
                                        cursor: activeUnitIndex === 0 ? 'not-allowed' : 'pointer',
                                        opacity: activeUnitIndex === 0 ? 0.4 : 1,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <ChevronLeft size={16} /> Unidad Anterior
                                </button>

                                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 750 }}>
                                    Módulo {activeUnitIndex + 1} de {unitsList.length}
                                </span>

                                <button
                                    disabled={activeUnitIndex === unitsList.length - 1}
                                    onClick={() => setActiveUnitIndex(prev => Math.min(unitsList.length - 1, prev + 1))}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'linear-gradient(135deg, #B541FA 0%, #192584 100%)',
                                        color: '#ffffff',
                                        border: '1.5px solid #4FD2E9',
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        fontSize: '0.82rem',
                                        fontWeight: 850,
                                        cursor: activeUnitIndex === unitsList.length - 1 ? 'not-allowed' : 'pointer',
                                        opacity: activeUnitIndex === unitsList.length - 1 ? 0.4 : 1,
                                        boxShadow: '0 4px 14px rgba(181, 65, 250, 0.3)'
                                    }}
                                >
                                    Siguiente Unidad <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}


            {/* PESTAÑA 2: CALENDARIO DE VISITAS A COLEGIOS & EVENTOS (EDITABLE) */}
            {activeTab === 'events' && (
                <SimiEventsTab 
                    isLeader={isLeader} 
                    profile={profile} 
                    members={simiMembers}
                    initialEvents={simiEvents} 
                    onEventsChange={(updated) => {
                        setSimiEvents(updated);
                        const mapFromEvents = {};
                        updated.forEach(evt => {
                            if (evt && evt.id) {
                                const st = evt.visibility_state || evt.visibilityState || (evt.is_locked || evt.isLocked ? 'locked' : (evt.is_hidden || evt.isHidden ? 'hidden' : 'unlocked'));
                                mapFromEvents[evt.id] = st;
                            }
                        });
                        setEventVisibilityMap(prev => ({ ...prev, ...mapFromEvents }));
                    }} 
                    isManageModeActive={isManageModeActive}
                    onToggleManageMode={() => setIsManageModeActive(!isManageModeActive)}
                />
            )}

            {/* PESTAÑA 3: BANCO DE PROYECTOS (EDITABLE) */}
            {activeTab === 'projects' && (
                <SimiProjectsTab 
                    isLeader={isLeader} 
                    profile={profile}
                    members={simiMembers}
                    initialProjects={simiProjects} 
                    onProjectsChange={(updated) => setSimiProjects(updated)} 
                />
            )}

            {/* PESTAÑA 4: NUESTROS RECURSOS & INVENTARIO (EDITABLE) */}
            {activeTab === 'resources' && (
                <SimiResourcesTab 
                    isLeader={isLeader} 
                    initialResources={simiResources} 
                    onResourcesChange={(updated) => setSimiResources(updated)} 
                    initialWebResources={simiWebResources}
                    onWebResourcesChange={(updated) => setSimiWebResources(updated)}
                    defaultSubTab={resourcesSubTab}
                />
            )}

            {/* PESTAÑA 4B: CATÁLOGO DE SERVICIOS & PORTAFOLIO STEAM */}
            {activeTab === 'services' && (
                <SimiServicesTab 
                    isLeader={isLeader}
                    profile={profile}
                    initialServices={simiServices}
                    onServicesChange={(updated) => setSimiServices(updated)}
                    isManageModeActive={isManageModeActive}
                    onToggleManageMode={() => setIsManageModeActive(!isManageModeActive)}
                />
            )}

            {/* PESTAÑA 5: DIRECTORIO DE MIEMBROS ACTIVOS & REGLA 80/80 */}
            {activeTab === 'members' && (
                <SimiMembersTab 
                    members={simiMembers} 
                    events={simiEvents} 
                    isLeader={isLeader} 
                    profile={profile}
                    memberBadgesMap={memberBadgesMap}
                    catalogImageUrlsMap={catalogImageUrlsMap}
                    onCatalogImageUpdate={(pinId, newUrl) => {
                        setCatalogImageUrlsMap(prev => {
                            const updated = { ...prev };
                            if (!newUrl) {
                                delete updated[pinId];
                            } else {
                                updated[pinId] = newUrl;
                            }
                            localStorage.setItem('simi_catalog_image_urls_map', JSON.stringify(updated));
                            return updated;
                        });
                    }}
                    onBadgeUpdate={(userId, pinId, tier, exp) => {
                        setMemberBadgesMap(prev => {
                            const updated = { ...prev };
                            if (!updated[userId]) updated[userId] = {};
                            if (tier === 'none' || !tier) {
                                delete updated[userId][pinId];
                            } else {
                                updated[userId][pinId] = { tier, exp, updatedAt: new Date().toISOString() };
                            }
                            localStorage.setItem('simi_member_badges_map', JSON.stringify(updated));
                            return updated;
                        });

                        // Si el usuario condecorado es el mismo usuario actual, actualizar selectedPinTiers
                        const currentUid = profile?.id || profile?.email;
                        if (userId === currentUid) {
                            setSelectedPinTiers(prev => {
                                const up = { ...prev };
                                if (tier === 'none' || !tier) {
                                    delete up[pinId];
                                } else {
                                    up[pinId] = tier;
                                }
                                localStorage.setItem('simi_pin_tiers', JSON.stringify(up));
                                return up;
                            });
                        }
                    }}
                />
            )}
                </main>
            </div>



            {/* MODAL DE SOLICITUDES DE ACCESO */}
            {isRequestsModalOpen && (
                <div className="simi-modal-backdrop" onClick={() => setIsRequestsModalOpen(false)}>
                    <div 
                        className="simi-modal-card" 
                        style={{ maxWidth: '850px', width: '95vw', maxHeight: '88vh', overflowY: 'auto', padding: '1.5rem' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="simi-modal-header" style={{ borderBottom: '1.5px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(181, 65, 250, 0.15)', border: '1.5px solid rgba(181, 65, 250, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B541FA' }}>
                                    <UserCheck size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                                        Gestión de Solicitudes de Acceso
                                    </h3>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        Aprobación y autorización de nuevos integrantes
                                    </span>
                                </div>
                            </div>
                            <button 
                                className="simi-modal-close-btn" 
                                onClick={() => setIsRequestsModalOpen(false)}
                                title="Cerrar modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <AccessRequests />
                    </div>
                </div>
            )}

            {/* MODAL DE INSIGNIA / PIN TÁCTICO */}
            {activePinModal && (() => {
                const ROMAN_MAP = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
                const currentTierStr = selectedPinTiers[activePinModal.id] || 'I';
                const currentTierNum = ROMAN_MAP[currentTierStr] || 1;
                const maxTierNum = 5;
                const currentExp = currentTierNum * 100;
                const maxExp = 500;
                const missingGrades = Math.max(0, maxTierNum - currentTierNum);
                const missingExp = Math.max(0, maxExp - currentExp);
                const progressPercent = Math.round((currentTierNum / maxTierNum) * 100);
                const isMaxLevel = currentTierNum === maxTierNum;
                const IconComp = ICON_MAP[activePinModal.icon] || Shield;
                const activeBadgeImageUrl = activePinModal.badgeImageUrl;

                return (
                    <div className="simi-modal-backdrop" onClick={() => setActivePinModal(null)}>
                        <div 
                            className="simi-modal-card" 
                            style={{ maxWidth: '600px', width: '95vw', maxHeight: '88vh', overflowY: 'auto' }} 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="simi-modal-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexDirection: 'column', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div 
                                            style={{ 
                                                width: '56px', 
                                                height: '56px', 
                                                borderRadius: '12px', 
                                                background: (activeBadgeImageUrl && !failedImageMap[activePinModal.id]) ? 'transparent' : `color-mix(in srgb, ${activePinModal.color} 15%, transparent)`, 
                                                border: (activeBadgeImageUrl && !failedImageMap[activePinModal.id]) ? 'none' : `1.5px solid ${activePinModal.color}`, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                color: activePinModal.color,
                                                overflow: 'hidden',
                                                padding: 0
                                            }}
                                        >
                                            {(activeBadgeImageUrl && !failedImageMap[activePinModal.id]) ? (
                                                <img 
                                                    src={activeBadgeImageUrl} 
                                                    alt={activePinModal.name} 
                                                    referrerPolicy="no-referrer"
                                                    onError={() => setFailedImageMap(prev => ({ ...prev, [activePinModal.id]: true }))}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.12))' }}
                                                />
                                            ) : (
                                                <IconComp size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                                Insignia: {activePinModal.name}
                                            </h3>
                                            <span style={{ fontSize: '0.74rem', color: activePinModal.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {activePinModal.category} • {tierToStars(currentTierStr)} {tierRankName(currentTierStr)}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button className="simi-modal-close-btn" onClick={() => setActivePinModal(null)} title="Cerrar modal">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                                    {activePinModal.description}
                                </p>

                                {/* ── TARJETA DE ESTADO Y PROGRESIÓN HACIA EL GRADO MÁXIMO ── */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(181, 65, 250, 0.06) 100%)',
                                    border: '1.5px solid rgba(6, 182, 212, 0.28)',
                                    borderRadius: '14px',
                                    padding: '0.9rem 1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.55rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                background: isMaxLevel ? '#f59e0b' : '#06b6d4',
                                                color: '#042f2e',
                                                fontWeight: 900,
                                                fontSize: '0.72rem',
                                                padding: '2px 9px',
                                                borderRadius: '99px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.4px'
                                            }}>
                                                {isMaxLevel ? '👑 Master · Grado Máximo' : `${tierRankName(currentTierStr)} · ${tierToStars(currentTierStr)}`}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: 800 }}>
                                                {currentExp} / {maxExp} EXP
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.76rem', fontWeight: 850, color: isMaxLevel ? '#10b981' : '#0891b2' }}>
                                            {progressPercent}% hacia el Máximo
                                        </span>
                                    </div>

                                    {/* Barra de Progreso */}
                                    <div style={{ width: '100%', height: '7px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${progressPercent}%`,
                                            height: '100%',
                                            background: isMaxLevel 
                                                ? 'linear-gradient(90deg, #f59e0b, #eab308)' 
                                                : `linear-gradient(90deg, ${activePinModal.color}, #B541FA)`,
                                            borderRadius: '99px',
                                            transition: 'width 0.35s ease'
                                        }} />
                                    </div>

                                    {/* Callout Informativo de Niveles Faltantes */}
                                    <div style={{
                                        fontSize: '0.78rem',
                                        color: isMaxLevel ? '#047857' : 'var(--text-heading)',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: isMaxLevel ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface-card)',
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        border: `1px solid ${isMaxLevel ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`
                                    }}>
                                        {isMaxLevel ? (
                                            <>🎉 ¡Excelente! Has alcanzado la <strong>Maestría Técnica Suprema (Grado V)</strong> en esta especialidad.</>
                                        ) : (
                                            <>⚡ <strong>Faltan {missingGrades} {missingGrades === 1 ? 'grado' : 'grados'} ({missingExp} EXP)</strong> para alcanzar el <strong>Grado Máximo V</strong>.</>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.15rem' }}>
                                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                        Escalafón de Ascensos & Requisitos Técnicos:
                                    </span>

                                    {activePinModal.tiers.map((tier) => {
                                        const tierNum = ROMAN_MAP[tier.level] || 1;
                                        const isDone = tierNum < currentTierNum;
                                        const isCurrent = tierNum === currentTierNum;
                                        const isLocked = tierNum > currentTierNum;
                                        const isPrestige = tier.level === 'V';

                                        return (
                                            <div 
                                                key={tier.level}
                                                onClick={() => handleSetMyBadgeTier(activePinModal.id, tier.level)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '10px',
                                                    padding: '0.75rem 0.9rem',
                                                    borderRadius: '12px',
                                                    background: isCurrent 
                                                        ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(181, 65, 250, 0.1) 100%)' 
                                                        : isDone 
                                                            ? 'rgba(16, 185, 129, 0.08)' 
                                                            : 'var(--surface-card)',
                                                    border: isCurrent 
                                                        ? '2px solid #06b6d4' 
                                                        : isDone
                                                            ? '1.5px solid rgba(16, 185, 129, 0.4)'
                                                            : '1px solid var(--border-default)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    transform: isCurrent ? 'scale(1.01)' : 'none',
                                                    boxShadow: isCurrent ? '0 4px 14px rgba(6, 182, 212, 0.25)' : 'none'
                                                }}
                                                title={`Toca para seleccionar Grado ${tier.level} (+${tier.expReq} EXP)`}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div 
                                                        style={{ 
                                                            width: '32px', 
                                                            height: '32px', 
                                                            borderRadius: '10px', 
                                                            background: isCurrent 
                                                                ? '#06b6d4' 
                                                                : isDone 
                                                                    ? '#10b981' 
                                                                    : isPrestige 
                                                                        ? '#f59e0b' 
                                                                        : 'var(--border-default)', 
                                                            color: (isCurrent || isDone || isPrestige) ? '#ffffff' : 'var(--text-secondary)', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            fontWeight: 900, 
                                                            fontSize: '0.84rem',
                                                            flexShrink: 0,
                                                            boxShadow: isCurrent ? '0 2px 8px rgba(6, 182, 212, 0.4)' : 'none'
                                                        }}
                                                    >
                                                        {isCurrent ? tier.level : isDone ? '✓' : tier.level}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '0.88rem', fontWeight: 850, color: isCurrent ? '#0891b2' : isDone ? '#047857' : 'var(--text-heading)' }}>
                                                                {tier.title}
                                                            </span>
                                                            {isCurrent && (
                                                                <span style={{ background: '#06b6d4', color: '#042f2e', fontWeight: 900, fontSize: '0.62rem', padding: '1px 7px', borderRadius: '99px' }}>
                                                                    ACTIVO
                                                                </span>
                                                            )}
                                                            {isDone && (
                                                                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#047857', fontWeight: 800, fontSize: '0.62rem', padding: '1px 6px', borderRadius: '99px' }}>
                                                                    DESBLOQUEADO
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                            {tier.reqDesc}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: isCurrent ? '#0891b2' : isDone ? '#10b981' : '#f59e0b', whiteSpace: 'nowrap' }}>
                                                    +{tier.expReq} EXP
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setActivePinModal(null)}
                                    style={{
                                        marginTop: '0.4rem',
                                        background: '#06b6d4',
                                        color: '#042f2e',
                                        border: 'none',
                                        padding: '9px 18px',
                                        borderRadius: '10px',
                                        fontWeight: 850,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        alignSelf: 'flex-end',
                                        boxShadow: '0 4px 12px -2px rgba(6, 182, 212, 0.4)'
                                    }}
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* MODAL DE VITRINA DE INSIGNIAS, NIVELES Y LOGROS TÁCTICOS */}
            {isBadgesModalOpen && (
                <div className="simi-modal-backdrop" onClick={() => setIsBadgesModalOpen(false)}>
                    <div 
                        className="simi-modal-card" 
                        style={{ maxWidth: '880px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Cabecera del Modal */}
                        <div className="simi-modal-header" style={{ borderBottom: '1.5px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '1.5px solid #06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                                    <Trophy size={22} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                                        🏆 Mis Insignias, Nivel & Rango Táctico SIMI3D
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Acreditación de Software 3D, Laminación y Taller STEAM
                                    </span>
                                </div>
                            </div>
                            <button className="simi-modal-close-btn" onClick={() => setIsBadgesModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Resumen del Rango y Nivel del Usuario */}
                        <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(181, 65, 250, 0.1) 100%)', border: '1.5px solid rgba(79, 210, 233, 0.35)', borderRadius: '16px', padding: '1.15rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', border: '2px solid #06b6d4', overflow: 'hidden', background: '#ffffff' }}>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Users size={32} color="#06b6d4" style={{ margin: '10px' }} />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                                            {profile?.full_name || 'Maker SIMI3D'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                            <span style={{ background: '#06b6d4', color: '#042f2e', fontWeight: 900, fontSize: '0.68rem', padding: '2px 8px', borderRadius: '99px' }}>
                                                NIVEL {myMakerInfo.level} MAKER
                                            </span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 700 }}>
                                                • {myMakerInfo.title}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 950, color: '#f59e0b' }}>{totalSimiExp.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}> / {maxSimiExp.toLocaleString()} EXP</span>
                                    <div style={{ width: '140px', height: '6px', background: '#e2e8f0', borderRadius: '99px', marginTop: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${simiExpPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #B541FA)', borderRadius: '99px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vitrina de Insignias Tácticas */}
                        <div style={{ marginTop: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    🎖️ Insignias Acreditadas ({SIMI_PINS_CATALOG.length} Especialidades)
                                </span>
                                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                    Toca una insignia para ver los requisitos de grado
                                </span>
                            </div>

                            <div className="simi-home-pins-grid">
                                {SIMI_PINS_CATALOG.map((pin) => {
                                    const IconComp = ICON_MAP[pin.icon] || Shield;
                                    const currentTier = selectedPinTiers[pin.id] || 'I';
                                    const isPrestige = currentTier === 'V';
                                    const pinImageUrl = pin.badgeImageUrl;
                                    const hasPinImg = Boolean(pinImageUrl && !failedImageMap[pin.id]);

                                    return (
                                        <div 
                                            key={pin.id}
                                            className="simi-home-pin-card"
                                            onClick={() => handleOpenPinModal(pin.id)}
                                            style={{ '--pin-accent': pin.color }}
                                        >
                                            <div className="simi-home-pin-header">
                                                <span className="simi-home-pin-cat">{pin.category}</span>
                                                <span 
                                                    className={`simi-home-pin-tier-pill ${isPrestige ? 'prestige' : ''}`}
                                                    style={{
                                                        background: `color-mix(in srgb, ${pin.color} 15%, var(--surface-card))`,
                                                        color: pin.color,
                                                        borderColor: `color-mix(in srgb, ${pin.color} 40%, transparent)`
                                                    }}
                                                >
                                                    {tierToStars(currentTier)}
                                                </span>
                                            </div>

                                            <div 
                                                className="simi-home-pin-icon-wrap" 
                                                style={{ 
                                                    color: pin.color, 
                                                    borderColor: hasPinImg ? 'transparent' : pin.color, 
                                                    border: hasPinImg ? 'none' : undefined,
                                                    background: hasPinImg ? 'transparent' : undefined, 
                                                    boxShadow: hasPinImg ? 'none' : undefined,
                                                    padding: 0 
                                                }}
                                            >
                                                {hasPinImg ? (
                                                    <img 
                                                        src={pinImageUrl} 
                                                        alt={pin.name} 
                                                        referrerPolicy="no-referrer"
                                                        onError={() => setFailedImageMap(prev => ({ ...prev, [pin.id]: true }))}
                                                        style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.14))' }} 
                                                    />
                                                ) : (
                                                    <IconComp size={28} />
                                                )}
                                            </div>

                                            <h4 className="simi-home-pin-name">{pin.name}</h4>
                                            <p className="simi-home-pin-desc">{pin.description}</p>

                                            <div className="simi-home-pin-footer">
                                                <span className="simi-home-pin-exp">+{currentTier === 'I' ? 100 : currentTier === 'II' ? 200 : currentTier === 'III' ? 300 : currentTier === 'IV' ? 400 : 500} EXP</span>
                                                <span className="simi-home-pin-action">Detalles <ChevronRight size={13} /></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Botón de Cierre */}
                        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsBadgesModalOpen(false)}
                                style={{
                                    background: '#192584',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '9px 20px',
                                    borderRadius: '10px',
                                    fontWeight: 850,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(25, 37, 132, 0.3)'
                                }}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DEDICADO DE AVISOS Y MISIONES SIMI3D */}
            <SimiNotificationsModal 
                isOpen={isNotificationsModalOpen} 
                onClose={() => {
                    setIsNotificationsModalOpen(false);
                    fetchSimiUnreadCount();
                }}
                onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    setIsNotificationsModalOpen(false);
                }}
            />

            {/* MODAL FLASH DE ASISTENCIA 2FA PARA ESTUDIANTES */}
            {activeAttendanceSession && !answeredSessionIds.includes(activeAttendanceSession.id || activeAttendanceSession.eventId) && (
                <SimiStudentFlashAttendanceModal
                    session={activeAttendanceSession}
                    onClose={() => {
                        const sId = activeAttendanceSession.id || activeAttendanceSession.eventId;
                        const updated = [...answeredSessionIds, sId];
                        setAnsweredSessionIds(updated);
                        sessionStorage.setItem('simi_answered_sessions', JSON.stringify(updated));
                        setActiveAttendanceSession(null);
                    }}
                    onSuccess={() => {
                        const sId = activeAttendanceSession.id || activeAttendanceSession.eventId;
                        const updated = [...answeredSessionIds, sId];
                        setAnsweredSessionIds(updated);
                        sessionStorage.setItem('simi_answered_sessions', JSON.stringify(updated));
                        setActiveAttendanceSession(null);
                    }}
                />
            )}

            {/* MODAL DE GESTIÓN DE ASISTENCIA DUAL (LÍDER/DOCENTE) */}
            {attendanceModalEvent && (
                <SimiAttendanceManagerModal
                    isOpen={Boolean(attendanceModalEvent)}
                    onClose={() => setAttendanceModalEvent(null)}
                    event={attendanceModalEvent}
                    members={simiMembers}
                    onAttendanceUpdated={(newAttendees, sessionMeta) => {
                        const updatedSessions = sessionMeta?.sessions || attendanceModalEvent?.sessions || [];
                        const updated = simiEvents.map(ev => {
                            if (ev.id === attendanceModalEvent.id) {
                                return { 
                                    ...ev, 
                                    attendees: newAttendees,
                                    sessions: updatedSessions,
                                    date: sessionMeta?.sessionDate || ev.date,
                                    objective: sessionMeta?.sessionTopic || ev.objective,
                                    session_topic: sessionMeta?.sessionTopic || ev.session_topic
                                };
                            }
                            return ev;
                        });
                        setSimiEvents(updated);
                        localStorage.setItem('simi_events_list', JSON.stringify(updated));
                        setAttendanceModalEvent(prev => prev ? ({
                            ...prev,
                            attendees: newAttendees,
                            sessions: updatedSessions,
                            date: sessionMeta?.sessionDate || prev.date,
                            objective: sessionMeta?.sessionTopic || prev.objective,
                            session_topic: sessionMeta?.sessionTopic || prev.session_topic
                        }) : null);
                    }}
                />
            )}

        </div>
    );
}