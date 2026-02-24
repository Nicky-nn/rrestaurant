import { forwardRef } from 'react'
import { IMaskInput } from 'react-imask'

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

/**
 * @description Realiza un enmascarmiento para registro de una tarjeta
 * @author isi-template
 */
export const TarjetaMask = forwardRef<HTMLElement, CustomProps>(function TextMaskCustom(props, ref: any) {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask="0000-\0\0\0\0-\0\0\0\0-0000"
      lazy={false}
      inputRef={ref}
      definitions={{
        '0': /[1-9-0]/,
      }}
      unmask={'typed'}
      onAccept={(value: any, mask: any) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  )
})
