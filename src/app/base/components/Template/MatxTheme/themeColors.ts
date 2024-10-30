export type ThemeTypeColorsProps =
  | 'default'
  | 'defaultDark'
  | 'indigo'
  | 'purple'
  | 'indigoDark'
  | 'purpleDark'
  | 'blue'
  | 'blueDark'
  | 'blue1'
  | 'blue1Dark'
  | 'green'
  | 'greenDark'
  | 'blue2'
  | 'purple2'
  | 'purple2Dark'

interface TextLightDarkProps {
  primary: string
  secondary: string
  disabled: string
  hint: string
}

const textLight: TextLightDarkProps = {
  primary: 'rgba(52, 49, 76, 1)',
  secondary: 'rgba(52, 49, 76, 0.54)',
  disabled: 'rgba(52, 49, 76, 0.38)',
  hint: 'rgba(52, 49, 76, 0.38)',
}

const textDark: TextLightDarkProps = {
  primary: 'rgba(255, 255, 255, 0.95)',
  secondary: 'rgba(255, 255, 255, 0.80)',
  disabled: 'rgba(255, 255, 255, 0.74)',
  hint: 'rgba(255, 255, 255, 0.64)',
}

interface ErrorColorProps {
  main: string
}

const errorColor = {
  main: '#F44336',
}

export interface PaletteProps {
  mode: 'light' | 'dark'
  primary: {
    main: string
    light?: string
    dark?: string
    contrastText: string
  }
  secondary: {
    main: string
    light?: string
    dark?: string
    contrastText: string
  }
  background: {
    paper: string
    default: string
  }
  error: ErrorColorProps
  text: TextLightDarkProps
}

/*** COMPUESTO
 * INTERFACE
 */
export interface ThemeColorsCompleteProps {
  palette: PaletteProps
}

export interface CreateMatxThemesProps {
  purple: ThemeColorsCompleteProps
  indigo: ThemeColorsCompleteProps
  indigoDark: ThemeColorsCompleteProps
  purpleDark: ThemeColorsCompleteProps
  blue: ThemeColorsCompleteProps
  blueDark: ThemeColorsCompleteProps
  blue1: ThemeColorsCompleteProps
  blue1Dark: ThemeColorsCompleteProps
  green: ThemeColorsCompleteProps
  greenDark: ThemeColorsCompleteProps
  default: ThemeColorsCompleteProps
  defaultDark: ThemeColorsCompleteProps
  blue2: ThemeColorsCompleteProps
  purple2: ThemeColorsCompleteProps
  purple2Dark: ThemeColorsCompleteProps
}

/****
 * SINGLE INTERFACE
 */
export interface ThemeColorsSingleProps {
  palette: PaletteProps
}

interface ThemeColorsProps {
  purple: ThemeColorsSingleProps
  purpleDark: ThemeColorsSingleProps
  indigo: ThemeColorsSingleProps
  indigoDark: ThemeColorsSingleProps
  blue: ThemeColorsSingleProps
  blueDark: ThemeColorsSingleProps
  blue1: ThemeColorsSingleProps
  blue1Dark: ThemeColorsSingleProps
  blue2: ThemeColorsSingleProps
  blue2Dark: ThemeColorsSingleProps
  green: ThemeColorsSingleProps
  greenDark: ThemeColorsSingleProps
  default: ThemeColorsSingleProps
  defaultDark: ThemeColorsSingleProps
  purple2: ThemeColorsSingleProps
  purple2Dark: ThemeColorsSingleProps
}

