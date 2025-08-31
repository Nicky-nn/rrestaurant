import { FormControl, FormControlProps, FormHelperText, useTheme } from '@mui/material'
import { GroupBase } from 'react-select'
import AsyncSelect, { AsyncProps } from 'react-select/async'

import { MyInputLabel } from '../MyInputs/MyInputLabel'
import { selectStyles } from '../MySelect/ReactSelect'

/*
EJEMPLO que reemplaza
<Controller
    name="cliente"
    control={control}
    render={({ field }) => (
      <FormControl fullWidth error={Boolean(errors.cliente)}>
        <MyInputLabel shrink>Búsqueda de clientes</MyInputLabel>
        <AsyncSelect<ClienteProps>
          {...field}
          cacheOptions={false}
          defaultOptions={true}
          styles={reactSelectStyle(Boolean(errors.cliente))}
          menuPosition={'fixed'}
          name="clientes"
          placeholder={'Seleccione Cliente'}
          loadOptions={fetchClientes}
          isClearable={true}
          value={field.value || null}
          getOptionValue={(item) => item.codigoCliente}
          getOptionLabel={(item) =>
            `${item.numeroDocumento}${item.complemento || ''} - ${item.razonSocial} - ${item.tipoDocumentoIdentidad.descripcion}`
          }
          onChange={(cliente: SingleValue<ClienteProps>) => {
            field.onChange(cliente)
            setValue('emailCliente', genReplaceEmpty(cliente?.email, ''))
          }}
          onBlur={field.onBlur}
          noOptionsMessage={() =>
            'Ingrese referencia -> Razon Social, Codigo Cliente, Numero documento'
          }
          loadingMessage={() => 'Buscando...'}
        />
        <FormHelperText>{errors.cliente?.message}</FormHelperText>
      </FormControl>
    )}
  />
*/

type SelectProps<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = AsyncProps<Option, IsMulti, Group> & {
  error?: boolean
  formHelperText?: string
  inputLabel?: string
  formControlProps?: FormControlProps
}

/**
 * Componente para realizar el select para formularios
 * ref no es funcional en la funcion
 * @author isi-template
 * @param props
 * @constructor
 */
const FormAsyncSelect = <
  Option,
  IsMulti extends boolean = false,
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
      <AsyncSelect
        menuPosition={'fixed'}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: t.palette.primary.light,
          },
        })}
        cacheOptions={false}
        defaultOptions={true}
        styles={{
          ...selectStyles(error || false, t),
        }}
        {...others}
      />
      <FormHelperText>{formHelperText || ''}</FormHelperText>
    </FormControl>
  )
}

export default FormAsyncSelect
