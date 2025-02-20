import { localNamePrinter } from '../base/interfaces/licenciaProducto'

/**
 * Decodifica los parametros de la licencia para impresion
 * @param params
 */
export const decodePrintParams = (params: string | null): { host: string } => {
  try {
    if (!params) return { host: 'http://localhost:7777' }
    return JSON.parse(params)
  } catch (e: any) {
    console.log(`Error decodificando parametros ${e.message}`)
    return { host: 'http://localhost:7777' }
  }
}

/**
 * Decodifica los parametros de la licencia para whatsapp
 * @param params
 */
export const decodeWhatsappParams = (params: string | null): { ok: boolean } => {
  try {
    if (!params) return { ok: true }
    return JSON.parse(params)
  } catch (e: any) {
    console.log(`Error decodificando parametros ${e.message}`)
    return { ok: false }
  }
}

/**
 * Obtenemos el nombre de la impresora de localStorage
 */
export const getNamePrinter = (): string | null => {
  try {
    return localStorage.getItem(localNamePrinter)
  } catch (e) {
    return null
  }
}

/**
 * Guardamos el nombre de la impresora en localStorage
 * @param name
 */
export const setNamePrinter = (name: string) => {
  localStorage.setItem(localNamePrinter, name)
}

/**
 * Eliminamos el nombre de la impresora en localStorage
 */
export const deleteNamePrinter = () => {
  localStorage.removeItem(localNamePrinter)
}
