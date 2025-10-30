import { MonedaProps } from './monedaPrecio.ts'

/**
 * Articulo Moneda
 * @author isi-template
 */
export interface ArticuloMonedaProps {
  monedaPrimaria: MonedaProps
  monedaAdicional1: MonedaProps | null
  monedaAdicional2: MonedaProps | null
  monedaAdicional3: MonedaProps | null
  state?: string
  usucre?: string
  usumod?: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * @author isi-template
 */
export interface ArticuloMonedaInputProps {
  moneda: number
}

/**
 * @author isi-template
 */
export const ARTICULO_MONEDA_INITIAL_VALUES: ArticuloMonedaInputProps = {
  moneda: 0,
}
