import { ThemeTypeColorsProps } from '../../MatxTheme/themeColors'

/**
 * @author isi-template
 */
export interface LayoutSettingsProps {
  leftSidebar: {
    show: boolean
    mode: 'full' | 'close' | 'compact' | 'mobile'
    theme: ThemeTypeColorsProps // View all valid theme colors inside MatxTheme/themeColors.js
    bgImgURL: string
  }
  topbar: {
    show: boolean
    fixed: boolean
    theme: ThemeTypeColorsProps // View all valid theme colors inside MatxTheme/themeColors.js
  }
}

/**
 * @description propiedades del layout 1
 * las funcionalidades de este layout se pasaron a settings.ts
 * @author isi-template
 */
const Layout1Settings: LayoutSettingsProps = {
  leftSidebar: {
    show: true,
    mode: 'full', // full, close, compact, mobile,
    theme: 'blueDark', // View all valid theme colors inside MatxTheme/themeColors.js
    bgImgURL: '/assets/images/sidebar/sidebar-bg-dark.jpg',
  },
  topbar: {
    show: true,
    fixed: true,
    theme: 'blue', // View all valid theme colors inside MatxTheme/themeColors.js
  },
}

export default Layout1Settings
