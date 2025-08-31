/**
 * @author isi-template
 */
export interface SinUnidadMedidaProps {
  codigoClasificador: string
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinTipoDocumentoSectorProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinTipoDocumentoIdentidadProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinTipoMetodoPagoProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinMotivoAnulacionProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinTipoMonedaProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinTipoPuntoVentaProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinTipoEmisionProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinTipoFacturaProps {
  codigoClasificador: number
  descripcion: string
}

/**
 * @author isi-template
 */
export interface SinActividadesEconomicasProps {
  codigoCaeb: string
  descripcion: string
  tipoActividad: string
}

/**
 * @author isi-template
 */
export interface SinActividadesProps {
  codigoCaeb: string
  descripcion: string
  tipoActividad: string
  codigoDocumentoSector: number
  tipoDocumentoSector: string
}

/**
 * @author isi-template
 */
export interface SinActividadesPorDocumentoSector {
  codigoActividad: string
  codigoCaeb: string
  codigoDocumentoSector: number
  tipoDocumentoSector: string
  actividadEconomica: string
  tipoActividad: string
}

/**
 * @author isi-template
 */
export interface SinActividadesDocumentoSectorProps {
  codigoActividad: string
  codigoDocumentoSector: number
  tipoDocumentoSector: string
  actividadEconomica: string
  tipoActividad: string
}

/**
 * @author isi-template
 */
export interface SinProductoServicioProps {
  codigoActividad: string
  codigoProducto: string
  descripcionProducto: string
}

/**
 * @author isi-template
 */
export interface MontoProps {
  monto: number
  moneda: SinTipoMonedaProps
  tipoCambio: number
}

/**
 * @author isi-template
 */
export interface SinCufdProps {
  codigo: string
  codigoControl: string
  direccion: string
  fechaInicial: string
  fechaVigencia: string
}

/**
 * @author isi-template
 */
export interface SinCuisProps {
  codigo: string
  fechaVigencia: string
}
