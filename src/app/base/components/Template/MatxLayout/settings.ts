import { themes, ThemesMap } from '../MatxTheme/initThemes'
import { LayoutSettingsProps } from './Layout1/Layout1Settings'

/**
 * @author isi-template
 */
export interface MatxLayoutSettingsProps {
  activeLayout: 'layout1' | 'layout2' // layout1, layout2
  activeTheme: string // View all valid theme colors inside MatxTheme/themeColors.js
  perfectScrollbar: boolean
  themes: ThemesMap
  layout1Settings: LayoutSettingsProps // open Layout1/Layout1Settings.js

  secondarySidebar: {
    show: boolean
    open: boolean
    theme: string // View all valid theme colors inside MatxTheme/themeColors.js
  }
  // Footer options
  footer: {
    show: boolean
    fixed: boolean
    theme: string // View all valid theme colors inside MatxTheme/themeColors.js
  }
  // Nuevo, tipo de tema, dark o light
  mode: 'light' | 'dark'
}

const activeTheme = import.meta.env.ISI_THEME || 'default'
const activeThemeDark = `${activeTheme}Dark`

/**
 * @author isi-template
 */
export const MatxLayoutSettings: MatxLayoutSettingsProps = {
  activeLayout: 'layout1', // layout1, layout2
  activeTheme, // View all valid theme colors inside MatxTheme/themeColors.js
  perfectScrollbar: false,

  themes: themes,
  mode: activeTheme as any,
  // Color del layout izquierdo y del top
  layout1Settings: {
    leftSidebar: {
      show: true,
      mode: 'full', // full, close, compact, mobile,
      theme: activeThemeDark, // View all valid theme colors inside MatxTheme/themeColors.js
      bgImgURL: '/assets/images/sidebar/sidebar-bg-dark.jpg',
    },
    topbar: {
      show: true,
      fixed: true,
      theme: activeTheme, // View all valid theme colors inside MatxTheme/themeColors.js
    },
  }, // open Layout1/Layout1Settings.js

  secondarySidebar: {
    show: false,
    open: false,
    theme: activeTheme, // View all valid theme colors inside MatxTheme/themeColors.js
  },
  // Footer options
  footer: {
    show: true,
    fixed: false,
    theme: activeTheme, // View all valid theme colors inside MatxTheme/themeColors.js
  },
}
