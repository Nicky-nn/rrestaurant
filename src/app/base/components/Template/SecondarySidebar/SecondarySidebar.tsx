import useSettings from '../../../hooks/useSettings'
import SecondarySidenavTheme from '../MatxTheme/SecondarySidenavTheme/SecondarySidenavTheme'
import SecondarySidebarContent from './SecondarySidebarContent'
import SecondarySidebarToggle from './SecondarySidebarToggle'

/**
 * @author isi-template
 * @constructor
 */
const SecondarySidebar = () => {
  const { settings } = useSettings()
  // @ts-ignore
  const secondarySidebarTheme: any = settings.themes[settings.secondarySidebar.theme]

  return (
    <SecondarySidenavTheme theme={secondarySidebarTheme}>
      {settings.secondarySidebar.open! && <SecondarySidebarContent />}
      <SecondarySidebarToggle />
    </SecondarySidenavTheme>
  )
}

export default SecondarySidebar
