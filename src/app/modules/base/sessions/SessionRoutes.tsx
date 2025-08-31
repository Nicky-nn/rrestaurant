import React, { lazy } from 'react'

import Loadable from '../../../base/components/Template/Loadable/Loadable'
import NotFound from './NotFound'

// const NotFound = Loadable(lazy(() => import('./NotFound')))
const ForgotPassword = Loadable(lazy(() => import('./ForgotPassword')))
const JwtLogin = Loadable(lazy(() => import('./login/JwtLogin')))
const JwtRegister = Loadable(lazy(() => import('./register/JwtRegister')))

/**
 * Estructura de rutas para la sesión
 * @author isi-template
 */
export const sessionRoutesMap = {
  signup: {
    path: '/session/signup',
    name: 'Registrar',
  },
  signin: {
    path: '/session/signin',
    name: 'Iniciar Sesión',
  },
  forgotPassword: {
    path: '/session/forgot-password',
    name: 'Olvistaste tu contraseña?',
  },
  s404: {
    path: '/session/404',
    name: 'Error 404',
  },
}

/**
 * Estructura de rutas para cargar la sesión
 * @author isi-template
 */
const sessionRoutes = [
  {
    path: sessionRoutesMap.signup.path,
    element: <JwtRegister />,
  },
  {
    path: sessionRoutesMap.signin.path,
    element: <JwtLogin />,
  },
  {
    path: sessionRoutesMap.forgotPassword.path,
    element: <ForgotPassword />,
  },
  {
    path: sessionRoutesMap.s404.path,
    element: <NotFound />,
  },
]

export default sessionRoutes
