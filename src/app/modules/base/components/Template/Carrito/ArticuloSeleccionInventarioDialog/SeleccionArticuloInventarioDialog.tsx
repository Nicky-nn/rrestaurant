import { yupResolver } from '@hookform/resolvers/yup'
import { AddShoppingCart, Close } from '@mui/icons-material'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { apiArticuloInventarioPorId } from '../../../../../../base/api/apiArticuloInventarioPorId.ts'
import { MetodoSeleccionLote } from '../../../../../../base/services/articuloToArticuloOperacionInputService.ts'
import { articuloToInventarioOperacion } from '../../../../../../base/services/articuloToInventarioOperacion.ts'
import { articuloOperacionInputValidator } from '../../../../../../base/validator/articuloOperacionInputValidator.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { UnidadMedidaSeleccionProps } from '../../ArticuloUnidadMedidaSeleccion/ArticuloUnidadMedidaSeleccion.tsx'
import { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccionTypes.ts'
import ArticuloInventarioFormularioCard from './ArticuloInventarioFormularioCard.tsx'
import ArticuloInventarioInformacionCard from './ArticuloInventarioInformacionCard.tsx'
import {
  ActionButtonsProps,
  CantidadSeleccionProps,
  DescuentoSeleccionProps,
  PrecioSeleccionProps,
  SeleccionArticuloInventarioDialogProps,
} from './ArticuloSeleccionInventarioTypes.ts'
import { seleccionArticuloInventarioReglas } from './seleccionArticuloInventarioReglas.ts'

const DEFAULT_LOTE_PROPS: LoteSeleccionProps = { metodoSeleccion: MetodoSeleccionLote.MANUAL }
const DEFAULT_EMPTY_PROPS = {}

/**
 * Diálogo de selección de artículo con inventario
 *
 * Permite configurar la fuente de datos de almacenes y lotes:
 * - listaAlmacen: 'tbl' usa API general | 'inv' usa inventario del artículo
 * - listaLote: 'tbl' usa API general | 'inv' usa inventario del artículo
 *
 * Configuraciones avanzadas disponibles en listaAlmacenProps y listaLoteProps
 *
 * @param props - Propiedades del componente
 * @constructor
 * @autor isi-template
 */
const SeleccionArticuloInventarioDialog: FunctionComponent<SeleccionArticuloInventarioDialogProps> = (
  props,
) => {
  const {
    onClose,
    open,
    articuloId,
    item,
    articuloIndex = -1,
    moneda,
    entidad,
    verificarPrecio = true,
    verificarInventario = false,
    onClear, // Para limpiar los parametros de entrada, resuelve Blocked aria-hidden
    almacenProps,
    loteProps = DEFAULT_LOTE_PROPS,
    unidadMedidaProps = DEFAULT_EMPTY_PROPS as UnidadMedidaSeleccionProps,
    cantidadProps = DEFAULT_EMPTY_PROPS as CantidadSeleccionProps,
    precioProps = DEFAULT_EMPTY_PROPS as PrecioSeleccionProps,
    descuentoProps = DEFAULT_EMPTY_PROPS as DescuentoSeleccionProps,
    reglas,
    actionButtons = DEFAULT_EMPTY_PROPS as ActionButtonsProps,
    ...other
  } = props

  const [mensajes, setMensajes] = useState<string[]>([])

  // Creamos el formulario
  const { control, handleSubmit, reset, setValue } = useForm<ArticuloOperacionInputProps>({
    defaultValues: item || {},
    resolver: yupResolver(articuloOperacionInputValidator),
  })

  const {
    data: articulo,
    isLoading: articuloLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [
      'seleccion-articulo-inventario-por-id',
      open,
      articuloId,
      entidad,
      verificarPrecio,
      verificarInventario,
    ],
    enabled: open && Boolean(articuloId),
    queryFn: async () => {
      if (!articuloId) return null
      const resp = await apiArticuloInventarioPorId({
        entidad,
        verificarPrecio,
        verificarInventario,
        id: articuloId,
      })
      return resp ?? null
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // ===== OBSERVACION DE DATOS DEL FORMULARIO =====
  const [almacenWatch, loteWatch, articuloUnidadMedidaWatch] = useWatch({
    control,
    name: ['almacen', 'lote', 'articuloUnidadMedida'],
  })

  // ===== CÁLCULO DEL INVENTARIO ACTUAL =====
  const inventario = useMemo(() => {
    if (!articulo) return null

    return articuloToInventarioOperacion(articulo, {
      codigoAlmacen: almacenWatch?.codigoAlmacen ?? null,
      codigoLote: loteWatch?.codigoLote ?? null,
      codigoUnidadMedida: articuloUnidadMedidaWatch?.codigoUnidadMedida ?? null,
    })
  }, [articulo, almacenWatch, loteWatch, articuloUnidadMedidaWatch])

  // ===== MANEJO DE ENVÍO DEL FORMULARIO =====
  const onSubmit = useCallback(
    (data: ArticuloOperacionInputProps) => {
      const errors = seleccionArticuloInventarioReglas(articulo, data, inventario, {
        loteProps,
        unidadMedidaProps,
        reglas,
      })
      setMensajes(errors.length > 0 ? errors : [])
      if (errors.length > 0) return
      onClose({
        index: articuloIndex,
        item: data,
      })
    },
    [articulo, inventario, loteProps, unidadMedidaProps, reglas, articuloIndex, onClose],
  )

  const onError = useCallback((errors: any) => {
    console.log('Errores de validación del formulario:', errors)
    setMensajes(['No se ha podido validar el formulario'])
  }, [])

  const lotePropsCalculados = useMemo(
    () => ({
      fuente: loteProps?.fuente ?? almacenProps?.fuente ?? 'inv',
      ...loteProps,
    }),
    [loteProps, almacenProps?.fuente],
  )

  // ===== EFECTOS =====
  const formularioInicializado = useRef(false)
  useEffect(() => {
    if (!open) formularioInicializado.current = false
  }, [open])

  // Reset del formulario cuando cambian los datos
  useEffect(() => {
    if (open && isSuccess && item && articulo && !formularioInicializado.current) {
      reset({ ...item })
      formularioInicializado.current = true
      setMensajes([])
    }
  }, [open, isSuccess, item, reset, articulo])

  /*###############################################################*/
  /*###############################################################*/

  // ===== RENDERIZAMOS EL CONTENIDO =====
  const renderContent = useCallback(() => {
    // Estado de carga
    if (articuloLoading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )
    }

    // Error de carga
    if (isError) {
      return (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          No se ha podido cargar los datos del artículo desde el servidor. Por favor, intente nuevamente.
        </Alert>
      )
    }

    // Validación de existencia de datos
    if (!articulo || !item) {
      return (
        <Alert severity="warning">
          <AlertTitle>Alerta</AlertTitle>
          No se ha podido encontrar los datos del artículo en el servidor o el item seleccionado es
          inexistente. Cierre el diálogo e intente de nuevo.
        </Alert>
      )
    }

    // Validación de coincidencia de artículo
    if (articulo._id !== item.articuloId) {
      return (
        <Alert severity="warning">
          <AlertTitle>Alerta</AlertTitle>
          El artículo del servidor no coincide con el artículo seleccionado. Cierre el diálogo y vuelva a
          intentar.
        </Alert>
      )
    }
    // Contenido principal
    return (
      <Grid container spacing={1} columns={12}>
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <ArticuloInventarioInformacionCard
            articulo={articulo}
            control={control}
            moneda={moneda}
            inventario={inventario}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <ArticuloInventarioFormularioCard
            control={control}
            setValue={setValue}
            articulo={articulo}
            moneda={moneda}
            inventario={inventario}
            entidad={entidad}
            almacenProps={almacenProps}
            loteProps={lotePropsCalculados}
            unidadMedidaProps={unidadMedidaProps}
            cantidadProps={cantidadProps}
            precioProps={precioProps}
            descuentoProps={descuentoProps}
            ocultarCalculos={reglas?.ocultarCalculos}
            open={open}
          />
        </Grid>
      </Grid>
    )
  }, [
    articuloLoading,
    isError,
    articulo,
    item,
    control,
    moneda,
    inventario,
    setValue,
    entidad,
    unidadMedidaProps,
    almacenProps,
    cantidadProps,
    precioProps,
    descuentoProps,
    reglas?.ocultarCalculos,
    open,
    lotePropsCalculados,
  ])

  // ===== MANEJO DE CIERRE =====
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // ===== MANEJO DE ENVÍO =====
  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit, onError)()
  }, [handleSubmit, onSubmit, onError])

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': { maxHeight: '90vh', width: '1100px', maxWidth: '90vw' },
      }}
      // maxWidth="lg"
      fullWidth
      open={open}
      onClose={handleClose}
      onTransitionExited={onClear}
      keepMounted={false}
      {...other}
    >
      <DialogTitle>
        <Typography
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '1',
            WebkitBoxOrient: 'vertical',
            mb: -0.2,
          }}
        >
          {articulo ? `${articulo.codigoArticulo} - ${articulo.nombreArticulo}` : 'Cargando...'}
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        title={'Cerrar o presione la tecla ESC'}
        onClick={() => onClose()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        {renderContent()}
        {mensajes.length > 0 && (
          <Box mt={1}>
            <Alert severity={'error'}>
              <AlertTitle>Se han detectado los siguientes errores:</AlertTitle>{' '}
              {mensajes.map((m, index) => (
                <Typography key={index}>- {m}</Typography>
              ))}
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        {actionButtons.mostrarBtnCerrar && (
          <Button color="error" variant={'text'} onClick={() => onClose()}>
            {actionButtons.btnCerrarText || 'Cerrar'}
          </Button>
        )}

        {!actionButtons.ocultarBtnActualizar && articulo && item && articulo._id === item.articuloId && (
          <Button
            color={item ? 'secondary' : 'primary'}
            variant="contained"
            startIcon={<AddShoppingCart />}
            onClick={handleFormSubmit}
          >
            {actionButtons.btnActualizarText || (item ? 'Actualizar item' : 'Agregar item')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default React.memo(SeleccionArticuloInventarioDialog)
