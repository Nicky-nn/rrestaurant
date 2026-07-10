import { alpha, IconButton, IconButtonProps, Palette, PaletteColor, styled } from '@mui/material'

interface StyledButtonProps extends IconButtonProps {
  // Ahora customColor acepta exactamente lo mismo que un IconButton de MUI
  customColor?: IconButtonProps['color']
  // En caso se un btn de tipo Link
  to?: string
}

/**
 * Estilos de iconos para acciones de fila
 * @author isi-template
 */
export const MrtIconButtonStyled = styled(IconButton, {
  // Esto es vital para que 'customColor' no llegue al HTML final y cause errores
  shouldForwardProp: (prop) => prop !== 'customColor',
})<StyledButtonProps>(({ theme, customColor = 'primary' }) => {
  // Lógica para obtener el color de la paleta de forma segura
  const getPaletteColor = () => {
    if (!customColor || customColor === 'inherit' || customColor === 'default') {
      return theme.palette.text.secondary
    }
    // Acceso dinámico a la paleta (ej: theme.palette.primary.main)
    return (theme.palette[customColor as keyof Palette] as PaletteColor)?.main || theme.palette.text.secondary
  }

  const activeColor = getPaletteColor()

  return {
    padding: '2px 2px',
    margin: '0 2px',
    borderRadius: '6px',
    // --- ESTADO INACTIVO (GRIS) ---
    color: theme.palette.text.secondary, // Aquí forzamos el gris sutil
    transition: 'all 0.2s ease-in-out',

    '& .MuiSvgIcon-root': {
      width: '24px', // Forzamos ancho fijo
      height: '24px', // Forzamos alto fijo
      fontSize: '1.4rem',
      transition: 'transform 0.2s ease-in-out',
    },

    // --- ESTADO ACTIVO (HOVER) ---
    '&:hover': {
      backgroundColor: alpha(activeColor, 0.08),
      color: activeColor, // Aquí recién aplicamos el color (azul, rojo, etc.)
      '& .MuiSvgIcon-root': {
        transform: 'scale(1.15)',
      },
    },

    '&.Mui-disabled': {
      opacity: 0.3,
      color: theme.palette.text.disabled,
    },
  }
})
