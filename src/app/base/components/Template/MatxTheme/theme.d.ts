import '@mui/material/styles'

// Lista de nombres de tus colores personalizados para reutilizar en las definiciones
type CustomColor = 'yellow' | 'green' | 'blue' | 'cyan' | 'purple' | 'teal' | 'orange'

declare module '@mui/material/styles' {
  // 1. Extendemos la Paleta para incluir tus colores
  interface Palette extends Record<CustomColor, Palette['primary']> {}
  interface PaletteOptions extends Record<CustomColor, PaletteOptions['primary']> {}
  interface PaletteColor {
    base?: string
  }
  interface SimplePaletteColorOptions {
    base?: string
  }
}

// 2. Extendemos TODOS los componentes que usan la prop 'color'
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/Fab' {
  interface FabPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/Checkbox' {
  interface CheckboxPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/Radio' {
  interface RadioPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/Switch' {
  interface SwitchPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/Slider' {
  interface SliderPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides extends Record<CustomColor, true> {}
}

declare module '@mui/material/LinearProgress' {
  interface LinearProgressPropsColorOverrides extends Record<CustomColor, true> {}
}
