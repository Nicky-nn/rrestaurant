import { ThemeOptions } from '@mui/material'
import { red } from '@mui/material/colors'

import { components } from './components'

export interface ThemeOptionsProps extends ThemeOptions {
  status: {
    danger: any
  }
}

/**
 * @author isi-template
 */
const themeOptions: ThemeOptionsProps = {
  typography: {
    fontSize: 14,
    // body1: {
    //   fontSize: '14px',
    // },
  },
  // breakpoints: {
  //   values: {
  //     xs: 0,
  //     sm: 768, // 600 - 640
  //     md: 1280, // 900 - 1000
  //     lg: 1535, // 1200 - 1300
  //     xl: 1980, // 1536 - 1650
  //   },
  // },
  status: {
    danger: red[500],
  },
  components: {
    ...components,
  },
}

export default themeOptions
