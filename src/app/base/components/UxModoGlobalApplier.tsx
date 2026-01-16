import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { aplicarEstilosUxModo, removeDarkMode } from '../hooks/useUxModo';

/**
 * Componente que aplica el modo UX globalmente basándose en user.uxModo
 * Se ejecuta desde que se carga la aplicación
 * NOTA: El tema nocturno NO se aplica en la ruta /session/signin
 */
export default function UxModoGlobalApplier() {
    const { user, isAuthenticated }: any = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Verificar si estamos en la ruta /session/signin
        const isSignInPage = location.pathname === "/session/signin";
        
        // Si estamos en /session/signin, siempre forzar modo LIGHT
        if (isSignInPage) {
            removeDarkMode();
            return;
        }

        // En cualquier otra ruta, aplicar el modo del usuario
        const modo = isAuthenticated ? user?.uxModo : null;
        aplicarEstilosUxModo(modo);

        // Escuchar cambios en las preferencias del sistema solo si estamos en modo SYSTEM
        if (modo === "SYSTEM" || modo === null) {
            const mediaQuery = window.matchMedia(
                "(prefers-color-scheme: dark)",
            );
            const handleChange = () => {
                // Verificar nuevamente si seguimos en /session/signin antes de aplicar
                const isSignInPage = window.location.pathname === "/session/signin";
                if (!isSignInPage) {
                    aplicarEstilosUxModo(modo);
                }
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [location.pathname, isAuthenticated, user?.uxModo]);

    return null; // Este componente no renderiza nada
}

