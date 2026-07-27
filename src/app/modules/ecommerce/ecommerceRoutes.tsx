import { lazy } from 'react';
import { authRoles } from '../../../auth/authRoles';

const EcommercePage = lazy(() => import('./pages/EcommercePage'));
const RepartidoresPage = lazy(() => import('./pages/RepartidoresPage'));

export const ecommerceRoutesMap = {
  ecommerce: {
    path: '/ecommerce',
    name: 'Ecommerce',
    action: 'GESTION_ECOMMERCE',
  },
  repartidores: {
    path: '/ecommerce/repartidores',
    name: 'Repartidores',
    action: 'GESTION_ECOMMERCE',
  }
};

const ecommerceRoutes = [
  {
    path: ecommerceRoutesMap.ecommerce.path,
    element: <EcommercePage />,
    auth: authRoles.admin,
  },
  {
    path: ecommerceRoutesMap.repartidores.path,
    element: <RepartidoresPage />,
    auth: authRoles.admin,
  },
];

export default ecommerceRoutes;
