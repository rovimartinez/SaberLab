import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';

const HEARTBEAT_INTERVAL_MS = 6000; // Cada 6 segundos para entrega rápida de alertas

export function useStudentPresence() {
    const { user, profile, isStaff, isImpersonating, viewMode } = useAuth();
    const location = useLocation();
    const [pendingMessage, setPendingMessage] = useState(null);
    const lastDismissedIdRef = useRef(null);

    const userRole = (profile?.role || user?.role || 'student').toLowerCase();
    // Estudiante real o administrador en Modo Vista de Estudiante
    const isStudent = Boolean(user && (!isStaff || isImpersonating || viewMode === 'student' || userRole === 'student'));

    const getActivityFromPath = (pathname) => {
        // ── Evaluaciones / Exámenes ──
        if (pathname.includes('/evaluations/') || pathname.match(/e\d+$/)) {
            return '📝 Presentando Examen';
        }
        // ── Lecciones activas ──
        if (pathname.includes('/lesson/')) {
            const parts = pathname.split('/');
            const lessonId = parts[parts.length - 1]; // ej. "ee-m1-l3"
            // Mapeo legible de IDs conocidos
            const lessonNames = {
                'ee-m1-l1': 'Lección 1 · Carga Eléctrica',
                'ee-m1-l2': 'Lección 2 · Ley de Ohm',
                'ee-m1-l3': 'Lección 3 · Circuitos Serie',
                'ee-m1-l4': 'Lección 4 · Circuitos Paralelo',
                'ee-m1-l5': 'Lección 5 · Circuitos Mixtos',
                'ee-m1-l6': 'Lección 6 · Examen M1',
                'ee-m2-l7': 'Lección 7 · Capacitores',
                'ee-m2-l8': 'Lección 8 · Bobinas y Diodos',
                'ee-m2-l9': 'Lección 9 · Transistores BJT',
                'ee-m2-l10': 'Lección 10 · Examen M2',
                're-m1-l1': 'RE · L1 Introducción a Robótica',
                're-m1-l2': 'RE · L2 Arduino y GPIO',
                're-m1-l3': 'RE · L3 Sensores',
                're-m1-l4': 'RE · L4 Actuadores',
                're-m1-l5': 'RE · L5 Programación',
                're-m1-l6': 'RE · L6 Examen M1',
            };
            const name = lessonNames[lessonId];
            return name ? `📖 ${name}` : `📖 Lección ${lessonId}`;
        }
        // ── Secciones de curso ──
        if (pathname.includes('/my-courses') && pathname.split('/').length > 3) {
            return '📚 Viendo Contenido del Curso';
        }
        if (pathname.includes('/my-courses')) {
            return '📚 Mis Cursos';
        }
        if (pathname.includes('/grades')) {
            return '📊 Revisando Calificaciones';
        }
        if (pathname.includes('/resources')) {
            return '🎬 Consultando Recursos / Videos';
        }
        if (pathname.includes('/rewards')) {
            return '🏆 Laboratorio de Recompensas';
        }
        if (pathname.includes('/profile')) {
            return '👤 Editando Perfil';
        }
        if (pathname.includes('/certificate')) {
            return '🎓 Viendo Certificado';
        }
        if (pathname.includes('/dashboard')) {
            return '🖥️ Panel Administrativo';
        }
        if (pathname === '/' || pathname.includes('/home') || pathname.includes('/inicio')) {
            return '🏠 Pantalla de Inicio';
        }
        return '🌐 En SaberLab';
    };

    const sendPing = useCallback(async () => {
        if (!isStudent) return;

        try {
            const activity = getActivityFromPath(location.pathname);
            const { data } = await api('/presence', {
                method: 'POST',
                body: {
                    current_page: location.pathname,
                    activity
                }
            });

            if (data?.direct_message) {
                // Solo mostramos si no es el último mensaje cerrado en esta sesión
                if (data.direct_message.id !== lastDismissedIdRef.current) {
                    setPendingMessage(data.direct_message);
                }
            }
        } catch (err) {
            // Silencioso para no saturar consola
        }
    }, [isStudent, location.pathname]);

    useEffect(() => {
        if (!isStudent) {
            setPendingMessage(null);
            return;
        }

        // Enviar ping inicial de inmediato
        sendPing();

        // Enviar periódicamente cada 6s
        const interval = setInterval(sendPing, HEARTBEAT_INTERVAL_MS);

        // También chequear inmediatamente cuando la pestaña vuelve a enfocarse
        const handleFocus = () => sendPing();
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleFocus);
        };
    }, [isStudent, sendPing]);

    const clearPendingMessage = useCallback(async () => {
        if (pendingMessage) {
            lastDismissedIdRef.current = pendingMessage.id;
            const isTemp = pendingMessage.is_temporary;
            setPendingMessage(null);

            // Si es notificación persistente, marcar como leída en el backend
            if (!isTemp) {
                try {
                    await api('/notifications', {
                        method: 'POST',
                        body: { ids: [pendingMessage.id] }
                    });
                } catch (e) {
                    console.error('Error marcando notificación:', e);
                }
            }
        }
    }, [pendingMessage]);

    return {
        pendingMessage,
        clearPendingMessage
    };
}