export const themeColors: ThemeColorsProps = {
  green: {
    palette: {
      mode: 'light',
      primary: {
        main: '#00625D',
        light: 'rgb(51, 129, 125)',
        dark: '#004E4A',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#F47A20',
        light: '#F6944C',
        dark: '#D65C01',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#fff',
        default: '#fafafa',
      },
      error: errorColor,
      text: textLight,
    },
  },
  greenDark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#00625D',
        light: 'rgb(51, 129, 125)',
        dark: '#004E4A',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#F47A20',
        light: '#F6944C',
        dark: '#D65C01',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#00625D',
        default: '#1a2038',
      },
      error: errorColor,
      text: textDark,
    },
  },
  indigo: {
    palette: {
      mode: 'light',
      primary: {
        main: '#1c4c96',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#ff7360',
        dark: '#f55444',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#ffffff',
        default: '#fafafa',
      },
      text: textLight,
      error: errorColor,
    },
  },
  indigoDark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#1c4c96',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#efb810',
        contrastText: textLight.primary,
      },
      background: {
        paper: '#1c4c96',
        default: '#1a2038',
      },
      text: textDark,
      error: errorColor,
    },
  },
  purple: {
    palette: {
      mode: 'light',
      primary: {
        main: '#4745b6',
        contrastText: textLight.primary,
      },
      secondary: {
        main: '#ff8000',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#fff',
        default: '#fafafa',
      },
      text: textLight,
      error: errorColor,
    },
  },
  purpleDark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#4745b6',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ff8000',
        contrastText: textLight.primary,
      },
      background: {
        paper: '#4745b6',
        default: '#1a2038',
      },
      text: textDark,
      error: errorColor,
    },
  },
  blue: {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#d27619',
        dark: '#cb6816',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#fff',
        default: '#fafafa',
      },
      text: textLight,
      error: errorColor,
    },
  },
  blueDark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#1976d2',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#d27619',
        dark: '#cb6816',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#1976d2',
        default: '#1a2038',
      },
      text: textDark,
      error: errorColor,
    },
  },
  blue1: {
    palette: {
      mode: 'light',
      primary: {
        main: '#00539A',
        dark: '#003A6B',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#E15200',
        dark: '#9D3900',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#fff',
        default: '#fafafa',
      },
      text: textLight,
      error: errorColor,
    },
  },
  blue1Dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#00539A',
        dark: '#003A6B',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#E15200',
        dark: '#9D3900',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#00539A',
        default: '#1a2038',
      },
      text: textDark,
      error: errorColor,
    },
  },
  blue2: {
    palette: {
      mode: 'light',
      primary: {
        main: '#25368B',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#FCC346',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#fff',
        default: '#fafafa',
      },
      text: textLight,
      error: errorColor,
    },
  },
  blue2Dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#25368B',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#FCC346',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#25368B',
        default: '#1a2038',
      },
      text: textDark,
      error: errorColor,
    },
  },
  default: {
    palette: {
      mode: 'light',
      primary: {
        main: '#363e5d',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#df9c16',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#fff',
        default: '#fafafa',
      },
      error: errorColor,
      text: textLight,
    },
  },
  defaultDark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#363e5d',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#df9c16',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#222A45',
        default: '#1a2038',
      },
      error: errorColor,
      text: textDark,
    },
  },
  purple2: {
    palette: {
      mode: 'light',
      primary: {
        main: '#584569',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#ED6C20',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#fff',
        default: '#fafafa',
      },
      error: errorColor,
      text: textLight,
    },
  },
  purple2Dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#584569',
        contrastText: textDark.primary,
      },
      secondary: {
        main: '#ED6C20',
        contrastText: textDark.primary,
      },
      background: {
        paper: '#584569',
        default: '#1a2038',
      },
      error: errorColor,
      text: textDark,
    },
  },
}

