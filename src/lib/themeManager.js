/**
 * themeManager.js - Controlador Centralizado de Tema (SaberLab)
 * Gestiona data-theme en documentElement, sincronización con localStorage
 * y escucha de cambios en la preferencia del sistema operativo.
 */

export const THEME_KEY = 'saberlab-theme';

/**
 * Comprueba si el usuario autenticado actualmente tiene rol de administrador
 */
export function isUserAdmin() {
    try {
        const cachedProfile = localStorage.getItem('saberlab_cached_profile');
        if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            const role = parsed?.real_role || parsed?.role;
            return role === 'admin';
        }
    } catch {
        // En caso de error o almacenamiento no disponible
    }
    return false;
}

/**
 * Obtiene el tema inicial preferido por el usuario o del sistema.
 * El tema predeterminado es 'light' para todos los usuarios.
 * El tema 'dark' está inhabilitado estrictamente hasta nueva orden para no-admins.
 */
export function getInitialTheme() {
    try {
        const admin = isUserAdmin();
        const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('theme');

        if (saved === 'dark') {
            if (admin) return 'dark';
            // Para no-admins, corregir de inmediato en localStorage a 'light'
            localStorage.setItem(THEME_KEY, 'light');
            localStorage.setItem('theme', 'light');
            return 'light';
        }

        if (saved === 'light') {
            return 'light';
        }

        if (saved === 'system') {
            if (!admin) {
                localStorage.setItem(THEME_KEY, 'light');
                localStorage.setItem('theme', 'light');
                return 'light';
            }
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }
    } catch {
        // Entornos sin window o localStorage bloqueado
    }
    return 'light'; // Tema predeterminado institucional oficial
}

/**
 * Aplica el tema en el elemento raíz <html> y persiste en localStorage
 */
export function applyTheme(theme) {
    let resolved = theme;
    const admin = isUserAdmin();

    // Bloqueo estricto de modo oscuro para no administradores hasta nueva orden
    if (!admin && (theme === 'dark' || theme === 'system')) {
        resolved = 'light';
    } else if (theme === 'system') {
        resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    try {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', resolved);
        }
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(THEME_KEY, resolved);
            localStorage.setItem('theme', resolved);
        }
    } catch (err) {
        console.warn('Error aplicando tema:', err);
    }

    return resolved;
}

/**
 * Alterna entre tema claro y oscuro (restringido a administradores)
 */
export function toggleTheme() {
    if (!isUserAdmin()) {
        applyTheme('light');
        return 'light';
    }
    const current = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return next;
}
