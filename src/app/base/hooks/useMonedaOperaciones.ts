import { useMemo } from "react";

import { ArticuloMonedaProps } from "../../interfaces/articuloMoneda.ts";
import { PerfilProps } from "../models/loginModel.ts";
import { getMonedaPorArticuloMonedaService } from "../services/getMonedaService.ts";

/**
 * Hook para cargar el listado de monedas y retornar la moneda de user, usada para todas las operaciones
 * del usuario, solo si esta es válida (existe en el listado).
 * - moneda que debe usar el usuario para sus transacciones, usada en operaciones de compra y venta.
 * - monedaPrimaria, monedaAdicional1, monedaAdicional2, monedaAdicional3: listado de monedas disponibles, donde moneda primaria es la moneda que se debe usar por defecto.
 * - Para el caso de inventarios debe usar monedaPrimaria.
 * @param user - El objeto de perfil que contiene la moneda establecida por el usuario.
 * @param articuloMoneda
 */
export const useMonedaOperaciones = (
  user: PerfilProps,
  articuloMoneda: ArticuloMonedaProps,
) => {
  const {
    monedaPrimaria,
    monedaAdicional1,
    monedaAdicional2,
    monedaAdicional3,
  } = articuloMoneda;

  // Usamos useMemo para calcular la moneda de operacion
  // Esto solo se recalculará si la lista de monedas o el perfil cambia cambian.
  const moneda = useMemo(() => {
    const monedaDeUso = user.moneda;

    const monedaEncontrada = getMonedaPorArticuloMonedaService(
      monedaDeUso,
      articuloMoneda,
    );

    // Si se encontró, esa es la moneda principal. Si no, retorna null.
    return monedaEncontrada || null;
  }, [user, articuloMoneda]);

  // Retorna los datos calculados
  return {
    moneda: moneda?.moneda, // null hasta que se encuentre, o si no es válida
    tipoMoneda: moneda?.tipoMoneda,
    monedaPrimaria, // La lista completa, por si el componente la necesita
    monedaAdicional1,
    monedaAdicional2,
    monedaAdicional3,
  };
};
