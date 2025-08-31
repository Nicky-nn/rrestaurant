import { getUnixTime } from 'date-fns'
import { orderBy } from 'lodash'

const shop = 'shop'

export interface StorageShopProps {
  label: string
  value: string
  date: number
}

/**
 * @description Parsea y se obtiene los datos del shop
 * @author isi-template
 */
const getStorageShop = (): StorageShopProps[] => {
  try {
    return JSON.parse(localStorage.getItem(shop) || '[]')
  } catch (e: any) {
    return []
  }
}

/**
 * @description Retornamos el listado de shop del storage
 * @author isi-template
 */
export const storageComercioListado = (): StorageShopProps[] => {
  try {
    const st = getStorageShop()
    return orderBy(st, ['date'], ['desc'])
  } catch (e: any) {
    return []
  }
}

/**
 * @description eliminamos un determinado comercio
 * @author isi-template
 * @param urlComercio
 */
export const storageComercioEliminar = (urlComercio: string): void => {
  try {
    const st = getStorageShop()
    const newSt = st.filter((s) => s.value !== urlComercio)
    localStorage.setItem(shop, JSON.stringify(newSt))
  } catch (e: any) {
    console.info('No se ha podigo eliminar el recurso')
  }
}

/**
 * @description Registramos o actualizamos los datos de un nuevo comercio
 * @author isi-template
 * @param urlComercio
 */
export const storageComercioActualizar = (urlComercio: string): void => {
  try {
    const st = getStorageShop()
    const newSt = st.filter((s) => s.value !== urlComercio)
    newSt.push({
      label: urlComercio,
      value: urlComercio,
      date: getUnixTime(new Date()),
    })
    localStorage.setItem(shop, JSON.stringify(newSt))
  } catch (e: any) {
    console.info('No se ha podido eliminar el recurso')
  }
}
