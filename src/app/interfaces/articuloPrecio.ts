import { ArticuloUnidadMedidaProps } from './articuloUnidadMedida.ts'
import { ImagenCloudProps } from './imagen.ts'
import { InventarioProps } from './inventario.ts'
import {
  MonedaPrecioApiInputProps,
  MonedaPrecioOperacionProps,
  MonedaPrecioProps,
  MonedaProps,
} from './monedaPrecio.ts'
import { ProveedorOperacionProps } from './proveedorOperacion.ts'
import { TipoArticuloOperacionProps } from './tipoArticulo.ts'

/**
 * Que vamos a evaluar para el calculo de costo y precio
 */
export enum ApiTipoArtPrecioOperacion {
  costo = 'costo',
  precio = 'precio',
}

/**
 * Forma de realizacion de descuentos
 * prioridad fechaInicial, fechaFinal, cantidad y finalmente porcentaje
 * @author isi-template
 */
export interface ArticuloDescuentoProps {
  fechaInicial: Date | null // Fecha Inicial de vigencia
  fechaFinal: Date | null // Fecha Final de vigencia o null para indefinido
  porcentaje: number // Porcentaje de descuento aplica si cantidad es array[]
  cantidad: {
    nro: number
    porcentaje: number
  }[] // Cantidad de productos para aplicar el descuento
}
/**
 * @author isi-template
 */
export interface PrecioInputProps {
  precioBase: number | null // Precio base multiplicador por el factor de ajuste
  precio: number | null
  delivery?: number | null // nuevo agregado delivery
  precioComparacion?: number | null
  manual: boolean // Si es false, no multiplica factorAjuste * precioBase
}

/**
 * Estructura unificada para la distribución de montos financieros.
 * Permite manejar tanto la entrada de inventario (COSTO) como la salida (PRECIO).
 */
export interface PrecioCostoOperacionProps {
  /** * Contexto de la operación:
   * - 'COSTO': Operación de entrada (Compras, Producción).
   * - 'PRECIO': Operación de salida (Ventas, Cotizaciones).
   */
  tipoOperacion: ApiTipoArtPrecioOperacion

  // --- 1. VALORES DE REFERENCIA (INPUTS) ---
  /** * El valor nominal actual de la operación.
   * - COSTO: Precio unitario en la Factura del Proveedor.
   * - PRECIO: Precio de Lista / Catálogo actual.
   */
  valorBase: number
  /**
   * El valor de referencia histórico o estándar.
   * - COSTO: Costo Promedio/Estándar anterior (Kardex).
   * - PRECIO: Generalmente 0 (o Precio de Lista anterior para comparar subidas).
   */
  valorBaseAnterior: number

  // --- 2. AJUSTES DIRECTOS ---
  /** Descuento directo unitario (Monto). */
  descuento: number
  /** Descuento adicional prorrateado (Monto). */
  descuentoAdicional: number

  // --- 3. VALORES CONTABLES (NETOS E IMPUESTOS) ---
  /** * Valor financiero real "limpio" de la mercancía.
   * - COSTO: Base Imponible (Costo sin IVA ni gastos).
   * - PRECIO: Revenue / Ingreso Neto Real (Precio de Venta sin IVA).
   */
  valorNeto: number
  /** * Monto del impuesto unitario.
   * - COSTO: Crédito Fiscal (Impuesto recuperable).
   * - PRECIO: Débito Fiscal (Impuesto a pagar al fisco).
   */
  impuestoUnitario: number

  // --- 4. EXTRAS DE COSTEO (Solo contexto COSTO) ---
  /** * Gastos vinculados (Fletes, Seguros, Aduanas).
   * - COSTO: Se suma al valor del inventario.
   * - PRECIO: 0 (Salvo casos especiales de envío).
   */
  gastoAdicional: number
  /** * Desviación financiera.
   * - COSTO: Diferencia entre (valorFinal - valorBaseAnterior).
   * - PRECIO: 0.
   */
  variacion: number

