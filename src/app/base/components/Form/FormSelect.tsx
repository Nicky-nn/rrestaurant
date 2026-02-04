// noinspection DuplicatedCode

import { FormControl, FormControlProps, FormHelperText, useTheme } from '@mui/material'
import { FocusEvent, memo, useCallback, useId, useMemo, useState } from 'react'
import Select, { GroupBase, Props as DefaultProps } from 'react-select'

import { MyInputLabel } from '../MyInputs/MyInputLabel'
import { MuiSelectSize, useMuiSelectStyles } from '../MySelect/selectStyles.tsx'

/*
EJEMPLO
<Controller
  control={control}
  name={'variante.unidadMedida'}
  render={({ field }) => (
    <FormControl
      fullWidth
      sx={{ mb: 1 }}
      error={Boolean(errors.variante?.unidadMedida)}
    >
      <MyInputLabel shrink>Unidad Medida</MyInputLabel>
      <Select<SinUnidadMedidaProps>
        {...field}
        menuPosition={'fixed'}
        placeholder={'Seleccione la unidad de medida'}
        value={field.value}
        onChange={async (unidadMedida: SingleValue<SinUnidadMedidaProps>) => {
          field.onChange(unidadMedida)
          setValue(
            'variantes',
            variantesWatch.map((vs) => ({
              ...vs,
              unidadMedida,
            })),
          )
        }}
        options={unidadesMedida}
        getOptionValue={(item) => item.codigoClasificador}
        getOptionLabel={(item) =>
          `${item.codigoClasificador} - ${item.descripcion}`
        }
      />
      <FormHelperText>
        {errors.variante?.unidadMedida?.message}
      </FormHelperText>
    </FormControl>
  )}
/>
*/

type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = DefaultProps<Option, IsMulti, Group> & {
  error?: boolean
  formHelperText?: string
  inputLabel?: string
  formControlProps?: FormControlProps
  size?: MuiSelectSize
}

/**
 * Componente para realizar el select para formularios
 * @author isi-template
 * @param props
 * @constructor
 */
const FormSelectComponent = <
  OptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>(
  props: SelectProps<OptionType, IsMulti, Group>,
) => {
  const theme = useTheme()
  const {
    error,
    formHelperText,
    inputLabel,
    formControlProps,
    size = 'small',
    onFocus,
    onBlur,
    ...others
  } = props
  const uniqueId = useId()
  const selectInputId = props.inputId || `mui-select-input-${uniqueId}`
  const labelId = `mui-select-label-${uniqueId}`

  // Estado local para el foco
  const [isFocused, setIsFocused] = useState(false)

  // Evita que estas funciones se regeneren en cada render, lo que rompería el React.memo del hijo
  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (onFocus) onFocus(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      if (onBlur) onBlur(event)
    },
    [onBlur],
  )

  // React-select puede ser sensible a cambios en esta prop
  const reactSelectThemeConfig = useMemo(
    () => (reactSelectTheme: any) => ({
      ...reactSelectTheme,
      colors: {
        ...reactSelectTheme.colors,
        primary: theme.palette.primary.main,
      },
    }),
    [theme.palette.primary.main],
  )

  const customStyles = useMuiSelectStyles<OptionType, IsMulti, Group>(error, size)

  const fc: FormControlProps = formControlProps
    ? { fullWidth: true, ...formControlProps }
    : { fullWidth: true }
  return (
    <FormControl error={error || false} {...fc} variant="outlined" focused={isFocused}>
      {inputLabel && (
        <MyInputLabel
          id={labelId} // ID del Label
          htmlFor={selectInputId} // Vinculación estándar HTML
          shrink
          focused={isFocused}
          error={error}
        >
          {inputLabel}
        </MyInputLabel>
      )}
      <Select
        {...others}
        placeholder={'Seleccione...'}
        inputId={selectInputId}
        styles={customStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        theme={reactSelectThemeConfig}
      />
      {formHelperText && <FormHelperText>{formHelperText}</FormHelperText>}
    </FormControl>
  )
}

const FormSelect = memo(FormSelectComponent) as typeof FormSelectComponent
export default FormSelect
