import 'react-datepicker/dist/react-datepicker.css' // Importamos CSS base obligatoriamente

import { alpha, styled } from '@mui/material/styles'

// Definimos qué props recibirá el componente de estilos
interface StyleProps {
  size?: 'small' | 'medium' | 'large'
}

export const MuiReactDatePickerStyles = styled('div')<StyleProps>(({ theme, size }) => {
  const { palette, shadows, shape, typography, spacing } = theme
  const isSmall = size === 'small'

  // 1. Tamaño de fuente: Usamos las variantes estándar de MUI
  // body2 suele ser 0.875rem (14px) y body1 1rem (16px)
  const fontSize = isSmall ? typography.body2.fontSize : typography.body1.fontSize

  // 2. Tamaño del día (círculo): Usamos el multiplicador de espaciado
  // Por defecto spacing(1) = 8px.
  // Small: 3.5 * 8 = 28px
  // Medium: 5 * 8 = 40px (o 4.5 para 36px)
  const daySize = isSmall ? spacing(4) : spacing(4.7)

  // 3. Márgenes y paddings dinámicos
  const dayMargin = spacing(0.2) // ~1.6px
  const headerPadding = isSmall ? spacing(1.1) : spacing(1.5)

  return {
    '& .react-datepicker-wrapper': {
      width: '100%',
      display: 'block',
      padding: 0,
      border: 'none',
    },
    '& .react-datepicker__input-container': {
      display: 'block',
      width: '100%',
      padding: 0,
      margin: 0,

      // Aseguramos que el TextField dentro llene el espacio,
      '& .MuiTextField-root': {
        minWidth: '100%',
      },
    },

    // --- CONTENEDOR PRINCIPAL ---
    '& .react-datepicker': {
      fontFamily: typography.fontFamily,
      backgroundColor: palette.background.paper,
      color: palette.text.primary,
      border: `1px solid ${palette.divider}`,
      borderRadius: shape.borderRadius,
      boxShadow: shadows[8],
      display: 'inline-block',
      position: 'relative',
      fontSize: fontSize,
    },

    // --- HEADER ---
    '& .react-datepicker__header': {
      backgroundColor: palette.background.default,
      borderBottom: `1px solid ${palette.divider}`,
      padding: headerPadding,
      '& .react-datepicker__current-month, & .react-datepicker-year-header': {
        color: palette.text.primary,
        fontWeight: typography.fontWeightBold,
        fontSize: isSmall ? typography.subtitle2.fontSize : typography.h6.fontSize,
      },
      '& .react-datepicker__day-name': {
        color: palette.text.secondary,
        fontWeight: typography.fontWeightMedium,
        width: daySize,
        lineHeight: daySize,
        margin: dayMargin,
      },
    },

    // --- DÍAS (GRID) ---
    '& .react-datepicker__month': {
      margin: spacing(1),
    },
    '& .react-datepicker__day': {
      color: palette.text.primary,
      width: daySize, // <--- Dinámico
      lineHeight: daySize, // <--- Dinámico
      margin: dayMargin, // <--- Dinámico
      borderRadius: '50%', // Redondos por defecto
      fontSize: fontSize,
      transition: theme.transitions.create(['background-color', 'color']),

      // Usamos action.hover para que no sea un blanco duro, sino sutil
      '&:hover': {
        backgroundColor: `${palette.action.hover} !important`,
        color: palette.text.primary,
        borderRadius: '50%',
      },
    },

    // DÍAS DENTRO DEL RANGO (El medio)
    // Usamos alpha() para que el fondo sea suave y el texto siga siendo legible
    '& .react-datepicker__day--in-range': {
      backgroundColor: `${alpha(palette.primary.main, 0.16)} !important`,
      margin: `${spacing(0.2)} 0`,
      color: `${palette.text.primary} !important`, // Texto normal (blanco en dark, negro en light)
      width: `calc(${daySize} + ${spacing(0.4)})`,
      borderRadius: 0, // Cuadrados conectados visualmente
      '&:hover': {
        backgroundColor: `${alpha(palette.primary.main, 0.25)} !important`,
      },
    },

    // 2. DÍAS DE INICIO Y FIN (Las puntas)
    // Fondo sólido fuerte y texto de contraste garantizado
    '& .react-datepicker__day--range-start, & .react-datepicker__day--range-end, & .react-datepicker__day--selected':
      {
        backgroundColor: `${palette.primary.main} !important`,
        color: `${palette.primary.contrastText} !important`, // Blanco o Negro según el brillo del primario
        fontWeight: 'bold',
        borderRadius: '50%', // Las puntas redondas
        '&:hover': {
          backgroundColor: `${palette.primary.dark} !important`,
        },
      },

    // 3. ESTADO "SELECCIONANDO" (Mientras arrastras el mouse)
    '& .react-datepicker__day--in-selecting-range': {
      backgroundColor: `${alpha(palette.primary.main, 0.16)} !important`,
      color: palette.text.primary,
      // Excluir el día sobre el que está el mouse para que se vea diferente
      '&:not(.react-datepicker__day--in-range)': {
        backgroundColor: `${alpha(palette.primary.main, 0.16)} !important`,
      },
    },

    // --- DÍA DE HOY ---
    '& .react-datepicker__day--today': {
      border: `1px solid ${alpha(palette.primary.main, 0.5)}`,
      backgroundColor: 'transparent',
      // Si hoy NO está seleccionado, usa color primario. Si SÍ, usa contraste.
      '&:not(.react-datepicker__day--selected):not(.react-datepicker__day--in-range)': {
        color: palette.primary.main,
      },
    },

    // --- DÍAS DESHABILITADOS ---
    '& .react-datepicker__day--disabled': {
      color: palette.text.disabled,
      pointerEvents: 'none',
      opacity: 0.5,
    },

    // --- Ocultar triángulo ---
    '& .react-datepicker__triangle': {
      display: 'none',
    },

    // --- Flechas de navegación ---
    '& .react-datepicker__navigation-icon::before': {
      borderColor: palette.text.secondary,
    },
  }
})
