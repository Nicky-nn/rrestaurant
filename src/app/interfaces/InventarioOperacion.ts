import { AlmacenInventarioProps } from "./almacen.ts";
import { ArticuloPrecioProps } from "./articuloPrecio.ts";
import { LoteInventarioProps } from "./lote.ts";
import { SucursalProps } from "./sucursal.ts";

/**
 * Inventario de articulo para operaciones
 * @author isi-template
 * @deprecated - Reemplazada por ArticuloInventarioOperacionProps
 */
export interface InventarioOperacionProps {
  _id: string;
  codigoArticulo: string;
  nombreArticulo: string;
  sucursal: SucursalProps;
  articuloPrecio: ArticuloPrecioProps;
  articuloPrecioBase: ArticuloPrecioProps;
  almacen: AlmacenInventarioProps;
  lote: LoteInventarioProps | null;
  totalStock: number; // Sumatoria stock de todos los almacenes
  totalComprometido: number; // Sumatoria comprometido de todos los almacenes
  totalSolicitado: number; // Stock reservado para pedidos para ordenes de compra aprobadas
  totalDisponible: number; // Disponible para transacción
  stock: number; // Existencia segun el tipo de busqueda, almacen u lote
  comprometido: number; // Existencia segun el tipo de busqueda, almacen u lote
  solicitado: number; // Existencia segun el tipo de busqueda, almacen u lote
  disponible: number; // Existencia segun el tipo de busqueda, almacen u lote
}

/**
 * Inventario de articulo para operaciones
 * Version 2026.4
 * @author isi-template
 */
export interface ArticuloInventarioOperacionProps {
  /** Id del inventario */
  _id: string;
  /** Id del articulo */
  articuloId: string;
  /** Código del articulo */
  codigoArticulo: string;
  /** Nombre del articulo */
  nombreArticulo: string;
  /** Sucursal segun sesión */
  sucursal: SucursalProps;
  /** Articulo precio para realizar la transacción */
  articuloPrecio: ArticuloPrecioProps;
  /** Articulo precio segun la unida de medida báse */
  articuloPrecioBase: ArticuloPrecioProps;
  /** Almacen con inventario según articulo precio */
  almacen: AlmacenInventarioProps | null;
  /** Lote con inventario según articulo precio */
  lote: LoteInventarioProps | null;
  /** Total stock segun articulo precio */
  totalStock: number;
  /** Total comprometido segun articulo precio */
  totalComprometido: number;
  /** Total solicitado segun articulo precio */
  totalSolicitado: number;
  /** Total disponible segun articulo precio */
  totalDisponible: number;
  /** Existencia según el tipo de busqueda, almacen u lote */
  stock: number;
  /** Existencia según el tipo de busqueda, almacen u lote */
  comprometido: number;
  /** Existencia segun el tipo de busqueda, almacen u lote */
  solicitado: number;
  /** Existencia segun el tipo de busqueda, almacen u lote */
  disponible: number;
}
