import { gql, GraphQLClient } from "graphql-request"
import { MyGraphQlError } from "../services/GraphqlError"
import { AccessToken } from "../models/paramsModel"

const mutation = gql`
mutation CambiarUx($uxModo: String!) {
  cuentaCambiarUxModo(uxModo: $uxModo)
}  
`
/**
 * @description Cambiamos el modo de la cuenta (LIGHT, DARK, SYSTEM)
 * @author isi-template
 * @param uxModo
 */
export const cuentaCambioModo = async (
    uxModo: String,
): Promise<String> => {
    try {
        const client = new GraphQLClient(import.meta.env.ISI_API_URL)

        // Obtenemos token desde localStorage
        const token = localStorage.getItem(AccessToken)
        if (!token) throw new Error("No hay token de acceso disponible")

        // Seteamos header Authorization
        client.setHeader('authorization', `Bearer ${token}`)
        const data: any = await client.request(mutation, { uxModo })
        return data.cuentaCambiarUxModo
    } catch (e: any) {
        throw new MyGraphQlError(e)
    }
}