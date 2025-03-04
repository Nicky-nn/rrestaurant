import { PerfilProps } from '../base/models/loginModel'
import { EntidadInputProps } from '../interfaces'

/**
 * @description Obtenemos la entidad de la sucursal y punto de venta
 * @param user
 */
export const getEntidadInput = (user: PerfilProps): EntidadInputProps => ({
  codigoSucursal: user.sucursal.codigo,
  codigoPuntoVenta: user.puntoVenta.codigo,
})