export const themeShadows = [
  'none',
  '0px 2px 1px -1px rgba(0, 0, 0, 0.06),0px 1px 1px 0px rgba(0, 0, 0, 0.042),0px 1px 3px 0px rgba(0, 0, 0, 0.036)',
  '0px 3px 1px -2px rgba(0, 0, 0, 0.06),0px 2px 2px 0px rgba(0, 0, 0, 0.042),0px 1px 5px 0px rgba(0, 0, 0, 0.036)',
  '0px 3px 3px -2px rgba(0, 0, 0, 0.06),0px 3px 4px 0px rgba(0, 0, 0, 0.042),0px 1px 8px 0px rgba(0, 0, 0, 0.036)',
  '0px 2px 4px -1px rgba(0, 0, 0, 0.06),0px 4px 5px 0px rgba(0, 0, 0, 0.042),0px 1px 10px 0px rgba(0, 0, 0, 0.036)',
  '0px 3px 5px -1px rgba(0, 0, 0, 0.06),0px 5px 8px 0px rgba(0, 0, 0, 0.042),0px 1px 14px 0px rgba(0, 0, 0, 0.036)',
  '0px 3px 5px -1px rgba(0, 0, 0, 0.06),0px 6px 10px 0px rgba(0, 0, 0, 0.042),0px 1px 18px 0px rgba(0, 0, 0, 0.036)',
  '0px 4px 5px -2px rgba(0, 0, 0, 0.06),0px 7px 10px 1px rgba(0, 0, 0, 0.042),0px 2px 16px 1px rgba(0, 0, 0, 0.036)',
  '0px 5px 5px -3px rgba(0, 0, 0, 0.06),0px 8px 10px 1px rgba(0, 0, 0, 0.042),0px 3px 14px 2px rgba(0, 0, 0, 0.036)',
  '0px 5px 6px -3px rgba(0, 0, 0, 0.06),0px 9px 12px 1px rgba(0, 0, 0, 0.042),0px 3px 16px 2px rgba(0, 0, 0, 0.036)',
  '0px 6px 6px -3px rgba(0, 0, 0, 0.06),0px 10px 14px 1px rgba(0, 0, 0, 0.042),0px 4px 18px 3px rgba(0, 0, 0, 0.036)',
  '0px 6px 7px -4px rgba(0, 0, 0, 0.06),0px 11px 15px 1px rgba(0, 0, 0, 0.042),0px 4px 20px 3px rgba(0, 0, 0, 0.036)',
  '0px 7px 8px -4px rgba(0, 0, 0, 0.06),0px 12px 17px 2px rgba(0, 0, 0, 0.042),0px 5px 22px 4px rgba(0, 0, 0, 0.036)',
  '0px 7px 8px -4px rgba(0, 0, 0, 0.06),0px 13px 19px 2px rgba(0, 0, 0, 0.042),0px 5px 24px 4px rgba(0, 0, 0, 0.036)',
  '0px 7px 9px -4px rgba(0, 0, 0, 0.06),0px 14px 21px 2px rgba(0, 0, 0, 0.042),0px 5px 26px 4px rgba(0, 0, 0, 0.036)',
  '0px 8px 9px -5px rgba(0, 0, 0, 0.06),0px 15px 22px 2px rgba(0, 0, 0, 0.042),0px 6px 28px 5px rgba(0, 0, 0, 0.036)',
  '0px 8px 10px -5px rgba(0, 0, 0, 0.06),0px 16px 24px 2px rgba(0, 0, 0, 0.042),0px 6px 30px 5px rgba(0, 0, 0, 0.036)',
  '0px 8px 11px -5px rgba(0, 0, 0, 0.06),0px 17px 26px 2px rgba(0, 0, 0, 0.042),0px 6px 32px 5px rgba(0, 0, 0, 0.036)',
  '0px 9px 11px -5px rgba(0, 0, 0, 0.06),0px 18px 28px 2px rgba(0, 0, 0, 0.042),0px 7px 34px 6px rgba(0, 0, 0, 0.036)',
  '0px 9px 12px -6px rgba(0, 0, 0, 0.06),0px 19px 29px 2px rgba(0, 0, 0, 0.042),0px 7px 36px 6px rgba(0, 0, 0, 0.036)',
  '0px 10px 13px -6px rgba(0, 0, 0, 0.06),0px 20px 31px 3px rgba(0, 0, 0, 0.042),0px 8px 38px 7px rgba(0, 0, 0, 0.036)',
  '0px 10px 13px -6px rgba(0, 0, 0, 0.06),0px 20px 31px 3px rgba(0, 0, 0, 0.042),0px 8px 38px 7px rgba(0, 0, 0, 0.036)',
  '0px 10px 13px -6px rgba(0, 0, 0, 0.06),0px 20px 31px 3px rgba(0, 0, 0, 0.042),0px 8px 38px 7px rgba(0, 0, 0, 0.036)',
  '0px 10px 13px -6px rgba(0, 0, 0, 0.06),0px 20px 31px 3px rgba(0, 0, 0, 0.042),0px 8px 38px 7px rgba(0, 0, 0, 0.036)',
  '0px 10px 13px -6px rgba(0, 0, 0, 0.06),0px 20px 31px 3px rgba(0, 0, 0, 0.042),0px 8px 38px 7px rgba(0, 0, 0, 0.036)',
]
