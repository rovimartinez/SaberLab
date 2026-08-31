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
        if (pathname.includes('/evaluations/') || pathname.includes('/re-m1-e2')) {
            return 'Presentando Evaluación / Examen';
        }
        if (pathname.includes('/lesson/')) {
            const parts = pathname.split('/');
            const lessonId = parts[parts.length - 1];
            return `Estudiando Lección (${lessonId})`;
        }
        if (pathname.includes('/my-courses')) {
            return 'Viendo Mis Cursos';
        }
        if (pathname.includes('/grades')) {
            return 'Revisando Calificaciones';
        }
        if (pathname.includes('/resources')) {
            return 'Consultando Recursos / Videos';
        }
        if (pathname.includes('/rewards')) {
            return 'En Laboratorio de Recompensas';
        }
        return 'En Plataforma SaberLab';
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
