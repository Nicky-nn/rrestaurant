import { genRandomString } from "../utils/helper.ts";
import { AlmacenProps } from "./almacen.ts";
import { ArticuloPrecioOperacionApiInputProps } from "./articuloPrecio.ts";
import { ArticuloUnidadMedidaProps } from "./articuloUnidadMedida.ts";
import { ClaseArticuloProps } from "./claseArticulo.ts";
import { GestionArticuloProps } from "./gestionArticulo.ts";
import { GrupoArticuloOperacionProps } from "./grupoArticulo.ts";
import { LoteInventarioApiInputProps, LoteProps } from "./lote.ts";
import { MonedaProps } from "./monedaPrecio.ts";
import { SinProductoServicioProps } from "./sin.interface.ts";
import { TipoArticuloOperacionProps } from "./tipoArticulo.ts";

/**
 * @author isi-template
 */
export interface ArticuloOperacionInputProps {
  id: string;
  nroItem: number | null;
  articuloId: string;
  codigoArticulo: string;
  nombreArticulo: string;
  tipoArticulo: TipoArticuloOperacionProps | null;
  claseArticulo: ClaseArticuloProps | null;
  grupoArticulo?: GrupoArticuloOperacionProps | null;
  gestionArticulo: GestionArticuloProps | null;
  almacen: AlmacenProps | null;
  lote: LoteProps | null;
  sinProductoServicio: SinProductoServicioProps | null;
  articuloUnidadMedida: ArticuloUnidadMedidaProps | null;
  // Cantidad solo para front-end
  cantidadOriginal: number;
  /** Cantidad equivalente segun articuloUnidadMedida */
  cantidadFactor: number;
  cantidad: number;
  descuento: number;
  descuentoP: number; // descuento porcentaje
  /** Impuesto porcentual 0 - 100%, default 0 */
  impuesto: number;
  /** Costo o precioBase del articulo */
  costo: number;
  /** Dependiendo el tipoMonto, puede ser precioBase, precio, delivery, etc */
  precio: number;
  /** Costo anterior que no cambia en el tiempo, se registra en funciones de conversión */
  costoAnterior?: number;
  /** Precio anterior que no cambia en el tiempo, se registra en funciones de conversión */
  precioAnterior?: number;
  moneda: MonedaProps | null;
  detalleExtra: string | null;
  nota: string | null;
  verificarStock: boolean;
  /**
   * Porcentaje de asignación financiera (0-100).
   * Uso exclusivo en Producción (DESPIECE / CONJUNTA) para prorratear el costo base.
   * En otras operaciones (Ventas/Compras) su valor es 0.
   */
  porcentajeCosto?: number;
}
/**
 * @author isi-template
 */
export interface ArticuloOperacionApiInputProps {
  /** Nro de item que se reenvia en caso de modificación */
  nroItem?: number | null;
  codigoArticulo: string;
  codigoAlmacen: string;
  codigoLote: string | null;
  /** En caso de asociar multiples lotes */
  lotes?: LoteInventarioApiInputProps[];
  articuloPrecio: ArticuloPrecioOperacionApiInputProps;
  detalleExtra: string | null;
  nota: string | null;
  notaRapida?: string[];
  cortesia?: boolean;
}

/**
 * @author isi-template
 */
export const ARTICULO_OPERACION_DEFAULTS: ArticuloOperacionInputProps = {
  id: genRandomString(10).toUpperCase(),
  nroItem: null,
  articuloId: "",
  codigoArticulo: "",
  nombreArticulo: "",
  tipoArticulo: null,
  claseArticulo: null,
  grupoArticulo: null,
  gestionArticulo: null,
  almacen: null,
  lote: null,
  sinProductoServicio: null,
  articuloUnidadMedida: null,
  cantidadOriginal: 0,
  cantidadFactor: 0,
  cantidad: 0,
  descuento: 0,
  descuentoP: 0,
  impuesto: 0,
  precio: 0,
  costo: 0,
  costoAnterior: 0,
  precioAnterior: 0,
  moneda: null,
  detalleExtra: null,
  nota: null,
  verificarStock: false,
  porcentajeCosto: 0,
};
