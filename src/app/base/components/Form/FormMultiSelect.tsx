// noinspection DuplicatedCode

import { FormControl, FormControlProps, FormHelperText, useTheme } from '@mui/material'
import Select, { GroupBase, Props as DefaultProps } from 'react-select'

import { MyInputLabel } from '../MyInputs/MyInputLabel'
import { selectStyles } from '../MySelect/ReactSelect'

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
        styles={reactSelectStyle(Boolean(errors.variante?.unidadMedida))}
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
  IsMulti extends boolean = true,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = DefaultProps<Option, IsMulti, Group> & {
  error?: boolean
  formHelperText?: string
  inputLabel?: string
  formControlProps?: FormControlProps
}

/**
 * Componente para realizar multiples select para formularios
 * @author isi-template
 * @param props
 * @constructor
 */
const FormMultiSelect = <
  Option,
  IsMulti extends boolean = true,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: SelectProps<Option, IsMulti, Group>,
) => {
  const t = useTheme()
  const { error, formHelperText, inputLabel, formControlProps, ...others } = props
  const fc: FormControlProps = formControlProps
    ? { fullWidth: true, ...formControlProps }
    : { fullWidth: true }
  return (
    <FormControl error={error || false} {...fc}>
      {inputLabel && <MyInputLabel shrink>{inputLabel}</MyInputLabel>}
      <Select
        menuPosition={'fixed'}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: t.palette.primary.light,
          },
        })}
        styles={{
          ...selectStyles(error || false, t),
        }}
        {...others}
      />
      <FormHelperText>{formHelperText || ''}</FormHelperText>
    </FormControl>
  )
}

export default FormMultiSelect
