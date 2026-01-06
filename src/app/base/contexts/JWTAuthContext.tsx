import { jwtDecode } from 'jwt-decode'
import React, { createContext, ReactNode, useEffect, useReducer } from 'react'

import { swalException } from '../../utils/swal'
import { apiLicenciaProducto } from '../api/apiLicenciaProducto'
import { apiValidarUsuario } from '../api/validarUsuario.api'
import MatxLoading from '../components/Template/MatxLoading/MatxLoading'
import { LicenciaProductoProps } from '../interfaces/licenciaProducto'
import { loginModel, PerfilProps, UserProps } from '../models/loginModel'
import { AccessToken } from '../models/paramsModel'
import { perfilModel } from '../models/perfilModel'

type LicenciaProps = {
  activo: boolean
  licencia: LicenciaProductoProps
}

type InitialStateProps = {
  isAuthenticated: boolean
  isInitialised: boolean
  user: PerfilProps
  lw: LicenciaProps // Licencia de whatsapp
  li: LicenciaProps // licencia de impresion
}
const initialState: InitialStateProps = {
  isAuthenticated: false,
  isInitialised: false,
  user: {} as PerfilProps,
  lw: {
    activo: false,
    licencia: {} as LicenciaProductoProps,
  },
  li: {
    activo: false,
    licencia: {} as LicenciaProductoProps,
  },
}

const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false
  }

  const decodedToken: any = jwtDecode(accessToken)
  const currentTime = Date.now() / 1000
  return decodedToken.exp > currentTime
}

const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken)
    // axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    localStorage.removeItem('accessToken')
    // delete axios.defaults.headers.common.Authorization
  }
}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'INIT': {
      const { isAuthenticated, user, lw, li } = action.payload

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user,
        lw,
        li,
      }
    }
    case 'LOGIN': {
      const { user, lw, li } = action.payload

      return {
        ...state,
        isAuthenticated: true,
        user,
        lw,
        li,
      }
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        user: {},
        lw: {},
        li: {},
      }
    }
    case 'REGISTER': {
      const { user, lw, li } = action.payload

      return {
        ...state,
        isAuthenticated: true,
        user,
        lw,
        li,
      }
    }
    default: {
      return { ...state }
    }
  }
}

const AuthContext = createContext({
  ...initialState,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => { },
  register: () => Promise.resolve(),
  refreshUser: () => Promise.resolve(),
})

export interface AuthProviderProps {
  children: ReactNode
}

/**
 * @description Proveedor de autenticación
 * @param children
 * @constructor
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  /**
   * @description login de usuario
   * @param shop
   * @param email
   * @param password
   */
  const login = async (shop: string, email: string, password: string) => {
    const user: UserProps = await loginModel(shop, email, password)
    const validarUsuario = await apiValidarUsuario(user.token)
    const { lw, li } = await apiLicenciaProducto(user.token)
    if (validarUsuario) {
      setSession(user.token)
      dispatch({
        type: 'LOGIN',
        payload: {
          user: user.perfil,
          lw,
          li,
        },
      })
    } else {
      setSession(null)
      dispatch({ type: 'LOGOUT' })
      throw new Error(
        `No cuenta con permisos para acceder al sistema; verifique url Comercio o consulte los permisos con el administrador del sistema`,
      )
    }
  }
  const register = async (email: string, username: string, password: string) => {
    /*
            const response = await axios.post('/api/auth/register', {
                email,
                username,
                password,
            })

            const {accessToken, user} = response.data

            setSession(accessToken)

            dispatch({
                type: 'REGISTER',
                payload: {
                    user,
                },
            })
            */
  }

  const logout = () => {
    setSession(null)
    dispatch({ type: 'LOGOUT' })
  }

  /**
   * @description refresca el usuario
   */
  const refreshUser = async () => {
    const accessToken = window.localStorage.getItem(AccessToken)
    const perfil: PerfilProps = await perfilModel()
    const { lw, li } = await apiLicenciaProducto(accessToken || '')
    dispatch({
      type: 'LOGIN',
      payload: {
        user: perfil,
        lw,
        li,
      },
    })
  }

  useEffect(() => {
    ; (async () => {
      try {
        const accessToken = window.localStorage.getItem(AccessToken)
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken)
          const user = await perfilModel()
          const validarUsuario = await apiValidarUsuario(accessToken)
          const { lw, li } = await apiLicenciaProducto(accessToken)
          if (validarUsuario) {
            dispatch({
              type: 'INIT',
              payload: {
                isAuthenticated: true,
                user,
                lw,
                li,
              },
            })
          } else {
            dispatch({
              type: 'INIT',
              payload: {
                isAuthenticated: false,
                user: {},
                lw,
                li,
              },
            })
            throw new Error(
              `No cuenta con permisos para acceder al sistema; verifique url Comercio o consulte los permisos con el administrador del sistema`,
            )
          }
        } else {
          dispatch({
            type: 'INIT',
            payload: {
              isAuthenticated: false,
              user: {},
              lw: {},
              li: {},
            },
          })
        }
      } catch (err) {
        swalException(err)
        dispatch({
          type: 'INIT',
          payload: {
            isAuthenticated: false,
            user: {},
            lw: {},
            li: {},
          },
        })
      }
    })()
  }, [])

  if (!state.isInitialised) {
    return <MatxLoading />
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
