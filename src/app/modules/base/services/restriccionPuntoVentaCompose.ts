import { UsuarioSucursalRestriccionProps } from '../cuenta/interfaces/restriccion.interface'

/**
 * Devuelve la lista de puntos de venta de una sucursal específica
 * en el formato { key, value } que usa FormMultiSelect.
 */
export const restriccionPuntoVentaCompose = (
  codigoSucursal: number,
  sucursales?: UsuarioSucursalRestriccionProps[],
): { key: number; value: string }[] => {
  if (!sucursales) return []
  const sucursal = sucursales.find((s) => s.codigo === codigoSucursal)
  if (!sucursal) return []
  return sucursal.puntosVenta.map((pv) => ({
    key: pv.codigo,
    value: pv.nombre || pv.descripcion,
  }))
}
