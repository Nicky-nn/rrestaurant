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

## Archivos nuevos/modificados

- NUEVO: `src/app/base/api/apiRolesPermisoDominio.ts`
  - Llama a GraphQL para obtener `misRolesPermisoPorDominio` retornando `string[]`.
- NUEVO: `src/app/base/hooks/useMisRolesPermisoDominio.ts`
  - Hook con React Query que expone `{ permisos, loading, error, refetch }`.
- NUEVO: `src/app/hooks/useFilteredNavigations.ts`
  - Hook que filtra `NavigationProps[]` según permisos del usuario. Soporta `debug` y `showEmptyParents`.
- NUEVO: `src/app/components/RouteGuard.tsx`
  - Componente que envuelve toda la app y protege rutas. Modo debug opcional.
- NUEVO: `src/app/utils/menuPermissionFilter.ts`
  - Utilidades: `normalizeString`, `buildPermissionKey`, `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `getDominioFromEnv`, `buildPermissionFromEnv`.
- NUEVO  `src/app/base/hooks/useBreadcrumbDetector.ts`
  - Componente que detecta automáticamente la jerarquía de navegación (breadcrumb) según la URL actual.
- NUEVO  `src/app/base/context/BreadcrumbContext.tsx`
  - Contexto que engloba los breadcrumbs, es decir, el “almacén central” donde se guarda y comparte la información que detecta tu hook useBreadcrumbDetector.

- MODIFICADO: `src/app/base/components/Template/MatxLayout/MatxLayout.tsx`
  - Se envuelve el `Layout` con `<RouteGuard>...</RouteGuard>`.
- MODIFICADO: `src/app/base/components/Template/Sidenav/Sidenav.tsx`
  - Integra `useMisRolesPermisoDominio` y `useFilteredNavigations` para mostrar menú filtrado.

## Cómo funciona la verificación de acceso

- Se definen rutas públicas que siempre son accesibles: `/login`, `/session`, `/404`, `/error`.
- La página principal `/` y `/home` se consideran accesibles sin permiso.
- Para otras rutas, `RouteGuard` busca el item correspondiente en `useNavigations()` y construye la clave de permiso con `buildPermissionFromEnv(seccion, accion)`.
- Si la ruta no existe en el mapa de navegación, por seguridad se deniega el acceso.
- Si existe, se evalúa contra los permisos del usuario con `hasPermission`.
- Cuando `loading` (cargando permisos) muestra un placeholder; si el acceso se deniega, presenta una pantalla de error.

## Filtrado del menú lateral

`Sidenav` pasa los permisos y la lista base de navegaciones a `useFilteredNavigations`:

- Los labels (`type: 'label'`) siempre se muestran.
- La página principal (path `/`, o `name` Home/Página Principal, o icono `home`) siempre se muestra.
- Los grupos se procesan recursivamente y se conservan solo si al menos un hijo queda visible.
- Items directos requieren permiso: clave construida desde el `parentName` y el `item.name`.

## Convención de claves de permiso

Se utiliza el formato: `DOMINIO:SECCION:ACCION`.

- `DOMINIO` proviene de `ISI_DOMINIO` (p. ej., `REST`, `POS`, `ADMIN`).
- `SECCION` y `ACCION` provienen de `name` del grupo y del item en `useNavigations()`.
- Las partes se normalizan: mayúsculas, sin acentos, espacios/guiones/puntos a `_` y solo caracteres `[A-Z0-9_:]`.
- Ejemplo: `Ventas y Pedidos > Registrar Pedido` en dominio `REST` → `REST:VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO`.

## Requisitos y dependencias

- React, React Router.
- `@tanstack/react-query` para el hook de permisos.
- `graphql-request` para la llamada al backend.
- Variables de entorno definidas:
  - `ISI_DOMINIO`: dominio activo para construir claves de permiso.

## Activación del modo debug

- Para ver logs de diagnóstico en consola:
  - `RouteGuard`: prop `isDebug={true}`.
  - `useFilteredNavigations`: opción `debug: true`.

## Puntos de extensión

- Añadir nuevas reglas de rutas públicas dentro de `RouteGuard` si se requiere.
- Ajustar la heurística de "Home" en `useFilteredNavigations` si cambia la navegación.
- Incluir `showEmptyParents: true` si se quiere mostrar grupos sin hijos.

## Ejemplo de navegación y permisos

Dado el siguiente item:

```ts
{
  name: 'Ventas y Pedidos',
  children: [
    { name: 'Registrar Pedido', path: '/pedidos/registrar' }
  ]
}
```

- Ruta `/pedidos/registrar` requerirá permiso `DOMINIO:VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO`.
- Si el usuario no posee el permiso, `RouteGuard` negará el acceso y el menú no mostrará ese item.

## Consideraciones de seguridad

- Si una ruta no existe en la configuración de `useNavigations`, el acceso se niega por defecto.
- Las claves de permiso se normalizan de manera consistente en frontend y deben corresponderse con backend.

## Próximos pasos sugeridos

- Añadir tests unitarios para `menuPermissionFilter` y `useFilteredNavigations`.
- Documentar el mapeo exacto de permisos por módulo (tabla de referencia).
- Añadir una pantalla de 403 dedicada y registro de auditoría opcional.


# Sistema de Control de Permisos con Decoradores

## 📋 Resumen

Se implementó un sistema completo de control de permisos basado en decoradores que detecta automáticamente la jerarquía de navegación y controla la visibilidad de componentes según los permisos del usuario obtenidos de la API.

## 🏗️ Estructura del Sistema

### Formato de Permisos API

Los permisos siguen la estructura:

```
[DOMINIO]:[MENÚ]:[SUBMENÚ_PADRE]:[SUBMENÚ_HIJO]:...[ACCIÓN]
```

Ejemplo real:

```
REST:VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:ANULAR
```

### Componentes Creados

1. **SecurityContext** (`src/app/contexts/SecurityContext.tsx`)
   - Context que maneja los permisos del usuario
   - Hook `useSecurity()` para acceder a los permisos
   - Función `hasActionPermission(action)` que verifica permisos automáticamente
   - Usa `useBreadcrumb()` para obtener la jerarquía actual
   - Normaliza y construye permisos en formato API

2. **withSecurity** (`src/app/security/withSecurity.tsx`)
   - Decorador HOC para proteger componentes
   - Componente `SecureComponent` para uso inline
   - Opción `keepInDom` para mantener elementos invisibles

3. **Index** (`src/app/security/index.ts`)
   - Exportaciones centralizadas del sistema

## 🚀 Uso

### Opción 1: Decorador (Recomendado)

```tsx
import { withSecurity } from '@/app/security'

