import { lazy } from 'react';
import { authRoles } from '../../../auth/authRoles';

const EcommercePage = lazy(() => import('./pages/EcommercePage'));

export const ecommerceRoutesMap = {
  ecommerce: {
    path: '/ecommerce',
    name: 'Ecommerce',
    action: 'GESTION_ECOMMERCE',
  },
};

const ecommerceRoutes = [
  {
    path: ecommerceRoutesMap.ecommerce.path,
    element: <EcommercePage />,
    auth: authRoles.admin,
  },
];

export default ecommerceRoutes;
