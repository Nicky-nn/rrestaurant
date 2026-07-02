// noinspection GraphQLUnresolvedReference

import { gql, GraphQLClient } from "graphql-request";
import { AccessToken } from "../../../base/models/paramsModel";
import { MyGraphQlError } from "../../../base/services/GraphqlError";
import { EntidadInputProps } from "../../../interfaces";
import { EntradaPorCajaApiInputProps, EntradaProps } from "../interfaces";
import { ENTRADA_FRAGMENT } from "../interfaces/fragments.ts";

const query = gql`
  ${ENTRADA_FRAGMENT}
  mutation ENTRADA_POR_CAJA_REGISTRO(
    $entidad: EntidadParamsInput!
    $cajaInput: EntradaPorCajaArqueoCajaInput!
    $input: EntradaInput!
    $detalle: [ArticuloOperacionInput]!
  ) {
    entradaPorCajaRegistro(
      entidad: $entidad
      cajaInput: $cajaInput
      input: $input
      detalle: $detalle
    ) {
      ...EntradaFieldsFragment
    }
  }
`;

/**
 * Registro de una entrada por caja
 * @param entidad
 * @param args
 */
export const apiEntradaPorCajaRegistro = async (
  entidad: EntidadInputProps,
  args: EntradaPorCajaApiInputProps,
): Promise<EntradaProps> => {
  try {
    const client = new GraphQLClient(import.meta.env.ISI_API_URL);
    const token = localStorage.getItem(AccessToken);
    // Set a single header
    client.setHeader("authorization", `Bearer ${token}`);
    const { entradaInput: input, cajaInput, detalle } = args;

    const data: any = await client.request(query, {
      entidad,
      cajaInput,
      input,
      detalle,
    });

    return data.entradaPorCajaRegistro;
  } catch (e: any) {
    throw new MyGraphQlError(e);
  }
};
