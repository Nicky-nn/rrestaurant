import { alpha, Components, Theme } from '@mui/material'

import { themeShadows } from './themeColors'

interface ComponentsProps extends Components<Omit<Theme, 'components'>> {
  MuiExpansionPanel: any
}

export const components: ComponentsProps = {
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
      },
      sizeMedium: {
        height: '40px', // 👈 iguala al TextField small (que es tu default)
      },
    },
  },

  MuiCssBaseline: {
    styleOverrides: {
      '*': { boxSizing: 'border-box' },
      html: {
        MozOsxFontSmoothing: 'grayscale',
        WebkitFontSmoothing: 'antialiased',
        height: '100%',
        width: '100%',
      },
      body: { height: '100%' },
      a: { textDecoration: 'none', color: 'inherit' },
      '#root': { height: '100%' },
      '#nprogress .bar': { zIndex: '2000 !important' },
    },
  },

  MuiFab: {
    styleOverrides: {
      root: { boxShadow: themeShadows[12] },
    },
  },

  MuiAccordion: {
    styleOverrides: {
      root: {
        '&:before': { display: 'none' },
      },
    },
  },

  MuiExpansionPanel: {
    styleOverrides: {
      root: {
        '&:before': { display: 'none' },
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: { fontSize: '0.6875rem' }, // ✅ se mantiene, tooltips necesitan ser más pequeños. Equivale a ~11px pero relativo
    },
  },

  MuiTextField: {
    defaultProps: {
      size: 'small',
    },
  },

  MuiAutocomplete: {
    defaultProps: {
      size: 'small',
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-disabled': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',

          '& .MuiOutlinedInput-notchedOutline': {
            borderStyle: 'dashed',
            borderColor: theme.palette.text.disabled,
            borderWidth: '1px',
          },

          '& .MuiInputBase-input': {
            opacity: 1,
            color: theme.palette.text.secondary,
            WebkitTextFillColor: theme.palette.text.secondary,
            fontWeight: 500,
          },
        },

        '&.Mui-readOnly, & .MuiInputBase-input[readonly]': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.04)
              : alpha(theme.palette.primary.main, 0.02),
          cursor: 'default',

          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },

          '& .MuiInputBase-input': {
            cursor: 'default',
            fontWeight: 400,
          },
        },
      }),
    },
  },

  MuiSelect: {
    defaultProps: {
      size: 'small',
    },
  },

  MuiCheckbox: {
    styleOverrides: {
      root: {
        '& .MuiSvgIcon-root': { fontSize: 25 }, // ✅ se mantiene, es tamaño de ícono SVG
      },
    },
  },

  MuiRadio: {
    styleOverrides: {
      root: {
        '& .MuiSvgIcon-root': { fontSize: 25 }, // ✅ se mantiene, es tamaño de ícono SVG
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '6px 16px', // ajusta según tu diseño
      },
      head: {
        fontWeight: 600,
      },
    },
  },
}
