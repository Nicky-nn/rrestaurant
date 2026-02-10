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
  DialogProps,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { apiArticuloInventarioPorId } from '../../../../../../base/api/apiArticuloInventarioPorId.ts'
import { articuloToInventarioOperacion } from '../../../../../../base/services/articuloToInventarioOperacion.ts'
import { articuloOperacionInputValidator } from '../../../../../../base/validator/articuloOperacionInputValidator.ts'
import { ActionFormProps, EntidadInputProps } from '../../../../../../interfaces'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { MonedaProps } from '../../../../../../interfaces/monedaPrecio.ts'
import { UnidadMedidaSeleccionProps } from '../../ArticuloUnidadMedidaSeleccion/ArticuloUnidadMedidaSeleccion.tsx'
import { LoteSeleccionProps } from '../../LoteSeleccion/LoteSeleccion.tsx'
import ArticuloInventarioFormularioCard, {
  AlmacenSeleccionProps,
  CantidadSeleccionProps,
  DescuentoSeleccionProps,
  PrecioSeleccionProps,
} from './ArticuloInventarioFormularioCard.tsx'
import ArticuloInventarioInformacionCard from './ArticuloInventarioInformacionCard.tsx'
import { seleccionArticuloInventarioReglas } from './seleccionArticuloInventarioReglas.ts'

export interface SeleccionArticuloReglasProps {
  validarCantidad: boolean
  validarTotal?: boolean
  validarInventario?: boolean
  ocultarCalculos?: boolean
}

interface OwnProps extends Omit<DialogProps, 'id' | 'onClose'> {
  id: string
  articuloId: string | null
  verificarPrecio?: boolean // Busqueda de articulo con precio, default true
  verificarInventario?: boolean // Busqueda de articulo con inventario, default false
  almacenProps?: AlmacenSeleccionProps
  loteProps: LoteSeleccionProps
  unidadMedidaProps?: UnidadMedidaSeleccionProps
  cantidadProps?: CantidadSeleccionProps
  precioProps?: PrecioSeleccionProps
  descuentoProps?: DescuentoSeleccionProps
  moneda: MonedaProps // para para visualización
  articuloIndex: number // Si el articulo es de tipo lista y ocupa una posición
  item: ArticuloOperacionInputProps | null
  action: ActionFormProps
  entidad: EntidadInputProps
  reglas: SeleccionArticuloReglasProps
  actionButtons?: {
    mostrarBtnCerrar?: boolean // muestra el btn de cerrar, default false
    ocultarBtnActualizar?: boolean // muestra el btn de guardar, default false
    btnCerrarText?: string // texto del btn de cerrar, default "Cerrar"
    btnActualizarText?: string // texto del btn de guardar, default "Actualizar item"
  }
  onClose: (resp?: { index: number; item: ArticuloOperacionInputProps }) => void
  onClear: () => void
}

type Props = OwnProps

/**
 * Dialogo de seleccion de articulo
 * @param props
 * @constructor
 */