const AnularButton = withSecurity({ action: 'anular' })(() => (
  <Button variant="contained" color="error">
    ANULAR
  </Button>
))

// Usar en el componente
<AnularButton />
```

### Opción 2: Componente Wrapper

```tsx
import { SecureComponent } from '@/app/security'
;<SecureComponent action="anular">
  <Button variant="contained" color="error">
    ANULAR
  </Button>
</SecureComponent>
```

### Opción 3: Con JSX Directo

```tsx
const SecureBox = withSecurity({ action: 'anular' })(
  <Box>
    <Button>ANULAR</Button>
  </Box>,
)
```

## ⚙️ Funcionamiento Automático

### Detección de Jerarquía

El sistema detecta automáticamente:

1. **Desde Breadcrumb**:

   ```
   ['Nota Crédito Débito', 'Gestión de Notas', 'Nueva Nota']
   ```

2. **Desde Navegación**:
   ```
   Ventas y Pedidos → Registrar Pedido
   ```

### Construcción de Permiso

1. Obtiene jerarquía del breadcrumb
2. Normaliza cada parte:
   - `'Ventas y Pedidos'` → `'VENTAS_Y_PEDIDOS'`
   - `'Registrar Pedido'` → `'REGISTRAR_PEDIDO'`
   - `'anular'` → `'ANULAR'`
3. Agrega dominio del environment (`ISI_DOMINIO`)
4. Construye: `REST:VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:ANULAR`
5. Verifica contra permisos del usuario

### Normalización

Usa `normalizeString()` de `menuPermissionFilter.ts`:

- Convierte a mayúsculas
- Elimina acentos
- Reemplaza espacios/guiones por underscores
- Elimina caracteres especiales

## 🔧 Integración

### App.tsx

```tsx
import { SecurityProvider } from './app/contexts/SecurityContext'
;<SettingsProvider>
  <AuthProvider>
    <BreadcrumbProvider>
      <SecurityProvider>{/* resto de la app */}</SecurityProvider>
    </BreadcrumbProvider>
  </AuthProvider>
