/**
 * Tipado de los datos parametricos que contengan valores de codigoClasificador y descripcion
 * @author isi-template
 */
export interface ClasificadorProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * Estados globales de los registros
 * Se recomiendo crear su propio apiestado para cada uno de los módulos
 * @author isi-template
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
  consultar: 'CONSULTAR',
}

/**
 * Acciones para el formulario, se usa para reutilización de formulacios
 * @author isi-template
 */
export type ActionFormProps = 'REGISTER' | 'UPDATE' | 'DELETE' | 'CONSULT' | 'CANCEL'

/**
 * Tipado de acciones para la implementación de formularios
 * @author isi-template
 */
export const actionForm: Record<ActionFormProps, ActionFormProps> = {
  REGISTER: 'REGISTER',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  CONSULT: 'CONSULT',
  CANCEL: 'CANCEL',
}

/**
 * Auditoria de los registros
 * @author isi-template
 */
export interface AuditoriaProps {
  usucre: string
  createdAt: string
  usumod: string
  updatedAt: string
}

/**
 * Información de paginación usada en las apis
 * @author isi-template
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
 * @author isi-template
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
 * @author isi-template
 */
export interface PageProps {
  limit: number
  page: number
  reverse: boolean
  query?: string
}

/**
 * Tipado para las paginaciones
 * @author isi-template
 */
export interface PageInputProps {
  limit: number
  page: number
  reverse: boolean
  query?: string
  extraQuery?: string
}

/**
 * @author isi-template
 */
export interface PlantillaDetalleExtra {
  _id: string // identificador primario
  type: string // HEADER | FOOTER
  title: string
  description: string
  content: string
}

/**
 * @author isi-template
 */
export const PAGE_DEFAULT: PageInputProps = {
  limit: 10,
  page: 0,
  reverse: true,
  query: '',
}

/**
 * Tipado de entidad para la implementación de formularios
 * @author isi-template
 */
export interface EntidadInputProps {
  codigoSucursal: number
  codigoPuntoVenta: number
}
