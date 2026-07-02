import { KeyValueProp } from '../base/interfaces/base'

/**
 * @description Clase de articulos que se pueden registrar
 */
export type TipoDocumentoProp = 'NOTA_VENTA' | 'FACTURA' | 'NOTA_COMPRA'
export const apiTipoDocumento: Record<TipoDocumentoProp, TipoDocumentoProp> = {
  NOTA_VENTA: 'NOTA_VENTA',
  FACTURA: 'FACTURA',
  NOTA_COMPRA: 'NOTA_COMPRA',
}

export const apiTipoDocumentoListado: KeyValueProp<TipoDocumentoProp>[] = Object.keys(apiTipoDocumento).map(
  (val) => ({
    key: val as TipoDocumentoProp,
    value: val as TipoDocumentoProp,
  }),
)

export const apiTipoDocumentoNotaCompra = apiTipoDocumentoListado.find((at) => at.key === 'NOTA_COMPRA')
