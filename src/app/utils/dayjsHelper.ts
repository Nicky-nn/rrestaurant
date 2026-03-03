import 'dayjs/locale/es'

import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)
/**
 * Convierte una fecha a formato DMY HH:MM:SS
 * @author isi-template
 * Usa la libreria dayjs
 * @author rquenta
 * @param date
 */
export const dateToDMYHHMMSS = (date: Date): string | null => {
  if (dayjs(date).isValid()) return dayjs(date).format('DD/MM/YYYY HH:mm:ss').toString()
  return null
}

/**
 * Convierte una fecha dayjs a formato D/M/Y HH:MM:SS
 * @author isi-template
 * Usa la libreria dayjs
 * @author rquenta
 * @param date
 */
export const dayjsToDMYHHMMSS = (date: Dayjs | null): string | null => {
  if (!date) return null
  if (dayjs(date).isValid()) return dayjs(date).format('DD/MM/YYYY HH:mm:ss').toString()
  return null
}

/**
 * Convierte una fecha a formato DMY HH:MM
 * Usa la libreria dayjs
 * @author rquenta
 * @author isi-template
 * @param date
 */
export const dateToDMYHHMM = (date: Date): string | null => {
  if (dayjs(date).isValid()) return dayjs(date).format('DD/MM/YYYY HH:mm').toString()
  return null
}

/**
 * Convierte una fecha dayjs a formato D/M/Y
 * @author rquenta
 * @author isi-template
 * @param date
 */
export const dayjsToDMY = (date: Dayjs | null): string | null => {
  if (!date) return null
  if (dayjs(date).isValid()) return dayjs(date).format('DD/MM/YYYY').toString()
  return null
}
/**
 * Convierte una fecha date a formato D/M/Y
 * @author rquenta
 * @author isi-template
 * @param date
 */
export const dateToDMY = (date: Date | null): string | null => {
  if (!date) return null
  if (dayjs(date).isValid()) return dayjs(date).format('DD/MM/YYYY').toString()
  return null
}

/**
 * Convierte una fecha dayjs a formato D/M/Y HH:MM
 * @author rquenta
 * @author isi-template
 * @param date
 */
export const dayjsToDMYHHMM = (date: Dayjs | null): string | null => {
  if (!date) return null
  if (dayjs(date).isValid()) return dayjs(date).format('DD/MM/YYYY HH:mm').toString()
  return null
}

/**
 * Convierte una fecha string a dayjs
 * @author rquenta
 * @author isi-template
 * @param date
 */
export const dateDMYHHMMSSToDate = (date: string | null): Dayjs | null => {
  try {
    if (!date) return null
    return dayjs(date, 'DD/MM/YYYY HH:mm:ss', 'es')
  } catch (e: any) {
    console.log('Error al convertir la fecha', e.message)
    return null
  }
}
/**
 * Convierte una fecha string a dayjs
 * @author rquenta
 * @author isi-template
 * @param date
 */
export const dateDMYToDate = (date: string | null): Dayjs | null => {
  try {
    if (!date) return null
    return dayjs(date, 'DD/MM/YYYY', 'es')
  } catch (e: any) {
    console.log('Error al convertir la fecha', e.message)
    return null
  }
}

/**
 * Transforma un string de fecha a un objeto Date nativo.
 * Soporta variaciones con y sin hora.
 * - las variaciones son 'DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY HH:mm', 'DD/MM/YYYY'
 * - usa la libreria dayjs
 * @author isi-template
 * @param dateStr
 */
export const parseStringToDate = (dateStr: string | null | undefined): Date | null => {
  // Validar si es vacío, null o inexistente
  if (!dateStr || dateStr.trim() === '') {
    return null
  }
  // Definimos los formatos que queremos soportar por orden de prioridad
  const formats = ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY HH:mm', 'DD/MM/YYYY']
  // Intentar parsear con los formatos definidos
  // El tercer parámetro 'true' activa el "strict parsing" (validación estricta)
  const d = dayjs(dateStr, formats, true)
  // Retornar el objeto Date si es válido, de lo contrario null
  return d.isValid() ? d.toDate() : null
}

/**
 * Verifica si una fecha string ya ha expirado
 * @param dateStr
 * @author isi-template
 */
export const fechaStringVerificaExpiracion = (dateStr: string): boolean => {
  // Parseamos el formato específico de tu JSON
  const expiryDate = dayjs(dateStr, 'DD/MM/YYYY')
  // Comparamos con el momento actual (Enero 2026)
  return expiryDate.isBefore(dayjs(), 'day')
}

/**
 * Semaforo para veriricar si un fecha esta por caducar
 * @param dateStr fecha string
 * 'expired' | 'warning' | 'healthy'
 * @param days default 30 dias de verificación
 */
export const fechaStringExpirationStatus = (
  dateStr: string,
  days: number = 30,
): 'expired' | 'warning' | 'healthy' => {
  try {
    const expiryDate = dayjs(dateStr, 'DD/MM/YYYY')
    const today = dayjs()
    const warningThreshold = today.add(days, 'days') // Configurable: 30 días para alerta

    if (expiryDate.isBefore(today, 'day')) return 'expired'
    if (expiryDate.isBefore(warningThreshold, 'day')) return 'warning'
    return 'healthy'
  } catch (e) {
    return 'healthy'
  }
}

/**
 * Transforma una fecha dayjs a unix
 * @param date
 */
export const dayjsToUnix = (date: Dayjs | null): number | null => {
  if (!date) return null
  if (date.isValid()) return date.unix()
  return null
}

/**
 * Transforma una fecha Date a unix
 * @param date
 */
export const dateToUnix = (date: Date | null): number | null => {
  if (!date) return null
  if (dayjs(date).isValid()) return dayjs(date).unix()
  return null
}
