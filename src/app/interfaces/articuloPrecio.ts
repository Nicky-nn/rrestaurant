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
 * Forma de realizacion de descuentos
 * prioridad fechaInicial, fechaFinal, cantidad y finalmente porcentaje
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

export interface PrecioInputProps {
  precioBase: number | null // Precio base multiplicador por el factor de ajuste
  precio: number | null
  precioComparacion?: number | null
  manual: boolean // Si es false, no multiplica factorAjuste * precioBase
}

/**
 * Propiedades de los articulos precios para todas la operaciones excepto articulo y articuloPrecioInventario
 */
export interface ArticuloPrecioOperacionProps {
  articuloUnidadMedida: ArticuloUnidadMedidaProps
  cantidad: number | null
  cantidadBase: number | null
  descuento: number | null
  factorAjuste: number
  impuesto: number
  monedaPrecio: MonedaPrecioOperacionProps // ya no es nesesario para front-end
}

/**
 * Propiedades de los articulos precios operacion para consume api
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
