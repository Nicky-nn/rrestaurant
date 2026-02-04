import { IconButtonProps, TableRowProps } from '@mui/material'
import { QueryFunctionContext, QueryKey } from '@tanstack/react-query'
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_TableOptions,
} from 'material-react-table'
import { ReactNode } from 'react'
import { LinkProps } from 'react-router-dom'

import { MrtActionParams } from './ActionIconButton.tsx'

/**
 * @author isi-template
 */
export interface MrtPaginatedResponse<T> {
  docs: T[]
  pageInfo: {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    page: number
    totalDocs: number
    totalPages: number
  }
}

/**
 * El resultado puede ser el array de datos, la estructura paginada, o un objeto genérico
 * @author isi-template
 */
export type MrtQueryFnResult<T> = T[] | MrtPaginatedResponse<T>

/**
 * Este es el objeto que recibirá tu configuración
 * @author isi-template
 */
export interface MrtTableFetchContext extends QueryFunctionContext<QueryKey> {
  pagination: MRT_PaginationState
  globalFilter: string
  columnFilters: MRT_ColumnFiltersState
  sorting: MRT_SortingState
}

// Esta interfaz agrupa SOLO lo que necesitas para generar la query
export interface MrtStateValues {
  pagination: MRT_PaginationState
  globalFilter: any // o string
  columnFilters: MRT_ColumnFiltersState
  sorting: MRT_SortingState
}

/**
 * Interfaz para acciones personalizadas de fila (Botones, Chips, etc.)
 * @author isi-template
 */
export interface MrtRowAction<T> {
  id: string
  // Ancho necesario para este componente (ej: 100)
  width?: number
  // Función de renderizado
  render: (params: { row: T; refetch: () => Promise<any> }) => ReactNode
}

/**
 * Interfaz para acciones de fila dinámicas
 * @author isi-template
 */
export interface MrtRowIconAction<T> {
  // Label
  label: string
  // Icon
  icon: ReactNode
  // Color
  color?: IconButtonProps['color']
  // Evento onClick
  onClick?: (params: MrtActionParams<T>) => void
  // Si esta activo
  enabled?: (row: T) => boolean
  // Si esta oculto
  hidden?: (row: T) => boolean
  // Por si quieres mostrar un spinner de cargando
  loading?: (row: T) => boolean
  // Soporte para navegación
  to?: string | ((row: T) => string)
  // Opcional: props adicionales de Link (ej: target="_blank")
  linkProps?: Partial<LinkProps>
}

/**
 * Interfaz para acciones de tipo menu contextual
 * @author isi-template
 */
export interface MrtMenuAction<T> {
  label: string
  icon?: ReactNode
  onClick?: (params: MrtActionParams<T>) => void
  disabled?: (row: T) => boolean
  color?: IconButtonProps['color'] // Para opciones como "Eliminar" en rojo dentro del menú
  divider?: boolean
  to?: string | ((row: T) => string)
  // Opcional: props adicionales de Link (ej: target="_blank")
  linkProps?: Partial<LinkProps>
  // cuando esta oculto
  hidden?: boolean | ((row: T) => boolean)
}

/**
 * Propiedades para cuando se requiera una tabla plana
 * @author isi-template
 */
export interface MrtFlatOptions {
  enablePagination?: boolean // Por si quieres tabla plana pero con páginas
  enableSorting?: boolean
  headerBackgroundColor?: string
  headerTextColor?: string
  showBorder?: boolean
  dense?: MRT_DensityState // Para filas más delgadas
  showHeaders?: boolean
  fullWidth?: boolean // Si es true, la tabla se estira al 100%
}

/**
 * Configuración principal de la tabla
 * rowSelection y onRowSelectionChange, se debe instanciar en MrtDynamicTable
 * @author isi-template
 */
export interface MrtTableConfig<T extends Record<string, any>> {
  // Identificador único debe ser único
  id: string
  // @required columnas para renderizar
  columns: MRT_ColumnDef<T, any>[]
  // título de la tabla
  title?: string
  // -- SELECCION --
  enableSelection?: boolean // Habilita seleccion checkbox/radio
  multiSelection?: boolean //true: Checkbox, false: Radio

  // -- LAYOUT y estidlos --
  fullWidth?: boolean
  isFlat?: boolean // Activa el modo vista/lista plana
  flatOptions?: MrtFlatOptions // Configuración del modo vista/plana, isFlat debe ser true

  // -- ACCIONES DE FILA --
  rowActions?: MrtRowAction<T>[] // Si queremos acciones de fila custom
  rowIconsActions?: MrtRowIconAction<T>[] // Arrya de botones de icono
  rowMenuActions?: MrtMenuAction<T>[] // Menú desplegable para acciones de fila
  showAudit?: boolean // Btn que muestra la auditoria

  // -- RENDERIZADO AVANZADO --
  getRowProps?: (row: T) => TableRowProps // Estilos y Sub-tablas
  renderDetailPanel?: (row: T) => ReactNode // Si queremos renderizar un panel de detalle

  // -- TOOLBARS PERSONALIZADOS --
  renderTopToolbarCustomActions?: (props: {
    table: MRT_TableInstance<T>
    refetch: () => Promise<any>
    data: T[]
  }) => ReactNode // Propiedades adicionales en la cabecera superior
  renderBottomToolbarCustomActions?: (props: {
    table: MRT_TableInstance<T>
    refetch: () => Promise<any>
    data: T[]
  }) => ReactNode // Inyectamos propiedades adicionales en el pie de página

  // Flag para activar modo servidor, usada cuando se ejecuta consultas con paginación, compatible isipass default false.
  manualPagination?: boolean
  // Nos permite mostrar el icon de refetch, habilita renderCustomActions
  showIconRefetch?: boolean
  // Props nativa de MRT que no esté mapeada arriba
  additionalOptions?: Partial<MRT_TableOptions<T>>
}
