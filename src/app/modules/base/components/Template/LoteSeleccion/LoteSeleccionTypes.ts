import { MetodoSeleccionLote } from '../../../../../base/services/articuloToArticuloOperacionInputService.ts'
import { LoteProps } from '../../../../../interfaces/lote.ts'

/**
 * Tipo de fuente para la lista de lotes
 * - 'tbl': Obtiene todos los lotes del artículo desde la tabla general
 * - 'inv': Obtiene lotes desde el inventario del artículo en el almacén específico
 * @author isi-template
 */
export type ListaLoteFuente = 'tbl' | 'inv'

/**
 * Configuración completa para el componente de selección de lote
 * Fusiona configuración de visualización y procesamiento de datos
 * @author isi-template
 */
export interface LoteSeleccionProps {
  // ===== CONFIGURACIÓN DE DATOS =====
  /**
   * Fuente de datos para cargar lotes
   * - 'tbl': Todos los lotes del artículo (para registros/compras)
   * - 'inv': Lotes del inventario por almacén (para ventas)
   * Default: 'inv'
   */
  fuente?: ListaLoteFuente

  /** Solo mostrar lotes que tengan stock disponible (aplica solo con fuente 'inv', default: false) */
  mostrarSoloConStock?: boolean

  /**
   * Metodo de ordenamiento de lotes
   * - FEFO: Ordena por fecha de vencimiento (más próximo primero)
   * - FIFO: Ordena por fecha de fabricación/admisión (más antiguo primero)
   * - MANUAL: Sin ordenamiento, mantiene orden original
   * Default: MANUAL
   */
  metodoSeleccion?: MetodoSeleccionLote

  /** Excluir lotes vencidos de la lista (default: false) */
  excluirVencidos?: boolean

  /**
   * Selección automática del primer lote según el metodo
   * Solo aplica cuando metodoSeleccion es FEFO o FIFO
   * Default: false
   */
  autoSeleccion?: boolean

  // ===== CONFIGURACIÓN DE VISUALIZACIÓN =====
  /** Label del campo de selección */
  label?: string

  /** Deshabilita el componente independiente si está gestionado por Lotes (default: false) */
  disabled?: boolean

  /** Valida lote siempre y cuando esté gestionado por lotes (default: false) */
  validarLote?: boolean

  /** Valida fecha de vencimiento (default: false) */
  validarFechaVencimiento?: boolean

  /** Mostrar botón de búsqueda avanzada (default: true) */
  mostrarBusquedaAvanzada?: boolean

  /** Mostrar botón de registrar nuevo lote (default: true) */
  mostrarRegistrarNuevo?: boolean
}

/**
 * Props del componente LoteSeleccion
 */
export interface LoteSeleccionComponentProps {
  /** Indica si la gestión de lotes está habilitada para el artículo */
  habilitado?: boolean

  /** Código del artículo */
  codigoArticulo: string

  /** ID del almacén (requerido cuando tipoLista es 'almacen') */
  almacenId?: string

  /** ID del inventario (requerido cuando tipoLista es 'almacen') */
  inventarioId?: string

  /** Valor actual del lote seleccionado */
  value: LoteProps | null

  /** Callback cuando cambia la selección */
  onChange: (resp: LoteProps | null) => void

  /** Mensaje de error de validación */
  error?: string

  /** Configuración del componente */
  loteProps: LoteSeleccionProps

  /**
   * Lotes procesados desde inventario (opcional)
   * Cuando se proporciona, se usan estos lotes en lugar de hacer la consulta
   * Útil cuando el componente padre `almacen` ya tiene los lotes procesados
   */
  lotesInventario?: LoteProps[]
}

/**
 * Props del diálogo de listado de lotes
 */
export interface LoteSeleccionListadoDialogProps {
  /** Indica si el diálogo está abierto */
  open: boolean

  /** Callback al cerrar el diálogo */
  onClose: (resp?: LoteProps | null) => void

  /** Código del artículo */
  codigoArticulo: string

  /** ID del almacén */
  almacenId?: string

  /** ID del inventario */
  inventarioId?: string

  /** Fuente de datos */
  fuente: ListaLoteFuente

  /** Metodo de selección para ordenamiento */
  metodoSeleccion?: MetodoSeleccionLote

  /** Excluir lotes vencidos */
  excluirVencidos?: boolean

  /** Validar fecha de vencimiento antes de seleccionar */
  validarFechaVencimiento?: boolean
}

/**
 * Props del diálogo de registro de lote
 */
export interface LoteSeleccionRegistroDialogProps {
  /** Indica si el diálogo está abierto */
  open: boolean

  /** Callback al cerrar el diálogo */
  onClose: () => void

  /** Callback al enviar el formulario con el nuevo lote */
  onSubmit: (resp: LoteProps) => void

  /** Código del artículo */
  codigoArticulo: string
}
