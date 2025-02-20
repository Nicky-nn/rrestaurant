export interface LicenciaProductoProps {
  _id: string
  codigoActivacion: string
  //   configuracion: PrivateCode
  parametros: string | null
  delegado: boolean
  fechaVencimiento: string
  maximoConexiones: number
  tipoProducto: string
  // state: string
  state: 'ACTIVADO' | 'ANULADO'
}

export const localNamePrinter = 'printer'
