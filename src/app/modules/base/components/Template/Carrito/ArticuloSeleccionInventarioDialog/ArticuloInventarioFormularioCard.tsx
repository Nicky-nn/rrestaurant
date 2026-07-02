import { Box, Divider, FormControl, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useCallback, useEffect, useMemo } from 'react'
import { Control, Controller, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form'

import { apiAlmacenPorSucursalListado } from '../../../../../../base/api/apiAlmacenPorSucursalListado.ts'
import { SimpleBox } from '../../../../../../base/components/Container/SimpleBox.tsx'
import { FormDescuentoField } from '../../../../../../base/components/Form/FormDescuentoField.tsx'
import FormSelect from '../../../../../../base/components/Form/FormSelect.tsx'
import { numberWithCommasPlaces } from '../../../../../../base/components/MyInputs/NumberInput.tsx'
import NumberSpinnerField from '../../../../../../base/components/NumberSpinnerField/NumberSpinnerField.tsx'
import MontoMonedaTexto from '../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { PreloadFieldSkeleton } from '../../../../../../base/components/skeleton/PreloadFieldSkeleton.tsx'
import { transformarArticuloPrecioService } from '../../../../../../base/services/transformarArticuloPrecioService.ts'
import { EntidadInputProps } from '../../../../../../interfaces'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { ArticuloPrecioProps } from '../../../../../../interfaces/articuloPrecio.ts'
import { ArticuloUnidadMedidaProps } from '../../../../../../interfaces/articuloUnidadMedida.ts'
import { apiGestionArticulo } from '../../../../../../interfaces/gestionArticulo.ts'
import { ArticuloInventarioOperacionProps } from '../../../../../../interfaces/InventarioOperacion.ts'
import { MonedaProps } from '../../../../../../interfaces/monedaPrecio.ts'
import { getColor } from '../../../../../../utils/getColor.ts'
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

/**
 * Redondea un número a una cantidad específica de decimales de forma segura,
 * evitando los errores de coma flotante nativos de JavaScript.
 */
const aifRound = (num: number | null | undefined, decimals: number = 2): number => {
  if (num == null || isNaN(num)) return 0
  if (decimals === 0) return Math.round(num)
  const roundedStr = Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals
  return Number(roundedStr)
}

// =========================================================================
// ENVOLTORIOS PARA AISLAR EL RENDER DEL DESCUENTO
// =========================================================================
interface WrapperDescuentoProps {
  control: Control<ArticuloOperacionInputProps>
  setValue: UseFormSetValue<ArticuloOperacionInputProps>
  monedaSigla: string
  disabled?: boolean
  nroDecimales: number
  step: number
  min: number
}

const WrapperDescuento: FunctionComponent<WrapperDescuentoProps> = ({
  control,
  setValue,
  monedaSigla,
  disabled,
  nroDecimales,
  step,
  min,
}) => {
  const [cantidad, precio] = useWatch({
    control,
    name: ['cantidad', 'precio'],
  })

  const subtotal = aifRound((Number(cantidad) || 0) * (Number(precio) || 0))

  return (
    <FormDescuentoField
      control={control}
      setValue={setValue}
      namePorcentaje="descuentoP"
      nameMonto="descuento"
      subtotal={subtotal}
      monedaSigla={monedaSigla}
      disabled={disabled}
      nroDecimales={nroDecimales}
      step={step}
      min={min}
    />
  )
}

// Nuevo envoltorio para solucionar el bug visual del ReadOnly
const DescuentoReadOnly: FunctionComponent<{
  control: Control<ArticuloOperacionInputProps>
  monedaSigla: string
  props?: DescuentoSeleccionProps
}> = ({ control, monedaSigla, props }) => {
  const descuentoWatch = useWatch({ control, name: 'descuento' })
  return (
    <TextField
      id="descuento-readonly"
      label={props?.label ?? 'Descuento'}
      value={props?.ocultar ? '--' : numberWithCommasPlaces(descuentoWatch || 0, props?.nroDecimales ?? 2)}
      size="small"
      fullWidth
      disabled={true}
      slotProps={{ input: { readOnly: true, endAdornment: monedaSigla } }}
    />
  )
}

// =========================================================================
// COMPONENTE AISLADO: RESUMEN DE CÁLCULOS
// =========================================================================
interface ResumenCalculosProps {
  control: Control<ArticuloOperacionInputProps>
  moneda: MonedaProps
}

const ResumenCalculos: FunctionComponent<ResumenCalculosProps> = ({ control, moneda }) => {
  const [cantidad, precio, descuentoMonto, descuentoPWatch] = useWatch({
    control,
    name: ['cantidad', 'precio', 'descuento', 'descuentoP'],
  })

  const calculos = useMemo(() => {
    const subtotal = (Number(cantidad) || 0) * (Number(precio) || 0)
    const montoDescuento = Number(descuentoMonto) || 0
    const totalNeto = subtotal - montoDescuento

    return { subtotal, montoDescuento, totalNeto }
  }, [cantidad, precio, descuentoMonto])

  return (
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

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary" noWrap>
            Descuento{' '}
            <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>
              ({Number(descuentoPWatch || 0).toFixed(2)}%)
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

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Typography
            variant="button"
            sx={{ fontSize: { xs: '0.90rem', sm: '1rem' }, fontWeight: 800, whiteSpace: 'nowrap' }}
          >
            TOTAL
          </Typography>
          <MontoMonedaTexto
            boxProps={{
              color: (theme) => getColor(theme, 'blue').textColor,
              fontSize: 'large',
              fontWeight: 600,
            }}
            monto={calculos.totalNeto}
            sigla={moneda.sigla}
          />
        </Stack>
      </Stack>
    </Paper>
  )
}

interface OwnProps {
  control: Control<ArticuloOperacionInputProps>
  setValue: UseFormSetValue<ArticuloOperacionInputProps>
  getValues: UseFormGetValues<ArticuloOperacionInputProps>
  articulo: ArticuloProps
  moneda: MonedaProps
  inventario: ArticuloInventarioOperacionProps | null
  open: boolean
  entidad: EntidadInputProps
  almacenProps: AlmacenSeleccionProps
  loteProps: LoteSeleccionProps
  unidadMedidaProps: UnidadMedidaSeleccionProps
  cantidadProps?: CantidadSeleccionProps
  precioProps?: PrecioSeleccionProps
  descuentoProps?: DescuentoSeleccionProps
  ocultarCalculos?: boolean
}

type Props = OwnProps

const ArticuloInventarioFormularioCard: FunctionComponent<Props> = (props) => {
  const {
    articulo,
    control,
    moneda,
    inventario,
    open,
    entidad,
    setValue,
    getValues,
    loteProps,
    almacenProps,
    unidadMedidaProps,
    cantidadProps,
    precioProps,
    descuentoProps,
    ocultarCalculos = false,
  } = props

  // ===== OBSERVACIÓN OPTIMIZADA =====
  const [almacenWatch, articuloUnidadMedidaWatch] = useWatch({
    control,
    name: ['almacen', 'articuloUnidadMedida'],
  })

  // ===== CARGA DE ALMACENES DESDE TABLA =====
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
      return almacenesTabla ? procesarAlmacenesDesdeTabla(almacenesTabla, almacenProps) : []
    } else {
      const inventarioDetalle = articulo?.inventario?.[0]?.detalle || []
      return procesarAlmacenesDesdeInventario(inventarioDetalle, almacenProps)
    }
  }, [almacenProps, almacenesTabla, articulo])

  const loadingAlmacenes = (almacenProps.fuente || 'tbl') === 'tbl' ? loadingAlmacenesTabla : false

  // ===== PROCESAMIENTO DE LOTES SEGÚN LA FUENTE =====
  const lotesDisponibles = useMemo(() => {
    if (!almacenWatch?.codigoAlmacen) return []
    const fuente = loteProps.fuente || 'inv'
    if (fuente === 'inv') {
      const inventarioDetalle = articulo?.inventario?.[0]?.detalle || []
      const detalleAlmacen = obtenerDetalleInventarioPorAlmacen(inventarioDetalle, almacenWatch.codigoAlmacen)
      if (!detalleAlmacen) return []
      return procesarLotesDesdeInventario(detalleAlmacen.lotes, loteProps)
    } else {
      return []
    }
  }, [almacenWatch, loteProps, articulo])

  // ===== AUTOSELECCIÓN DE ALMACÉN =====
  useEffect(() => {
    if (almacenProps.autoSeleccion && isSuccess && almacenes.length > 0 && !almacenWatch) {
      const primerAlmacen = seleccionarAlmacenAutomatico(almacenes)
      if (primerAlmacen) {
        setValue('almacen', primerAlmacen, { shouldValidate: true, shouldDirty: true })
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

  const precioLabel = useMemo(() => {
    if (precioProps?.tipoMonto === 'costo') return 'Costo unitario'
    if (precioProps?.tipoMonto === 'delivery') return 'Precio delivery'
    return 'Precio unitario'
  }, [precioProps?.tipoMonto])

  const articuloPrecioMap = useMemo<Map<string, ArticuloPrecioProps>>(() => {
    if (!articulo) return new Map()
    return new Map<string, ArticuloPrecioProps>(
      [articulo.articuloPrecioBase, ...articulo.articuloPrecio].map((ap) => [
        ap.articuloUnidadMedida.codigoUnidadMedida,
        ap,
      ]),
    )
  }, [articulo])

  // ===== CAMBIO DE UNIDAD DE MEDIDA =====
  const onChangeUnidadMedida = useCallback(
    (item: ArticuloUnidadMedidaProps | null) => {
      if (!item) return
      if (item.codigoUnidadMedida === articuloUnidadMedidaWatch?.codigoUnidadMedida) return

      // const cantidadActual = getValues('cantidad') || 0
      // const cantidadOriginalActual = getValues('cantidadOriginal') || 0

      const articuloPrecio = articuloPrecioMap.get(item.codigoUnidadMedida)
      // const articuloOld = articuloPrecioMap.get(articuloUnidadMedidaWatch?.codigoUnidadMedida || '')
      if (!articuloPrecio) return

      // --- 1. PRECIOS ---
      const monedaPrecio = transformarArticuloPrecioService(articuloPrecio, moneda)
      let precioFinal = monedaPrecio.precio

      if (precioProps?.tipoMonto === 'precio') precioFinal = monedaPrecio.precio
      if (precioProps?.tipoMonto === 'costo') precioFinal = monedaPrecio.precioBase
      if (precioProps?.tipoMonto === 'delivery') precioFinal = monedaPrecio.delivery

      setValue('precio', precioFinal, { shouldValidate: true, shouldDirty: true })

      // // --- 2. CANTIDADES (Matemática de Alta Precisión) ---
      // const factorAntiguo = articuloOld?.cantidadBase || 1
      // const factorNuevo = articuloPrecio.cantidadBase
      //
      // // Calculamos el valor exacto en la unidad base (sin redondear)
      // const cantidadBaseExacta = cantidadActual * factorAntiguo
      // const cantidadOriginalBaseExacta = cantidadOriginalActual * factorAntiguo
      //
      // // Dividimos por el nuevo factor
      // let cantidadTransformado = cantidadBaseExacta / factorNuevo
      // let cantidadOriginal = cantidadOriginalBaseExacta / factorNuevo
      //
      // // Usamos toFixed(6) para limpiar basura de punto flotante de JS (ej: 0.9999999)
      // // pero mantenemos suficientes decimales para que las conversiones inversas sean exactas.
      // cantidadTransformado = Number(cantidadTransformado.toFixed(6))
      // cantidadOriginal = Number(cantidadOriginal.toFixed(6))
      //
      // // console.log("Valor exacto calculado:", cantidadTransformado)
      //
      // setValue('cantidad', cantidadTransformado, { shouldValidate: true, shouldDirty: true })
      // setValue('cantidadFactor', factorNuevo)
      // setValue('cantidadOriginal', cantidadOriginal)
    },
    [
      articuloPrecioMap,
      articuloUnidadMedidaWatch?.codigoUnidadMedida,
      moneda,
      precioProps?.tipoMonto,
      setValue,
    ],
  )

  // articuloPrecioMap,
  // articuloUnidadMedidaWatch?.codigoUnidadMedida,
  // moneda,
  // precioProps?.tipoMonto,
  // setValue,
  // getValues,

  const handleAlmacenChange = useCallback(
    (newValue: any, fieldOnChange: (val: any) => void) => {
      fieldOnChange(newValue)
      setValue('lote', null)
    },
    [setValue],
  )

  /** Prorreamos la cantidad en funcíon a cantidadFactor de la unidad de medida */
  const handleUnidadMedidaChange = useCallback(
    (item: any, fieldOnChange: (val: any) => void) => {
      fieldOnChange(item)
      onChangeUnidadMedida(item)
    },
    [onChangeUnidadMedida],
  )

  // ===== RENDERIZADO =====
  return (
    <SimpleBox sx={{ py: 2, px: 2, width: '100%' }}>
      <Grid container rowSpacing={3} columnSpacing={1.5}>
        <Grid size={12}>
          <Typography
            sx={{
              color: (theme) => getColor(theme, 'primary').textColor,
              fontWeight: 500,
              letterSpacing: 0.5,
              textTransform: 'capitalize',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '1',
              WebkitBoxOrient: 'vertical',
            }}
          >
            Ficha del producto: {articulo?.nombreArticulo || ''}
          </Typography>
        </Grid>
        <Grid size={12}>
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
                    onChange={(newValue) => handleAlmacenChange(newValue, field.onChange)}
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
          <Controller
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ArticuloUnidadMedidaSeleccion
                value={field.value}
                error={error?.message}
                onChange={(item) => handleUnidadMedidaChange(item, field.onChange)}
                datos={articulosUnidadMedida}
                unidadMedidaProps={unidadMedidaProps}
              />
            )}
            name={'articuloUnidadMedida'}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          <Controller
            control={control}
            name="cantidad"
            render={({ field, fieldState: { error } }) => {
              if (cantidadProps?.readOnly || cantidadProps?.ocultar) {
                return (
                  <TextField
                    id="cantidad-readonly"
                    label={cantidadProps?.label ?? 'Cantidad *'}
                    value={
                      cantidadProps?.ocultar
                        ? '--'
                        : numberWithCommasPlaces(field.value || 0, cantidadProps?.nroDecimales ?? 2)
                    }
                    size="small"
                    fullWidth
                    disabled={true}
                    slotProps={{ input: { readOnly: true, endAdornment: moneda.sigla } }}
                  />
                )
              }
              return (
                <NumberSpinnerField
                  min={cantidadProps?.min ?? 0}
                  decimalScale={cantidadProps?.nroDecimales ?? 2}
                  step={cantidadProps?.step ?? 1}
                  label={cantidadProps?.label ?? 'Cantidad'}
                  size="small"
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
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          <Controller
            control={control}
            name="precio"
            render={({ field, fieldState: { error } }) => {
              if (precioProps?.readOnly || precioProps?.ocultar) {
                return (
                  <TextField
                    id="precio-readonly"
                    label={precioProps?.label ?? precioLabel}
                    value={
                      precioProps?.ocultar
                        ? '--'
                        : numberWithCommasPlaces(field.value || 0, precioProps?.nroDecimales ?? 2)
                    }
                    size="small"
                    fullWidth
                    disabled={true}
                    slotProps={{ input: { readOnly: true, endAdornment: moneda.sigla } }}
                  />
                )
              }
              return (
                <NumberSpinnerField
                  label={precioProps?.label ?? precioLabel}
                  size="small"
                  min={precioProps?.min ?? 0}
                  step={precioProps?.step ?? 0.1}
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
                  decimalScale={precioProps?.nroDecimales ?? 2}
                />
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {descuentoProps?.readOnly || descuentoProps?.ocultar ? (
            <DescuentoReadOnly control={control} monedaSigla={moneda.sigla} props={descuentoProps} />
          ) : (
            <WrapperDescuento
              control={control}
              setValue={setValue}
              monedaSigla={moneda.sigla}
              disabled={descuentoProps?.disabled}
              nroDecimales={descuentoProps?.nroDecimales ?? 2}
              step={descuentoProps?.step ?? 0.1}
              min={descuentoProps?.min ?? 0}
            />
          )}
        </Grid>

        {!ocultarCalculos && (
          <Grid size={12}>
            <Box mt={0}>
              <ResumenCalculos control={control} moneda={moneda} />
            </Box>
          </Grid>
        )}
      </Grid>
    </SimpleBox>
  )
}

export default React.memo(ArticuloInventarioFormularioCard)
