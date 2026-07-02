import {
  ArticuloOperacionApiInputProps,
  ArticuloOperacionInputProps,
} from "../../interfaces/articuloOperacion.ts";
import { genReplaceEmpty } from "../../utils/helper.ts";

/**
 * Decodificamos el articuloOperacionInputProp a ArticuloOperacionApiInputProp
 * @param input
 * @author isi-template
 */
export const articuloOperacionInputToApiService = (
  input: ArticuloOperacionInputProps,
): ArticuloOperacionApiInputProps => {
  return {
    nroItem: input.nroItem || null,
    articuloPrecio: {
      cantidad: input.cantidad,
      codigoArticuloUnidadMedida:
        input.articuloUnidadMedida!.codigoUnidadMedida,
      descuento: input.descuento,
      impuesto: input.impuesto,
      precio: input.precio,
      esDescuentoTotal: true,
      incluyeImpuesto: false,
      porcentajeCosto: input.porcentajeCosto ?? 0,
    },
    codigoAlmacen: input.almacen!.codigoAlmacen,
    codigoArticulo: input!.codigoArticulo,
    codigoLote: genReplaceEmpty(input.lote?.codigoLote, null),
    detalleExtra: genReplaceEmpty(input.detalleExtra, null),
    nota: genReplaceEmpty(input.nota, null),
    cortesia: false,
  };
};
