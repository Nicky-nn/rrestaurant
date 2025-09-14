import React, { FC, ReactElement, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import useAuth from '../app/base/hooks/useAuth'
import { PerfilProps } from '../app/base/models/loginModel'
import { appRoutes } from '../app/routes/routes'
import { isEmptyValue } from '../app/utils/helper'
import { flat } from '../app/utils/utils'

/**
 * Verificamos si el usuario tiene acceso a cierto rol
 * @author isi-template
 * @param pathname
 * @param user
 * @param routes
 */
const userHasPermission = (pathname: string, user: PerfilProps, routes: any) => {
  try {
    if (isEmptyValue(user)) {
      return false
    }
    const matched = routes.find((r: any) => r.path === pathname)
    return matched && matched.auth && matched.auth.length
      ? matched.auth.includes(user.tipo)
      : true
  } catch (e: any) {
    return false
  }
}

type Props = {
  children: ReactElement | ReactElement[]
}

/**
 * Verificación de rutas de sesión
 * @author isi-template
 * @param children
 * @constructor
 */
const AuthGuard: FC<Props> = ({ children }: Props) => {
  const { pathname } = useLocation()
  try {
    const { isAuthenticated, user } = useAuth()
    const routes = useMemo(() => flat(appRoutes), [])
    // tiene permisos?
    const hasPermission = userHasPermission(pathname, user, routes)
    // IF YOU NEED ROLE BASED AUTHENTICATION,
    // UNCOMMENT ABOVE TWO LINES, getUserRoleAuthStatus METHOD AND user VARIABLE
    // AND COMMENT OUT BELOW LINE
    const authenticated = isAuthenticated && hasPermission
    console.log(pathname, authenticated)

    if (!authenticated) {
      return <Navigate replace to="/session/signin" state={{ from: pathname }} />
    }
    return children
  } catch (e) {
    return <Navigate replace to="/session/signin" state={{ from: pathname }} />
  }
}

export default AuthGuard