</SettingsProvider>
```

### RouteGuard

Ya existente, obtiene permisos con:

```tsx
const { permisos, loading } = useMisRolesPermisoDominio()
```

### BreadcrumbContext

Ya existente, mantiene:

- `fullHierarchy`: Array con jerarquía completa
- `breadcrumbs`: Segmentos del breadcrumb
- `currentPath`: Ruta actual

## 🎯 Ventajas

1. **Automático**: No necesitas verificar manualmente cada ruta
2. **Declarativo**: Código limpio y fácil de leer
3. **Centralizado**: Un solo lugar para lógica de permisos
4. **Reutilizable**: Usa el decorador en cualquier componente
5. **Type-safe**: Completamente tipado con TypeScript
6. **Performance**: Usa Set para búsqueda O(1)

## 📝 Ejemplo Completo

Ver `src/app/security/ejemploUso.tsx` para ejemplos detallados de uso.

## 🔍 Casos de Uso

### Botones de Acciones

```tsx
<SecureComponent action="editar">
  <Button>EDITAR</Button>
</SecureComponent>

<SecureComponent action="eliminar">
  <Button>ELIMINAR</Button>
</SecureComponent>

<SecureComponent action="anular">
  <Button>ANULAR</Button>
</SecureComponent>
```

### Secciones Completas

```tsx
<SecureComponent action="ver_reportes">
  <Box>
    <Typography>Reportes Financieros</Typography>
    {/* contenido completo */}
  </Box>
</SecureComponent>
```

### Con Layout Preservado

```tsx
<SecureComponent action="anular" keepInDom>
  <Button>ANULAR</Button>
</SecureComponent>
```

## 🔐 Seguridad

- Los permisos se obtienen del backend vía API
- Se validan en el cliente para UX
- **IMPORTANTE**: Siempre validar en el backend también
- El frontend solo oculta UI, no previene llamadas API

## 📦 Archivos Creados

1. `src/app/contexts/SecurityContext.tsx` - Context de seguridad
2. `src/app/security/withSecurity.tsx` - Decorador HOC
3. `src/app/security/index.ts` - Exportaciones
4. `src/app/security/ejemploUso.tsx` - Ejemplos de uso

## 🔄 Archivos Modificados

1. `src/App.tsx` - Agregado `SecurityProvider`

## ✅ Estado

- ✅ Context de seguridad implementado
- ✅ Decorador withSecurity funcional
- ✅ Componente SecureComponent disponible
- ✅ Integración con breadcrumb
- ✅ Integración con permisos API
- ✅ Normalización automática
- ✅ Ejemplos documentados
- ✅ Tipado TypeScript completo

/\*\*

- EJEMPLO DE USO DEL SISTEMA DE PERMISOS CON DECORADORES
-
- Este archivo muestra cómo usar @withSecurity y SecureComponent
- para controlar la visibilidad de elementos según los permisos del usuario.
  \*/

```tsx
import { Box, Button, Grid } from '@mui/material'
import React from 'react'

import { SecureComponent, withSecurity } from '../security'

/**
 * EJEMPLO 1: Uso con el decorador @withSecurity (sintaxis preferida)
 *
 * El decorador oculta automáticamente el componente si el usuario no tiene
 * el permiso para la acción especificada.
 *
 * Basándose en la jerarquía actual del breadcrumb o ruta, construye el permiso:
 * Ejemplo: REST:VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:ANULAR
 */
