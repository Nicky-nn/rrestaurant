import { AlmacenProps } from './almacen.ts'
import { ArticuloPrecioOperacionProps, ArticuloPrecioProps } from './articuloPrecio.ts'
import { ClaseArticuloProps } from './claseArticulo.ts'
import { GestionArticuloProps } from './gestionArticulo.ts'
import { GrupoArticuloOperacionProps } from './grupoArticulo.ts'
import { GrupoUnidadMedidaProps } from './grupoUnidadMedida.ts'
import { ImagenCloudProps } from './imagen.ts'
import { AuditoriaProps } from './index.ts'
import { InventarioProps } from './inventario.ts'
import { LoteProps } from './lote.ts'
import { ProveedorOperacionProps } from './proveedorOperacion.ts'
import {
  SinActividadesProps,
  SinProductoServicioProps,
  SinTipoDocumentoSectorProps,
} from './sin.interface.ts'
import { TipoArticuloOperacionProps } from './tipoArticulo.ts'

/**
 * Datos operacionales del articulo
 * @author isi-template
 */
export interface ArticuloOperacionProps {
  // id unico generado solo por front-end
  id: string | null
  // numero de item
  nroItem: number
  // id del articulo
  articuloId: string
  tipoArticulo: TipoArticuloOperacionProps | null
  claseArticulo: ClaseArticuloProps | null
  grupoArticulo: GrupoArticuloOperacionProps | null
  gestionArticulo: GestionArticuloProps | null
  codigoArticulo: string
  nombreArticulo: string
  almacen: AlmacenProps | null
  lote: LoteProps | null
  codigoGrupo: number | null
  sinProductoServicio: SinProductoServicioProps
  articuloPrecioBase: ArticuloPrecioOperacionProps // transformación segun la moneda y configuracion de inventario
  articuloPrecio: ArticuloPrecioOperacionProps // Transformación segun la nueva moneda de ingreso y el tipo de cambio
  detalleExtra: string
  nota: string
  verificarStock: boolean
}
/**
 * @author isi-template
 */
export interface ArticuloComplementoProps {
  id: string
  codigoArticulo: string
  nombreArticulo: string
}

/**
 * @description Tabla principal del articulo
 * @author isi-template
 */
export interface ArticuloProps extends AuditoriaProps {
  _id: string
  codigoArticulo: string
  nombreArticulo: string // nombre propio o corto del articulo
  descripcionArticulo: string | null // Descripcion detallada del producto
  descripcionHtml: string | null // Descripcion con tags html del producto
  documentoSector: SinTipoDocumentoSectorProps
  actividadEconomica: SinActividadesProps // Actividad economica relacionada con DS FCV
  sinProductoServicio: SinProductoServicioProps // Homologación del producto o articulo con el sin
  tipoArticulo: TipoArticuloOperacionProps // Clasificador de tipos de articulos articulos
  proveedor: ProveedorOperacionProps[] // Lista de proveedores del producto
  imagen: ImagenCloudProps | null
  codigoGrupoUnidadMedida: number | null // grupo de unidad de medida del articulo, se realiza una relación de 1 a 1
  grupoUnidadMedida: GrupoUnidadMedidaProps | null // grupo de unidad de medida del articulo, se realiza una relación de 1 a 1
  articuloPrecioBase: ArticuloPrecioProps // Segun la unidad de medida principal o minima
  articuloPrecio: ArticuloPrecioProps[] // Todas las convinaciones de precios segun la unidad de medida
  // codigos para compras, ventas, inventario
  articuloVenta: boolean // Si se usa solo para venta
  articuloInventario: boolean // Si se usa solo para inventarios
  articuloCompra: boolean // Si se usa solo para compras / o compras administrativas
  inventario: InventarioProps[] // lista de almacenes donde se almacena el articulo, se filtra por sucursal por eso array
  claseArticulo: ClaseArticuloProps // P = Producto, S = Servicio, C = Compra para gastos
  grupoArticulo: GrupoArticuloOperacionProps | null // Grupo de articulo ejemplo Impresora, comidas, etc
  gestionArticulo: GestionArticuloProps | null // No se gestiona, NULL, SERIE, LOTE
  verificarStock: boolean // si es true, se verifica el stock del articulo
  complemento: boolean
  listaComplemento: ArticuloComplementoProps[]
  activo: boolean // si es true, el articulo esta activo para su uso
  state?: string
}

/**
 * @author isi-template
 */
export interface ArticuloResumenProps {
  _id: string
  activo: boolean
  claseArticulo: ClaseArticuloProps // P = Producto, S = Servicio, C = Compra para gastos
  codigoArticulo: string
  descripcionArticulo: string
  gestionArticulo: GestionArticuloProps | null
  imagen: ImagenCloudProps | null
  nombreArticulo: string
  tipoArticulo: TipoArticuloOperacionProps
  verificarStock: boolean
}
