# Rutas protegidas por permisos (nuevo)

Este documento describe la nueva funcionalidad implementada para proteger rutas y filtrar el menú lateral según los permisos del usuario.

Fecha: 17-10-2025  
Rama: `feature/control-usuarios`

## Objetivos

- Proteger automáticamente TODAS las rutas de la app en base a permisos del backend.
- Filtrar dinámicamente el menú lateral (Sidenav) mostrando solo las opciones permitidas para el usuario.
- Centralizar la construcción y verificación de permisos usando el dominio configurado en variables de entorno.
- Ofrecer un modo de depuración (debug) para diagnosticar accesos denegados.

## Arquitectura y flujo

1. Al montar la aplicación, se obtiene la lista de permisos del usuario para el dominio activo por medio de GraphQL.
2. El componente `RouteGuard` envuelve el `Layout` y verifica el acceso a la ruta actual con base en la configuración de navegaciones.
3. El `Sidenav` usa `useFilteredNavigations` para filtrar el menú y solo mostrar entradas con permisos.
4. Las utilidades en `menuPermissionFilter.ts` estandarizan la generación/chequeo de permisos.

### Fuentes de datos

- Backend GraphQL: query `misRolesPermisoPorDominio(dominio: String!)`.
- Variable de entorno `import.meta.env.ISI_DOMINIO` para el dominio.

🆕 Archivos Nuevos (Implementados desde cero)
🔹 API y Hooks

src/app/base/api/apiRolesPermisoDominio.ts
→ Obtiene los permisos del backend (misRolesPermisoPorDominio).

src/app/base/hooks/useMisRolesPermisoDominio.ts
→ Hook que usa React Query para exponer permisos { permisos, loading, error, refetch }.

🔹 Filtrado y Seguridad

src/app/hooks/useFilteredNavigations.ts
→ Filtra el menú lateral (navigations) según los permisos del usuario.

src/app/components/RouteGuard.tsx
→ Protege rutas según los permisos obtenidos del backend.

src/app/utils/menuPermissionFilter.ts
→ Funciones auxiliares para construir y normalizar claves de permiso.
(ej. buildPermissionKey, normalizeString, hasPermission)

🔹 Breadcrumbs (detección automática de jerarquía)

src/app/base/hooks/useBreadcrumbDetector.ts
→ Detecta la jerarquía de navegación según la URL actual.

src/app/base/context/BreadcrumbContext.tsx
→ Contexto que guarda y expone la jerarquía del breadcrumb.

🔹 Sistema de decoradores de permisos

src/app/contexts/SecurityContext.tsx
→ Nuevo contexto global de seguridad que gestiona los permisos del usuario.
Provee useSecurity() y funciones como hasActionPermission(action).

src/app/security/withSecurity.tsx
→ Decorador (HOC) para proteger componentes o botones según permisos (action o staticPermission).

src/app/security/index.ts
→ Exportaciones centralizadas (withSecurity, SecureComponent).

src/app/security/ejemploUso.tsx
→ Archivo demostrativo con ejemplos de uso de withSecurity y SecureComponent.

✏️ Archivos Modificados

src/App.tsx
→ Se agregó el SecurityProvider que envuelve toda la aplicación:

<SettingsProvider>
  <AuthProvider>
    <BreadcrumbProvider>
      <SecurityProvider>
        {/* resto de la app */}
      </SecurityProvider>
    </BreadcrumbProvider>
  </AuthProvider>
</SettingsProvider>


src/app/base/components/Template/MatxLayout/MatxLayout.tsx
→ Se envolvió el layout principal con <RouteGuard> para proteger rutas.

src/app/base/components/Template/Sidenav/Sidenav.tsx
→ Se integró useMisRolesPermisoDominio + useFilteredNavigations para mostrar solo los menús autorizados.