import { alpha, Components, Theme } from '@mui/material'

import { themeShadows } from './themeColors'

interface ComponentsProps extends Components<Omit<Theme, 'components'>> {
  // MUIDataTableSelectCell: any
  // MUIDataTableHeadCell: any
  // MUIDataTableBodyCell: any
  MuiExpansionPanel: any
}

/**
 * @author isi-template
 */
export const components: ComponentsProps = {
  MuiPaper: {
    styleOverrides: {
      root: {
        // Esto desactiva la capa blanca automática en modo oscuro
        backgroundImage: 'none',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        // Asegura que use tu color definido en themeColors.ts
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
      },
    },
  },
  // MuiTableCell: {
  //   styleOverrides: {
  //     head: {
  //       fontSize: '0.84rem',
  //     },
  //     root: {
  //       fontSize: '0.80rem',
  //       whiteSpace: 'pre-wrap',
  //     },
  //   },
  // },
  MuiButton: {
    styleOverrides: {
      root: {
        fontSize: '14px',
        textTransform: 'none',
        fontWeight: '400',
      },
      contained: {
        boxShadow: themeShadows[8],
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        boxSizing: 'border-box',
      },
      html: {
        MozOsxFontSmoothing: 'grayscale',
        WebkitFontSmoothing: 'antialiased',
        height: '100%',
        width: '100%',
      },
      body: {
        height: '100%',
      },
      a: {
        textDecoration: 'none',
        color: 'inherit',
      },
      '#root': {
        height: '100%',
      },
      '#nprogress .bar': {
        zIndex: '2000 !important',
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: themeShadows[12],
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        '&:before': {
          display: 'none',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: '11px',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
      },
    },
  },
  MuiExpansionPanel: {
    styleOverrides: {
      root: {
        '&:before': {
          display: 'none',
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '15px',
      },
      shrink: {
        transform: 'translate(15px, -11px) scale(0.90) !important',
      },
      outlined: {
        backgroundColor: 'transparent',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& fieldset': {
          fontSize: '18px',
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        // ----------------------------------------------------------------
        // 1. ESTILO DISABLED (Deshabilitado)
        // "Parece desconectado, borde discontinuo, opacidad baja"
        // ----------------------------------------------------------------
        '&.Mui-disabled': {
          // Fondo sutilmente gris para diferenciarlo del fondo blanco/negro puro
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(0, 0, 0, 0.04)',

          '& .MuiOutlinedInput-notchedOutline': {
            // El borde dashed es un indicador universal de "inactivo"
            borderStyle: 'dashed',
            borderColor: theme.palette.text.disabled,
            borderWidth: '1px',
          },

          // El texto se ve más apagado
          '& .MuiInputBase-input': {
            // 3. TEXTO: El cambio más importante para la legibilidad
            opacity: 1, // Forzamos a que el navegador no lo desvanezca

            // Usamos 'text.secondary' (gris medio) en vez de 'text.disabled' (gris fantasma)
            color: theme.palette.text.secondary,

            // Fix necesario para Safari/Chrome en inputs disabled
            WebkitTextFillColor: theme.palette.text.secondary,
            fontWeight: 500, // Un poco más de peso ayuda a leerlo
          },
        },
        // ----------------------------------------------------------------
        // 2. ESTILO READONLY (Solo Lectura)
        // "Parece dato fijo, alto contraste, sin borde o borde muy sutil"
        // ----------------------------------------------------------------
        '&.Mui-readOnly': {
          // Un fondo tintado con el color Primary muy suave (elegante)
          backgroundColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.04)
              : alpha(theme.palette.primary.main, 0.02),

          // Quitamos el puntero de texto
          cursor: 'default',

          '& .MuiOutlinedInput-notchedOutline': {
            // Borde transparente o muy sutil para que parezca "dato impreso"
            borderColor: 'transparent',
            // Opcional: si prefieres un borde muy fino:
            // borderColor: alpha(theme.palette.divider, 0.5),
          },

          // IMPORTANTE: El texto se mantiene con alto contraste (Primary Text)
          '& .MuiInputBase-input': {
            cursor: 'default',
            // color: theme.palette.text.primary, // Legibilidad total
            fontWeight: 400, // Un poco más de peso para denotar valor
          },
        },
        '& fieldset': {
          fontSize: '18px',
        },
      }),
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        '& fieldset': {
          fontSize: '18px',
        },
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        '& fieldset': {
          fontSize: 25,
        },
        '& .MuiSvgIcon-root': { fontSize: 25 },
      },
    },
  },
  MuiRadio: {
    styleOverrides: {
      root: {
        '& fieldset': {
          fontSize: '18px',
        },
        '& .MuiSvgIcon-root': { fontSize: 25 },
      },
    },
  },
}