export const EjemploConDecorador: React.FC = () => {
  // Componente con permiso de ANULAR
  const AnularButton = withSecurity({ action: 'anular' })(() => (
    <Button variant="contained" color="error">
      ANULAR
    </Button>
  ))

  // Componente con permiso de EDITAR
  const EditarButton = withSecurity({ action: 'editar' })(() => (
    <Button variant="contained" color="primary">
      EDITAR
    </Button>
  ))

  // Componente con permiso de ELIMINAR
  const EliminarButton = withSecurity({ action: 'eliminar' })(() => (
    <Button variant="contained" color="warning">
      ELIMINAR
    </Button>
  ))

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item>
          <AnularButton />
        </Grid>
        <Grid item>
          <EditarButton />
        </Grid>
        <Grid item>
          <EliminarButton />
        </Grid>
      </Grid>
    </Box>
  )
}

/**
 * EJEMPLO 2: Uso con SecureComponent (sintaxis alternativa)
 *
 * Útil cuando quieres envolver múltiples elementos o componentes más complejos
 */
export const EjemploConSecureComponent: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Solo se muestra si tiene permiso de ANULAR */}
        <SecureComponent action="anular">
          <Grid item>
            <Button variant="contained" color="error">
              ANULAR
            </Button>
          </Grid>
        </SecureComponent>

        {/* Solo se muestra si tiene permiso de EDITAR */}
        <SecureComponent action="editar">
          <Grid item>
            <Button variant="contained" color="primary">
              EDITAR
            </Button>
          </Grid>
        </SecureComponent>

        {/* Solo se muestra si tiene permiso de ELIMINAR */}
        <SecureComponent action="eliminar">
          <Grid item>
            <Button variant="contained" color="warning">
              ELIMINAR
            </Button>
          </Grid>
        </SecureComponent>
      </Grid>
    </Box>
  )
}

/**
 * EJEMPLO 3: Uso con JSX Elements directos
 *
 * Puedes usar withSecurity directamente con elementos JSX
 */
export const EjemploConJSXDirecto: React.FC = () => {
  // Envuelve directamente un Box completo
  const SecureBox = withSecurity({ action: 'anular' })(
    <Box>
      <Grid container spacing={2}>
        <Grid item>
          <Button variant="contained" color="error">
            ANULAR
          </Button>
        </Grid>
      </Grid>
    </Box>,
  )

  return <SecureBox />
}

/**
 * EJEMPLO 4: Uso con keepInDom (mantener en DOM pero invisible)
 *
 * Útil cuando necesitas mantener el layout pero ocultar el elemento
 */
export const EjemploConKeepInDom: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Se mantiene en el DOM con display: none si no tiene permiso */}
        <SecureComponent action="anular" keepInDom>
          <Grid item>
            <Button variant="contained" color="error">
              ANULAR (mantiene espacio)
            </Button>
          </Grid>
        </SecureComponent>
      </Grid>
    </Box>
  )
}
```

/\*\*

- CÓMO FUNCIONA EL SISTEMA:
-
- 1.  El sistema detecta automáticamente la jerarquía actual usando el breadcrumb:
- - Ejemplo: ['Ventas y Pedidos', 'Registrar Pedido']
-
- 2.  Normaliza la jerarquía y la acción:
- - 'Ventas y Pedidos' → 'VENTAS_Y_PEDIDOS'
- - 'Registrar Pedido' → 'REGISTRAR_PEDIDO'
- - 'anular' → 'ANULAR'
-
- 3.  Construye el permiso completo usando el dominio del environment:
- - Dominio (de ISI_DOMINIO): 'REST'
- - Resultado: 'REST:VENTAS_Y_PEDIDOS:REGISTRAR_PEDIDO:ANULAR'
-
- 4.  Compara con los permisos del usuario obtenidos de la API:
- - Si el permiso existe → muestra el componente
- - Si no existe → oculta el componente (o lo mantiene invisible con keepInDom)
-
- VENTAJAS:
- - No necesitas verificar manualmente cada ruta
- - Detección automática basada en breadcrumb
- - Código limpio y declarativo
- - Centralizado en el contexto de seguridad
    \*/

    // Permiso estático
<SecureComponent staticPermission="CLIENTES:GESTION_CLIENTES:EDITAR">
  <Button>EDITAR CLIENTE</Button>
</SecureComponent>

// Permiso automático
<SecureComponent action="editar">
  <Button>EDITAR</Button>
</SecureComponent>