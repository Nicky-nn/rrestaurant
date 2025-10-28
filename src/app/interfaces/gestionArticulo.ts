import { KeyValueProp } from '../base/interfaces/base.ts'

/** ******************************* */
export type GestionArticuloProps = 'SERIE' | 'LOTE' // No se gestiona, SERIE, LOTE
export const apiGestionArticulo: { [Key in GestionArticuloProps]: GestionArticuloProps } =
  {
    SERIE: 'SERIE',
    LOTE: 'LOTE',
  }

export const GESTION_ARTICULO_DEFAULTS: KeyValueProp<GestionArticuloProps>[] = [
  { key: 'LOTE', value: 'LOTE' },
]
