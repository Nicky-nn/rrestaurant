import {
  SinActividadesProps,
  SinCufdProps,
  SinCuisProps,
  SinMotivoAnulacionProps,
  SinProductoServicioProps,
  SinTipoDocumentoSectorProps,
  SinTipoEmisionProps,
  SinTipoFacturaProps,
  SinUnidadMedidaProps,
} from '../../sin/interfaces/sin.interface'
import { ClientProps } from '../../clients/interfaces/client'
import { PuntoVentaProps } from '../../puntoVenta/interfaces/puntoVenta'
import { SucursalProps } from '../../sucursal/interfaces/sucursal'
import { RepresentacionGraficaProps } from '../../ventas/interfaces/factura'
import { SalidaFacturaDetalle } from '../../ventas/types'

export interface NcdDetalleInputProps {
  nroItem: number
  cantidadOriginal: number
  cantidad: number
  descripcion: string
  montoDescuento: number
  precioUnitario: number
  subTotal: number
}

export interface NcdInputProps {
  numeroFactura: string
  fechaEmision: string
  razonSocial: string
  facturaCuf: string
  detalleFactura: NcdDetalleInputProps[]
  detalle: SalidaFacturaDetalle[]
}

export interface DetalleNcdProps {
  nroItem: number
  nroItemFactura: number
  actividadEconomica: SinActividadesProps
  productoServicio: SinProductoServicioProps
  producto: string
  descripcion: string
  cantidad: number
  unidadMedida: SinUnidadMedidaProps
  precioUnitario: number
  montoDescuento: number
  subTotal: number
  codigoDetalleTransaccion: 1 | 2
}

export interface NcdProps {
  nitEmisor: string
  razonSocialEmisor: string
  numeroNotaCreditoDebito: number
  numeroFactura: number
  cuf: string
  cufd: SinCufdProps
  cuis: SinCuisProps
  tipoFactura: SinTipoFacturaProps
  tipoEmision: SinTipoEmisionProps
  sucursal: SucursalProps
  puntoVenta: PuntoVentaProps
  fechaEmision: string
  cliente: ClientProps
  numeroAutorizacionCuf: string
  fechaEmisionFactura: string
  montoTotalOriginal: number
  montoTotalDevuelto: number
  montoTotalLiteral: number
  montoDescuentoCreditoDebito: number
  montoEfectivoCreditoDebito: number
  leyenda: string
  subLeyenda: string
  usuario: string     
  documentoSectorFactura: SinTipoDocumentoSectorProps
  documentoSector: SinTipoDocumentoSectorProps
  detalle: DetalleNcdProps[]
  codigoRecepcion: string
  motivoAnulacion: SinMotivoAnulacionProps
  representacionGrafica: RepresentacionGraficaProps
  usucre: string
  createdAt: string
  usumod: string
  updatedAt: string
  state: string
}
