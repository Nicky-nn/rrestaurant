import { forwardRef } from 'react'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

interface CustomProps {
  onChange: (event: {
    target: { name: string; value: number | undefined | null }
  }) => void
  decimalScale?: number
  name: string
  allowNegative?: boolean
}

/**
 * Props	Options	Default	Description
 * thousandSeparator	mixed: single character string or boolean true (true is default to ,)	none	Agregar separadores de miles en el número
 * decimalSeparator	single character string	.	Support decimal point on a number
 * decimalScale	number	none	Si se define, se limita a la escala decimal dada
 * fixedDecimalScale	boolean	false	Si es cierto, agrega 0 para que coincida con decimalScale dado
 * allowNegative	boolean	true	permitir números negativos (solo cuando no se proporciona la opción de formato)
 * @description Parsea un Input normal en un input de tipo numerico segun las especificaciones
 * scale es la cantidad de decimales que debe aceptar, por default es 2
 * @documentation https://s-yadav.github.io/react-number-format/docs/props
 * @author isi-template
 */
export const NumeroFormat = forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref: any) {
    const { onChange, decimalScale, allowNegative, ...other } = props
    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.floatValue ?? null,
            },
          })
        }}
        thousandSeparator={' '}
        decimalScale={decimalScale || 2}
        fixedDecimalScale={false}
        valueIsNumericString={true}
        allowNegative={allowNegative || false}
      />
    )
  },
)
