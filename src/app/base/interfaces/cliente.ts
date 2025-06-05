import { SinTipoDocumentoIdentidadProps } from '../../interfaces/sin.interface'

/**
 * Interface para cliente operacion
 */
export interface ClienteOperacionProps {
  apellidos: string
  codigoCliente: string
  complemento: string
  creditoMaximo: number
  creditoMinimo: number
  direccion: string
  direccionLaboral: string
  email: string
  entidadLaboral: string
  lineaCredito: boolean
  maximoPlazo: number
  nombres: string
  numeroDocumento: string
  razonSocial: string
  telefono: string
  tipoDocumentoIdentidad: SinTipoDocumentoIdentidadProps
}

/**
 * Datos de entrada para ingreso de cliente operacion api input
 */
export interface ClienteOperacionApiInputProps {
  codigoCliente: string
  direccion: string | null
  email: string
  razonSocial: string
  telefono: string | null
}
