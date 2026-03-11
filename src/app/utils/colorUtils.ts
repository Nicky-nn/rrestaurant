import { alpha, darken, getContrastRatio, Theme } from '@mui/material'

// --- CACHÉ DE ALTO RENDIMIENTO ---
// Guardamos los resultados aquí para no recalcular matemáticas complejas.
// Clave: "color-mode-factor" -> Valor: "colorResultante"
const colorCache = new Map<string, string>()
const contrastCache = new Map<string, string>()

/**
 * 1. ADAPT COLOR (Simple)
 * Devuelve el color ajustado (oscurecido en dark mode, normal en light).
 * @author isi-template
 */
export const adaptColor = (color: string, theme: Theme, darknessFactor: number = 0.55): string => {
  // 1. Si es Light Mode, retornamos rápido (Coste 0)
  if (theme.palette.mode === 'light') {
    return color
  }

  // 2. Generamos clave única para el caché
  const cacheKey = `${color}-${theme.palette.mode}-${darknessFactor}`

  // 3. Consultamos Caché (O(1) - Instantáneo)
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!
  }

  // 4. Cálculo (Solo ocurre la primera vez)
  const result = darken(color, darknessFactor)

  // 5. Guardamos en caché
  colorCache.set(cacheKey, result)

  return result
}

/**
 * Asignamos el alpha dependiendo del tema
 * @param color
 * @param theme
 * @param darkFactor
 * @param lightFactor
 */
export const alphaByTheme = (color: string, theme: Theme, darkFactor: number = 0.2, lightFactor?: number) => {
  // 2. Generamos clave única para el caché
  const cacheKey = `alpha-theme-${color}-${theme.palette.mode}-${darkFactor}-${lightFactor ?? darkFactor}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!
  }

  if (theme.palette.mode === 'light') {
    const l = alpha(color, lightFactor ?? darkFactor)
    colorCache.set(cacheKey, l)
    return l
  }
  const d = alpha(color, darkFactor + 0.01)
  colorCache.set(cacheKey, d)
  return d
}

/**
 * Asignamos el alpha dependiendo del tema, solo aplica el alpha al modo dark
 * @param color
 * @param theme
 * @param darkFactor
 * @param lightFactor
 */
export const alphaDark = (color: string, theme: Theme, darkFactor: number = 0.3, lightFactor?: number) => {
  // 2. Generamos clave única para el caché
  const cacheKey = `alpha-dark-${color}-${theme.palette.mode}-${darkFactor}-${lightFactor ?? darkFactor}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!
  }

  if (theme.palette.mode === 'light') {
    const l = alpha(color, lightFactor ?? darkFactor)
    colorCache.set(cacheKey, l)
    return l
  }
  const d = alpha(color, darkFactor)
  colorCache.set(cacheKey, d)
  return d
}

/**
 * Asignamos el alpha a un color, a diferencia de alpha, este cachea los colores
 * @param color
 * @param darknessFactor
 */
export const alphaNormal = (color: string, darknessFactor: number = 0.09) => {
  // 2. Generamos clave única para el caché
  const cacheKey = `alpha-normal-${color}-${darknessFactor}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!
  }
  const d = alpha(color, darknessFactor)
  colorCache.set(cacheKey, d)
  return d
}

/**
 * Asignamos el alpha dependiendo del model light o dark
 * @param color
 * @param mode
 * @param darkFactor
 * @param lightFactor
 */
export const alphaByMode = (
  color: string,
  mode: 'light' | 'dark',
  darkFactor: number = 0.3,
  lightFactor?: number,
) => {
  // 2. Generamos clave única para el caché
  const cacheKey = `alpha-mode-${color}-${mode}-${darkFactor}-${lightFactor ?? darkFactor}`
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!
  }

  if (mode === 'light') {
    const l = alpha(color, lightFactor ?? darkFactor)
    colorCache.set(cacheKey, l)
    return l
  }
  const d = alpha(color, darkFactor)
  colorCache.set(cacheKey, d)
  return d
}

/**
 * 2. GET CONTRAST (Optimizado)
 * Decide si el texto debe ser blanco o negro según el fondo.
 */
export const getContrastColor = (background: string): string => {
  if (contrastCache.has(background)) {
    return contrastCache.get(background)!
  }

  // Usamos getContrastRatio de MUI que es muy robusto
  const contrast = getContrastRatio(background, '#fff')
  // Si el contraste con blanco es >= 3, usa blanco, si no, negro.
  const result = contrast >= 3 ? '#ffffff' : '#000000'

  contrastCache.set(background, result)
  return result
}

/**
 * 3. ADAPT BOX STYLE (Completo)
 * Devuelve el objeto de estilos { bgcolor, color, borderColor }
 * Ideal para Chips, Celdas de tabla, Badges.
 * const styles = adaptBoxStyle(colorBase, theme)
 * <Box
 *   sx={{
 *      ...styles, // Aplica bg y color de texto
 *      p: 1,
 *      borderRadius: 1,
 *      textAlign: 'center'
 * }}
 * >
 *   {value}
 * </Box>
 * @author isi-template
 */
export const adaptBoxStyle = (
  bgColor: string,
  theme: Theme,
  borderColor?: string,
  darknessFactor: number = 0.5,
) => {
  // Obtenemos el fondo adaptado
  const adaptedBg = adaptColor(bgColor, theme, darknessFactor)

  // Obtenemos el texto que contraste con ESE fondo adaptado
  const textColor = getContrastColor(adaptedBg)

  // Calculamos borde solo si existe
  const adaptedBorder = borderColor ? adaptColor(borderColor, theme, darknessFactor) : undefined

  return {
    backgroundColor: adaptedBg, // Usamos 'backgroundColor' que es más estándar que 'bgcolor'
    color: textColor,
    ...(adaptedBorder && { borderColor: adaptedBorder }),
  }
}
