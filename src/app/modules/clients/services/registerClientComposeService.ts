import { genReplaceEmpty } from '../../../utils/helper'
import { ClientApiInputProps, ClientInputProps } from '../interfaces/client'

export const registerClientComposeService = (
  input: ClientInputProps,
): ClientApiInputProps => {
  return {
    nombres: input.nombres,
    apellidos: genReplaceEmpty(input.apellidos, ''),
    codigoTipoDocumentoIdentidad: input.sinTipoDocumento!.codigoClasificador,
    numeroDocumento: input.numeroDocumento,
    complemento: genReplaceEmpty(input.complemento, null),
    email: input.email,
    razonSocial: input.razonSocial,
    telefono: genReplaceEmpty(input.telefono, null),
    direccion: JSON.stringify({
      calle: input.direccion.calle,
      número: input.direccion.numero,
      apartamento: input.direccion.apartamento,
      barrio: input.direccion.barrio,
      referenciasAdicionales: input.direccion.referenciasAdicionales,
    }),
  }
}
