/**
 * Clasificador de metodos de pago
 * @author isi-template
 */
export interface MetodoPagoProps {
  codigoClasificador: number
  descripcion: string
  usucre?: string
  usumod?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Metodo de pago de sistema constante en todos los comercios
 * @author isi-template
 */
export const METODO_PAGO_EFECTIVO: MetodoPagoProps = {
  codigoClasificador: 1,
  descripcion: 'EFECTIVO',
}
