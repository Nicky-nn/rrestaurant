import { FormControl, FormControlProps, FormHelperText, useTheme } from '@mui/material'
import { GroupBase } from 'react-select'
import AsyncSelect from 'react-select/async'
import { AsyncProps } from 'react-select/dist/declarations/src/useAsync'

import { MyInputLabel } from '../MyInputs/MyInputLabel'
import { reactSelectStyle } from '../MySelect/ReactSelect'

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
  Option,
  IsMulti extends boolean = true,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = AsyncProps<Option, IsMulti, Group> & {
  error?: boolean
  formHelperText?: string
  inputLabel?: string
  formControlProps?: FormControlProps
}

/**
 * Componente para realizar el select para formularios
 * @param props
 * @constructor
 */
const FormAsyncSelect = <
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
        //@ts-ignore
        styles={{
          ...reactSelectStyle(error || false),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menu: (provided) => ({ ...provided, zIndex: 9999 }),
          placeholder: (base) => ({
            ...base,
            color: !error ? '#a4a4a4' : t.palette.error.main,
          }),
          control: (baseStyles, state) => {
            return {
              ...baseStyles,
              boxShadow: state.isFocused
                ? `0 0 0px 1px ${error ? t.palette.error.main : t.palette.primary.main}`
                : 'none',
              borderColor: !error ? 'rgb(52, 49, 76, 0.3)' : '#FF3D57',
              ':hover': {
                ...baseStyles[':hover'],
                borderColor: !error ? 'rgba(52, 49, 76, 1)' : t.palette.error.main,
              },
            }
          },
        }}
        {...others}
      />
      <FormHelperText>{formHelperText || ''}</FormHelperText>
    </FormControl>
  )
}

export default FormAsyncSelect
