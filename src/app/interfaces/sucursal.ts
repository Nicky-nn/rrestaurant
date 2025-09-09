import { ActionFormProps } from './index'

/**
 * Tipado para objectos departamentos
 * @author isi-template
 */
export interface DepartamentoProps {
  codigo: number
  codigoPais: number
  departamento: string
  sigla: string
}

/**
 * Tipado para objectos sucursales
 * @author isi-template
 */
export interface SucursalProps {
  _id: string
  codigo: number
  departamento: DepartamentoProps
  direccion: string
  municipio: string
  telefono: string
  integracionSiat: boolean
  state: string
  usucre: string
  usumod: string
  createdAt: string
  updatedAt: string
}

/**
 * Tipado para los argumentos o inputs de las sucursales
 * @author isi-template
 */
export interface SucursalInputProps {
  codigo: number
  direccion: string
  telefono: string
  departamento: DepartamentoProps | null
  municipio: string
  integracionSiat?: boolean
  action: ActionFormProps
}

/**
 * Tipado para los argumentos o inputs  de las sucursales para las apis
 * @author isi-template
 */
export interface SucursalInputApiProps {
  codigo: number
  direccion: string
  telefono: string
  departamento: number
  municipio: string
}
