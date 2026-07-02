import { ArticuloMonedaProps } from "../../interfaces/articuloMoneda.ts";
import { ArticuloPrecioProps } from "../../interfaces/articuloPrecio.ts";
import {
  apiTipoMoneda,
  MonedaPrecioProps,
} from "../../interfaces/monedaPrecio.ts";
import { MonedaParamsProps } from "../interfaces/base.ts";

/**
 * Obtenemos la moneda en funcion a las monedas de sistema
 * @param moneda
 * @param articuloMoneda
 * @author isi-template
 */
export const getMonedaPorArticuloMonedaService = (
  moneda: MonedaParamsProps,
  articuloMoneda: ArticuloMonedaProps,
) => {
  const {
    monedaPrimaria,
    monedaAdicional1,
    monedaAdicional2,
    monedaAdicional3,
  } = articuloMoneda;
  if (moneda.codigo === monedaPrimaria.codigo)
    return { moneda: monedaPrimaria, tipoMoneda: apiTipoMoneda.monedaPrimaria };

  if (monedaAdicional1) {
    if (moneda.codigo === monedaAdicional1.codigo)
      return {
        moneda: monedaAdicional1,
        tipoMoneda: apiTipoMoneda.monedaAdicional1,
      };
  }

  if (monedaAdicional2) {
    if (moneda.codigo === monedaAdicional2.codigo)
      return {
        moneda: monedaAdicional2,
        tipoMoneda: apiTipoMoneda.monedaAdicional2,
      };
  }

  if (monedaAdicional3) {
    if (moneda.codigo === monedaAdicional3.codigo)
      return {
        moneda: monedaAdicional3,
        tipoMoneda: apiTipoMoneda.monedaAdicional3,
      };
  }

  throw new Error("Moneda could not be found.");
};

/**
 * Transformamos los datos de moneda usuario a su equivalente moneda precio
 * @param moneda
 * @param articuloPrecio
 * @author isi-template
 */
export const getMonedaPrecioPorArticuloPrecioService = (
  moneda: MonedaParamsProps,
  articuloPrecio: ArticuloPrecioProps,
): MonedaPrecioProps | null => {
  const {
    monedaPrimaria,
    monedaAdicional1,
    monedaAdicional2,
    monedaAdicional3,
  } = articuloPrecio;

  if (moneda.codigo === monedaPrimaria.moneda.codigo) return monedaPrimaria;

  if (monedaAdicional1) {
    if (moneda.codigo === monedaAdicional1.moneda.codigo)
      return monedaAdicional1;
  }

  if (monedaAdicional2) {
    if (moneda.codigo === monedaAdicional2.moneda.codigo)
      return monedaAdicional2;
  }

  if (monedaAdicional3) {
    if (moneda.codigo === monedaAdicional3.moneda.codigo)
      return monedaAdicional3;
  }
  return null;
};
