import { MetodoPagoProp } from '../../base/metodoPago/interfaces/metodoPago'
import { MonedaProps } from '../../base/moneda/interfaces/moneda'
import { ClientProps } from '../../clients/interfaces/client'
import { ProductoVarianteProps } from '../../productos/interfaces/producto.interface'
import { PuntoVentaProps } from '../../puntoVenta/interfaces/puntoVenta'
import {
  SinActividadesDocumentoSectorProps,
  SinActividadesProps,
  SinCufdProps,
  SinCuisProps,
  SinMotivoAnulacionProps,
  SinProductoServicioProps,
  SinTipoDocumentoSectorProps,
  SinTipoEmisionProps,
  SinTipoFacturaProps,
  SinTipoMetodoPagoProps,
  SinTipoMonedaProps,
  SinUnidadMedidaProps,
} from '../../../interfaces/sin.interface'
import { SucursalProps } from '../../notaCreditoDebito/types'

export interface FacturaDetalleInputProps extends ProductoVarianteProps {
  codigoActividad?: string | null
  verificarStock: boolean
  codigoProductoSin: string
  descripcion: string
  numeroImei: string
  numeroSerie: string
  cantidad: number | null
  montoDescuento: number | null
  precioUnitario: number | null
  detalleExtra: string
  subtotal: number
  incluirCantidad: boolean
}

export interface FacturaInputProps {
  actividadEconomica: SinActividadesDocumentoSectorProps | null
  tipoCliente: 'N' | '99002' | '99003'
  cliente: ClientProps | null
  codigoCliente: string
  codigoExcepcion: boolean | null
  codigoMetodoPago: MetodoPagoProp
  codigoMoneda: number
  descuentoAdicional: number
  detalle: FacturaDetalleInputProps[]
  detalleExtra?: string | null
  detalleExtraText?: string | null
  emailCliente?: string | null
  montoGiftCard?: number | null
  numeroTarjeta?: string | null
  tipoCambio: number
  montoPagar: number
  montoSubTotal: number
  total: number
  inputMontoPagar: number
  inputVuelto: number
  moneda?: MonedaProps
}

/**
 * Valores iniciales del formulario
 */
export const FacturaInitialValues: FacturaInputProps = {
  actividadEconomica: null,
  tipoCliente: 'N',
  cliente: null,
  codigoCliente: '',
  codigoExcepcion: false,
  codigoMetodoPago: {
    codigoClasificador: 1,
    descripcion: 'EFECTIVO',
  },
  codigoMoneda: 1,
  descuentoAdicional: 0,
  detalle: [] as FacturaDetalleInputProps[],
  detalleExtra: '',
  detalleExtraText: '',
  emailCliente: null,
  montoGiftCard: 0,
  numeroTarjeta: null,
  tipoCambio: 1,
  montoSubTotal: 0,
  montoPagar: 0,
  total: 0,
  inputMontoPagar: 0,
  inputVuelto: 0,
}

export interface RepresentacionGraficaProps {
  pdf: string
  rollo: string
  xml: string
  sin: string
}

export interface DetalleFacturaProps {
  actividadEconomica: SinActividadesProps
  cantidad: number
  descripcion: string
  detalleExtra: string
  montoDescuento: number
  nroItem: number
  numeroImei: string
  numeroSerie: string
  precioUnitario: number
  producto: string
  productoServicio: SinProductoServicioProps
  subTotal: number
  unidadMedida: SinUnidadMedidaProps
}

export interface FacturaProps {
  _id: string
  cafc: string
  cliente: ClientProps
  codigoRecepcion: String
  createdAt: string
  cuf: string
  cufd: SinCufdProps
  cuis: SinCuisProps
  descuentoAdicional: number
  detalle: DetalleFacturaProps[]
  detalleExtra: string
  documentoSector: SinTipoDocumentoSectorProps
  eventoSignificativo: any
  fechaEmision: string
  leyenda: string
  metodoPago: SinTipoMetodoPagoProps
  moneda: SinTipoMonedaProps
  montoGiftCard: number
  montoTotal: number
  montoTotalLiteral: number
  montoTotalMoneda: number
  montoTotalSujetoIva: number
  motivoAnulacion: SinMotivoAnulacionProps
  nitEmisor: string
  numeroFactura: number
  numeroTarjeta: string
  puntoVenta: PuntoVentaProps
  razonSocialEmisor: string
  representacionGrafica: RepresentacionGraficaProps
  state: string
  subLeyenda: string
  sucursal: SucursalProps
  tipoCambio: number
  tipoEmision: SinTipoEmisionProps
  tipoFactura: SinTipoFacturaProps
  updatedAt: string
  usuario: string
  usucre: string
  usumod: string
}
