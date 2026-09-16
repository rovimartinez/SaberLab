/**
 * themeManager.js - Controlador Centralizado de Tema (SaberLab)
 * Gestiona data-theme en documentElement, sincronización con localStorage
 * y escucha de cambios en la preferencia del sistema operativo.
 */

export const THEME_KEY = 'saberlab-theme';

/**
 * Obtiene el tema inicial preferido por el usuario o del sistema
 */
export function getInitialTheme() {
    try {
        const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        if (saved === 'system') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }
    } catch {
        // Entornos sin window o localStorage bloqueado
    }
    return 'dark'; // Tema predeterminado institucional de alto contraste
}

/**
 * Aplica el tema en el elemento raíz <html> y persiste en localStorage
 */
export function applyTheme(theme) {
    let resolved = theme;
    if (theme === 'system') {
        resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    try {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', resolved);
        }
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(THEME_KEY, theme);
            // Compatibilidad retroactiva
            localStorage.setItem('theme', theme);
        }
    } catch (err) {
        console.warn('Error aplicando tema:', err);
    }

    return resolved;
}

/**
 * Alterna entre tema claro y oscuro
 */
export function toggleTheme() {
    const current = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
}
