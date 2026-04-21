import { DialogProps } from '@mui/material'

import { EntidadInputProps } from '../../../../../../interfaces'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { MonedaProps } from '../../../../../../interfaces/monedaPrecio.ts'
import { UnidadMedidaSeleccionProps } from '../../ArticuloUnidadMedidaSeleccion/ArticuloUnidadMedidaSeleccion.tsx'
import { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccionTypes.ts'

/**
 * Configuración para la visualización de montos
 * @autor isi-template
 */
export interface MontoSeleccionProps {
  label?: string
  readOnly?: boolean
  disabled?: boolean
  ocultar?: boolean
}

/**
 * Fuente de datos para la lista de almacenes
 * - 'tbl': Obtiene almacenes desde apiAlmacenPorSucursalListado (tabla general)
 * - 'inv': Obtiene almacenes desde inventario del artículo (solo almacenes con stock)
 * @autor isi-template
 */
export type ListaAlmacenFuente = 'tbl' | 'inv'

/**
 * Configuración para la selección de almacén
 * @autor isi-template
 */
export interface AlmacenSeleccionProps {
  // ===== CONFIGURACIÓN DE DATOS =====
  /** Fuente de datos para cargar almacenes (default: 'tbl') */
  fuente: ListaAlmacenFuente
  /** Solo mostrar almacenes que tengan stock disponible (aplica solo con fuente 'inv') */
  mostrarSoloConStock?: boolean
  /** Ordenar almacenes por prioridad ascendente (default: true) */
  ordenarPorPrioridad?: boolean
  /** Filtrar por tipos de almacén específicos (ej: ['DESPACHO', 'REPOSICION']) */
  filtrarPorTipos?: string[]
  /** Solo mostrar almacenes activos (default: true) */
  soloActivos?: boolean

  // ===== CONFIGURACIÓN DE VISUALIZACIÓN =====
  label?: string
  /** Deshabilita el componente, default false */
  disabled?: boolean
  /** Si value contiene datos, se prioriza, luego autoselección, default false */
  autoSeleccion?: boolean
  /** Si la lista contiene almacen virtual 999, esta de oculta de la visualización */
  ocultarAlmacenVirtual?: boolean
}

// /**
//  * Configuración avanzada para el select de lotes
//  * @autor isi-template
//  */
// export interface ListaLoteProps {
//   /** Fuente de datos para cargar lotes */
//   fuente?: ListaLoteFuente
//   /** Solo mostrar lotes que tengan stock disponible (aplica solo con fuente 'inv') */
//   mostrarSoloConStock?: boolean
//   /**
//    * Metodo de ordenamiento de lotes
//    * - FEFO: Ordena por fecha de vencimiento (más próximo primero)
//    * - FIFO: Ordena por fecha de fabricación/registro (más antiguo primero)
//    * - MANUAL: Sin ordenamiento, requiere selección manual del usuario
//    * Default: FEFO
//    */
//   metodoSeleccion?: MetodoSeleccionLote
//   /** Excluir lotes vencidos */
//   excluirVencidos?: boolean
//   /** Selección automática del primer lote según el metodo (solo aplica si metodoSeleccion !== MANUAL) */
//   autoSeleccion?: boolean
// }

/**
 * Configuración para la selección de precio
 * Distribución de precios a operar
 * @autor isi-template
 */
export interface PrecioSeleccionProps extends MontoSeleccionProps {
  /**
   * Tipo de monto a usar como precio
   * - 'precio': Setea el precio de venta del formulario
   * - 'costo': Setea el costo/precio base del formulario
   * - 'delivery': Setea el precio delivery del formulario
   * Default: lo que aparece del callback
   * @autor isi-template
   */
  tipoMonto?: 'precio' | 'costo' | 'delivery'
  /** Cantidad de decimales para el input valor, default 2 */
  nroDecimales?: number
}

/**
 * Configuración para la selección de cantidad
 * @autor isi-template
 */
export interface CantidadSeleccionProps extends MontoSeleccionProps {
  /** Cantidad de decimales para el input cantidad, default 2 */
  nroDecimales?: number
}

/**
 * Configuración para la selección de descuento
 * @autor isi-template
 */
export interface DescuentoSeleccionProps extends MontoSeleccionProps {
  /** Cantidad de decimales para el input descuento, default 2 */
  nroDecimales?: number
}

/**
 * Reglas de validación para la selección de artículos
 * @autor isi-template
 *
 */
export interface SeleccionArticuloReglasProps {
  /** Valida que cantidad sea mayor a 0, default: true */
  validarCantidad?: boolean
  /**
   * - Valida que cantidad sea menor o igual a stock disponible.
   * - El articulo debe contar con verificarStock=true
   * - default: false
   */
  validarCantidadStock?: boolean
  /** Valida que monto total sea mayor a 0, default: false */
  validarTotal?: boolean
  /** Verifica que cumpla con la condicion de disponible > 0, default false */
  validaStock?: boolean
  /** Obliga seleccion lote, siempre y cuando este gestionado por lotes, default: false */
  validaLote?: boolean
  /** El articulo debe contener datos de inventario, default: false */
  validarExistenciaInventario?: boolean
  /** Valida que el lote cumpla condicion fecha de vencimiento mayor al dia de hoy, default: false */
  validaLoteFechaVencimiento?: boolean
  /** Oculta el cuadro de calculos de totales */
  ocultarCalculos?: boolean
}

/**
 * Configuración de los botones de acción del diálogo
 * @autor isi-template
 *
 */
export interface ActionButtonsProps {
  /** Muestra el botón de cerrar, default false */
  mostrarBtnCerrar?: boolean
  /** Oculta el botón de actualizar/guardar, default false */
  ocultarBtnActualizar?: boolean
  /** Texto del botón de cerrar, default "Cerrar" */
  btnCerrarText?: string
  /** Texto del botón de guardar, default "Actualizar item" */
  btnActualizarText?: string
}

/**
 * Props principales del componente SeleccionArticuloInventarioDialog
 * @autor isi-template
 */
export interface SeleccionArticuloInventarioDialogProps extends Omit<DialogProps, 'id' | 'onClose'> {
  id: string
  /** Ref al id del articulo */
  articuloId: string | null
  /** Búsqueda de artículo con precio, default true */
  verificarPrecio?: boolean
  /** Búsqueda de artículo con inventario, default false */
  verificarInventario?: boolean

  // ===== CONFIGURACIÓN DE CAMPOS =====
  /** Configuraciones para visualización de almacén */
  almacenProps: AlmacenSeleccionProps
  /** Configuración para visualización de lotes */
  loteProps?: LoteSeleccionProps
  /** Configuración para visualización de unidades de medida */
  unidadMedidaProps?: UnidadMedidaSeleccionProps
  /** Configuración de visualización para cantidad */
  cantidadProps?: CantidadSeleccionProps
  /** Configuraciones para visualización de precios */
  precioProps?: PrecioSeleccionProps
  /** Configuración para visualización de descuento */
  descuentoProps?: DescuentoSeleccionProps

  // ===== DATOS DEL CONTEXTO =====
  /** Moneda de operación */
  moneda: MonedaProps
  /** Si el artículo es de tipo lista y ocupa una posición */
  articuloIndex: number
  /** Datos de entrada del formulario */
  item: ArticuloOperacionInputProps | null
  /** Datos de entidad: código sucursal, código punto de venta */
  entidad: EntidadInputProps
  /** Reglas adicionales para el renderizado */
  reglas?: SeleccionArticuloReglasProps
  /** Configuración de botones de acción */
  actionButtons?: ActionButtonsProps

  // ===== CALLBACKS =====
  onClose: (resp?: { index: number; item: ArticuloOperacionInputProps }) => void
  onClear: () => void
}
