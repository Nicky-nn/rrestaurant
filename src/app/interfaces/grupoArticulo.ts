import { ImagenCloudProps } from './imagen.ts'
import { AuditoriaProps } from './index.ts'

/**
 * @description Agrupador de articulo, es el valor que se usará para modificaciones de precios, descuentos globales
 */
export interface GrupoArticuloOperacionProps {
  codigoGrupoArticulo: string
  nombreGrupoArticulo: string // nombre propio o corto del articulo
}

/**
 * @description propiedades del articulo
 */
export interface GrupoArticuloProps extends AuditoriaProps {
  codigoGrupoArticulo: string
  nombreGrupoArticulo: string // nombre propio o corto del articulo
  descripcionGrupoArticulo: string | null // Descripcion detallada del producto
  prefijo: string | null // Prefijo para el generar el codigo del producto
  imagen: ImagenCloudProps | null
  activo: boolean // si es true, el articulo esta activo para su uso
  state?: string
}
