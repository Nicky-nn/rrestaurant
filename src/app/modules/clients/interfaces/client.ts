import { actionForm, ActionFormProps, AuditoriaProps, PageInputProps } from '../../../interfaces'
import { SinTipoDocumentoIdentidadProps } from '../../../interfaces/sin.interface'

export interface ClientProps extends AuditoriaProps {
  _id: string
  apellidos: string
  codigoCliente: string
  codigoExcepcion: number
  complemento: string
  email: string
  nombres: string
  numeroDocumento: string
  razonSocial: string
  tipoDocumentoIdentidad: SinTipoDocumentoIdentidadProps
  state: string
  telefono: string
  lineaCredito: boolean

  direccion: string
  creditoMaximo: number
  creditoMinimo: number
  direccionLaboral: string
  entidadLaboral: string
  maximoPlazo: number
}

export interface ClientInputProps {
  sinTipoDocumento: SinTipoDocumentoIdentidadProps | null
  razonSocial: string
  numeroDocumento: string
  complemento: string
  email: string
  nombres: string
  apellidos: string
  telefono: string
  action: ActionFormProps
  direccion: {
    calle: string
    numero: string
    apartamento: string
    barrio: string
    referenciasAdicionales: string
  }
}

export interface ClientApiInputProps {
  codigoTipoDocumentoIdentidad: number
  nombres: string
  apellidos: string
  razonSocial: string
  numeroDocumento: string
  complemento: string
  email: string
  telefono: string
  direccion?: string
}

export const CLIENT_DEFAULT_INPUT: ClientInputProps = {
  sinTipoDocumento: null,
  razonSocial: '',
  numeroDocumento: '',
  complemento: '',
  email: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  action: actionForm.REGISTER,
  direccion: {
    calle: '',
    numero: '',
    apartamento: '',
    barrio: '',
    referenciasAdicionales: '',
  },
}

export const PAGE_DEFAULT_WITH_CREDIT: PageInputProps = {
  limit: 10,
  page: 0,
  reverse: true,
  query: 'lineaCredito=true',
}
