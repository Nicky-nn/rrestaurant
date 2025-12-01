/**
 * @description console.log condicional al estado .env
 * @param args
 * @author isi-template
 */
import { MRT_ColumnFiltersState } from 'material-react-table'
import { customAlphabet } from 'nanoid'

/**
 * @author isi-template
 * @param args
 */
export const logg = (...args: any) => {
  if (import.meta.env.MODE !== 'production') {
    console.log(...args)
  }
}

/**
 * Abrimos url en una nueva pestaña
 * @author isi-template
 * @param url
 */
export const openInNewTab = (url: string): void => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const handleSelect = (event: any) => {
  if (event.target?.select) event.target.select()
}

/**
 * Devuelve el producto cartesiano de un array de items
 * @author isi-template
 * @param arr
 */
export const cartesianProduct = (arr: [[]]) => {
  return arr.reduce(
    function (a, b) {
      return a
        .map(function (x) {
          return b.map(function (y) {
            return x.concat([y])
          })
        })
        .reduce(function (a, b) {
          return a.concat(b)
        }, [])
    },
    [[]],
  )
}

/**
 * @description true = vacio, false = no vacio
 * @author isi-template
 * @param value
 */
export const isEmptyValue = (value: any): boolean => {
  const matches = [null, false, undefined, '']
  if (typeof value === 'object') {
    if (matches.includes(value)) return true
    if (Object.keys(value).length === 0) return true
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return true
  }
  if (typeof value === 'string') {
    if (matches.includes(value)) return true
    if (value.trim() === '') return true
  }
  if (value === null || value === false || value === undefined) return true
  return matches.includes(value)
}

/**
 * GENERAMOS CADENA ALEATORIA STRING SOLO ALFABETICO
 * @author isi-template
 * @param lng
 */
export const genRandomString = (lng = 5): string => {
  const nanoidd = customAlphabet('abcdefghijkmnpqrtwxyz', lng)
  return nanoidd()
}

/**
 * Verificamos el tipo de dato, parceamos y enviamos el dato correcto
 * @author isi-template
 * @param val
 * @param replace
 */
export const genReplaceEmpty = (val: any, replace: any): any => {
  if (val === undefined) return replace
  if (val === null) return replace
  if (typeof val === 'object') {
    if (Object.keys(val).length === 0) return replace
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return replace
  }

  // Verificando si es string
  if (typeof val === 'string' || val instanceof String) {
    if (val.trim() === '') return replace
  }
  return val
}

export const handleFocus = (event: any) => {
  if (event?.target?.select instanceof Function) {
    event.target.select()
  }
}

/**
 * @author isi-template
 * @param str
 */
function isNumeric(str: any) {
  if (typeof str != 'string') return false // we only process strings!
  return (
    !isNaN(Number(str)) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ) // ...and ensure strings of whitespace fail
}

/**
 * Parseamos un array en formato query para envio de parametro query, a la api
 * @author isi-template
 * @param data
 * @param extraQuery = query extra
 */
export const genApiQuery = (
  data: MRT_ColumnFiltersState,
  extraQuery: string[] = [],
): string => {
  if (data.length === 0) return extraQuery.join('&')
  const query: Array<string> = []
  data.forEach((item) => {
    if (isNumeric(item.value)) {
      query.push(`${item.id}=${item.value}`)
    } else {
      query.push(`${item.id}=/${item.value}/i`)
    }
  })
  if (extraQuery.length > 0) {
    return query.join('&') + '&' + extraQuery.join('&')
  }
  return query.join('&')
}

/**
 * @description Verifica si una string es un email válido
 * @author isi-template
 * @param mail
 */
export const validateEmail = (mail: string): boolean => {
  const res =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return res.test(String(mail).toLowerCase())
}

/**
 * @description Limpiamos los saltos vacios en una cadena
 * @author isi-template
 * @param str
 */
export const clearAllLineBreak = (str: string) => {
  return str.replace(/\r?\n|\r/g, ' ')
}

/**
 * @description Si el texto sobrepasa la cantidad de caracteres, reemplza por ...
 * @author isi-template
 * @param text
 * @param nro
 */
export const splitTextAjust = (text: string, nro: number) => {
  return text.length > nro ? text.substring(0, nro) + '...' : text
}
