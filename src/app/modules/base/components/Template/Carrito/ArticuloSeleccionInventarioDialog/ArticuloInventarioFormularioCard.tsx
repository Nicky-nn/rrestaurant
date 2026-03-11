import { ArticleOutlined } from '@mui/icons-material'
import { Box, Divider, FormControl, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useCallback, useEffect, useMemo } from 'react'
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form'

import { apiAlmacenPorSucursalListado } from '../../../../../../base/api/apiAlmacenPorSucursalListado.ts'
import { FormDescuentoField } from '../../../../../../base/components/Form/FormDescuentoField.tsx'
import FormSelect from '../../../../../../base/components/Form/FormSelect.tsx'
import { numberWithCommasPlaces } from '../../../../../../base/components/MyInputs/NumberInput.tsx'
import NumberSpinnerField from '../../../../../../base/components/NumberSpinnerField/NumberSpinnerField.tsx'
import MontoMonedaTexto from '../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { PreloadFieldSkeleton } from '../../../../../../base/components/skeleton/PreloadFieldSkeleton.tsx'
import SimpleCard from '../../../../../../base/components/Template/Cards/SimpleCard.tsx'
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

// =========================================================================
// ENVOLTORIO PARA AISLAR EL RENDER DEL DESCUENTO
// =========================================================================
interface WrapperDescuentoProps {
  control: Control<ArticuloOperacionInputProps>
  setValue: UseFormSetValue<ArticuloOperacionInputProps>
  monedaSigla: string
  disabled?: boolean
  nroDecimales: number
}

const WrapperDescuento: FunctionComponent<WrapperDescuentoProps> = ({
  control,
  setValue,
  monedaSigla,
  disabled,
  nroDecimales,
}) => {
  // Solo este pequeño wrapper se re-renderiza cuando cambian la cantidad o el precio
  const [cantidad, precio] = useWatch({
    control,
    name: ['cantidad', 'precio'],
  })

  const subtotal = (Number(cantidad) || 0) * (Number(precio) || 0)

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
    />
  )
}

// =========================================================================
// COMPONENTE AISLADO: RESUMEN DE CÁLCULOS
// Extraemos la observación de campos de alta frecuencia aquí
// para evitar re-renderizar al momento de teclear
// =========================================================================
interface ResumenCalculosProps {
  control: Control<ArticuloOperacionInputProps>
  moneda: MonedaProps
}

/**
 * Componente para generar los totales
 * @param control
 * @param setValue
 * @param moneda
 * @constructor
 */
const ResumenCalculos: FunctionComponent<ResumenCalculosProps> = ({ control, moneda }) => {
  // 1. Escuchamos directamente el MONTO (descuento), no el porcentaje
  const [cantidad, precio, descuentoMonto, descuentoPWatch] = useWatch({
    control,
    name: ['cantidad', 'precio', 'descuento', 'descuentoP'],
  })

  // 2. Cálculos simples
  const calculos = useMemo(() => {
    const subtotal = (Number(cantidad) || 0) * (Number(precio) || 0)
    const montoDescuento = Number(descuentoMonto) || 0 // Ya viene calculado desde el wrapper
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

        {/* DESCUENTO */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary" noWrap>
            Descuento{' '}
            <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>
              {/* Seguimos mostrando el % visualmente para el cliente */}(
              {Number(descuentoPWatch || 0).toFixed(2)}%)
            </Box>
          </Typography>
          <MontoMonedaTexto
            boxProps={{ color: 'error.main', fontSize: 'medium' }}
            label={'- '}
            monto={calculos.montoDescuento} // Mostramos el monto exacto
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
  )
}

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
  // Solo observamos dependencias estructurales que cambian selects o listas
  const [almacenWatch, articuloUnidadMedidaWatch] = useWatch({
    control,
    name: ['almacen', 'articuloUnidadMedida'],
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
  const onChangeUnidadMedida = useCallback(
    (item: ArticuloUnidadMedidaProps | null) => {
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
    },
    [
      articuloPrecioMap,
      articuloUnidadMedidaWatch?.codigoUnidadMedida,
      moneda,
      precioProps?.tipoMonto,
      setValue,
    ],
  )

  const handleAlmacenChange = useCallback(
    (newValue: any, fieldOnChange: (val: any) => void) => {
      fieldOnChange(newValue)
      setValue('lote', null)
    },
    [setValue],
  )

  const handleUnidadMedidaChange = useCallback(
    (item: any, fieldOnChange: (val: any) => void) => {
      fieldOnChange(item)
      onChangeUnidadMedida(item)
    },
    [onChangeUnidadMedida],
  )

  /***********************************************************************************/
  /***********************************************************************************/
  /***********************************************************************************/
  // ===== RENDERIZADO =====
  return (
    <SimpleCard
      title={`${articulo.codigoArticulo}: ${articulo.nombreArticulo}`}
      childIcon={<ArticleOutlined />}
    >
      <Grid container rowSpacing={2.7} columnSpacing={1.5}>
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
                onChange={(item) => handleUnidadMedidaChange(item, field.onChange)}
                datos={articulosUnidadMedida}
                unidadMedidaProps={unidadMedidaProps}
              />
            )}
            name={'articuloUnidadMedida'}
          />
        </Grid>
        {/* CANTIDAD */}
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
                  min={0}
                  decimalScale={cantidadProps?.nroDecimales ?? 2}
                  step={1}
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
        {/* PRECIO */}
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
                  hideActionButtons={true}
                  decimalScale={precioProps?.nroDecimales ?? 2}
                />
              )
            }}
          />
        </Grid>
        {/* DESCUENTO */}
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
          {descuentoProps?.readOnly || descuentoProps?.ocultar ? (
            <TextField
              id="descuento-readonly"
              label={descuentoProps?.label ?? 'Descuento'}
              // Mostramos el monto directamente, ya que el cálculo interno lo mantiene actualizado
              value={
                descuentoProps?.ocultar
                  ? '--'
                  : numberWithCommasPlaces(
                      control._formValues.descuento || 0,
                      descuentoProps?.nroDecimales ?? 2,
                    )
              }
              size="small"
              fullWidth
              disabled={true}
              slotProps={{ input: { readOnly: true, endAdornment: moneda.sigla } }}
            />
          ) : (
            <WrapperDescuento
              control={control}
              setValue={setValue}
              monedaSigla={moneda.sigla}
              disabled={descuentoProps?.disabled}
              nroDecimales={descuentoProps?.nroDecimales ?? 2}
            />
          )}
        </Grid>
        {/* CÁLCULOS AISLADOS */}
        {!ocultarCalculos && (
          <Grid size={12}>
            <Box mt={-1.5}>
              <ResumenCalculos control={control} moneda={moneda} />
            </Box>
          </Grid>
        )}
      </Grid>
    </SimpleCard>
  )
}

export default React.memo(ArticuloInventarioFormularioCard)
