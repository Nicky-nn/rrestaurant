import { forwardRef } from 'react'
import { IMaskInput } from 'react-imask'

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

/**
 * @description Realiza un enmascaramiento para registro de un codigo
 */
export const InputCodigoMask = forwardRef<HTMLElement, CustomProps>(
  function InputCodigoMask(props, ref: any) {
    const { onChange, ...other } = props
    return (
      <IMaskInput
        {...other}
        mask={/^[\w./+'"[\]-]*$/}
        lazy={false}
        inputRef={ref}
        unmask={'typed'}
        prepare={(s: string) => s}
        onAccept={(value: any, mask: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    )
  },
)
