import { lazy } from "react";
import { authRoles } from "../../../auth/authRoles";

const EcommercePage = lazy(() => import("./pages/EcommercePage"));
const RepartidoresPage = lazy(() => import("./pages/RepartidoresPage"));
const EcommerceConfigPage = lazy(() => import("./pages/EcommerceConfigPage"));
const ReservasPage = lazy(() => import("./pages/ReservasPage"));

export const ecommerceRoutesMap = {
  ecommerce: {
    path: "/ecommerce",
    name: "Ecommerce",
    action: "GESTION_ECOMMERCE",
  },
  reservas: {
    path: "/ecommerce/reservas",
    name: "Pedidos Programados",
    action: "GESTION_ECOMMERCE",
  },
  repartidores: {
    path: "/ecommerce/repartidores",
    name: "Repartidores",
    action: "GESTION_ECOMMERCE",
  },
  config: {
    path: "/ecommerce/configuracion",
    name: "Configuración Tienda",
    action: "GESTION_ECOMMERCE",
  },
};

const ecommerceRoutes = [
  {
    path: ecommerceRoutesMap.ecommerce.path,
    element: <EcommercePage />,
    auth: authRoles.admin,
  },
  {
    path: ecommerceRoutesMap.reservas.path,
    element: <ReservasPage />,
    auth: authRoles.admin,
  },
  {
    path: ecommerceRoutesMap.repartidores.path,
    element: <RepartidoresPage />,
    auth: authRoles.admin,
  },
  {
    path: ecommerceRoutesMap.config.path,
    element: <EcommerceConfigPage />,
    auth: authRoles.admin,
  },
];

export default ecommerceRoutes;
