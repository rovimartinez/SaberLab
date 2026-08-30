import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/useAuth';

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutos
const WARNING_LIMIT_MS = 9 * 60 * 1000;     // 9 minutos (muestra aviso 60s antes)

export function useInactivityLogout() {
    const { user, effectiveRole, signOut } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(60);

    const warningTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Solo activamos para estudiantes autenticados
    const isStudent = Boolean(user && effectiveRole === 'student');

    const handleLogout = useCallback(() => {
        setShowWarning(false);
        signOut();
        window.location.href = '/login?reason=inactivity';
    }, [signOut]);

    const resetTimer = useCallback(() => {
        if (!isStudent) return;

        // Limpiar timers anteriores
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setShowWarning(false);
        setSecondsRemaining(60);

        // Timer para la advertencia (a los 9 minutos)
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setSecondsRemaining(60);

            // Intervalo de conteo regresivo de 60 segundos
            countdownIntervalRef.current = setInterval(() => {
                setSecondsRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownIntervalRef.current);
                        handleLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, WARNING_LIMIT_MS);

        // Timer final por seguridad (a los 10 minutos)
        logoutTimerRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_LIMIT_MS);
    }, [isStudent, handleLogout]);

    useEffect(() => {
        if (!isStudent) {
            setShowWarning(false);
            return;
        }

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        const onActivity = () => {
            // Solo reiniciamos automáticamente con eventos si la advertencia NO está visible
            // Si la advertencia está visible, el usuario debe interactuar conscientemente (ej. clic en el modal)
            if (!showWarning) {
                resetTimer();
            }
        };

        // Iniciar timer
        resetTimer();

        events.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));

        return () => {
            events.forEach(evt => window.removeEventListener(evt, onActivity));
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [isStudent, showWarning, resetTimer]);

    const extendSession = () => {
        resetTimer();
    };

    return {
        showWarning,
        secondsRemaining,
        extendSession,
        handleLogout
    };
}
