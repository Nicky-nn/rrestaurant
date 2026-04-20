import { ImagenProps } from '../../../base/interfaces/base'
import { genRandomString } from '../../../utils/helper'
import { ProveedorProps } from '../../proveedor/interfaces/proveedor.interface'
import {
  SinActividadesDocumentoSectorProps,
  SinActividadesEconomicasProps,
  SinActividadesProps,
  SinProductoServicioProps,
  SinUnidadMedidaProps,
} from '../../sin/interfaces/sin.interface'
import { SucursalProps } from '../../sucursal/interfaces/sucursal'
import { TipoProductoProps } from '../../tipoProducto/interfaces/tipoProducto.interface'
import { InventarioProps } from './inventario.interface'

export interface ProductoDefinitionProps {
  _id?: string
  titulo: string
  descripcion: string
  actividadEconomica?: SinActividadesEconomicasProps
  descripcionHtml: string
  opcionesProducto: OpcionesProductoProps[]
  tipoProducto: TipoProductoProps | null
  totalVariantes: number
  imagenDestacada?: ImagenProps // url de la imagen
  varianteUnica: boolean // si solo tienen una sola variante
  proveedor: ProveedorProps | null // nombre del proveedor si vale el caso
  state?: string
  usucre?: string
  createdAt?: Date
  usumod?: string
  updatedAt?: Date
}

// Para evitar circular llamada
export interface ProductoProps extends ProductoDefinitionProps {
  variantes: ProductoVarianteProps[]
}

export interface ProductoVarianteInventarioProps {
  sucursal: SucursalProps
  stock: number
}

export interface ProductoVarianteProps {
  _id: string
  id: string
  sinProductoServicio: SinProductoServicioProps
  codigoProducto: string // identificador o codigo unico
  producto: ProductoDefinitionProps
  titulo: string // nombre propio
  nombre: string // nombre producto + titulo
  detalleExtra?: string
  codigoBarras: string | null
  precio: number
  precioComparacion: number // Para mostrar un precio rebajado
  costo: number
  imagen?: ImagenProps
  incluirCantidad: boolean // habilita cantidad al stock del inventario
  verificarStock: boolean // si es true, se verifica cantidad en stock, false = no se toma en cuenta
  unidadMedida: SinUnidadMedidaProps
  inventario: Array<InventarioProps>
  peso: number
  state?: string
  usucre?: string
  createdAt?: Date
  usumod?: string
  updatedAt?: Date
}

export interface ProductoVarianteInputProps {
  id: string
  codigoProducto: string // identificador o codigo unico
  sinProductoServicio: string
  titulo: string // nombre propio
  nombre: string // nombre producto + titulo
  disponibleParaVenta: boolean
  codigoBarras: string | null
  precio: number
  precioComparacion?: number
  incluirCantidad: boolean // Incluye cantidad por cada item producto
  verificarStock: boolean // Continuar venta aun si el stock ha terminado
  costo: number
  inventario: ProductoVarianteInventarioProps[]
  peso?: number
  unidadMedida: SinUnidadMedidaProps | null
}

export interface OpcionesProductoProps {
  id: string
  nombre: string
  valores: string[]
}

export interface ProductoInputProps {
  id?: string | null
  actividadEconomica: SinActividadesDocumentoSectorProps | null
  sinProductoServicio: SinProductoServicioProps | null
  titulo: string
  descripcion: string
  descripcionHtml: string
  varianteUnica: boolean
  varianteUnicaTemp: boolean
  variante: ProductoVarianteInputProps
  opcionesProducto: Array<OpcionesProductoProps>
  tipoProducto: TipoProductoProps | null
  tipoProductoPersonalizado: string | null
  variantes: ProductoVarianteInputProps[]
  variantesTemp: ProductoVarianteInputProps[] // Se usa para modificaciones, guardar historial
  proveedor: ProveedorProps | null
}

/**
 * Valores iniciales para una variante
 */
export const PRODUCTO_VARIANTE_INITIAL_VALUES = {
  id: genRandomString(10),
  codigoProducto: '',
  sinProductoServicio: '',
  titulo: '',
  nombre: '',
  disponibleParaVenta: true,
  codigoBarras: '',
  precio: 0,
  incluirCantidad: false,
  verificarStock: true,
  precioComparacion: 0,
  costo: 0,
  inventario: [],
  unidadMedida: null,
}
/**
 * valores iniciales para un nuevo producto
 */
export const PRODUCTO_INITIAL_VALUES: ProductoInputProps = {
  id: null,
  actividadEconomica: null,
  sinProductoServicio: null,
  titulo: '',
  descripcion: '',
  descripcionHtml: '<span></span>',
  varianteUnica: true,
  varianteUnicaTemp: true,
  variante: PRODUCTO_VARIANTE_INITIAL_VALUES,
  opcionesProducto: [],
  tipoProducto: null,
  tipoProductoPersonalizado: '',
  variantes: [],
  variantesTemp: [],
  proveedor: null,
}

export interface ProductoVarianteApiProps {
  id: string
  codigoProducto: string
  codigoProductoSin: string
  titulo: string
  precio: number
  precioComparacion: number | null
  costo: number
  incluirCantidad: boolean
  verificarStock: boolean
  codigoUnidadMedida: number
  inventario: Array<{ codigoSucursal: number; stock: number }>
}

/**
 * Interface que nos permite registrar el producto, se usa para las apis
 */
export interface ProductoInputApiProps {
  codigoActividad: string
  titulo: string
  descripcion: string
  descripcionHtml: string
  opcionesProducto: OpcionesProductoProps[]
  tipoProductoId: string | null
  tipoProductoPersonalizado: string | null
  varianteUnica: boolean
  codigoProveedor: string | null
  variantes: ProductoVarianteApiProps[]
}
