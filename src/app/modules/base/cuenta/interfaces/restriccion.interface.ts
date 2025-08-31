/**
 * @author isi-template
 */
export interface UsuarioPuntoVentaRestriccionProps {
  codigo: number
  tipoPuntoVenta: {
    codigoClasificador: number
    descripcion: string
  }
  nombre: string
  descripcion: string
}

/**
 * @author isi-template
 */
export interface UsuarioSucursalRestriccionProps {
  codigo: number
  telefono: string
  direccion: string
  departamento: {
    codigo: number
    codigoPais: number
    sigla: string
    departamento: string
  }
  municipio: string
  puntosVenta: Array<UsuarioPuntoVentaRestriccionProps>
}

/**
 * @author isi-template
 */
export interface UsuarioRestriccionProps {
  sucursales: Array<UsuarioSucursalRestriccionProps>
}
