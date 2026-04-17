import { RestNotaCreditoDebitoInput } from '../types'

export const ncdInputCompose = (ncd: NcdInputProps): RestNotaCreditoDebitoInput => {
  //@ts-ignore
  return {
    facturaCuf: ncd.facturaCuf,
    detalle: ncd.detalleFactura.map((item) => ({
      itemFactura: item.nroItem,
      cantidad: item.cantidad,
    })),
  }
}
