import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Users, Link2, Plus, Clock, Copy, Check, Share2, CalendarPlus, 
    Trash2, Edit2, AlertCircle, Sparkles, Filter, CheckCircle2, XCircle, Search, Layers, UserCheck, GraduationCap,
    Download, LayoutGrid, Table, ArrowUpDown, ArrowRight, QrCode, Mail, RefreshCw, Calendar, MoreVertical, ChevronRight, List
} from 'lucide-react';
import { api } from '../../lib/api';
import { COURSES_DEFINITION, getCourseColor } from '../../data/coursesData.jsx';

const normalizeText = (text) => {
    return (text || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

export default function CourseInviteManager({ courseId = null }) {
    // ── ESTADOS PRINCIPALES ──
    const [activeTab, setActiveTab] = useState('groups'); // 'groups' | 'students' | 'links'
    const [groups, setGroups] = useState([]);
    const [codes, setCodes] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState(courseId ? String(courseId) : 'all');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);
    const [copiedEmailsStatus, setCopiedEmailsStatus] = useState(false);

    // ── VISTA DUAL DE ESTUDIANTES (GRID VS TABLA) ──
    const [studentViewMode, setStudentViewMode] = useState('table'); // 'table' | 'grid'
    const [studentSortField, setStudentSortField] = useState('full_name'); // 'full_name' | 'course_id' | 'group_name'
    const [studentSortAsc, setStudentSortAsc] = useState(true);

    // ── MODAL PROYECCIÓN AULA (QR CODE) ──
    const [projectorCode, setProjectorCode] = useState(null); // null | { code, group_name, course_name, expires_at }

    // ── REASIGNACIÓN / TRANSFERENCIA DE ESTUDIANTE ──
    const [transferringStudentId, setTransferringStudentId] = useState(null);

    // ── MODALES DE GRUPOS ──
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupForm, setGroupForm] = useState({ id: null, name: '', teacher: 'Prof. Ronny Martinez', course_id: 1, is_active: 1 });
    const [savingGroup, setSavingGroup] = useState(false);

    // ── MODAL DE ESTUDIANTES ──
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [selectedGroupStudents, setSelectedGroupStudents] = useState(null);
    const [studentsList, setStudentsList] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [deletingStudentId, setDeletingStudentId] = useState(null);

    // ── MODALES DE ENLACES TEMPORALES ──
    const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
    const [linkForm, setLinkForm] = useState({ course_id: 1, group_id: '', durationHours: 24 });
    const [creatingLink, setCreatingLink] = useState(false);

    // ── MODAL EXTENDER TIEMPO ──
    const [extendTarget, setExtendTarget] = useState(null);
    const [addHours, setAddHours] = useState(24);
    const [updatingTime, setUpdatingTime] = useState(false);

    // ── CARGA DE DATOS ──
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [groupsRes, codesRes, platRes, studentsRes] = await Promise.all([
                api('/groups'),
                api('/codes'),
                api('/admin/plataforma').catch(() => ({ data: null })),
                api('/groups?all_students=1').catch(() => ({ data: null }))
            ]);

            let fetchedGroups = [];
            if (groupsRes?.data && Array.isArray(groupsRes.data)) {
                fetchedGroups = groupsRes.data;
                setGroups(groupsRes.data);
            }
            if (codesRes?.data && Array.isArray(codesRes.data)) {
                setCodes(codesRes.data);
            }

            // Construir lista canónica de estudiantes (sin duplicados artificiales pero preservando asignaciones reales)
            let fetchedStudents = [];

            // A. Verificar si /groups?all_students=1 devolvió registros con nombres de estudiantes (no grupos)
            const rawApiStudents = studentsRes?.data && Array.isArray(studentsRes.data) ? studentsRes.data : [];
            const isValidStudentArray = rawApiStudents.length > 0 && rawApiStudents.some(s => s.full_name || s.email || s.group_name) && rawApiStudents.length > fetchedGroups.length;

            if (isValidStudentArray) {
                fetchedStudents = rawApiStudents;
            } else if (platRes?.data) {
                // B. Fuente canónica disponible en producción (/admin/plataforma)
                const platData = platRes.data;
                const rawPerfiles = Array.isArray(platData.perfiles) ? platData.perfiles : [];
                const rawGu = Array.isArray(platData.grupos_usuario) ? platData.grupos_usuario : [];
                const grpList = fetchedGroups.length > 0 ? fetchedGroups : (Array.isArray(platData.grupos) ? platData.grupos : []);

                const groupMap = {};
                grpList.forEach(g => {
                    groupMap[g.id] = g;
                    groupMap[String(g.id)] = g;
                });

                const profileMap = new Map();
                rawPerfiles.forEach(p => {
                    if (p.id) profileMap.set(String(p.id).trim().toLowerCase(), p);
                    if (p.email) profileMap.set(p.email.trim().toLowerCase(), p);
                });

                const studentRecords = [];
                const processedAssignmentKeys = new Set();

                // 1. Mapear vinculaciones directas en grupos_usuario (las de las 3 tarjetas de grupos)
                rawGu.forEach(gu => {
                    const prof = profileMap.get(String(gu.user_id).trim().toLowerCase()) || null;
                    if (prof && ['admin', 'docente', 'profesor'].includes((prof.role || '').toLowerCase())) {
                        return; // Omitir docentes/administradores
                    }

                    const grp = groupMap[gu.group_id] || groupMap[String(gu.group_id)];
                    const cId = grp?.course_id || 1;
                    const key = `${gu.user_id}_${gu.group_id}`;

                    if (!processedAssignmentKeys.has(key)) {
                        processedAssignmentKeys.add(key);
                        studentRecords.push({
                            id: prof?.id || gu.user_id,
                            user_id: gu.user_id,
                            email: prof?.email || '',
                            full_name: prof?.full_name || (prof?.email ? prof.email.split('@')[0] : 'Estudiante'),
                            avatar_url: prof?.avatar_url || null,
                            role: prof?.role || 'student',
                            group_id: grp?.id || gu.group_id,
                            group_name: grp?.name || `Grupo #${gu.group_id}`,
                            course_id: cId,
                            teacher: grp?.teacher || 'Prof. Ronny Martinez',
                            group_is_active: grp?.is_active !== undefined ? grp.is_active : 1
                        });
                    }
                });

                // Pre-construir Set de user_ids/emails que YA tienen al menos un grupo —
                // normalizado para que UUID ↔ email no genere falsos negativos
                const usersWithGroupSet = new Set();
                rawGu.forEach(gu => {
                    const guId = String(gu.user_id || '').trim().toLowerCase();
                    usersWithGroupSet.add(guId);
                    // Buscar el perfil correspondiente y agregar también su email e id al set
                    const matchedProfile = rawPerfiles.find(p => {
                        const pid = String(p.id || '').trim().toLowerCase();
                        const pemail = String(p.email || '').trim().toLowerCase();
                        return pid === guId || pemail === guId;
                    });
                    if (matchedProfile) {
                        if (matchedProfile.id) usersWithGroupSet.add(String(matchedProfile.id).trim().toLowerCase());
                        if (matchedProfile.email) usersWithGroupSet.add(matchedProfile.email.trim().toLowerCase());
                    }
                });

                // 2. Incluir estudiantes de perfiles que aún no estén en ningún grupo
                rawPerfiles.forEach(p => {
                    if (['admin', 'docente', 'profesor'].includes((p.role || '').toLowerCase())) return;
                    const pId = String(p.id || '').trim().toLowerCase();
                    const pEmail = String(p.email || '').trim().toLowerCase();
                    const hasGroup = usersWithGroupSet.has(pId) || (pEmail && usersWithGroupSet.has(pEmail));

                    if (!hasGroup) {
                        studentRecords.push({
                            id: p.id,
                            user_id: p.id,
                            email: p.email || '',
                            full_name: p.full_name || (p.email ? p.email.split('@')[0] : 'Estudiante'),
                            avatar_url: p.avatar_url || null,
                            role: p.role || 'student',
                            group_id: null,
                            group_name: 'Sin grupo asignado',
                            course_id: null,
                            teacher: null,
                            group_is_active: 1
                        });
                    }
                });

                studentRecords.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
                fetchedStudents = studentRecords;
            }

            setAllStudents(fetchedStudents);
        } catch (err) {
            console.error('Error cargando grupos, códigos y estudiantes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── CRUD GRUPOS ──
    const openCreateGroupModal = (presetCourseId = null) => {
        setGroupForm({
            id: null,
            name: '',
            teacher: 'Prof. Ronny Martinez',
            course_id: presetCourseId ? Number(presetCourseId) : (selectedCourseFilter !== 'all' ? Number(selectedCourseFilter) : 1),
            is_active: 1
        });
        setShowGroupModal(true);
    };

    const openEditGroupModal = (group) => {
        setGroupForm({
            id: group.id,
            name: group.name,
            teacher: group.teacher || 'Prof. Ronny Martinez',
            course_id: group.course_id,
            is_active: group.is_active !== undefined ? (group.is_active ? 1 : 0) : 1
        });
        setShowGroupModal(true);
    };

    const handleSaveGroup = async (e) => {
        e.preventDefault();
        if (!groupForm.name.trim()) return;

        setSavingGroup(true);
        try {
            const { data, error } = await api('/groups', {
                method: 'POST',
                body: {
                    id: groupForm.id || undefined,
                    name: groupForm.name.trim(),
                    teacher: groupForm.teacher.trim(),
                    course_id: Number(groupForm.course_id),
                    is_active: Number(groupForm.is_active)
                }
            });

            if (error) throw new Error(error.message || 'Error al guardar grupo');

            await loadData();
            setShowGroupModal(false);
        } catch (err) {
            alert(err.message || 'Error al guardar el grupo');
        } finally {
            setSavingGroup(false);
        }
    };

    const handleToggleGroupActive = async (group) => {
        const newActiveState = group.is_active ? 0 : 1;
        // Optimistic update
        setGroups(prev => prev.map(g => g.id === group.id ? { ...g, is_active: newActiveState } : g));

        try {
            await api('/groups', {
                method: 'POST',
                body: {
                    id: group.id,
                    name: group.name,
                    teacher: group.teacher,
                    is_active: newActiveState
                }
            });
        } catch (err) {
            console.error('Error al alternar estado del grupo:', err);
            await loadData();
        }
    };

    const handleDeleteGroup = async (group) => {
        const confirmMsg = `¿Estás seguro de eliminar el grupo "${group.name}" (#DB-${group.id})?\nSe eliminarán las vinculaciones asociadas en la base de datos.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const { error } = await api(`/groups?id=${group.id}`, { method: 'DELETE' });
            if (error) throw new Error(error.message || 'Error al eliminar grupo');
            setGroups(prev => prev.filter(g => g.id !== group.id));
        } catch (err) {
            alert(err.message || 'No se pudo eliminar el grupo');
        }
    };

    // ── VER ESTUDIANTES DEL GRUPO ──
    const openStudentsView = async (group) => {
        setSelectedGroupStudents(group);
        setShowStudentsModal(true);
        setLoadingStudents(true);
        try {
            const { data } = await api(`/groups?group_id=${group.id}`);
            let list = Array.isArray(data) ? data : [];
            if (list.length === 0) {
                list = allStudents.filter(s => String(s.group_id) === String(group.id));
            }
            setStudentsList(list);
        } catch (err) {
            console.error('Error al cargar alumnos:', err);
            const fallbackList = allStudents.filter(s => String(s.group_id) === String(group.id));
            setStudentsList(fallbackList);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleRemoveStudent = async (student, customGroup = null) => {
        const group = customGroup || selectedGroupStudents;
        if (!group) return;
        const studentName = student.full_name || student.email || 'este estudiante';
        const groupName = group.name || group.group_name || 'este grupo';
        const groupId = group.id || group.group_id;
        const courseId = group.course_id;

        if (!window.confirm(`¿Deseas desvincular a "${studentName}" del grupo "${groupName}"?`)) return;

        setDeletingStudentId(student.id);
        try {
            const { error } = await api('/groups', {
                method: 'PATCH',
                body: {
                    group_id: groupId,
                    user_id: student.id,
                    course_id: courseId
                }
            });

            if (error) throw new Error(error.message || 'Error al desvincular estudiante');

            setStudentsList(prev => prev.filter(s => s.id !== student.id));
            setAllStudents(prev => prev.filter(s => !(s.id === student.id && s.group_id === groupId)));
        } catch (err) {
            alert(err.message || 'Error al desvincular estudiante');
        } finally {
            setDeletingStudentId(null);
        }
    };

    const handleTransferStudent = async (student, newGroupId) => {
        if (!newGroupId || String(newGroupId) === String(student.group_id)) return;
        const targetGroup = groups.find(g => String(g.id) === String(newGroupId));
        if (!targetGroup) return;

        const studentName = student.full_name || student.email || 'el estudiante';
        if (!window.confirm(`¿Mover a "${studentName}" al grupo "${targetGroup.name}"?`)) return;

        setTransferringStudentId(student.id);
        try {
            const { error } = await api('/groups', {
                method: 'PATCH',
                body: {
                    action: 'transfer_student',
                    user_id: student.id,
                    old_group_id: student.group_id,
                    new_group_id: targetGroup.id,
                    course_id: targetGroup.course_id
                }
            });

            if (error) throw new Error(error.message || 'Error al transferir estudiante');

            // Actualización optimista local
            setAllStudents(prev => prev.map(s => {
                if (s.id === student.id && String(s.group_id) === String(student.group_id)) {
                    return {
                        ...s,
                        group_id: targetGroup.id,
                        group_name: targetGroup.name,
                        course_id: targetGroup.course_id,
                        teacher: targetGroup.teacher
                    };
                }
                return s;
            }));

            // Actualizar lista si modal de grupo está abierto
            setStudentsList(prev => prev.filter(s => s.id !== student.id));

            // Actualizar contadores de grupos
            setGroups(prev => prev.map(g => {
                if (String(g.id) === String(student.group_id)) {
                    return { ...g, studentCount: Math.max(0, (g.studentCount || 1) - 1) };
                }
                if (String(g.id) === String(targetGroup.id)) {
                    return { ...g, studentCount: (g.studentCount || 0) + 1 };
                }
                return g;
            }));
        } catch (err) {
            alert(err.message || 'No se pudo mover el estudiante');
        } finally {
            setTransferringStudentId(null);
        }
    };

    // ── EXPORTACIÓN A CSV / EXCEL ──
    const handleExportStudentsCSV = (studentsToExport) => {
        if (!studentsToExport || studentsToExport.length === 0) {
            alert('No hay estudiantes para exportar con los filtros actuales.');
            return;
        }

        const headers = ['Nombre Completo', 'Correo Electrónico', 'Curso', 'Grupo Asignado', 'Docente'];
        const rows = studentsToExport.map(s => {
            const course = COURSES_DEFINITION.find(c => c.id === s.course_id);
            const courseName = course ? `${course.name} (${course.abbr})` : 'Curso General';
            const safeName = `"${(s.full_name || '').replace(/"/g, '""')}"`;
            const safeEmail = `"${(s.email || '').replace(/"/g, '""')}"`;
            const safeCourse = `"${courseName.replace(/"/g, '""')}"`;
            const safeGroup = `"${(s.group_name || '').replace(/"/g, '""')}"`;
            const safeTeacher = `"${(s.teacher || '').replace(/"/g, '""')}"`;
            return [safeName, safeEmail, safeCourse, safeGroup, safeTeacher].join(',');
        });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute('download', `SaberLab_Estudiantes_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ── COPIAR TODOS LOS CORREOS AL PORTAPAPELES ──
    const handleCopyEmails = (studentsToCopy) => {
        const emails = [...new Set(studentsToCopy.map(s => s.email).filter(Boolean))];
        if (emails.length === 0) {
            alert('No hay correos disponibles para copiar.');
            return;
        }
        const text = emails.join(', ');
        navigator.clipboard.writeText(text);
        setCopiedEmailsStatus(true);
        setTimeout(() => setCopiedEmailsStatus(false), 2500);
    };

    // ── ENLACES TEMPORALES (CREAR / EXTENDER / COPIAR) ──
    const openCreateLinkForGroup = (group) => {
        setLinkForm({
            course_id: group.course_id,
            group_id: group.id,
            durationHours: 24
        });
        setShowCreateLinkModal(true);
    };

    const handleCreateLinkSubmit = async (e) => {
        e.preventDefault();
        setCreatingLink(true);

        try {
            const courseObj = COURSES_DEFINITION.find(c => c.id === Number(linkForm.course_id)) || COURSES_DEFINITION[0];
            const prefix = courseObj.abbr || 'SL';
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const generatedCode = `${prefix}-${randomNum}`;

            let expiresAt = null;
            if (linkForm.durationHours > 0) {
                const date = new Date();
                date.setHours(date.getHours() + Number(linkForm.durationHours));
                expiresAt = date.toISOString();
            }

            const { data, error } = await api('/codes', {
                method: 'POST',
                body: {
                    group_id: Number(linkForm.group_id),
                    course_id: Number(linkForm.course_id),
                    code: generatedCode,
                    expires_at: expiresAt
                }
            });

            if (error) throw new Error(error.message || 'Error al generar enlace');

            await loadData();
            setShowCreateLinkModal(false);
            setActiveTab('links'); // Cambiar a pestaña de enlaces para ver el nuevo código
        } catch (err) {
            alert(err.message || 'Error al generar enlace temporal');
        } finally {
            setCreatingLink(false);
        }
    };

    const handleExtendTime = async () => {
        if (!extendTarget) return;
        setUpdatingTime(true);

        try {
            let baseDate = new Date();
            if (extendTarget.expires_at) {
                const currentExpires = new Date(extendTarget.expires_at);
                if (currentExpires > baseDate) {
                    baseDate = currentExpires;
                }
            }

            let newExpiresAt = null;
            if (addHours > 0) {
                baseDate.setHours(baseDate.getHours() + Number(addHours));
                newExpiresAt = baseDate.toISOString();
            }

            const { error } = await api('/codes', {
                method: 'PUT',
                body: {
                    id: extendTarget.id,
                    expires_at: newExpiresAt
                }
            });

            if (error) throw new Error(error.message || 'Error al extender tiempo');

            setExtendTarget(null);
            await loadData();
        } catch (err) {
            alert(err.message || 'Error al extender vigencia');
        } finally {
            setUpdatingTime(false);
        }
    };

    const handleDeleteCode = async (id) => {
        if (!confirm('¿Deseas revocar este enlace de invitación?')) return;
        try {
            await api(`/codes?id=${id}`, { method: 'DELETE' });
            setCodes(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error al borrar código:', err);
        }
    };

    const getFullJoinUrl = (code) => `https://saberlab.pages.dev/join?code=${code}`;

    const handleCopy = (code) => {
        const url = getFullJoinUrl(code);
        navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const handleShareWhatsApp = (code, courseName, groupName) => {
        const url = getFullJoinUrl(code);
        const text = `¡Hola! Únete al grupo *${groupName || 'del curso'}* en *${courseName}* (SaberLab) con este enlace directo:\n${url}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getCodeStatus = (expiresAt) => {
        if (!expiresAt) return { label: 'Permanente', color: '#10b981', active: true };
        const now = new Date();
        const exp = new Date(expiresAt);
        if (exp < now) return { label: 'Expirado', color: '#ef4444', active: false };

        const diffMinutes = Math.round((exp - now) / 60000);
        if (diffMinutes < 60) return { label: `Vence en ${diffMinutes} min`, color: '#f59e0b', active: true };
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return { label: `Vence en ${diffHours} h`, color: '#38bdf8', active: true };
        const diffDays = Math.round(diffHours / 24);
        return { label: `Vence en ${diffDays} d`, color: '#34d399', active: true };
    };

    // ── FILTRADO DE GRUPOS (INCLUYE BÚSQUEDA POR ESTUDIANTE) ──
    const filteredGroups = groups.filter(g => {
        const q = normalizeText(searchQuery);

        // Búsqueda inteligente por estudiantes dentro del grupo
        const studentMatch = q ? allStudents.some(s => 
            (s.group_id === g.id || String(s.group_id) === String(g.id)) && (
                normalizeText(s.full_name).includes(q) ||
                normalizeText(s.email).includes(q)
            )
        ) : false;

        const nameMatch = q ? normalizeText(g.name).includes(q) : false;
        const teacherMatch = q ? normalizeText(g.teacher).includes(q) : false;
        const idMatch = q ? (normalizeText(g.id).includes(q) || normalizeText(`#DB-${g.id}`).includes(q)) : false;

        // Si el usuario escribe una búsqueda y coincide con un estudiante, lo mostramos aunque haya un filtro de curso seleccionado
        if (selectedCourseFilter !== 'all' && String(g.course_id) !== String(selectedCourseFilter)) {
            if (!studentMatch) return false;
        }

        if (statusFilter === 'active' && g.is_active === 0) return false;
        if (statusFilter === 'inactive' && g.is_active !== 0) return false;

        if (q) {
            if (!nameMatch && !teacherMatch && !idMatch && !studentMatch) return false;
        }
        return true;
    });

    const activeGroupsCount = groups.filter(g => g.is_active !== 0).length;
    const inactiveGroupsCount = groups.filter(g => g.is_active === 0).length;

    // ── FILTRADO Y ORDENAMIENTO DE ESTUDIANTES ──
    const filteredStudents = useMemo(() => {
        const q = normalizeText(searchQuery);
        let list = allStudents.filter(s => {
            const nameMatch = q ? normalizeText(s.full_name).includes(q) : false;
            const emailMatch = q ? normalizeText(s.email).includes(q) : false;
            const groupMatch = q ? normalizeText(s.group_name).includes(q) : false;
            const teacherMatch = q ? normalizeText(s.teacher).includes(q) : false;
            const idMatch = q ? (normalizeText(s.id).includes(q) || normalizeText(s.group_id).includes(q)) : false;

            // Si hay una búsqueda de estudiante activa, permitir encontrarlo sin restringir curso salvo que no haya búsqueda
            if (selectedCourseFilter !== 'all' && String(s.course_id) !== String(selectedCourseFilter)) {
                if (!nameMatch && !emailMatch) return false;
            }

            if (q) {
                if (!nameMatch && !emailMatch && !groupMatch && !teacherMatch && !idMatch) return false;
            }
            return true;
        });

        // Ordenamiento dinámico
        list.sort((a, b) => {
            let valA = a[studentSortField] || '';
            let valB = b[studentSortField] || '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return studentSortAsc ? -1 : 1;
            if (valA > valB) return studentSortAsc ? 1 : -1;
            return 0;
        });

        return list;
    }, [allStudents, searchQuery, selectedCourseFilter, studentSortField, studentSortAsc]);

    const uniqueStudentsCount = useMemo(() => new Set(allStudents.map(s => s.id || s.email)).size, [allStudents]);

    const activeCodesCount = useMemo(() => {
        return codes.filter(c => getCodeStatus(c.expires_at).active).length;
    }, [codes]);

    const activeStudentsTotal = useMemo(() => {
        return allStudents.length > 0 ? allStudents.length : 48; // fallback to active student count
    }, [allStudents]);

    // Formateador de tiempo estilo 13:20 min o Vence en X
    const getCompactTimeLeft = (expiresAt) => {
        if (!expiresAt) return 'Permanente';
        const now = new Date();
        const exp = new Date(expiresAt);
        if (exp <= now) return 'Expirado';
        const diffMs = exp - now;
        const totalMins = Math.floor(diffMs / 60000);
        if (totalMins < 60) {
            const secs = Math.floor((diffMs % 60000) / 1000);
            return `${String(totalMins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
        }
        const hours = Math.floor(totalMins / 60);
        if (hours < 24) {
            const remMins = totalMins % 60;
            return `${hours}h ${remMins}m`;
        }
        const days = Math.floor(hours / 24);
        return `${days} d`;
    };

    return (
        <div className="invite-groups-manager-root" style={{ width: '100%', color: 'var(--text-heading)' }}>
            {/* ── 1. ACCIONES PRINCIPALES Y BOTONES RÁPIDOS ── */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.65rem',
                marginBottom: '1.25rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => openCreateGroupModal()}
                        style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.6rem 1.15rem',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Plus size={16} />
                        <span>+ Nuevo Grupo</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setLinkForm({ course_id: selectedCourseFilter !== 'all' ? Number(selectedCourseFilter) : 1, group_id: '', durationHours: 24 });
                            setShowCreateLinkModal(true);
                        }}
                        style={{
                            background: 'var(--surface-card)',
                            color: 'var(--text-heading)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '10px',
                            padding: '0.6rem 1.15rem',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Link2 size={16} color="var(--brand-primary)" />
                        <span>Generar Enlace Rápido</span>
                    </button>
                </div>
            </div>

            {/* ── 2. FILA DE 4 KPIS / MÉTRICAS (MOCKUP EXACTO) ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem'
            }}>
                {/* KPI 1: Grupos Registrados */}
                <div style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                            Grupos Registrados
                        </span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>
                            {groups.length}
                        </span>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0284c7'
                    }}>
                        <Users size={20} />
                    </div>
                </div>

                {/* KPI 2: Estudiantes Activos */}
                <div style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                            Estudiantes Activos
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>
                                {uniqueStudentsCount || allStudents.length}
                            </span>
                            {allStudents.length > (uniqueStudentsCount || 0) && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    ({allStudents.length} inscripciones)
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(168, 85, 247, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9333ea'
                    }}>
                        <GraduationCap size={20} />
                    </div>
                </div>

                {/* KPI 3: Enlaces con Tiempo */}
                <div style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                            Enlaces con Tiempo
                        </span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                                {activeCodesCount}
                            </span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>
                                activos
                            </span>
                        </div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981'
                    }}>
                        <Clock size={20} />
                    </div>
                </div>

                {/* KPI 4: Periodo Académico */}
                <div style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                            Periodo Académico
                        </span>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>
                            2026 - II
                        </span>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f59e0b'
                    }}>
                        <Calendar size={20} />
                    </div>
                </div>
            </div>

            {/* ── 3. BARRA DE NAVEGACIÓN (TABS PÍLDORAS) + SELECTOR DE VISTA (GRID / LISTA) ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
                marginBottom: '1rem',
                background: 'var(--surface-card)',
                padding: '0.5rem 0.75rem',
                borderRadius: '14px',
                border: '1px solid var(--border-subtle)'
            }}>
                {/* Tabs Principales: Grupos vs Estudiantes vs Enlaces con Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('groups')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: activeTab === 'groups' ? 'rgba(56, 189, 248, 0.4)' : 'transparent',
                            background: activeTab === 'groups' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                            color: activeTab === 'groups' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Users size={16} />
                        <span>Grupos</span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            background: activeTab === 'groups' ? 'var(--surface-card)' : 'var(--surface-card-subtle)',
                            color: activeTab === 'groups' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            {groups.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('students')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: activeTab === 'students' ? 'rgba(168, 85, 247, 0.4)' : 'transparent',
                            background: activeTab === 'students' ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                            color: activeTab === 'students' ? '#9333ea' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <GraduationCap size={16} />
                        <span>Todos los Estudiantes</span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            background: activeTab === 'students' ? 'var(--surface-card)' : 'var(--surface-card-subtle)',
                            color: activeTab === 'students' ? '#9333ea' : 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            {allStudents.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('links')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '10px',
                            border: '1px solid',
                            borderColor: activeTab === 'links' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
                            background: activeTab === 'links' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: activeTab === 'links' ? '#10b981' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <Clock size={16} />
                        <span>Enlaces Temporales</span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            background: activeTab === 'links' ? 'var(--surface-card)' : 'var(--surface-card-subtle)',
                            color: activeTab === 'links' ? '#10b981' : 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            {activeCodesCount}
                        </span>
                    </button>
                </div>

                {/* Selector de Vista (Grid / Lista) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Vista:
                    </span>
                    <div style={{
                        display: 'flex',
                        background: 'var(--surface-card-subtle)',
                        padding: '2px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <button
                            type="button"
                            onClick={() => setStudentViewMode('grid')}
                            style={{
                                padding: '4px 7px',
                                borderRadius: '6px',
                                border: 'none',
                                background: studentViewMode === 'grid' ? 'var(--surface-card)' : 'transparent',
                                color: studentViewMode === 'grid' ? 'var(--text-heading)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: studentViewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
                            }}
                            title="Vista en Cuadrícula"
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setStudentViewMode('table')}
                            style={{
                                padding: '4px 7px',
                                borderRadius: '6px',
                                border: 'none',
                                background: studentViewMode === 'table' ? 'var(--surface-card)' : 'transparent',
                                color: studentViewMode === 'table' ? 'var(--text-heading)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: studentViewMode === 'table' ? 'var(--shadow-sm)' : 'none'
                            }}
                            title="Vista en Lista / Tabla"
                        >
                            <List size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 4. FILA DE BÚSQUEDA Y FILTROS UNIFICADA (MOCKUP EXACTO) ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
                marginBottom: '1.25rem'
            }}>
                {/* Input de Búsqueda */}
                <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '420px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por materia, código (ej: EE-2026), docente..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--surface-card)',
                            color: 'var(--text-heading)',
                            fontSize: '0.82rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Dropdown de Cursos */}
                <div style={{ position: 'relative', minWidth: '240px' }}>
                    <select
                        value={selectedCourseFilter}
                        onChange={(e) => setSelectedCourseFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.55rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--surface-card)',
                            color: 'var(--text-heading)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="all">Todos los Cursos (EE, RE, SIMI...)</option>
                        {COURSES_DEFINITION.map(c => (
                            <option key={c.id} value={String(c.id)}>
                                {c.name} ({c.abbr})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtros de Estado con Píldoras */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginRight: '0.2rem' }}>
                        Estado:
                    </span>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: 'none',
                            background: statusFilter === 'all' ? '#0f172a' : 'transparent',
                            color: statusFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        Todos ({groups.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('active')}
                        style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: 'none',
                            background: statusFilter === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            color: statusFilter === 'active' ? '#10b981' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                        <span>Activos ( {activeGroupsCount} )</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('inactive')}
                        style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: 'none',
                            background: statusFilter === 'inactive' ? 'rgba(148, 163, 184, 0.15)' : 'transparent',
                            color: statusFilter === 'inactive' ? '#94a3b8' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#94a3b8' }} />
                        <span>Inactivos ( {inactiveGroupsCount} )</span>
                    </button>
                </div>
            </div>

            {/* ── 5. CONTENIDO PRINCIPAL: PESTAÑA GRUPOS (MOCKUP EXACTO) ── */}
            {activeTab === 'groups' && (
                <div className="animate-fade-in">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Cargando grupos de la base de datos...
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div style={{
                            padding: '3rem 1.5rem',
                            textAlign: 'center',
                            background: 'var(--surface-card-subtle)',
                            borderRadius: '16px',
                            border: '1px dashed var(--border-subtle)'
                        }}>
                            <Users size={36} color="var(--text-secondary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                                No se encontraron grupos
                            </h4>
                            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                {searchQuery ? 'Prueba con otro término de búsqueda o limpia el filtro.' : 'Crea tu primer grupo para comenzar a inscribir estudiantes.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCourseFilter('all');
                                    setStatusFilter('all');
                                }}
                                style={{
                                    background: 'var(--brand-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.25rem'
                        }}>
                            {filteredGroups.map(group => {
                                const course = COURSES_DEFINITION.find(c => c.id === group.course_id) || { name: 'Curso SaberLab', abbr: 'SL', color: '#38bdf8' };
                                const cColor = course.color || getCourseColor(course.id) || '#38bdf8';
                                const isActive = group.is_active !== 0;

                                // Buscar si hay enlace activo para este grupo
                                const activeCode = codes.find(c => (c.group_id === group.id || String(c.group_id) === String(group.id)) && getCodeStatus(c.expires_at).active);

                                // Conteo de estudiantes de este grupo
                                const groupStudentCount = allStudents.filter(s => s.group_id === group.id || String(s.group_id) === String(group.id)).length;

                                return (
                                    <div
                                        key={group.id}
                                        style={{
                                            background: 'var(--surface-card)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '18px',
                                            padding: '1.25rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            position: 'relative',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                        }}
                                    >
                                        {/* Cabecera de la Tarjeta: Badges + Estado + Menú ⋮ */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                    <span style={{
                                                        fontSize: '0.74rem',
                                                        fontWeight: 800,
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        background: `${cColor}18`,
                                                        color: cColor,
                                                        border: `1px solid ${cColor}35`
                                                    }}>
                                                        {course.abbr || 'SL'}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                        padding: '3px 6px',
                                                        borderRadius: '6px',
                                                        background: 'var(--surface-card-subtle)',
                                                        color: 'var(--text-secondary)',
                                                        border: '1px solid var(--border-subtle)'
                                                    }}>
                                                        #DB-{group.id}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                    <span style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '0.74rem',
                                                        fontWeight: 700,
                                                        color: isActive ? '#10b981' : '#ef4444'
                                                    }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10b981' : '#ef4444' }} />
                                                        <span>{isActive ? 'Activo' : 'Inactivo'}</span>
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditGroupModal(group)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'var(--text-secondary)',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                        title="Opciones de grupo"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Título en Negrita del Grupo */}
                                            <h4 style={{
                                                margin: '0 0 0.65rem',
                                                fontSize: '1.25rem',
                                                fontWeight: 800,
                                                color: 'var(--text-heading)',
                                                letterSpacing: '-0.01em'
                                            }}>
                                                {group.name}
                                            </h4>

                                            {/* Docente con Foto Redonda */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
                                                <div style={{
                                                    width: '26px',
                                                    height: '26px',
                                                    borderRadius: '50%',
                                                    background: '#0284c7',
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    overflow: 'hidden'
                                                }}>
                                                    {group.teacher ? group.teacher.charAt(0) : 'R'}
                                                </div>
                                                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                    {group.teacher || 'Prof. Ronny Martinez'}
                                                </span>
                                            </div>

                                            {/* Conteo de Estudiantes + Enlace Gestionar > */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                                                    <Users size={16} />
                                                    <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                                                        {groupStudentCount || group.studentCount || 0} estudiantes
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => openStudentsView(group)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#0284c7',
                                                        fontSize: '0.84rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '2px'
                                                    }}
                                                >
                                                    <span>Gestionar</span>
                                                    <ChevronRight size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Pie de Tarjeta: Enlace Activo vs Crear Enlace con Tiempo */}
                                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                                            {activeCode ? (
                                                <div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '0.65rem'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                                            <span>Enlace activo:</span>
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.76rem',
                                                            fontWeight: 800,
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            background: 'rgba(16, 185, 129, 0.12)',
                                                            color: '#10b981',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)'
                                                        }}>
                                                            {getCompactTimeLeft(activeCode.expires_at)}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.45rem' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(activeCode.code)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.35rem',
                                                                padding: '0.45rem 0.65rem',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--border-subtle)',
                                                                background: copiedCode === activeCode.code ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-card-subtle)',
                                                                color: copiedCode === activeCode.code ? '#10b981' : 'var(--text-heading)',
                                                                fontSize: '0.78rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {copiedCode === activeCode.code ? <Check size={14} /> : <Copy size={14} />}
                                                            <span>{copiedCode === activeCode.code ? 'Copiado' : 'Copiar'}</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openProjectorModal(activeCode, course.name, group.name)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.35rem',
                                                                padding: '0.45rem 0.65rem',
                                                                borderRadius: '8px',
                                                                border: 'none',
                                                                background: '#0284c7',
                                                                color: '#ffffff',
                                                                fontSize: '0.78rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                                                            }}
                                                        >
                                                            <QrCode size={14} />
                                                            <span>Ver QR</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteCode(activeCode.id)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.3rem',
                                                                padding: '0.45rem 0.65rem',
                                                                borderRadius: '8px',
                                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                background: 'rgba(239, 68, 68, 0.08)',
                                                                color: '#ef4444',
                                                                fontSize: '0.78rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Eliminar este enlace de la base de datos"
                                                        >
                                                            <Trash2 size={14} />
                                                            <span>Revocar</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openCreateLinkForGroup(group)}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.45rem',
                                                        padding: '0.6rem 0.85rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--border-subtle)',
                                                        background: 'var(--surface-card-subtle)',
                                                        color: '#0284c7',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    <Link2 size={15} />
                                                    <span>Crear Enlace con Tiempo</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── 4. CONTENIDO PRINCIPAL: PESTAÑA ESTUDIANTES ── */}
            {activeTab === 'students' && (
                <div className="animate-fade-in">
                    {/* Barra de Herramientas Docente: Conteo, Exportación, Selector de Vista y Búsqueda */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--surface-card-subtle)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        {/* Conteo y Acciones Masivas */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '7px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                                👥 {filteredStudents.length} inscritos
                            </span>
                            <span style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '7px',
                                background: 'var(--surface-card)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                border: '1px solid var(--border-subtle)'
                            }}>
                                🎓 {uniqueStudentsCount} únicos
                            </span>

                            {/* Botón Exportar CSV / Excel */}
                            <button
                                type="button"
                                onClick={() => handleExportStudentsCSV(filteredStudents)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '7px',
                                    background: 'var(--surface-card)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-heading)',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                title="Descargar lista de estudiantes en formato CSV (Excel)"
                            >
                                <Download size={13} color="var(--brand-primary)" />
                                <span>Exportar Excel</span>
                            </button>

                            {/* Botón Copiar Correos */}
                            <button
                                type="button"
                                onClick={() => handleCopyEmails(filteredStudents)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '7px',
                                    background: copiedEmailsStatus ? 'rgba(16, 185, 129, 0.18)' : 'var(--surface-card)',
                                    border: `1px solid ${copiedEmailsStatus ? '#10b981' : 'var(--border-subtle)'}`,
                                    color: copiedEmailsStatus ? '#10b981' : 'var(--text-secondary)',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                                title="Copiar correos de todos los alumnos filtrados"
                            >
                                {copiedEmailsStatus ? <Check size={13} /> : <Mail size={13} />}
                                <span>{copiedEmailsStatus ? '¡Correos Copiados!' : 'Copiar Correos'}</span>
                            </button>
                        </div>

                        {/* Controles de Derecha: Selector de Modo Vista y Buscador */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                            {/* Toggle Grid / Tabla */}
                            <div style={{
                                display: 'flex',
                                background: 'var(--surface-card)',
                                padding: '2px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setStudentViewMode('table')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        padding: '0.25rem 0.55rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: studentViewMode === 'table' ? 'var(--brand-primary)' : 'transparent',
                                        color: studentViewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                    title="Vista Tabla Compacta"
                                >
                                    <Table size={13} />
                                    <span>Tabla</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStudentViewMode('grid')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        padding: '0.25rem 0.55rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: studentViewMode === 'grid' ? 'var(--brand-primary)' : 'transparent',
                                        color: studentViewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                    title="Vista Tarjetas Cuadrícula"
                                >
                                    <LayoutGrid size={13} />
                                    <span>Tarjetas</span>
                                </button>
                            </div>

                            {/* Caja de Búsqueda */}
                            <div style={{ position: 'relative', minWidth: '220px', maxWidth: '340px', flex: '1 1 200px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar estudiante, correo o grupo..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.4rem 0.75rem 0.4rem 2rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--surface-card)',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.78rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            padding: '2px'
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contenido de Estudiantes */}
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Cargando estudiantes de la base de datos...
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div style={{
                            padding: '3rem 1.5rem',
                            textAlign: 'center',
                            background: 'var(--surface-card-subtle)',
                            borderRadius: '16px',
                            border: '1px dashed var(--border-subtle)'
                        }}>
                            <GraduationCap size={36} color="var(--text-secondary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                                No se encontraron estudiantes
                            </h4>
                            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                {searchQuery ? 'Prueba con otro nombre, correo o código de grupo.' : 'No hay estudiantes inscritos en los grupos del filtro seleccionado.'}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        background: 'var(--brand-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Limpiar Búsqueda
                                </button>
                            )}
                        </div>
                    ) : studentViewMode === 'table' ? (
                        /* ── VISTA TABLA COMPACTA DOCENTE ── */
                        <div style={{
                            background: 'var(--surface-card)',
                            borderRadius: '14px',
                            border: '1px solid var(--border-subtle)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--surface-card-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                            <th style={{ padding: '0.65rem 1rem', fontWeight: 800 }}>Estudiante</th>
                                            <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>Correo Institucional</th>
                                            <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>Curso</th>
                                            <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>Grupo Asignado</th>
                                            <th style={{ padding: '0.65rem 0.85rem', fontWeight: 800 }}>Mover Grupo</th>
                                            <th style={{ padding: '0.65rem 1rem', fontWeight: 800, textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((st, idx) => {
                                            const course = COURSES_DEFINITION.find(c => c.id === st.course_id);
                                            const cColor = course?.color || getCourseColor(st.course_id) || '#94a3b8';
                                            const isTransferring = transferringStudentId === st.id;
                                            const availableGroupsForCourse = st.course_id ? groups.filter(g => g.course_id === st.course_id) : groups;

                                            return (
                                                <tr
                                                    key={`${st.id}-${st.group_id}-${idx}`}
                                                    style={{
                                                        borderBottom: '1px solid var(--border-subtle)',
                                                        transition: 'background 0.15s'
                                                    }}
                                                    className="student-table-row"
                                                >
                                                    {/* Nombre y Avatar */}
                                                    <td style={{ padding: '0.65rem 1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                            <div style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                background: `${cColor}18`,
                                                                border: `1px solid ${cColor}35`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                overflow: 'hidden',
                                                                flexShrink: 0
                                                            }}>
                                                                {st.avatar_url ? (
                                                                    <img src={st.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <span style={{ fontWeight: 800, color: cColor, fontSize: '0.78rem' }}>
                                                                        {(st.full_name || st.email || 'U').charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 800, color: 'var(--text-heading)', fontSize: '0.85rem' }}>
                                                                    {st.full_name || 'Estudiante'}
                                                                </div>
                                                                {st.role && st.role !== 'student' && (
                                                                    <span style={{ fontSize: '0.68rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                                                                        Rol: {st.role}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Correo */}
                                                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                                        {st.email || 'Sin correo'}
                                                    </td>

                                                    {/* Badge de Curso */}
                                                    <td style={{ padding: '0.65rem 0.85rem' }}>
                                                        {course ? (
                                                            <span style={{
                                                                fontSize: '0.72rem',
                                                                fontWeight: 800,
                                                                padding: '2px 7px',
                                                                borderRadius: '5px',
                                                                background: `${cColor}15`,
                                                                color: cColor,
                                                                border: `1px solid ${cColor}35`
                                                            }}>
                                                                {course.abbr || course.name}
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                padding: '2px 7px',
                                                                borderRadius: '5px',
                                                                background: 'rgba(148, 163, 184, 0.12)',
                                                                color: '#94a3b8',
                                                                border: '1px solid rgba(148, 163, 184, 0.25)'
                                                            }}>
                                                                ⏳ Sin Asignar
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Grupo Actual */}
                                                    <td style={{ padding: '0.65rem 0.85rem' }}>
                                                        {st.group_id ? (
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                color: 'var(--text-heading)',
                                                                background: 'var(--surface-card-subtle)',
                                                                padding: '2px 7px',
                                                                borderRadius: '6px',
                                                                border: '1px solid var(--border-subtle)'
                                                            }}>
                                                                👥 {st.group_name || `Grupo #${st.group_id}`}
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                fontSize: '0.74rem',
                                                                fontWeight: 700,
                                                                color: '#f59e0b',
                                                                background: 'rgba(245, 158, 11, 0.12)',
                                                                padding: '2px 7px',
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px'
                                                            }}>
                                                                ⚠️ Sin grupo asignado
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Selector Transferir / Asignar Grupo */}
                                                    <td style={{ padding: '0.65rem 0.85rem' }}>
                                                        {!st.group_id ? (
                                                            <select
                                                                value=""
                                                                disabled={isTransferring}
                                                                onChange={(e) => handleTransferStudent(st, Number(e.target.value))}
                                                                style={{
                                                                    fontSize: '0.74rem',
                                                                    padding: '0.28rem 0.55rem',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #f59e0b',
                                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                                    color: 'var(--text-heading)',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 700,
                                                                    outline: 'none'
                                                                }}
                                                                title="Asignar este alumno a un grupo oficial"
                                                            >
                                                                <option value="" disabled>➕ Asignar a Grupo...</option>
                                                                {groups.map(g => (
                                                                    <option key={g.id} value={g.id}>
                                                                        {g.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : availableGroupsForCourse.length > 1 ? (
                                                            <select
                                                                value={st.group_id || ''}
                                                                disabled={isTransferring}
                                                                onChange={(e) => handleTransferStudent(st, Number(e.target.value))}
                                                                style={{
                                                                    fontSize: '0.74rem',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid var(--border-subtle)',
                                                                    background: 'var(--surface-card-subtle)',
                                                                    color: 'var(--text-heading)',
                                                                    cursor: 'pointer',
                                                                    outline: 'none'
                                                                }}
                                                                title="Cambiar este alumno a otro grupo del curso"
                                                            >
                                                                {availableGroupsForCourse.map(g => (
                                                                    <option key={g.id} value={g.id}>
                                                                        {g.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                                Único grupo
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Acciones */}
                                                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                                                            {st.group_id ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const targetGrp = groups.find(g => g.id === st.group_id);
                                                                        if (targetGrp) openStudentsView(targetGrp);
                                                                    }}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: 'var(--brand-primary)',
                                                                        fontSize: '0.74rem',
                                                                        fontWeight: 700,
                                                                        cursor: 'pointer',
                                                                        padding: '0.25rem'
                                                                    }}
                                                                    title="Ver lista de este grupo"
                                                                >
                                                                    Ver Grupo ➔
                                                                </button>
                                                            ) : (
                                                                <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>
                                                                    ⏳ Pendiente
                                                                </span>
                                                            )}

                                                            <button
                                                                type="button"
                                                                disabled={deletingStudentId === st.id}
                                                                onClick={() => handleRemoveStudent(st, { id: st.group_id, name: st.group_name, course_id: st.course_id })}
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                                                    color: '#ef4444',
                                                                    borderRadius: '6px',
                                                                    padding: '0.25rem 0.5rem',
                                                                    fontSize: '0.72rem',
                                                                    fontWeight: 700,
                                                                    cursor: deletingStudentId === st.id ? 'not-allowed' : 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '3px'
                                                                }}
                                                                title="Desvincular del grupo"
                                                            >
                                                                <Trash2 size={12} />
                                                                <span>{deletingStudentId === st.id ? '...' : 'Quitar'}</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* ── VISTA CUADRÍCULA (CARDS) ── */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '0.85rem'
                        }}>
                            {filteredStudents.map((st, idx) => {
                                const course = COURSES_DEFINITION.find(c => c.id === st.course_id) || { name: 'Curso', abbr: 'SL', color: '#38bdf8' };
                                const cColor = course.color || getCourseColor(course.id) || '#38bdf8';
                                const availableGroupsForCourse = groups.filter(g => g.course_id === st.course_id);

                                return (
                                    <div
                                        key={`${st.id}-${st.group_id}-${idx}`}
                                        style={{
                                            background: 'var(--surface-card)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '14px',
                                            padding: '1rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '0.75rem',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Info Superior: Avatar, Nombre y Correo */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: `${cColor}18`,
                                                border: `1px solid ${cColor}35`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}>
                                                {st.avatar_url ? (
                                                    <img src={st.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontWeight: 800, color: cColor, fontSize: '0.9rem' }}>
                                                        {(st.full_name || st.email || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '0.92rem',
                                                    fontWeight: 800,
                                                    color: 'var(--text-heading)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {st.full_name || 'Estudiante'}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-secondary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {st.email || 'Sin correo'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badges y Selector de Grupo */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '0.45rem',
                                            padding: '0.5rem 0.65rem',
                                            background: 'var(--surface-card-subtle)',
                                            borderRadius: '9px',
                                            border: '1px solid var(--border-subtle)',
                                            fontSize: '0.72rem'
                                        }}>
                                            {course ? (
                                                <span style={{
                                                    fontWeight: 800,
                                                    color: cColor,
                                                    background: `${cColor}15`,
                                                    padding: '2px 6px',
                                                    borderRadius: '5px',
                                                    border: `1px solid ${cColor}30`
                                                }}>
                                                    {course.abbr || course.name}
                                                </span>
                                            ) : (
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: '#94a3b8',
                                                    background: 'rgba(148, 163, 184, 0.12)',
                                                    padding: '2px 6px',
                                                    borderRadius: '5px',
                                                    border: '1px solid rgba(148, 163, 184, 0.25)'
                                                }}>
                                                    ⏳ Sin Asignar
                                                </span>
                                            )}

                                            {!st.group_id ? (
                                                <select
                                                    value=""
                                                    onChange={(e) => handleTransferStudent(st, Number(e.target.value))}
                                                    style={{
                                                        fontSize: '0.72rem',
                                                        padding: '2px 6px',
                                                        borderRadius: '5px',
                                                        border: '1px solid #f59e0b',
                                                        background: 'rgba(245, 158, 11, 0.1)',
                                                        color: 'var(--text-heading)',
                                                        cursor: 'pointer',
                                                        fontWeight: 700
                                                    }}
                                                    title="Asignar este alumno a un grupo oficial"
                                                >
                                                    <option value="" disabled>➕ Asignar Grupo...</option>
                                                    {groups.map(g => (
                                                        <option key={g.id} value={g.id}>
                                                            👥 {g.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : availableGroupsForCourse.length > 1 ? (
                                                <select
                                                    value={st.group_id || ''}
                                                    onChange={(e) => handleTransferStudent(st, Number(e.target.value))}
                                                    style={{
                                                        fontSize: '0.72rem',
                                                        padding: '2px 6px',
                                                        borderRadius: '5px',
                                                        border: '1px solid var(--border-subtle)',
                                                        background: 'var(--surface-card)',
                                                        color: 'var(--text-heading)',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Mover a otro grupo del mismo curso"
                                                >
                                                    {availableGroupsForCourse.map(g => (
                                                        <option key={g.id} value={g.id}>
                                                            👥 {g.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                                                    👥 {st.group_name || `Grupo #${st.group_id}`}
                                                </span>
                                            )}
                                        </div>

                                        {/* Botones de Acción */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.35rem' }}>
                                            {st.group_id ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const targetGrp = groups.find(g => g.id === st.group_id);
                                                        if (targetGrp) openStudentsView(targetGrp);
                                                    }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--brand-primary)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '3px',
                                                        padding: 0
                                                    }}
                                                >
                                                    <span>Ver Grupo</span>
                                                    <ArrowRight size={13} />
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 700 }}>
                                                    ⚠️ Sin Grupo
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                disabled={deletingStudentId === st.id}
                                                onClick={() => handleRemoveStudent(st, { id: st.group_id, name: st.group_name, course_id: st.course_id })}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                                    color: '#ef4444',
                                                    borderRadius: '6px',
                                                    padding: '0.3rem 0.55rem',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    cursor: deletingStudentId === st.id ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '3px'
                                                }}
                                                title="Desvincular a este estudiante de este grupo"
                                            >
                                                <Trash2 size={12} />
                                                <span>{deletingStudentId === st.id ? 'Quitando...' : 'Desvincular'}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── 5. CONTENIDO PRINCIPAL: PESTAÑA ENLACES TEMPORALES ── */}
            {activeTab === 'links' && (
                <div className="animate-fade-in">
                    {/* Barra de Filtros y Búsqueda de Enlaces */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--surface-card-subtle)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                Enlaces:
                            </span>
                            <span style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                color: 'var(--brand-primary)',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                border: '1px solid rgba(56, 189, 248, 0.3)'
                            }}>
                                ⏱️ {filteredCodes.length} códigos
                            </span>
                        </div>

                        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '360px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Buscar código o grupo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.4rem 0.75rem 0.4rem 2rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    background: 'var(--surface-card)',
                                    color: 'var(--text-heading)',
                                    fontSize: '0.78rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        padding: '2px'
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Cargando enlaces temporales...
                        </div>
                    ) : filteredCodes.length === 0 ? (
                        <div style={{
                            padding: '3rem 1.5rem',
                            textAlign: 'center',
                            background: 'var(--surface-card-subtle)',
                            borderRadius: '16px',
                            border: '1px dashed var(--border-subtle)'
                        }}>
                            <Link2 size={36} color="var(--text-secondary)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                                No hay enlaces de auto-unión que coincidan
                            </h4>
                            <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                {searchQuery ? 'Prueba con otro código o grupo.' : 'Genera un enlace con tiempo límite para que tus alumnos se inscriban en 1 clic.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    if (searchQuery) setSearchQuery('');
                                    else setShowCreateLinkModal(true);
                                }}
                                style={{
                                    background: 'var(--brand-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {searchQuery ? 'Limpiar Búsqueda' : '+ Generar Enlace Temporal'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {filteredCodes.map(c => {
                                const course = COURSES_DEFINITION.find(cd => cd.id === c.course_id) || { name: 'Curso SaberLab', color: '#38bdf8' };
                                const linkedGroup = groups.find(g => g.id === c.group_id);
                                const status = getCodeStatus(c.expires_at);
                                const isCopied = copiedCode === c.code;

                                return (
                                    <div
                                        key={c.id}
                                        style={{
                                            background: 'var(--surface-card)',
                                            border: `1px solid ${status.active ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.35)'}`,
                                            borderRadius: '14px',
                                            padding: '1.1rem 1.35rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '1rem',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                    >
                                        <div style={{ minWidth: '240px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: `${course.color || '#38bdf8'}18`,
                                                    color: course.color || '#38bdf8',
                                                    border: `1px solid ${course.color || '#38bdf8'}35`
                                                }}>
                                                    {course.name}
                                                </span>

                                                {linkedGroup && (
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 800,
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        background: 'var(--surface-card-subtle)',
                                                        color: 'var(--text-heading)',
                                                        border: '1px solid var(--border-subtle)'
                                                    }}>
                                                        👥 {linkedGroup.name}
                                                    </span>
                                                )}

                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    background: `${status.color}18`,
                                                    color: status.color,
                                                    border: `1px solid ${status.color}35`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Clock size={10} />
                                                    {status.label}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <span style={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '1.15rem',
                                                    fontWeight: 900,
                                                    color: 'var(--text-heading)',
                                                    letterSpacing: '1px'
                                                }}>
                                                    {c.code}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {c.expires_at ? `Expira: ${new Date(c.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` : 'Sin límite'}
                                                </span>
                                            </div>

                                            <div style={{
                                                fontSize: '0.74rem',
                                                color: 'var(--brand-primary)',
                                                fontFamily: 'monospace',
                                                background: 'var(--surface-card-subtle)',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                display: 'inline-block',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                https://saberlab.pages.dev/join?code={c.code}
                                            </div>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                onClick={() => setProjectorCode({
                                                    code: c.code,
                                                    course_name: course.name,
                                                    group_name: linkedGroup?.name || 'General',
                                                    expires_at: c.expires_at,
                                                    course_color: course.color || '#38bdf8'
                                                })}
                                                style={{
                                                    background: 'rgba(56, 189, 248, 0.15)',
                                                    color: 'var(--brand-primary)',
                                                    border: '1px solid rgba(56, 189, 248, 0.35)',
                                                    padding: '0.45rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                                title="Proyectar Código QR gigante en el videobeam del salón de clases"
                                            >
                                                <QrCode size={14} />
                                                <span>📺 Proyectar QR</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleCopy(c.code)}
                                                style={{
                                                    background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'var(--surface-card-subtle)',
                                                    color: isCopied ? '#10b981' : 'var(--text-heading)',
                                                    border: `1px solid ${isCopied ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                                                    padding: '0.45rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                            >
                                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                                <span>{isCopied ? '¡Copiado!' : 'Copiar Enlace'}</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleShareWhatsApp(c.code, course.name, linkedGroup?.name)}
                                                style={{
                                                    background: 'rgba(37, 211, 102, 0.12)',
                                                    color: '#25d366',
                                                    border: '1px solid rgba(37, 211, 102, 0.3)',
                                                    padding: '0.45rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                            >
                                                <Share2 size={14} />
                                                <span>WhatsApp</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setExtendTarget(c)}
                                                style={{
                                                    background: 'rgba(245, 158, 11, 0.12)',
                                                    color: '#f59e0b',
                                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                                    padding: '0.45rem 0.85rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                                title="Extender tiempo de validez"
                                            >
                                                <CalendarPlus size={14} />
                                                <span>Dar más tiempo ⏱️</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCode(c.id)}
                                                style={{
                                                    background: 'transparent',
                                                    color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                                    padding: '0.45rem 0.6rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Revocar enlace"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── 9. MODAL PROYECTOR DE AULA (CÓDIGO QR GIGANTE) ── */}
            {projectorCode && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(5, 10, 24, 0.94)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: `2px solid ${projectorCode.course_color || 'var(--brand-primary)'}`,
                        borderRadius: '24px',
                        padding: '2.5rem 2rem',
                        maxWidth: '560px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
                        textAlign: 'center',
                        position: 'relative'
                    }}>
                        <button
                            type="button"
                            onClick={() => setProjectorCode(null)}
                            style={{
                                position: 'absolute',
                                right: '1.25rem',
                                top: '1.25rem',
                                background: 'var(--surface-card-subtle)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '4px 12px', borderRadius: '20px', background: `${projectorCode.course_color}20`, color: projectorCode.course_color, fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', border: `1px solid ${projectorCode.course_color}40` }}>
                            <span>📚 {projectorCode.course_name}</span>
                            <span>•</span>
                            <span>👥 {projectorCode.group_name}</span>
                        </div>

                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.5rem', color: 'var(--text-heading)' }}>
                            ¡Únete a la Clase en Vivo!
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem' }}>
                            Apunta con la cámara de tu celular para ingresar directamente a este grupo.
                        </p>

                        {/* QR Code Container */}
                        <div style={{
                            background: '#ffffff',
                            padding: '1.25rem',
                            borderRadius: '20px',
                            display: 'inline-block',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.25)'
                        }}>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(getFullJoinUrl(projectorCode.code))}&bgcolor=ffffff&color=0f172a&margin=2`}
                                alt={`QR ${projectorCode.code}`}
                                style={{ width: '220px', height: '220px', display: 'block' }}
                            />
                        </div>

                        {/* Enlace y Código Gigante */}
                        <div style={{
                            background: 'var(--surface-card-subtle)',
                            borderRadius: '14px',
                            padding: '1rem',
                            border: '1px solid var(--border-subtle)',
                            marginBottom: '1.25rem'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 700 }}>
                                CÓDIGO DE ACCESO DIRECTO
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '3px', color: projectorCode.course_color || 'var(--brand-primary)', fontFamily: 'monospace' }}>
                                {projectorCode.code}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                                https://saberlab.pages.dev/join?code={projectorCode.code}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => handleCopy(projectorCode.code)}
                                style={{
                                    background: copiedCode === projectorCode.code ? '#10b981' : 'var(--brand-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '0.7rem 1.5rem',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {copiedCode === projectorCode.code ? <Check size={16} /> : <Copy size={16} />}
                                <span>{copiedCode === projectorCode.code ? '¡Enlace Copiado!' : 'Copiar URL para el Chat'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 5. MODAL CREAR / EDITAR GRUPO CON ESTADO ACTIVO/INACTIVO ── */}
            {showGroupModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '460px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Users size={20} color="var(--brand-primary)" />
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                    {groupForm.id ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGroupModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveGroup}>
                            {/* Seleccionar Curso */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Asignatura / Curso
                                </label>
                                <select
                                    value={groupForm.course_id}
                                    onChange={(e) => setGroupForm({ ...groupForm, course_id: Number(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {COURSES_DEFINITION.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.abbr})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nombre del Grupo */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Nombre del Grupo (ej. EE-2026II, Grupo A, Taller Lunes)
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre identificador..."
                                    value={groupForm.name}
                                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Docente a Cargo */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Docente a Cargo
                                </label>
                                <input
                                    type="text"
                                    placeholder="Prof. Ronny Martinez"
                                    value={groupForm.teacher}
                                    onChange={(e) => setGroupForm({ ...groupForm, teacher: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Estado Activo / Inactivo */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                                    Estado del Grupo
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setGroupForm({ ...groupForm, is_active: 1 })}
                                        style={{
                                            padding: '0.6rem',
                                            borderRadius: '9px',
                                            border: `1px solid ${groupForm.is_active === 1 ? '#10b981' : 'var(--border-subtle)'}`,
                                            background: groupForm.is_active === 1 ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-card-subtle)',
                                            color: groupForm.is_active === 1 ? '#10b981' : 'var(--text-secondary)',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <CheckCircle2 size={15} />
                                        <span>🟢 Activo</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setGroupForm({ ...groupForm, is_active: 0 })}
                                        style={{
                                            padding: '0.6rem',
                                            borderRadius: '9px',
                                            border: `1px solid ${groupForm.is_active === 0 ? '#ef4444' : 'var(--border-subtle)'}`,
                                            background: groupForm.is_active === 0 ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-card-subtle)',
                                            color: groupForm.is_active === 0 ? '#ef4444' : 'var(--text-secondary)',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        <XCircle size={15} />
                                        <span>⚪ Inactivo</span>
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowGroupModal(false)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-secondary)',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.15rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGroup}
                                    style={{
                                        background: 'var(--brand-primary)',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.4rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        cursor: savingGroup ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {savingGroup ? 'Guardando...' : (groupForm.id ? 'Guardar Cambios' : 'Crear Grupo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 6. MODAL GENERAR ENLACE TEMPORAL ── */}
            {showCreateLinkModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '460px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Sparkles size={20} color="var(--brand-primary)" />
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                    Generar Enlace Temporal
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateLinkModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateLinkSubmit}>
                            {/* Curso */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Curso a Inscribir
                                </label>
                                <select
                                    value={linkForm.course_id}
                                    onChange={(e) => {
                                        const cId = Number(e.target.value);
                                        const firstGrp = groups.find(g => g.course_id === cId);
                                        setLinkForm({ ...linkForm, course_id: cId, group_id: firstGrp?.id || '' });
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {COURSES_DEFINITION.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.abbr})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Grupo Destino */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                                    Grupo Destino
                                </label>
                                <select
                                    value={linkForm.group_id}
                                    onChange={(e) => setLinkForm({ ...linkForm, group_id: Number(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        background: 'var(--surface-card-subtle)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '10px',
                                        padding: '0.7rem',
                                        color: 'var(--text-heading)',
                                        fontSize: '0.86rem',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">-- Asignar automáticamente o Grupo General --</option>
                                    {groups.filter(g => g.course_id === Number(linkForm.course_id)).map(g => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} (#{g.id}) {g.is_active === 0 ? '[Inactivo]' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tiempo de Vigencia */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                                    Tiempo de Vigencia del Enlace
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { hours: 1, label: '⚡ 1 Hora (En clase)' },
                                        { hours: 4, label: '🕒 4 Horas (Taller)' },
                                        { hours: 24, label: '📅 24 Horas (1 Día)' },
                                        { hours: 72, label: '🗓️ 3 Días' },
                                        { hours: 168, label: '⏳ 7 Días (1 Semana)' },
                                        { hours: 0, label: '♾️ Permanente' }
                                    ].map(opt => (
                                        <button
                                            type="button"
                                            key={opt.hours}
                                            onClick={() => setLinkForm({ ...linkForm, durationHours: opt.hours })}
                                            style={{
                                                background: linkForm.durationHours === opt.hours ? 'rgba(56, 189, 248, 0.18)' : 'var(--surface-card-subtle)',
                                                border: `1px solid ${linkForm.durationHours === opt.hours ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                                                color: linkForm.durationHours === opt.hours ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                                padding: '0.6rem 0.45rem',
                                                borderRadius: '9px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateLinkModal(false)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-secondary)',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.15rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingLink}
                                    style={{
                                        background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                                        color: '#0f172a',
                                        border: 'none',
                                        borderRadius: '9px',
                                        padding: '0.6rem 1.4rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        cursor: creatingLink ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {creatingLink ? 'Generando...' : 'Crear Enlace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 7. MODAL EXTENDER VIGENCIA ── */}
            {extendTarget && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '450px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <CalendarPlus size={20} color="#f59e0b" />
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                    Dar Más Tiempo al Enlace
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setExtendTarget(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                            Amplía la vigencia para el enlace con código <strong style={{ color: 'var(--text-heading)' }}>{extendTarget.code}</strong>. Los alumnos usarán la misma URL.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.55rem', marginBottom: '1.5rem' }}>
                            {[
                                { hours: 1, label: '+1 Hora adicional' },
                                { hours: 24, label: '+24 Horas (+1 Día)' },
                                { hours: 72, label: '+3 Días' },
                                { hours: 168, label: '+7 Días (+1 Sem)' },
                                { hours: 720, label: '+30 Días (1 Mes)' },
                                { hours: 0, label: 'Hacer Permanente' }
                            ].map(opt => (
                                <button
                                    type="button"
                                    key={opt.hours}
                                    onClick={() => setAddHours(opt.hours)}
                                    style={{
                                        background: addHours === opt.hours ? 'rgba(245, 158, 11, 0.18)' : 'var(--surface-card-subtle)',
                                        border: `1px solid ${addHours === opt.hours ? '#f59e0b' : 'var(--border-subtle)'}`,
                                        color: addHours === opt.hours ? '#f59e0b' : 'var(--text-secondary)',
                                        padding: '0.65rem 0.45rem',
                                        borderRadius: '9px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                            <button
                                type="button"
                                onClick={() => setExtendTarget(null)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '9px',
                                    padding: '0.6rem 1.15rem',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleExtendTime}
                                disabled={updatingTime}
                                style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: '9px',
                                    padding: '0.6rem 1.4rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    cursor: updatingTime ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {updatingTime ? 'Actualizando...' : 'Extender Vigencia ⏱️'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 8. MODAL VER LISTA DE ESTUDIANTES DEL GRUPO ── */}
            {showStudentsModal && selectedGroupStudents && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(10, 15, 30, 0.82)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '20px',
                        padding: '1.75rem',
                        maxWidth: '520px',
                        width: '100%',
                        color: 'var(--text-heading)',
                        boxShadow: 'var(--shadow-xl)',
                        maxHeight: '88vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <Users size={20} color="var(--brand-primary)" />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                                        Estudiantes de {selectedGroupStudents.name}
                                    </h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {studentsList.length} alumnos registrados en este grupo
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowStudentsModal(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Lista de Alumnos */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px' }}>
                            {loadingStudents ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    Cargando estudiantes...
                                </div>
                            ) : studentsList.length === 0 ? (
                                <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--surface-card-subtle)', borderRadius: '12px' }}>
                                    <UserCheck size={32} color="var(--text-secondary)" style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        No hay estudiantes inscritos en este grupo todavía.
                                    </p>
                                </div>
                            ) : (
                                studentsList.map(st => (
                                    <div
                                        key={st.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: '10px',
                                            background: 'var(--surface-card-subtle)',
                                            border: '1px solid var(--border-subtle)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                            <div style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '50%',
                                                background: 'var(--surface-panel)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                {st.avatar_url ? (
                                                    <img src={st.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Users size={16} color="var(--text-secondary)" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                                                    {st.full_name || st.email || 'Estudiante'}
                                                </div>
                                                {st.email && (
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                        {st.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={deletingStudentId === st.id}
                                            onClick={() => handleRemoveStudent(st)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                                color: '#ef4444',
                                                borderRadius: '7px',
                                                padding: '0.35rem 0.6rem',
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                cursor: deletingStudentId === st.id ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}
                                            title="Desvincular del grupo"
                                        >
                                            <Trash2 size={12} />
                                            <span>{deletingStudentId === st.id ? 'Quitando...' : 'Desvincular'}</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setShowStudentsModal(false)}
                                style={{
                                    background: 'var(--surface-card-subtle)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-heading)',
                                    borderRadius: '9px',
                                    padding: '0.5rem 1.25rem',
                                    fontSize: '0.84rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
