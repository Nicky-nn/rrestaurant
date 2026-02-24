import { Box, Divider, FormControl, Grid, Paper, Stack, styled, TextField, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useEffect, useMemo } from 'react'
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form'

import { apiAlmacenPorSucursalListado } from '../../../../../../base/api/apiAlmacenPorSucursalListado.ts'
import { SimpleBox } from '../../../../../../base/components/Container/SimpleBox.tsx'
import FormSelect from '../../../../../../base/components/Form/FormSelect.tsx'
import { numberWithCommasPlaces } from '../../../../../../base/components/MyInputs/NumberInput.tsx'
import NumberSpinnerField from '../../../../../../base/components/NumberSpinnerField/NumberSpinnerField.tsx'
import MontoMonedaTexto from '../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { PreloadFieldSkeleton } from '../../../../../../base/components/skeleton/PreloadFieldSkeleton.tsx'
import { transformarArticuloPrecioService } from '../../../../../../base/services/transformarArticuloPrecioService.ts'
import { EntidadInputProps } from '../../../../../../interfaces'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { ArticuloUnidadMedidaProps } from '../../../../../../interfaces/articuloUnidadMedida.ts'
import { apiGestionArticulo } from '../../../../../../interfaces/gestionArticulo.ts'
import { InventarioOperacionProps } from '../../../../../../interfaces/InventarioOperacion.ts'
import { MonedaProps } from '../../../../../../interfaces/monedaPrecio.ts'
import { handleFocus } from '../../../../../../utils/helper.ts'
import ArticuloUnidadMedidaSeleccion, {
  UnidadMedidaSeleccionProps,
} from '../../ArticuloUnidadMedidaSeleccion/ArticuloUnidadMedidaSeleccion.tsx'
import LoteSeleccion from '../../LoteSeleccion/LoteSeleccion.tsx'
import { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccionTypes.ts'
import {
  obtenerDetalleInventarioPorAlmacen,
  procesarAlmacenesDesdeInventario,
  procesarAlmacenesDesdeTabla,
  procesarLotesDesdeInventario,
  seleccionarAlmacenAutomatico,
} from './articuloInventarioUtils.ts'
import {
  AlmacenSeleccionProps,
  CantidadSeleccionProps,
  DescuentoSeleccionProps,
  PrecioSeleccionProps,
} from './ArticuloSeleccionInventarioTypes.ts'

// IMPORTANTE: Estilo para TextField readonly | oculto
const TextFieldReadonly = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color']),

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

interface OwnProps {
  control: Control<ArticuloOperacionInputProps>
  setValue: UseFormSetValue<ArticuloOperacionInputProps>
  articulo: ArticuloProps
  moneda: MonedaProps
  inventario: InventarioOperacionProps | null
  open: boolean // si es true, se cargan los datos, open de dialog
  entidad: EntidadInputProps
  almacenProps: AlmacenSeleccionProps
  loteProps: LoteSeleccionProps
  unidadMedidaProps: UnidadMedidaSeleccionProps
  cantidadProps?: CantidadSeleccionProps
  precioProps?: PrecioSeleccionProps
  descuentoProps?: DescuentoSeleccionProps
  ocultarCalculos?: boolean // Si queremos ocultar el cuadro de calculos
}

type Props = OwnProps

/**
 * Tarjeta de formulario de artículo con inventario
 * Soporta múltiples fuentes de datos para almacenes y lotes
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

  // ===== OBSERVACON DE CAMPOS DEL FORMULARIO =====
  const [cantidadWatch, precioWatch, descuentoPWatch, almacenWatch, articuloUnidadMedidaWatch] = useWatch({
    control,
    name: ['cantidad', 'precio', 'descuentoP', 'almacen', 'articuloUnidadMedida'],
  })

  // ===== CARGA DE ALMACENES DESDE TABLA (solo si fuente === 'tbl') =====
  const {
    data: almacenesTabla,
    isLoading: loadingAlmacenesTabla,
    isSuccess,
  } = useQuery({
    queryKey: ['articulo-inventario-formulario-almacenes-list', entidad, open],
    queryFn: () => apiAlmacenPorSucursalListado(entidad.codigoSucursal),
    enabled: open && (almacenProps.fuente || 'tbl') === 'tbl',
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  // ===== PROCESAMIENTO DE ALMACENES SEGÚN LA FUENTE =====
  const almacenes = useMemo(() => {
    const fuente = almacenProps.fuente || 'tbl'

    if (fuente === 'tbl') {
      // Usar almacenes de la tabla general
      return almacenesTabla ? procesarAlmacenesDesdeTabla(almacenesTabla, almacenProps) : []
    } else {
      // Usar almacenes del inventario del artículo
      const inventarioDetalle = articulo?.inventario?.[0]?.detalle || []
      return procesarAlmacenesDesdeInventario(inventarioDetalle, almacenProps)
    }
  }, [almacenProps, almacenesTabla, articulo])

  // loading siempre y cuando sea de tbl
  const loadingAlmacenes = (almacenProps.fuente || 'tbl') === 'tbl' ? loadingAlmacenesTabla : false

  // ===== PROCESAMIENTO DE LOTES SEGÚN LA FUENTE =====
  const lotesDisponibles = useMemo(() => {
    if (!almacenWatch?.codigoAlmacen) return []

    const fuente = loteProps.fuente || 'inv'

    if (fuente === 'inv') {
      // Usar lotes del inventario del artículo por almacén
      const inventarioDetalle = articulo?.inventario?.[0]?.detalle || []
      const detalleAlmacen = obtenerDetalleInventarioPorAlmacen(inventarioDetalle, almacenWatch.codigoAlmacen)

      if (!detalleAlmacen) return []

      return procesarLotesDesdeInventario(detalleAlmacen.lotes, loteProps)
    } else {
      // fuente === 'tbl': Usar lotes de la API (todos los lotes del artículo)
      // Por ahora retornamos vacío, pero aquí iría la llamada a la API de lotes
      // cuando no dependan del almacén específico
      return []
    }
  }, [almacenWatch, loteProps, articulo])

  // ===== AUTOSELECCIÓN DE ALMACÉN =====
  useEffect(() => {
    if (almacenProps.autoSeleccion && isSuccess && almacenes.length > 0 && !almacenWatch) {
      const primerAlmacen = seleccionarAlmacenAutomatico(almacenes)
      if (primerAlmacen) {
        setValue('almacen', primerAlmacen, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }, [almacenProps.autoSeleccion, isSuccess, almacenes, almacenWatch, setValue])

  // ===== UNIDADES DE MEDIDA DEL ARTÍCULO =====
  const articulosUnidadMedida = useMemo(() => {
    if (!articulo) return []
    return [
      articulo.articuloPrecioBase.articuloUnidadMedida,
      ...articulo.articuloPrecio.map((art) => art.articuloUnidadMedida),
    ]
  }, [articulo])

  // ===== LABEL DE PRECIO SEGÚN TIPO =====
  const precioLabel = useMemo(() => {
    if (precioProps?.tipoMonto === 'costo') return 'Costo unitario'
    if (precioProps?.tipoMonto === 'delivery') return 'Precio delivery'
    return 'Precio unitario'
  }, [precioProps?.tipoMonto])

  // ===== CÁLCULOS DE MONTOS =====
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

  // ===== EFECTOS =====
  // Sincronizar monto de descuento con el campo del formulario
  useEffect(() => {
    setValue('descuento', calculos.montoDescuento || 0, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [calculos.montoDescuento, setValue])

  // Mapeamos articulo en map para facil acceso de valores
  const articuloPrecioMap = useMemo(() => {
    if (!articulo) return new Map()
    return new Map(
      [articulo.articuloPrecioBase, ...articulo.articuloPrecio].map((ap) => [
        ap.articuloUnidadMedida.codigoUnidadMedida,
        ap,
      ]),
    )
  }, [articulo])

  // Cambio de unidad de medida y seteamos el precio en función configuracion de tipo moneda
  const onChangeUnidadMedida = (item: ArticuloUnidadMedidaProps | null) => {
    if (!item) return
    // Si los codigos son iguales no hacemos nada
    if (item.codigoUnidadMedida === articuloUnidadMedidaWatch?.codigoUnidadMedida) return

    const articuloPrecio = articuloPrecioMap.get(item.codigoUnidadMedida)
    if (!articuloPrecio) return

    const monedaPrecio = transformarArticuloPrecioService(articuloPrecio, moneda)
    let precioFinal = monedaPrecio.precio

    if (precioProps?.tipoMonto === 'precio') precioFinal = monedaPrecio.precio
    if (precioProps?.tipoMonto === 'costo') precioFinal = monedaPrecio.precioBase
    if (precioProps?.tipoMonto === 'delivery') precioFinal = monedaPrecio.delivery

    setValue('precio', precioFinal, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  /***********************************************************************************/
  /***********************************************************************************/
  /***********************************************************************************/
  // ===== RENDERIZADO =====
  return (
    <SimpleBox sx={{ p: 2, pt: 3 }}>
      <Grid container rowSpacing={2.6} columnSpacing={1.5}>
        <Grid size={12}>
          {/* ALMACENES */}
          <Controller
            control={control}
            name={'almacen'}
            render={({ field, fieldState: { error } }) => (
              <PreloadFieldSkeleton label="Almacén..." isLoading={loadingAlmacenes}>
                <FormControl fullWidth error={!!error}>
                  <FormSelect
                    inputLabel={almacenProps?.label ?? 'Almacén'}
                    placeholder="Seleccione un almacén..."
                    options={almacenes || []}
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue)
                      // Limpiar lote al cambiar almacén
                      setValue('lote', null)
                    }}
                    getOptionValue={(item) => item.codigoAlmacen}
                    getOptionLabel={(item) => `${item.codigoAlmacen} - ${item.nombre}`}
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
                // Pasar lotes procesados si viene del inventario por almacén
                lotesInventario={
                  (loteProps.fuente || 'almacen') === 'almacen'
                    ? lotesDisponibles.map((l) => l.lote)
                    : undefined
                }
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
                onChange={(item) => {
                  field.onChange(item)
                  onChangeUnidadMedida(item)
                }}
                datos={articulosUnidadMedida}
                unidadMedidaProps={unidadMedidaProps}
              />
            )}
            name={'articuloUnidadMedida'}
          />
        </Grid>
        {/* CANTIDAD */}
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {cantidadProps?.readOnly || cantidadProps?.ocultar ? (
            <ReadOnlyBox>
              <TextFieldReadonly
                id="cantidad-outline-saskdd"
                label={cantidadProps?.label ?? 'Cantidad *'}
                value={cantidadProps?.ocultar ? '--' : numberWithCommasPlaces(cantidadWatch || 0)}
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
        {/* PRECIO */}
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {precioProps?.readOnly || precioProps?.ocultar ? (
            <ReadOnlyBox>
              <TextFieldReadonly
                id="precio-outline-saskdd"
                label={precioProps?.label ?? precioLabel}
                value={precioProps?.ocultar ? '--' : numberWithCommasPlaces(precioWatch || 0)}
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
        {/* DESCUENTO */}
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {descuentoProps?.readOnly || descuentoProps?.ocultar ? (
            <ReadOnlyBox>
              <TextFieldReadonly
                id="precio-outline-saskdd"
                label={descuentoProps?.label ?? 'Descuento %'}
                value={descuentoProps?.ocultar ? '--' : numberWithCommasPlaces(descuentoPWatch)}
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
        {/* CÁLCULOS */}
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
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
