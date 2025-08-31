/**
 * Convierte un numero en su equivalente con comas decimales 2
 * se usa generalmente en validadores como yup
 * @author isi-template
 * @param x
 * @param param1
 * @returns
 */
export const numberWithCommas = (x: number | undefined, { userTyping, input }: any) => {
  if (userTyping) {
    return input
  }
  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
  return Number(x).toLocaleString('en', options)
}

/**
 * @description Convierte un numero en su equivalente con comas decimales
 * @author isi-template
 * @param value
 * @param maximumFractionDigits
 */
export const numberWithCommasPlaces = (
  value: any | undefined,
  maximumFractionDigits = 2,
) => {
  const options = {
    minimumFractionDigits: maximumFractionDigits,
    maximumFractionDigits,
  }
  return Number(value).toLocaleString('en', options)
}
