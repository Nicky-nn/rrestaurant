import { Components, Theme } from '@mui/material'

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
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontSize: '0.84rem',
      },
      root: {
        fontSize: '0.80rem',
        whiteSpace: 'pre-wrap',
      },
    },
  },
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
        // transform: 'translate(15px 9px) scale(1)',
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
      root: () => ({
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
