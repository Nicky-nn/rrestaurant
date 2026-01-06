import { useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useUxModo } from '../hooks/useUxModo';

/**
 * Componente que aplica el modo UX globalmente basándose en user.uxModo
 * Se ejecuta desde que se carga la aplicación
 */
export default function UxModoGlobalApplier() {
    const { user, isAuthenticated }: any = useAuth();

    // Aplicar el modo UX automáticamente
    useUxModo(isAuthenticated ? user?.uxModo : null);

    return null; // Este componente no renderiza nada
}

