import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { api } from '../lib/api';

const HEARTBEAT_INTERVAL_MS = 25000; // Cada 25 segundos

export function useStudentPresence() {
    const { user, effectiveRole } = useAuth();
    const location = useLocation();
    const [pendingMessage, setPendingMessage] = useState(null);
    const lastDismissedIdRef = useRef(null);

    const isStudent = Boolean(user && effectiveRole === 'student');

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

        // Enviar periódicamente
        const interval = setInterval(sendPing, HEARTBEAT_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isStudent, sendPing]);

    const clearPendingMessage = useCallback(async () => {
        if (pendingMessage) {
            lastDismissedIdRef.current = pendingMessage.id;
            try {
                // Marcar como leída en el backend
                await api('/notifications', {
                    method: 'POST',
                    body: { ids: [pendingMessage.id] }
                });
            } catch (e) {
                console.error('Error marcando notificación:', e);
            }
            setPendingMessage(null);
        }
    }, [pendingMessage]);

    return {
        pendingMessage,
        clearPendingMessage
    };
}
