import { AuditoriaProps } from './index.ts'

/**
 * @description Se usa en las tablas relacionadas
 * @author isi-template
 */
export interface ProveedorOperacionProps {
  _id?: string
  codigo: string
  nombre: string
  direccion: string
  ciudad: string
  contacto: string
  correo: string
  telefono: string
  notas: string
}

/**
 * @description Tabla de proveedor
 * @author isi-template
 */
export interface ProveedorProps extends ProveedorOperacionProps, AuditoriaProps {
  state?: string
}

/**
 * @author isi-template
 */
export interface ProveedorInputProps {
  codigo: string
  nombre: string
  direccion: string
  ciudad: string
  contacto: string
  correo: string
  telefono: string
  notas: string
}

/**
 * @author isi-template
 */
export interface ProveedorActualizarInputProps {
  nombre: string
  direccion: string
  ciudad: string
  contacto: string
  correo: string
  telefono: string
  notas: string
}

/**
 * @author isi-template
 */
export const PROVEEDOR_DEFAULTS: ProveedorInputProps = {
  codigo: '',
  nombre: '',
  direccion: '',
  ciudad: '',
  contacto: '',
  correo: '',
  telefono: '',
  notas: '',
}

/**
 * @author isi-template
 */
export interface ProveedorApiInputProps {
  ciudad: string
  codigo: string
  contacto: string
  correo: string
  direccion: string
  nombre: string
  notas: string
  telefono: string
}
