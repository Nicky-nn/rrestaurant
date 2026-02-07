import { Suspense } from 'react'

import MatxLoading from '../../../base/components/Template/MatxLoading/MatxLoading.tsx'

/**
 * Higher-Order Component, nos permite aplicar Cargado de datos, antes de descargar el contenido del módulo
 * Ejemplo
 * const DeaGestion = Loadable(lazy(() => import('./view/DeaGestion')));
 * @param Component
 * @constructor
 * @author isi-template
 */
export const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<MatxLoading />}>
    <Component {...props} />
  </Suspense>
)

/**
 * Este es un componente estándar de React que recibe a otro componente como una prop.
 * nos permite aplicar Cargado de datos, antes de descargar el contenido del módulo
 * Ejemplo
 * {
 *     path: deaRoutesMap.actualizar.path,
 *     element: <LoadableComponent component={DeaFormulario} />,
 *     auth: authRoles.admin,
 *},
 * @param Component
 * @constructor
 */
export const LoadableComponent = ({ component: Component }: any) => {
  return (
    <Suspense fallback={<MatxLoading />}>
      <Component />
    </Suspense>
  )
}
