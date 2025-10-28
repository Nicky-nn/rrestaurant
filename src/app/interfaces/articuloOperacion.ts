import { AlmacenProps } from './almacen.ts'
import { ArticuloPrecioOperacionApiInputProps } from './articuloPrecio.ts'
import { ArticuloUnidadMedidaProps } from './articuloUnidadMedida.ts'
import { ClaseArticuloProps } from './claseArticulo.ts'
import { GestionArticuloProps } from './gestionArticulo.ts'
import { GrupoArticuloProps } from './grupoArticulo.ts'
import { LoteProps } from './lote.ts'
import { MonedaProps } from './monedaPrecio.ts'
import { SinProductoServicioProps } from './sin.interface.ts'
import { TipoArticuloOperacionProps } from './tipoArticulo.ts'

export interface ArticuloOperacionInputProps {
  id: string
  nroItem: number | null
  articuloId: string
  codigoArticulo: string
  nombreArticulo: string
  tipoArticulo: TipoArticuloOperacionProps | null
  claseArticulo: ClaseArticuloProps | null
  grupoArticulo?: GrupoArticuloProps | null
  gestionArticulo: GestionArticuloProps | null
  almacen: AlmacenProps | null
  lote: LoteProps | null
  sinProductoServicio: SinProductoServicioProps | null
  articuloUnidadMedida: ArticuloUnidadMedidaProps | null
  cantidadOriginal: number
  cantidad: number
  descuento: number
  descuentoP: number // descuento porcentaje
  impuesto: number
  precio: number
  moneda: MonedaProps | null
  detalleExtra: string | null
  nota: string | null
  verificarStock: boolean
}

export interface ArticuloOperacionApiInputProps {
  articuloPrecio: ArticuloPrecioOperacionApiInputProps
  codigoAlmacen: string
  codigoArticulo: string
  codigoLote: string | null
  detalleExtra: string | null
  nota: string | null
}

export const ARTICULO_OPERACION_DEFAULT: ArticuloOperacionInputProps = {
  id: '',
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
