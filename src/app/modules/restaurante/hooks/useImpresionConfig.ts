export interface ImpresionAutomatica {
  facturar: boolean
  comanda: boolean
  estadoDeCuenta: boolean
  actualizarYComandar: boolean
}

export interface ImpresionConfig {
  comanda: string
  estadoDeCuenta: string
  facturar: string
  impresionAutomatica: ImpresionAutomatica
  manualPrinters: string[]
  impresionPorCategorias: boolean
  categoriasAsignadas: Record<string, string>
}

const STORAGE_KEY = 'impresionConfig'

const DEFAULT_CONFIG: ImpresionConfig = {
  comanda: '',
  estadoDeCuenta: '',
  facturar: '',
  impresionAutomatica: {
    facturar: false,
    comanda: false,
    estadoDeCuenta: false,
    actualizarYComandar: false,
  },
  manualPrinters: [],
  impresionPorCategorias: false,
  categoriasAsignadas: {},
}

/**
 * Obtiene config segura (merge profundo básico)
 */
export const getImpresionConfig = (): ImpresionConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG

    const parsed = JSON.parse(raw)

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      impresionAutomatica: {
        ...DEFAULT_CONFIG.impresionAutomatica,
        ...(parsed.impresionAutomatica || {}),
      },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

/**
 * 🔥 FUNCIÓN CLARA: decide si imprimir o no
 */
export const debeImprimirComanda = (): boolean => {
  const cfg = getImpresionConfig()
  return cfg.impresionAutomatica?.comanda === true
}

/**
 * 🔥 FUNCIÓN CLARA: decide si usar printJS
 */
export const debeUsarPrintJS = (): boolean => {
  const cfg = getImpresionConfig()

  if (!cfg.impresionAutomatica?.comanda) return false

  return cfg.comanda === '' // sin impresora → navegador
}

/**
 * (para futuro)
 */
export const getImpresoraComanda = (): string => {
  return getImpresionConfig().comanda
}
