import { AuditoriaProps } from './index.ts'

/**
 * @description Se usa en las tablas relacionadas
 * @author isi-template
 */
export interface ProveedorOperacionProps {
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
