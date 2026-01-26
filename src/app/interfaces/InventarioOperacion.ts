import { AlmacenInventarioProps } from './almacen.ts'
import { ArticuloPrecioProps } from './articuloPrecio.ts'
import { LoteInventarioProps } from './lote.ts'
import { SucursalProps } from './sucursal.ts'

/**
 * Inventario de articulo para operaciones
 * @author isi-template
 */
export interface InventarioOperacionProps {
  _id: string
  codigoArticulo: string
  nombreArticulo: string
  sucursal: SucursalProps
  articuloPrecio: ArticuloPrecioProps
  articuloPrecioBase: ArticuloPrecioProps
  almacen: AlmacenInventarioProps
  lote: LoteInventarioProps | null
  totalStock: number // Sumatoria stock de todos los almacenes
  totalComprometido: number // Sumatoria comprometido de todos los almacenes
  totalSolicitado: number // Stock reservado para pedidos para ordenes de compra aprobadas
  totalDisponible: number // Disponible para transacción
  stock: number // Existencia segun el tipo de busqueda, almacen u lote
  comprometido: number // Existencia segun el tipo de busqueda, almacen u lote
  solicitado: number // Existencia segun el tipo de busqueda, almacen u lote
  disponible: number // Existencia segun el tipo de busqueda, almacen u lote
}
