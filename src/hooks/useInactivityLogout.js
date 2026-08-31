import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/useAuth';

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutos máximo de inactividad
const WARNING_LIMIT_MS = 4 * 60 * 1000;     // 4 minutos (aviso preventivo 60s antes)
const LAST_ACTIVITY_KEY = 'saberlab_last_activity';

export function useInactivityLogout() {
    const { user, signOut } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(60);

    const warningTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Activamos para cualquier usuario autenticado en la plataforma
    const isAuthenticated = Boolean(user);

    const handleLogout = useCallback(async () => {
        setShowWarning(false);
        try {
            await signOut();
        } catch {
            // fallback
        }
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        window.location.href = '/login?reason=inactivity';
    }, [signOut]);

    const checkInactivityOnFocus = useCallback(() => {
        if (!isAuthenticated) return;
        const last = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
        if (!last) return;
        const elapsed = Date.now() - last;
        if (elapsed >= INACTIVITY_LIMIT_MS) {
            handleLogout();
        } else if (elapsed >= WARNING_LIMIT_MS) {
            const rem = Math.max(1, Math.round((INACTIVITY_LIMIT_MS - elapsed) / 1000));
            setSecondsRemaining(rem);
            setShowWarning(true);
        }
    }, [isAuthenticated, handleLogout]);

    const resetTimer = useCallback(() => {
        if (!isAuthenticated) return;

        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

        // Limpiar timers anteriores
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setShowWarning(false);
        setSecondsRemaining(60);

        // Timer para la advertencia (a los 4 minutos)
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

        // Timer final por seguridad (a los 5 minutos)
        logoutTimerRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_LIMIT_MS);
    }, [isAuthenticated, handleLogout]);

    useEffect(() => {
        if (!isAuthenticated) {
            setShowWarning(false);
            return;
        }

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        const onActivity = () => {
            // Solo reiniciamos automáticamente con eventos si la advertencia NO está visible
            if (!showWarning) {
                resetTimer();
            }
        };

        const onVisibilityOrFocus = () => {
            checkInactivityOnFocus();
        };

        // Iniciar timer
        resetTimer();

        events.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));
        window.addEventListener('visibilitychange', onVisibilityOrFocus);
        window.addEventListener('focus', onVisibilityOrFocus);

        return () => {
            events.forEach(evt => window.removeEventListener(evt, onActivity));
            window.removeEventListener('visibilitychange', onVisibilityOrFocus);
            window.removeEventListener('focus', onVisibilityOrFocus);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [isAuthenticated, showWarning, resetTimer, checkInactivityOnFocus]);

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
