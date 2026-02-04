import { darken, useTheme } from '@mui/material'

/**
 * Calcula el color de texto apropiado (negro o blanco) según el brillo del fondo
 */
function getContrastText(backgroundColor: string): string {
  // Convertir color hex a RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calcular luminosidad (fórmula W3C)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Si el fondo es claro, usar texto oscuro, si es oscuro, usar texto claro
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

/**
 * Hook para adaptar colores automáticamente según el modo (claro/oscuro)
 *
 * En modo claro: devuelve el color original
 * En modo oscuro: oscurece el color para que sea visible sobre fondo oscuro
 *
 * @example
 * const adaptColor = useAdaptiveColor()
 * backgroundColor: adaptColor(orange[100]) // orange[100] en claro, versión oscura en modo noche
 */
export const useAdaptiveColor = () => {
  const theme = useTheme()
  const isNightMode = theme.palette.mode === 'dark'

  return (lightColor: string, darknessFactor: number = 0.5): string => {
    if (!isNightMode) {
      return lightColor
    }

    // En modo oscuro, oscurecer el color para que sea visible
    // Usamos darken para hacer el color más oscuro pero manteniendo el tono
    return darken(lightColor, darknessFactor)
  }
}

/**
 * Hook que devuelve estilos completos (background + color de texto) adaptados al tema
 *
 * En modo claro: usa el color original y calcula el texto contrastante
 * En modo oscuro: oscurece el fondo y calcula el texto contrastante
 *
 * @example
 * const getAdaptiveStyle = useAdaptiveBoxStyle()
 * const styles = getAdaptiveStyle(green[100], green[200])
 * // Retorna: { bgcolor: '...', color: '...', borderColor: '...' }
 */
export const useAdaptiveBoxStyle = () => {
  const theme = useTheme()
  const isNightMode = theme.palette.mode === 'dark'

  return (bgColor: string, borderColor?: string, darknessFactor: number = 0.5) => {
    const adaptedBg = isNightMode ? darken(bgColor, darknessFactor) : bgColor
    const textColor = getContrastText(adaptedBg)
    const adaptedBorder = borderColor
      ? isNightMode
        ? darken(borderColor, darknessFactor)
        : borderColor
      : undefined

    return {
      bgcolor: adaptedBg,
      color: textColor,
      ...(adaptedBorder && { borderColor: adaptedBorder }),
    }
  }
}

/**
 * Hook para adaptar múltiples colores condicionales
 *
 * @example
 * const adaptColors = useAdaptiveColors()
 * backgroundColor: adaptColors({
 *   'FACTURA': green[100],
 *   'NOTA_VENTA': orange[100],
 * })[row.original.tipoDocumento]
 */
export const useAdaptiveColors = () => {
  const adaptColor = useAdaptiveColor()

  return <T extends Record<string, string>>(colorMap: T): T => {
    const adapted: any = {}
    for (const [key, color] of Object.entries(colorMap)) {
      adapted[key] = adaptColor(color)
    }
    return adapted as T
  }
}