  // --- 5. VALOR FINAL (OUTPUT) ---
  /** * El monto final efectivo.
   * - COSTO: Costo Landed (Neto + Gastos). Valor de entrada al Kardex.
   * - PRECIO: Precio Final (Neto + IVA). Monto que paga el Cliente.
   */
  valorFinal: number

  // --- 6. TOTALES ACUMULADOS (Unitarios * Cantidad) ---
  totales: {
    /** Cantidad * valorBase */
    subtotalBruto: number
    /** Cantidad * (descuento + descuentoAdicional) */
    totalDescuento: number
    /** Cantidad * valorNeto (Valor total del inventario base o Ingreso total ventas) */
    subtotalNeto: number
    /** Cantidad * impuestoUnitario */
    totalImpuestos: number
    /** Cantidad * gastoAdicional */
    totalGasto: number
    /** Cantidad * valorFinal (Total Valor Entrada Stock o Total a Pagar Cliente) */
    totalFinal: number
  }
}

/**
 * Propiedades de los articulos precios para todas la operaciones excepto articulo y articuloPrecioInventario
 * @author isi-template
 */
export interface ArticuloPrecioOperacionProps {
  /** Datos unidad de medida */
  articuloUnidadMedida: ArticuloUnidadMedidaProps
  /** @deprecated ya no es nesesario para front-end*/
  monedaPrecio: MonedaPrecioOperacionProps
  /** Estructura de moneda que incluye el tipo de cambio segun moneda principal */
  moneda: MonedaProps
  /** Tipo de cambio final, puede ser diferente al tipo de cambio de moneda */
  tipoCambio: number
  /** Desglose de montos y totales para la linea de operacion */
  estructuraValor: PrecioCostoOperacionProps
  // /** Si TipoOperacion===costo, desglose de los datos para costo */
  // costoOperacion: CostoOperacionProps
  /** Tipo operacion de transaccion, costo o precio */
  tipoOperacion: ApiTipoArtPrecioOperacion
  /** valor que se ingresa de front-end de operacion segun sea de tipoOperacion costo o precio */
  valor: number
  cantidad: number
  /** @deprecated, se camia por cantidadFactor */
  cantidadBase: number
  /** Equivalencia de la unidad (12 unidades por Caja) */
  cantidadFactor: number
  /** Descuento de linea */
  descuento: number
  /** Descuento prorrateado */
  descuentoAdicional: number
  /** Otros costos prorrateado */
  otrosCostos: number
  /** Valor de impuesto */
  impuesto: number
  /** Si incluye impuestos, true o false, Si precio real incluye impuestos */
  incluyeImpuesto: boolean
  /** Si el descuento de linea aplica como descuento global o unitario, default: true */
  esDescuentoTotal: boolean
  factorAjuste: number
}

/**
 * @description datos de entrada para operaciones de precios de articulos independientes
 * @author isi-template
 */
export interface ArticuloPrecioOperacionInputProps {
  codigoArticuloUnidadMedida: string
  /** Cantidad de venta o compra */
  cantidad: number // Cantidad de items que ingresan a inventario
  /** Precio o monto del item */
  precio: number
  /** Descuento, que puede ser global o unitario, es dependiente del parametro esDescuentoTotal */
  descuento: number
  /** Impuesto % que va entre  0% y 100% */
  impuesto: number
  /** Si es true, el descuento se aplica global, si es false, el descuento se aplica por unidad, (default: true) */
  esDescuentoTotal: boolean
  /** Si el documento fue generado con factura o sin factura */
  incluyeImpuesto: boolean
}

/**
 * Propiedades de los articulos precios operacion para consume api
 * @author isi-template
 */
export interface ArticuloPrecioOperacionApiInputProps {
  cantidad: number
  codigoArticuloUnidadMedida: string
  descuento: number
  impuesto: number
  precio: number
}

/**
 * Datos del articulo / precio completo para la gestion de articulos
 * @author isi-template
 */
