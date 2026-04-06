import { genRandomString } from '../utils/helper.ts'
import { AlmacenProps } from './almacen.ts'
import { ArticuloPrecioOperacionApiInputProps } from './articuloPrecio.ts'
import { ArticuloUnidadMedidaProps } from './articuloUnidadMedida.ts'
import { ClaseArticuloProps } from './claseArticulo.ts'
import { GestionArticuloProps } from './gestionArticulo.ts'
import { GrupoArticuloOperacionProps } from './grupoArticulo.ts'
import { LoteProps } from './lote.ts'
import { MonedaProps } from './monedaPrecio.ts'
import { SinProductoServicioProps } from './sin.interface.ts'
import { TipoArticuloOperacionProps } from './tipoArticulo.ts'

/**
 * @author isi-template
 */
export interface ArticuloOperacionInputProps {
  id: string
  nroItem: number | null
  articuloId: string
  codigoArticulo: string
  nombreArticulo: string
  tipoArticulo: TipoArticuloOperacionProps | null
  claseArticulo: ClaseArticuloProps | null
  grupoArticulo?: GrupoArticuloOperacionProps | null
  gestionArticulo: GestionArticuloProps | null
  almacen: AlmacenProps | null
  lote: LoteProps | null
  sinProductoServicio: SinProductoServicioProps | null
  articuloUnidadMedida: ArticuloUnidadMedidaProps | null
  // Cantidad solo para front-end
  cantidadOriginal: number
  cantidad: number
  descuento: number
  descuentoP: number // descuento porcentaje
  /** Impuesto porcentual 0 - 100%, default 0 */
  impuesto: number
  precio: number
  moneda: MonedaProps | null
  detalleExtra: string | null
  nota: string | null
  verificarStock: boolean
}
/**
 * @author isi-template
 */
export interface ArticuloOperacionApiInputProps {
  articuloPrecio: ArticuloPrecioOperacionApiInputProps
  codigoAlmacen: string
  codigoArticulo: string
  codigoLote: string | null
  detalleExtra: string | null
  nota: string | null
}
/**
 * @author isi-template
 */
export const ARTICULO_OPERACION_DEFAULTS: ArticuloOperacionInputProps = {
  id: genRandomString(10).toUpperCase(),
  nroItem: null,
  articuloId: '',
  codigoArticulo: '',
  nombreArticulo: '',
  tipoArticulo: null,
  claseArticulo: null,
  grupoArticulo: null,
  gestionArticulo: null,
  almacen: null,
  lote: null,
  sinProductoServicio: null,
  articuloUnidadMedida: null,
  cantidadOriginal: 0,
  cantidad: 0,
  descuento: 0,
  descuentoP: 0,
  impuesto: 0,
  precio: 0,
  moneda: null,
  detalleExtra: null,
  nota: null,
  verificarStock: false,
}
