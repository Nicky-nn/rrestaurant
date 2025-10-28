import { ArticuloPrecioProps } from '../../interfaces/articuloPrecio.ts'
import { MonedaPrecioProps } from '../../interfaces/monedaPrecio.ts'
import { MonedaParamsProps } from '../interfaces/base.ts'

/**
 * Realizamos la transformacion de articuloPrecio segun la moneda del user o alguna referencia moneda
 * @param articuloPrecio
 * @param moneda
 */
export const transformarArticuloPrecioService = (
  articuloPrecio: ArticuloPrecioProps,
  moneda: MonedaParamsProps,
): MonedaPrecioProps => {
  if (moneda.codigo === articuloPrecio.monedaPrimaria.moneda.codigo) {
    return articuloPrecio.monedaPrimaria
  }
  if (moneda.codigo === articuloPrecio.monedaAdicional1?.moneda.codigo) {
    return articuloPrecio.monedaAdicional1
  }
  if (moneda.codigo === articuloPrecio.monedaAdicional2?.moneda.codigo) {
    return articuloPrecio.monedaAdicional2
  }
  if (moneda.codigo === articuloPrecio.monedaAdicional3?.moneda.codigo) {
    return articuloPrecio.monedaAdicional3
  }
  console.log(
    `No se encontró la moneda ${moneda.sigla} para transformación, generado valores por estaticos`,
  )
  return {
    moneda: {
      _id: '',
      codigo: moneda.codigo,
      descripcion: moneda.descripcion,
      sigla: moneda.sigla,
      tipoCambio: moneda.tipoCambio || 0,
      tipoCambioCompra: moneda.tipoCambio || 0,
      activo: 1,
      usucre: 'Autogenerado',
      usumod: '',
      createdAt: '',
      updatedAt: '',
    },
    precioBase: 0,
    precio: 0,
    delivery: 0,
    precioComparacion: 0,
    manual: false,
  }
}
