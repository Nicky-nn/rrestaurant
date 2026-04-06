// noinspection ExceptionCaughtLocallyJS

import { PaletteMode } from '@mui/material'
import { jwtDecode } from 'jwt-decode'
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react'

import { swalException } from '../../utils/swal'
import { apiCuentaCambiarUxModo } from '../api/apiCuentaCambiarUxModo.ts'
import { apiLicenciaProducto } from '../api/apiLicenciaProducto'
import { apiValidarUsuario } from '../api/validarUsuario.api'
import MatxLoading from '../components/Template/MatxLoading/MatxLoading'
import useSettings from '../hooks/useSettings.ts'
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

// Es token válido
const isValidToken = (accessToken: string) => {
  if (!accessToken) return false
  const decodedToken: any = jwtDecode(accessToken)
  const currentTime = Date.now() / 1000
  return decodedToken.exp > currentTime
}

// Seteamos a storage la sesión
const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem(AccessToken, accessToken)
  } else {
    localStorage.removeItem(AccessToken)
  }
}

// Configuracion de reducer con acciones
const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'INIT':
    case 'LOGIN': // INIT y LOGIN suelen hacer lo mismo con el payload
    case 'REGISTER': {
      const { isAuthenticated, user, lw, li } = action.payload
      return {
        ...state,
        isAuthenticated: isAuthenticated !== undefined ? isAuthenticated : true,
        isInitialised: true,
        user,
        lw,
        li,
      }
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        isInitialised: true,
        user: initialState.user,
        lw: initialState.lw,
        li: initialState.li,
      }
    }
    case 'UPDATE_THEME': {
      const { theme } = action.payload
      return { ...state, user: { ...state.user, uxModo: theme as any } }
    }
    default: {
      return { ...state }
    }
  }
}

export const AuthContext = createContext({
  ...initialState,
  method: 'JWT',
  login: (shop: string, email: string, password: string) => Promise.resolve(),
  logout: () => {},
  register: () => Promise.resolve(),
  refreshUser: () => Promise.resolve(),
  updateTheme: (mode: PaletteMode) => Promise.resolve(),
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
  const { applyMode } = useSettings()

  // Helper para aplicar tema (seguro contra nulos y mayúsculas)
  const setTheme = useCallback((uxMode?: string | null) => {
    const mode = !uxMode || uxMode === 'SYSTEM' ? 'light' : (uxMode.toLowerCase() as 'light' | 'dark')
    applyMode(mode)
  }, [applyMode])

  // Queremos resetear a thema por default light
  const resetTheme = () => {
    applyMode('light')
  }

  const handleSessionCleanUp = useCallback(() => {
    setSession(null)
    applyMode('light')
    dispatch({ type: 'LOGOUT' })
  }, [applyMode])

  /**
   * @description login de usuario
   * @param shop
   * @param email
   * @param password
   */
  const login = useCallback(
    async (shop: string, email: string, password: string) => {
      try {
        const user: UserProps = await loginModel(shop, email, password)
        // Validación temprana: si no hay token, fallar antes de llamar a otras APIs
        if (!user?.token) throw new Error('Error al obtener credenciales, intente nuevamente')
        const validarUsuario = await apiValidarUsuario(user.token)
        const { lw, li } = await apiLicenciaProducto(user.token)
        if (validarUsuario) {
          setSession(user.token)
          setTheme(user.perfil.uxModo)
          dispatch({
            type: 'LOGIN',
            payload: {
              user: user.perfil,
              lw,
              li,
            },
          })
        } else {
          throw new Error(
            `No cuenta con permisos para acceder al sistema; verifique url Comercio o consulte los permisos con el administrador del sistema`,
          )
        }
      } catch (error: any) {
        handleSessionCleanUp()
        throw error
      }
    },
    [handleSessionCleanUp, setTheme],
  )

  const register = async (email: string, username: string, password: string) => {
    // Implementacion pendiente
  }

  // Cuando se cierra la sesión
  const logout = useCallback(() => {
    handleSessionCleanUp()
  }, [handleSessionCleanUp])

  /**
   * @description refresca el usuario
   */
  const refreshUser = async () => {
    const accessToken = window.localStorage.getItem(AccessToken)
    const perfil: PerfilProps = await perfilModel()
    const { lw, li } = await apiLicenciaProducto(accessToken || '')
    setTheme(perfil.uxModo)
    dispatch({
      type: 'LOGIN',
      payload: {
        user: perfil,
        lw,
        li,
      },
    })
  }

  // Actualizamos el thema uxModo
  const updateTheme = useCallback(
    async (mode: PaletteMode) => {
      applyMode(mode)
      try {
        await apiCuentaCambiarUxModo(mode.toUpperCase())
        dispatch({
          type: 'UPDATE_THEME',
          payload: {
            theme: mode.toUpperCase(),
          },
        })
      } catch (err) {
        swalException(err)
      }
    },
    [applyMode],
  )

  // Inicio del sistema
  useEffect(() => {
    ;(async () => {
      try {
        const accessToken = window.localStorage.getItem(AccessToken)
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken)
          const [user, validarUsuario, licencias] = await Promise.all([
            perfilModel(),
            apiValidarUsuario(accessToken),
            apiLicenciaProducto(accessToken),
          ])

          if (validarUsuario) {
            setTheme(user.uxModo)
            dispatch({
              type: 'INIT',
              payload: {
                isAuthenticated: true,
                user,
                lw: licencias.lw,
                li: licencias.li,
              },
            })
          } else {
            throw new Error(
              `No cuenta con permisos para acceder al sistema; verifique url Comercio o consulte los permisos con el administrador del sistema`,
            )
          }
        } else {
          handleSessionCleanUp()
        }
      } catch (err) {
        swalException(err)
        console.error(err) // Log para debug
        handleSessionCleanUp()
      }
    })()
  }, [handleSessionCleanUp, setTheme])

  // Memorizamos el value
  const contextValue = useMemo(
    () => ({
      ...state,
      method: 'JWT',
      login,
      logout,
      register,
      refreshUser,
      updateTheme,
    }),
    [state, login, logout, register, refreshUser, updateTheme],
  )

  if (!state.isInitialised) {
    return <MatxLoading />
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
