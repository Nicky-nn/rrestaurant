import { genReplaceEmpty } from '../../../utils/helper'
import { ClientApiInputProps, ClientInputProps } from '../interfaces/client'

export const registerClientComposeService = (
  input: ClientInputProps,
): ClientApiInputProps => {
  return {
    nombres: input.nombres,
    apellidos: genReplaceEmpty(input.apellidos, ''),
    codigoTipoDocumentoIdentidad: input.sinTipoDocumento?.codigoClasificador!,
    numeroDocumento: input.numeroDocumento,
    complemento: genReplaceEmpty(input.complemento, null),
    email: input.email,
    razonSocial: input.razonSocial,
    telefono: genReplaceEmpty(input.telefono, null),
  }
}