const SeleccionArticuloInventarioDialog: FunctionComponent<Props> = (props) => {
  const {
    onClose,
    open,
    articuloId,
    item,
    action,
    articuloIndex = -1,
    moneda,
    entidad,
    verificarPrecio = true,
    verificarInventario = false,
    onClear, // Para limpiar los parametros de entrada, resuelve Blocked aria-hidden
    loteProps,
    almacenProps = {},
    unidadMedidaProps = {} as UnidadMedidaSeleccionProps,
    cantidadProps = {} as CantidadSeleccionProps,
    precioProps = {} as PrecioSeleccionProps,
    descuentoProps = {} as DescuentoSeleccionProps,
    reglas,
    actionButtons = {},
    ...other
  } = props

  const [mensajes, setMensajes] = useState<string[]>([])

  // Creamos el formulario
  const { control, handleSubmit, reset, setValue } = useForm<ArticuloOperacionInputProps>(
    {
      defaultValues: item || {},
      resolver: yupResolver(articuloOperacionInputValidator),
    },
  )

  const {
    data: articulo,
    isLoading: articuloLoading,
    isSuccess,
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
      if (articuloId) {
        const resp = await apiArticuloInventarioPorId({
          entidad,
          verificarPrecio,
          verificarInventario,
          id: articuloId,
        })
        return resp ?? null
      }
      return null
    },
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  const [almacenWatch, loteWatch, articuloUnidadMedidaWatch] = useWatch({
    control,
    name: ['almacen', 'lote', 'articuloUnidadMedida'],
  })

  // Datos del inventario actual
  const inventario = useMemo(() => {
    if (!articulo) return null
    return articuloToInventarioOperacion(articulo, {
      codigoAlmacen: almacenWatch?.codigoAlmacen ?? null,
      codigoLote: loteWatch?.codigoLote ?? null,
      codigoUnidadMedida: articuloUnidadMedidaWatch?.codigoUnidadMedida ?? null,
    })
  }, [articulo, almacenWatch, loteWatch, articuloUnidadMedidaWatch])

  // Registro formulario
  const onSubmit = (data: ArticuloOperacionInputProps) => {
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
  }

  const onError = (errors: any) => {
    console.log(errors)
    setMensajes(['No se podido validar el formulario'])
  }

  /*###############################################################*/
  /*###############################################################*/
  /*###############################################################*/
  /*###############################################################*/
  useEffect(() => {
    if (open && isSuccess && item && articulo) {
      reset({ ...item })
    }
    setMensajes([])
  }, [open, isSuccess, item, articulo])
  /*###############################################################*/
  /*###############################################################*/

  // Renderizamos el contenido
  const renderContent = () => {
    // Carga de articulo en servidor
    if (articuloLoading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )
    }

    // Verifica Inexistencia de articulo o item
    if (!articulo || !item) {
      return (
        <Alert severity="warning">
          <AlertTitle>Alerta</AlertTitle>
          No se ha podido encontrar los datos del artículo en el servidor o el item
          seleccionado es inexistente, cierre el diálogo e intente de nuevo.
        </Alert>
      )
    }

    // Verifica que el articulo del servidor no coincide con la selección
    if (articulo._id !== item.articuloId) {
      return (
        <Alert severity="warning">
          <AlertTitle>Alerta</AlertTitle>
          El artículo del servidor no coincide con el articulo seleccionado, cierre el
          diálogo y vuelva a intentar.
        </Alert>
      )
    }

    return (
      <Grid container spacing={2} columns={12}>
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
            loteProps={loteProps}
            unidadMedidaProps={unidadMedidaProps}
            almacenProps={almacenProps}
            cantidadProps={cantidadProps}
            precioProps={precioProps}
            descuentoProps={descuentoProps}
            ocultarCalculos={reglas.ocultarCalculos}
            open={open}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': { maxHeight: '90vh', width: '1100px', maxWidth: '90vw' },
      }}
      // maxWidth="lg"
      fullWidth
      open={open}
      onClose={() => onClose()}
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
          {articulo
            ? `${articulo.codigoArticulo} - ${articulo.nombreArticulo}`
            : 'Cargando...'}
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
      <DialogContent dividers>
        {renderContent()}
        {mensajes.length > 0 && (
          <Box>
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

        {!actionButtons.ocultarBtnActualizar && (
          <>
            {articulo && item && articulo._id === item.articuloId && (
              <Button
                color={item ? 'secondary' : 'primary'}
                variant={'contained'}
                sx={{ mr: 2 }}
                startIcon={<AddShoppingCart />}
                onClick={() => handleSubmit(onSubmit, onError)()}
              >
                {actionButtons.btnActualizarText
                  ? actionButtons.btnActualizarText
                  : item
                    ? 'Actualizar item'
                    : 'Agregar item'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default SeleccionArticuloInventarioDialog
