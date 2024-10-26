import 'dayjs/locale/es'

import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

/**
 * Convierte una fecha a formato DMY HH:MM:SS
 * Usa la libreria dayjs
 * @param date
 */
export const dateToDMYHHMMSS = (date: Date): string | null => {
  dayjs.extend(customParseFormat)
  if (dayjs(date).isValid()) return dayjs(date).format('DD/MM/YYYY HH:mm:ss').toString()
  return null
}

/**
 * Convierte una fecha string a dayjs
 * @param date
 */
export const dateDMYHHMMSSToDate = (date: string | null): Dayjs | null => {
  try {
    if (!date) return null
    dayjs.extend(customParseFormat)
    return dayjs(date, 'DD/MM/YYYY HH:mm:ss', 'es')
  } catch (e: any) {
    console.log('Error al convertir la fecha', e.message)
    return null
  }
}
/**
 * Convierte una fecha string a dayjs
 * @param date
 */
export const dateDMYToDate = (date: string | null): Dayjs | null => {
  try {
    if (!date) return null
    dayjs.extend(customParseFormat)
    return dayjs(date, 'DD/MM/YYYY', 'es')
  } catch (e: any) {
    console.log('Error al convertir la fecha', e.message)
    return null
  }
}
