import { ActionFormProps } from '../../../interfaces'
import { genReplaceEmpty } from '../../../utils/helper'
import { ClientInputProps, ClientProps } from '../interfaces/client'

export const clientDecomposeService = (input: ClientProps, action: ActionFormProps): ClientInputProps => {
  return {
    sinTipoDocumento: input.tipoDocumentoIdentidad,
    razonSocial: input.razonSocial,
    numeroDocumento: input.numeroDocumento,
    complemento: genReplaceEmpty(input.complemento, ''),
    email: input.email,
    nombres: genReplaceEmpty(input.nombres, ''),
    apellidos: genReplaceEmpty(input.apellidos, ''),
    telefono: genReplaceEmpty(input.telefono, ''),
    action,
  }
}
