/**
 * Tipado de los datos parametricos que contengan valores de codigoClasificador y descripcion
 */
export interface ClasificadorProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * Estados globales de los registros
 * Se recomiendo crear su propio apiestado para cada uno de los módulos
 */
export const apiEstado = {
  elaborado: 'ELABORADO',
  aprobado: 'APROBADO',
  validada: 'VALIDADA',
  completado: 'COMPLETADO',
  finalizado: 'FINALIZADO',
  pendiente: 'PENDIENTE',
  observado: 'OBSERVADO',
  paqueteObservado: 'OBSERVADA',
  anulado: 'ANULADO',
  eliminado: 'ELIMINADO',
  rechazado: 'RECHAZADA',
}

/**
 * Acciones para el formulario, se usa para reutilización de formulacios
 */
export type ActionFormProps = 'REGISTER' | 'UPDATE' | 'DELETE'

/**
 * Tipado de acciones para la implementación de formularios
 */
export const actionForm: Record<ActionFormProps, ActionFormProps> = {
  REGISTER: 'REGISTER',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
}

/**
 * Auditoria de los registros
 */
export interface AuditoriaProps {
  usucre: string
  createdAt: string
  usumod: string
  updatedAt: string
}

/**
 * Información de paginación usada en las apis
 */
export interface PageInfoProps {
  hasNextPage: boolean
  hasPrevPage: boolean
  totalDocs: number
  limit: number
  page: number
  totalPages: number
}

/**
 * Información de paginación por defecto
 */
export const PAGE_INFO_DEFAULT: PageInfoProps = {
  hasNextPage: false,
  hasPrevPage: false,
  totalDocs: 10,
  limit: 10,
  page: 1,
  totalPages: 1,
}

/**
 * Argumentos de paginación para las apis
 */
export interface PageProps {
  limit: number
  page: number
  reverse: boolean
  query?: string
}

/**
 * Tipado para las paginaciones
 */
export interface PageInputProps {
  limit: number
  page: number
  reverse: boolean
  query?: string
}

export interface PlantillaDetalleExtra {
  _id: string // identificador primario
  type: string // HEADER | FOOTER
  title: string
  description: string
  content: string
}

export const PAGE_DEFAULT: PageInputProps = {
  limit: 10,
  page: 0,
  reverse: true,
  query: '',
}

/**
 * Tipado de entidad para la implementación de formularios
 */
export interface EntidadInputProps {
  codigoSucursal: number
  codigoPuntoVenta: number
}
