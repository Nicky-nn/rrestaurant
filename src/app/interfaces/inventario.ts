import { AlmacenProps } from './almacen.ts'
import { ArticuloUnidadMedidaProps } from './articuloUnidadMedida.ts'
import { AuditoriaProps } from './index.ts'
import { KardexPeriodoProps } from './kardexPeriodo.ts'
import { LoteProps } from './lote'
import { SinTipoDocumentoSectorProps } from './sin.interface.ts'
import { SucursalProps } from './sucursal.ts'

/**
 * @description Detalle de lotes en un almacen
 */
export interface InventarioDetalleLoteProps {
  codigoLote: string // parametro deprecado en base de datos
  lote: LoteProps // Lote de almacen
  stock: number // Stock actual -> disponible - comprometido
  comprometido: number // Stock reservado para pedidos
  solicitado: number // Stock reservado para pedidos para ordenes de compra aprobadas
  disponible: number // Disponible para venta -> stock - comprometido
}

/**
 * @description Detalle de inventario (conjunto de almacenes)
 */
export interface InventarioDetalleProps {
  codigoAlmacen: string // parametro deprecado en base de datos
  almacen: AlmacenProps // Almacen
  stock: number // Stock actual -> disponible - comprometido
  comprometido: number // Stock reservado para pedidos
  solicitado: number // Stock reservado para pedidos para ordenes de compra aprobadas
  disponible: number // Disponible para venta -> stock - comprometido
  orden: number // orden de los almacenes, las búsquedas se realizan por orden 1,2,3,4
  lotes: InventarioDetalleLoteProps[]
}

/**
 * @description Inventario de articulos por sucursal
 * Cada inventario que se vaya creando se relacionará con la tabla articulos
 */
export interface InventarioProps extends AuditoriaProps {
  codigoArticulo: string
  nombreArticulo: string
  documentoSector: SinTipoDocumentoSectorProps // Hereda del articulo
  sucursal: SucursalProps
  kardexPeriodo: KardexPeriodoProps // Periodo de tiempo para calculo de kardex
  codigoGrupo: string | null
  unidadMedida: ArticuloUnidadMedidaProps // Unidad de medida asignado para calculo de inventarios
  detalle: InventarioDetalleProps[]
  totalStock: number // Sumatoria stock de todos los almacenes
  totalComprometido: number // Sumatoria comprometido de todos los almacenes
  totalSolicitado: number // Stock reservado para pedidos para ordenes de compra aprobadas
  totalDisponible: number // Disponible para transacción
  state?: string
}
