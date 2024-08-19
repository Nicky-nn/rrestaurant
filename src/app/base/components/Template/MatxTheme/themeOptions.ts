import { ThemeOptions } from '@mui/material'
import { red } from '@mui/material/colors'

import { components } from './components'

export interface ThemeOptionsProps extends ThemeOptions {
  status: {
    danger: any
  }
}

const themeOptions: ThemeOptionsProps = {
  typography: {
    fontSize: 14,
    body1: {
      fontSize: '14px',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640, // 600
      md: 1000, // 900
      lg: 1300, // 1200
      xl: 1650, // 1536
    },
  },
  status: {
    danger: red[500],
  },
  components: {
    ...components,
  },
}

export default themeOptions
