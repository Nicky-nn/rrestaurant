import { lazy } from 'react'

import { authRoles } from '../../../auth/authRoles'

const AdsApp = lazy(() => import('./view/Ads'))

export const adsRoutesMap = {
  gestion: {
    path: '/ads/gestion',
    name: 'Gestión de Anuncios',
    action: 'GESTION_DE_ANUNCIOS',
  },
}

const adsRoutes = [
  {
    path: adsRoutesMap.gestion.path,
    element: <AdsApp />,
    auth: authRoles.admin,
  },
]

export default adsRoutes
