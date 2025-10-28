import { AuditoriaProps } from './index.ts'
import { SinTipoDocumentoSectorProps } from './sin.interface.ts'

/**
 * @description Modelo de Periodo
 */
export interface KardexPeriodoProps extends AuditoriaProps {
  codigo: number
  descripcion: string
  documentoSector: SinTipoDocumentoSectorProps
  state?: string
}
