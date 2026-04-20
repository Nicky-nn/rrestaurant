import { UsuarioSucursalRestriccionProps } from '../cuenta/interfaces/restriccion.interface'

/**
 * Composicion de restricciones de punto de venta
 * @param codigoSucursal
 * @param restriccion
 */
export const restriccionPuntoVentaCompose = (
  codigoSucursal: number,
  restriccion: UsuarioSucursalRestriccionProps[],
): { key: number; value: string }[] => {
  if (!restriccion) return []
  const sucursales = restriccion.find((item) => item.codigo === codigoSucursal)
  if (!sucursales) return []
  return sucursales.puntosVenta.map((item) => ({
    key: item.codigo,
    value: `S ${codigoSucursal} - PV ${item.codigo}`,
  }))
}
