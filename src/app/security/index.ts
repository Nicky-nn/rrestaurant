/**
 * Sistema de seguridad basado en permisos
 *
 * Exporta:
 * - withSecurity: Decorador HOC para proteger componentes
 * - SecureComponent: Componente wrapper para protección inline
 * - useSecurity: Hook para acceder al contexto de seguridad
 */

import { SecurityProvider, useSecurity } from '../base/contexts/SecurityContext'

export { SecureComponent, withSecurity } from './withSecurity'
