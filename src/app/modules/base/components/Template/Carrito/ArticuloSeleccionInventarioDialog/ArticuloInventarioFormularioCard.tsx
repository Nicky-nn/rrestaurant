import {
  Box,
  Divider,
  FormControl,
  Grid,
  Paper,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useEffect, useMemo } from 'react'
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form'

import { apiAlmacenPorSucursalListado } from '../../../../../../base/api/apiAlmacenPorSucursalListado.ts'
import { SimpleBox } from '../../../../../../base/components/Container/SimpleBox.tsx'
import FormSelect from '../../../../../../base/components/Form/FormSelect.tsx'
import { numberWithCommasPlaces } from '../../../../../../base/components/MyInputs/NumberInput.tsx'
import { reactSelectStyle } from '../../../../../../base/components/MySelect/ReactSelect.tsx'
import NumberSpinnerField from '../../../../../../base/components/NumberSpinnerField/NumberSpinnerField.tsx'
import MontoMonedaTexto from '../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { PreloadFieldSkeleton } from '../../../../../../base/components/skeleton/PreloadFieldSkeleton.tsx'
import { TipoMontoProps } from '../../../../../../base/interfaces/base.ts'
import { transformarArticuloPrecioService } from '../../../../../../base/services/transformarArticuloPrecioService.ts'
import { EntidadInputProps } from '../../../../../../interfaces'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { apiGestionArticulo } from '../../../../../../interfaces/gestionArticulo.ts'
import { InventarioOperacionProps } from '../../../../../../interfaces/InventarioOperacion.ts'
import { MonedaProps } from '../../../../../../interfaces/monedaPrecio.ts'
import { handleFocus } from '../../../../../../utils/helper.ts'
import ArticuloUnidadMedidaSeleccion, {
  UnidadMedidaSeleccionProps,
} from '../../ArticuloUnidadMedidaSeleccion/ArticuloUnidadMedidaSeleccion.tsx'
import LoteSeleccion, { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccion.tsx'

interface MontoSeleccionProps {
  label?: string
  readOnly?: boolean
  disabled?: boolean
  ocultar?: boolean
}
export interface AlmacenSeleccionProps {
  label?: string
  disabled?: boolean // Deshabilita el componente, default false
  autoSeleccion?: boolean // Si value contiene datos, se prioriza, luego autoselección, default false
}
export interface CantidadSeleccionProps extends MontoSeleccionProps {}
export interface PrecioSeleccionProps extends MontoSeleccionProps {
  tipoMonto: TipoMontoProps // default precio
}
export interface DescuentoSeleccionProps extends MontoSeleccionProps {}

interface OwnProps {
  control: Control<ArticuloOperacionInputProps>
  setValue: UseFormSetValue<ArticuloOperacionInputProps>
  articulo: ArticuloProps
  moneda: MonedaProps
  inventario: InventarioOperacionProps | null
  open: boolean // si es true, se cargan los datos, open de dialog
  entidad: EntidadInputProps
  loteProps: LoteSeleccionProps
  almacenProps: AlmacenSeleccionProps
  unidadMedidaProps: UnidadMedidaSeleccionProps
  cantidadProps?: CantidadSeleccionProps
  precioProps?: PrecioSeleccionProps
  descuentoProps?: DescuentoSeleccionProps
  ocultarCalculos?: boolean // Si queremos ocultar el cuadro de calculos
}

type Props = OwnProps

// IMPORTANTE: Estilo para TextField readonly | oculto
const TextFieldReadonly = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: theme.transitions.create([
      'background-color',
      'box-shadow',
      'border-color',
    ]),

    // IMPORTANTE: Quitamos el outline del elemento de entrada interno
    '& input': {
      outline: 'none',
    },

    // Estado normal y Hover (ya lo habíamos dejado estático)
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
      transition: 'border-color 0.2s',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider, // Mantiene el gris
    },

    // ESTADO FOCO (Cuando entras con TAB o Click)
    '&.Mui-focused': {
      // Forzamos que el borde sea el nuestro y no el default
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
        borderWidth: '1px', // Evitamos que se engrose (MUI usa 2px por defecto)
      },
    },
  },
}))

// Estilo para el box de readonly
const ReadOnlyBox = styled(Box)(({ theme }) => ({
  // Estética: Fondo gris muy tenue y borde sólido sutil
  backgroundColor: theme.palette.background.paper,
}))

/**
 * Tarjeta de articulo con el inventario, describe las cantidades disponibles de stock según la unidad de medida
 * En case sea un articulo sin verificar stock, muestra el icono de infinito
 * @param props
 * @constructor
 */
