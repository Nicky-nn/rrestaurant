import React, { ComponentType, FC } from 'react'

import { useSecurity } from '../base/contexts/SecurityContext'

interface WithSecurityOptions {
  /**
   * Acción específica que se requiere para mostrar el componente
   * Usa la jerarquía automática del breadcrumb
   * Ejemplo: "anular", "editar", "eliminar", "crear"
   */
  action?: string

  /**
   * Permiso estático completo (sin usar jerarquía automática)
   * El desarrollador especifica toda la ruta excepto el dominio
   * Ejemplo: "VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:ANULAR"
   * Se construirá como: REST:VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:ANULAR
   */
  staticPermission?: string

  /**
   * Si es true, renderiza children aunque no tenga permiso pero invisible (display: none)
   * Útil para mantener el layout. Por defecto es false (no renderiza nada).
   */
  keepInDom?: boolean
}

/**
 * Higher Order Component (HOC) que envuelve componentes para controlar su visibilidad
 * según los permisos del usuario.
 *
 * @example
 * ```tsx
 * const SecureButton = withSecurity({ action: "anular" })(
 *   <Button>ANULAR</Button>
 * )
 * ```
 */
export function withSecurity(options: WithSecurityOptions) {
  return function <P extends object>(WrappedComponent: ComponentType<P> | React.ReactElement) {
    const WithSecurityComponent: FC<P> = (props) => {
      const { hasActionPermission, hasStaticPermission, loading } = useSecurity()
      const { action, staticPermission, keepInDom = false } = options

      // Mientras carga, no mostramos nada (o podrías mostrar un skeleton)
      if (loading) {
        return null
      }

      // Validar que se proporcione action O staticPermission, no ambos
      if (action && staticPermission) {
        console.error('withSecurity: No se puede usar action y staticPermission al mismo tiempo')
        return null
      }

      if (!action && !staticPermission) {
        console.error('withSecurity: Debe proporcionar action o staticPermission')
        return null
      }

      // Verificar el permiso según el tipo
      const hasPermission = staticPermission
        ? hasStaticPermission(staticPermission)
        : hasActionPermission(action!)

      // Si no tiene permiso
      if (!hasPermission) {
        if (keepInDom) {
          return <div style={{ display: 'none' }} />
        }
        return null
      }

      // Si tiene permiso, renderiza el componente
      if (React.isValidElement(WrappedComponent)) {
        return WrappedComponent
      }

      const Component = WrappedComponent as ComponentType<P>
      return <Component {...props} />
    }

    WithSecurityComponent.displayName = `withSecurity(${getDisplayName(WrappedComponent)})`

    return WithSecurityComponent
  }
}

/**
 * Versión alternativa que funciona como decorador de componentes funcionales
 * Útil para componentes más complejos
 */
export const SecureComponent: FC<WithSecurityOptions & { children: React.ReactNode }> = ({
  action,
  staticPermission,
  keepInDom = false,
  children,
}) => {
  const { hasActionPermission, hasStaticPermission, loading } = useSecurity()

  if (loading) {
    return null
  }

  // Validar que se proporcione action O staticPermission, no ambos
  if (action && staticPermission) {
    console.error('SecureComponent: No se puede usar action y staticPermission al mismo tiempo')
    return null
  }

  if (!action && !staticPermission) {
    console.error('SecureComponent: Debe proporcionar action o staticPermission')
    return null
  }

  // Verificar el permiso según el tipo
  const hasPermission = staticPermission
    ? hasStaticPermission(staticPermission)
    : hasActionPermission(action!)

  if (!hasPermission) {
    if (keepInDom) {
      return <div style={{ display: 'none' }}>{children}</div>
    }
    return null
  }

  return <>{children}</>
}

// Utility para obtener el nombre del componente
function getDisplayName(WrappedComponent: any): string {
  if (React.isValidElement(WrappedComponent)) {
    return WrappedComponent.type?.toString() || 'Component'
  }
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
