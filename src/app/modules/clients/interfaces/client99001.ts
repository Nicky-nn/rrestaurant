export interface Cliente99001InputProps {
  razonSocial: string
  email: string
  codigoCliente: string
}

/** Genera un código de cliente aleatorio de 7 letras mayúsculas, ej: XAHAIWW */
export const generarCodigoCliente99001 = (): string => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return Array.from({ length: 7 }, () => letras[Math.floor(Math.random() * letras.length)]).join('')
}

export const CLIENTE_99001_DEFAULT_INPUT = (): Cliente99001InputProps => ({
  razonSocial: '',
  email: '',
  codigoCliente: generarCodigoCliente99001(),
})