const ArticuloInventarioFormularioCard: FunctionComponent<Props> = (props) => {
  const {
    articulo,
    control,
    moneda,
    inventario,
    open,
    entidad,
    setValue,
    loteProps,
    almacenProps,
    unidadMedidaProps,
    cantidadProps,
    precioProps,
    descuentoProps,
    ocultarCalculos = false,
  } = props

  const [
    cantidadWatch,
    precioWatch,
    descuentoPWatch,
    almacenWatch,
    articuloUnidadMedidaWatch,
  ] = useWatch({
    control,
    name: ['cantidad', 'precio', 'descuentoP', 'almacen', 'articuloUnidadMedida'],
  })

  const { data: almacenes, isLoading: loadingAlmacenes } = useQuery({
    queryKey: ['articulo-inventario-formulario-almacenes-list', entidad, open],
    queryFn: () => apiAlmacenPorSucursalListado(entidad.codigoSucursal),
    enabled: open, // Solo cargar si el diálogo está abierto
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  // Listamos los articulos unidad de medida
  const articulosUnidadMedida = useMemo(() => {
    if (!articulo) return []
    return [
      articulo.articuloPrecioBase.articuloUnidadMedida,
      ...articulo.articuloPrecio.map((art) => art.articuloUnidadMedida),
    ]
  }, [articulo])

  // Definición del label de precio
  const precioLabel = useMemo(() => {
    if (precioProps?.tipoMonto === 'costo') return 'Costo unitario'
    if (precioProps?.tipoMonto === 'delivery') return 'Precio delivery'
    return 'Precio unitario'
  }, [precioProps?.tipoMonto])

  // Calculos para mostrar en la tarjeta
  const calculos = useMemo(() => {
    const cant = Number(cantidadWatch) || 0
    const prec = Number(precioWatch) || 0
    const descPorc = Number(descuentoPWatch) || 0

    const subtotal = cant * prec
    const montoDescuento = subtotal * (descPorc / 100)
    const totalNeto = subtotal - montoDescuento

    return {
      subtotal,
      montoDescuento,
      totalNeto,
    }
  }, [cantidadWatch, precioWatch, descuentoPWatch])

  /*********************************************************************************/
  /*********************************************************************************/
  useEffect(() => {
    // Sincronizamos el total calculado con el campo del formulario
    setValue('descuento', calculos.montoDescuento || 0, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [calculos.montoDescuento, setValue])

  useEffect(() => {
    // Si no hay unidad o no ha cargado el artículo, no hacemos nada
    if (!articuloUnidadMedidaWatch || !articulo) return

    // 2. Buscamos el precio sugerido para esta unidad específica
    // Asumiendo que el objeto articulo tiene un array de precios/unidades
    const articuloPrecio = [articulo.articuloPrecioBase, ...articulo.articuloPrecio].find(
      (ap) =>
        ap.articuloUnidadMedida.codigoUnidadMedida ===
        articuloUnidadMedidaWatch.codigoUnidadMedida,
    )
    if (articuloPrecio) {
      const monedaPrecio = transformarArticuloPrecioService(articuloPrecio, moneda)
      let precioFinal = monedaPrecio.precio
      if (precioProps?.tipoMonto === 'costo') precioFinal = monedaPrecio.precioBase
      if (precioProps?.tipoMonto === 'delivery') precioFinal = monedaPrecio.delivery

      // Si encontramos un precio, actualizamos el campo
      setValue('precio', precioFinal, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [
    articuloUnidadMedidaWatch?.codigoUnidadMedida,
    moneda,
    articulo,
    setValue,
    precioProps?.tipoMonto,
  ])

  /***********************************************************************************/
  /***********************************************************************************/
  /***********************************************************************************/

  return (
    <SimpleBox sx={{ p: 2, pt: 3 }}>
      <Grid container rowSpacing={2.6} columnSpacing={1.5}>
        <Grid size={12}>
          {/* ALMACENES */}
          <Controller
            control={control}
            name={'almacen'}
            render={({ field, fieldState: { error } }) => (
              <PreloadFieldSkeleton label={'Almacen...'} isLoading={loadingAlmacenes}>
                <FormControl fullWidth error={!!error}>
                  <FormSelect
                    inputLabel={almacenProps?.label ?? 'Almacén'}
                    styles={reactSelectStyle(!!error)}
                    placeholder={'Seleccione un almacen...'}
                    options={almacenes || []}
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue)
                      setValue('lote', null)
                    }}
                    getOptionValue={(item) => item.codigoAlmacen}
                    getOptionLabel={(item) =>
                      `Cod. ${item.codigoAlmacen} - ${item.nombre}`
                    }
                    error={!!error}
                    formHelperText={error?.message}
                    isSearchable={false}
                    isDisabled={almacenProps.disabled}
                  />
                </FormControl>
              </PreloadFieldSkeleton>
            )}
          />
        </Grid>
        <Grid size={12}>
          {/* LOTE */}
          <Controller
            control={control}
            render={({ field, fieldState: { error } }) => (
              <LoteSeleccion
                habilitado={articulo.gestionArticulo === apiGestionArticulo.LOTE}
                loteProps={loteProps}
                codigoArticulo={articulo.codigoArticulo}
                almacenId={almacenWatch?._id}
                inventarioId={inventario?._id}
                value={field.value}
                error={error?.message}
                onChange={field.onChange}
              />
            )}
            name={'lote'}
          />
        </Grid>
        <Grid size={12}>
          {/* UNIDAD MEDIDA */}
          <Controller
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ArticuloUnidadMedidaSeleccion
                value={field.value}
                error={error?.message}
                onChange={field.onChange}
                datos={articulosUnidadMedida}
                unidadMedidaProps={unidadMedidaProps}
              />
            )}
            name={'articuloUnidadMedida'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {cantidadProps?.readOnly || cantidadProps?.ocultar ? (
            <ReadOnlyBox>
              <TextFieldReadonly
                id="cantidad-outline-saskdd"
                label={cantidadProps?.label ?? 'Cantidad *'}
                value={
                  cantidadProps?.ocultar
                    ? '--'
                    : numberWithCommasPlaces(cantidadWatch || 0)
                }
                size={'small'}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: moneda.sigla,
                  },
                }}
              />
            </ReadOnlyBox>
          ) : (
            <Controller
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NumberSpinnerField
                  min={0}
                  decimalScale={2}
                  step={1}
                  label={cantidadProps?.label ?? 'Cantidad'}
                  size={'small'}
                  fullWidth
                  onClick={handleFocus}
                  onChange={field.onChange}
                  value={field.value}
                  helperText={error?.message || ''}
                  error={Boolean(error)}
                  spinnerTabIndex={false}
                  disabled={cantidadProps?.disabled ?? false}
                  required
                />
              )}
              name={'cantidad'}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {precioProps?.readOnly || precioProps?.ocultar ? (
            <ReadOnlyBox>
              <TextFieldReadonly
                id="precio-outline-saskdd"
                label={precioProps?.label ?? precioLabel}
                value={
                  precioProps?.ocultar ? '--' : numberWithCommasPlaces(precioWatch || 0)
                }
                size={'small'}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: moneda.sigla,
                  },
                }}
              />
            </ReadOnlyBox>
          ) : (
            <Controller
              name={'precio'}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NumberSpinnerField
                  label={precioProps?.label ?? precioLabel}
                  size={'small'}
                  min={0}
                  fullWidth
                  onClick={handleFocus}
                  onChange={field.onChange}
                  value={field.value}
                  helperText={error?.message || ''}
                  error={Boolean(error)}
                  required
                  unit={moneda.sigla}
                  spinnerTabIndex={false}
                  disabled={precioProps?.disabled ?? false}
                />
              )}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {descuentoProps?.readOnly || descuentoProps?.ocultar ? (
            <ReadOnlyBox>
              <TextFieldReadonly
                id="precio-outline-saskdd"
                label={descuentoProps?.label ?? 'Descuento %'}
                value={
                  descuentoProps?.ocultar ? '--' : numberWithCommasPlaces(descuentoPWatch)
                }
                size={'small'}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: moneda.sigla,
                  },
                }}
              />
            </ReadOnlyBox>
          ) : (
            <Controller
              name={'descuentoP'}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NumberSpinnerField
                  label={descuentoProps?.label ?? 'Descuento %'}
                  min={0}
                  max={100}
                  decimalScale={2}
                  step={1}
                  size={'small'}
                  fullWidth
                  onClick={handleFocus}
                  onChange={field.onChange}
                  value={field.value}
                  helperText={error?.message || ''}
                  error={Boolean(error)}
                  required
                  unit={`% ${moneda.sigla || ''}`}
                  spinnerTabIndex={false}
                  disabled={descuentoProps?.disabled ?? false}
                />
              )}
            />
          )}
        </Grid>
        {!ocultarCalculos && (
          <Grid size={12}>
            <Box>
              <Paper
                variant="outlined"
                sx={{
                  pt: { xs: 0.5, sm: 0.3 },
                  pl: { xs: 1, sm: 1.5 },
                  pr: { xs: 1, sm: 1.5 },
                  pb: { xs: 0.5, sm: 0.1 },
                  bgcolor: 'background.default',
                  borderColor: 'primary.light',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    bgcolor: 'primary.main',
                  },
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Stack spacing={0.1}>
                  {/* Línea de Subtotal */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Subtotal
                    </Typography>
                    <MontoMonedaTexto
                      boxProps={{ fontSize: 'medium' }}
                      monto={calculos.subtotal}
                      sigla={moneda.sigla}
                    />
                  </Stack>

                  {/* Línea de Descuento */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Descuento{' '}
                      <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>
                        ({descuentoPWatch || 0}%)
                      </Box>
                    </Typography>
                    <MontoMonedaTexto
                      boxProps={{ color: 'error.main', fontSize: 'medium' }}
                      label={'- '}
                      monto={calculos.montoDescuento}
                      sigla={moneda.sigla}
                    />
                  </Stack>

                  <Divider sx={{ borderStyle: 'dashed', pt: 0.5 }} />

                  {/* TOTAL FINAL */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="baseline"
                    spacing={1}
                    sx={{ width: '100%' }}
                  >
                    <Typography
                      variant="button"
                      sx={{
                        fontSize: { xs: '0.90rem', sm: '1rem' },
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      TOTAL
                    </Typography>
                    <MontoMonedaTexto
                      boxProps={{
                        color: (theme) => theme.palette.blue.light,
                        fontSize: 'large',
                      }}
                      monto={calculos.totalNeto}
                      sigla={moneda.sigla}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        )}
      </Grid>
    </SimpleBox>
  )
}

export default ArticuloInventarioFormularioCard