export interface ArticuloPrecioProps {
  articuloUnidadMedida: ArticuloUnidadMedidaProps
  monedaPrimaria: MonedaPrecioProps
  monedaAdicional1: MonedaPrecioProps | null
  monedaAdicional2: MonedaPrecioProps | null
  monedaAdicional3: MonedaPrecioProps | null
  cantidadBase: number // Equivalencia relacionada a la unidad de medida base
  descuento: ArticuloDescuentoProps | null // en caso de contar con un descuento especifico que aplica a todos los valores
  imagen: ImagenCloudProps | null
  factorAjuste: number // factor ajuste que afecta al precio, no asi al precio base, solo afecta si moneda precio manual es false
  umVenta: boolean // si es para unidad de medida para ventas
  umInventario: boolean // si es para unidad de medida para inventarios
  umCompra: boolean // si es para unidad de medida para compras
}
/**
 * @author isi-template
 */
export interface ArticuloPrecioInputProps {
  articulo: ArticuloPrecioBaseProp | null
  articuloUnidadMedida: ArticuloUnidadMedidaProps | null
  monedaPrimaria: PrecioInputProps | null
  monedaAdicional1: PrecioInputProps | null
  monedaAdicional2: PrecioInputProps | null
  monedaAdicional3: PrecioInputProps | null
  cantidadBase: number
  descuento: ArticuloDescuentoProps | null // en caso de contar con un descuento especifico que aplica a todos los valores
  factorAjuste: number // factor ajuste que afecta al precio, no asi al precio base, solo afecta si moneda precio manual es false
  umVenta: boolean // si es para unidad de medida para ventas
  umInventario: boolean // si es para unidad de medida para inventarios
  umCompra: boolean // si es para unidad de medida para compras
}
/**
 * @author isi-template
 */
export const ARTICULO_PRECIO_DEFAULT: ArticuloPrecioInputProps = {
  articulo: null,
  articuloUnidadMedida: null,
  monedaPrimaria: null,
  monedaAdicional1: null,
  monedaAdicional2: null,
  monedaAdicional3: null,
  cantidadBase: 1,
  descuento: null,
  factorAjuste: 1,
  umVenta: true,
  umInventario: true,
  umCompra: false,
}

/**
 * @description datos de entrada para operaciones de precios de articulos independientes
 * @author isi-template
 */
export interface ArticuloPrecioApiInputProps {
  codigoArticulo: string
  codigoUnidadMedida: string
  monedaPrimaria: MonedaPrecioApiInputProps
  monedaAdicional1: MonedaPrecioApiInputProps | null
  monedaAdicional2: MonedaPrecioApiInputProps | null
  monedaAdicional3: MonedaPrecioApiInputProps | null
  cantidadBase?: number | null
  factorAjuste?: number | null
  umVenta?: boolean | null // si es para unidad de medida para ventas
  umInventario?: boolean | null // si es para unidad de medida para inventarios
  umCompra?: boolean | null // si es para unidad de medida para compras
  descuento?: any | null
}

/**
 * @description datos de entrada para operaciones de precios de articulos independientes
 * @author isi-template
 */
export interface ArticuloPrecioBaseProp {
  _id: string
  articuloPrecioId: string
  codigoArticulo: string
  nombreArticulo: string // nombre propio o corto del articulo
  tipoArticulo: TipoArticuloOperacionProps | null // Clasificador de tipos de articulos articulos
  proveedor: ProveedorOperacionProps[] // Lista de proveedores del producto
  imagen: ImagenCloudProps | null
  inventario: InventarioProps[] // lista de almacenes donde se almacena el articulo, se filtra por sucursal por eso array
  activo: boolean // si es true, el articulo esta activo para su uso
  state?: string
  cantidadBase: number
  articuloUnidadMedida: ArticuloUnidadMedidaProps
  moneda: MonedaProps
  precio: number
  precioBase: number
  manual: boolean
  monedaA1: MonedaProps
  precioA1: number
  precioBaseA1: number
  manualA1: boolean
  monedaA2: MonedaProps
  precioA2: number
  precioBaseA2: number
  manualA2: boolean
  monedaA3: MonedaProps
  precioA3: number
  precioBaseA3: number
  manualA3: boolean
}
