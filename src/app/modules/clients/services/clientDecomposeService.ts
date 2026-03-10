import { ActionFormProps } from '../../../interfaces'
import { genReplaceEmpty } from '../../../utils/helper'
import { ClientInputProps, ClientProps } from '../interfaces/client'

export const clientDecomposeService = (input: ClientProps, action: ActionFormProps): ClientInputProps => {
  let direccionParsed = {
    calle: '',
    numero: '',
    apartamento: '',
    barrio: '',
    referenciasAdicionales: '',
  }

  if (input.direccion) {
    try {
      const parsed = JSON.parse(input.direccion)
      direccionParsed = {
        calle: parsed.calle || '',
        numero: parsed.número || parsed.numero || '', // Handling both 'número' as in JSON and 'numero' in state just in case
        apartamento: parsed.apartamento || '',
        barrio: parsed.barrio || '',
        referenciasAdicionales: parsed.referenciasAdicionales || '',
      }
    } catch {
      // Ignore parse errors, will use fallback default
    }
  }

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
    direccion: direccionParsed,
  }
}
