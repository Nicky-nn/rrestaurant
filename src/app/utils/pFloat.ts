/**
 * @description Parsea un string o number a un valor numérico, en caso de ocurrir un error devuelve null
 * @author isi-template
 * @param value
 */
export const pFloat = (value: any): number | null => {
  try {
    if (typeof value === 'number') {
      return value as number
    }
    return parseFloat(value.toString())
  } catch {
    return null
  }
}
