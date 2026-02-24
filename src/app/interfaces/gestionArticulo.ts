import { KeyValueProp } from '../base/interfaces/base.ts'

/** ******************************* */
/**
 * @author isi-template
 */
export type GestionArticuloProps = 'SERIE' | 'LOTE' // No se gestiona, SERIE, LOTE
export const apiGestionArticulo: { [Key in GestionArticuloProps]: GestionArticuloProps } = {
  SERIE: 'SERIE',
  LOTE: 'LOTE',
}
/**
 * @author isi-template
 */
export const GESTION_ARTICULO_DEFAULTS: KeyValueProp<GestionArticuloProps>[] = [
  { key: 'LOTE', value: 'LOTE' },
]
