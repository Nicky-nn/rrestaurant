import { themes } from '../MatxTheme/initThemes'
import { CreateMatxThemesProps, ThemeTypeColorsProps } from '../MatxTheme/themeColors'
import { LayoutSettingsProps } from './Layout1/Layout1Settings'

/**
 * @author isi-template
 */
export interface MatxLayoutSettingsProps {
  activeLayout: 'layout1' | 'layout2' // layout1, layout2
  activeTheme: ThemeTypeColorsProps // View all valid theme colors inside MatxTheme/themeColors.js
  perfectScrollbar: boolean
  themes: CreateMatxThemesProps
  layout1Settings: LayoutSettingsProps // open Layout1/Layout1Settings.js

  secondarySidebar: {
    show: boolean
    open: boolean
    theme: ThemeTypeColorsProps // View all valid theme colors inside MatxTheme/themeColors.js
  }
  // Footer options
  footer: {
    show: boolean
    fixed: boolean
    theme: ThemeTypeColorsProps // View all valid theme colors inside MatxTheme/themeColors.js
  }
}

const activeTheme: ThemeTypeColorsProps = (import.meta.env.ISI_THEME ||
  'default') as ThemeTypeColorsProps
const activeThemeDark = `${activeTheme}Dark` as ThemeTypeColorsProps

// UPDATE BELOW CODE
// DOC http://demos.ui-lib.com/matx-react-doc/layout.html
/**
 * @author isi-template
 */
export const MatxLayoutSettings: MatxLayoutSettingsProps = {
  activeLayout: 'layout1', // layout1, layout2
  activeTheme, // View all valid theme colors inside MatxTheme/themeColors.js
  perfectScrollbar: false,

  themes: themes,
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
    theme: activeThemeDark, // View all valid theme colors inside MatxTheme/themeColors.js
  },
}
