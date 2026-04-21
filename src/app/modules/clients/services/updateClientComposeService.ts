import { genReplaceEmpty } from '../../../utils/helper'
import { ClientApiInputProps, ClientInputProps } from '../interfaces/client'

export const updateClientComposeService = (input: ClientInputProps): ClientApiInputProps => {
  return {
    codigoTipoDocumentoIdentidad: input.sinTipoDocumento!.codigoClasificador,
    apellidos: genReplaceEmpty(input.apellidos, ''),
    nombres: input.nombres,
    numeroDocumento: input.numeroDocumento,
    complemento: genReplaceEmpty(input.complemento, ''),
    email: input.email,
    razonSocial: input.razonSocial,
    telefono: genReplaceEmpty(input.telefono, ''),
    direccion: JSON.stringify({
      calle: input.direccion.calle,
      número: input.direccion.numero,
      apartamento: input.direccion.apartamento,
      barrio: input.direccion.barrio,
      referenciasAdicionales: input.direccion.referenciasAdicionales,
    }),
  }
}
