import MenuItem from '@mui/material/MenuItem'
import NativeSelect, { NativeSelectProps } from '@mui/material/NativeSelect'
import Select, { SelectProps } from '@mui/material/Select'

const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

export interface AppSelectOption {
  value: string | number
  label: string
}

interface AppSelectProps extends Omit<SelectProps & NativeSelectProps, 'children'> {
  options?: AppSelectOption[]
}

/**
 * Select adaptativo: usa NativeSelect en dispositivos Apple y Select de MUI en el resto.
 * Ideal para selects simples con opciones estáticas.
 */
export const AppSelect = ({ options = [], ...props }: AppSelectProps) => {
  if (isApple) {
    return (
      <NativeSelect {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </NativeSelect>
    )
  }

  return (
    <Select {...props}>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  )
}

export default AppSelect
