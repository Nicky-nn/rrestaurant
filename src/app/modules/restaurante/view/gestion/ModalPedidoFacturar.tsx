import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Divider,
  useTheme,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormGroup,
  OutlinedInput,
} from '@mui/material'
import {
  Close,
  ExpandMore,
  Add,
  Remove,
  Delete,
  ReceiptOutlined,
  CheckCircle,
  ControlPointDuplicate,
  RecentActors,
  PersonAddAlt1Outlined,
  TableChart,
  CreditCard,
} from '@mui/icons-material'
import { FunctionComponent, MouseEvent,useEffect, useMemo, useState } from 'react'
import { RestPedido, ArticuloOperacion, MetodoPagoVenta } from '../../types'
import { alphaByTheme, getContrastColor } from '../../../../utils/colorUtils'
import { FormTextField } from '../../../../base/components/Form'
import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput'
import { Controller, useForm } from 'react-hook-form'
import { MyInputLabel } from '../../../../base/components/MyInputs/MyInputLabel'
import AsyncSelect from 'react-select/async'
import { ClientProps } from '../../../clients/interfaces/client'
import { genReplaceEmpty } from '../../../../utils/helper'
import { swalException } from '../../../../utils/swal'
import { searchClientsApi } from '../../../clients/api/searchClients.api'
import DatosCliente from './DatosCliente'
import { getSelectStyles } from '../../../../base/components/MySelect/selectStyles'
import { useQuery } from '@tanstack/react-query'
import { apiMonedas } from '../../../base/moneda/api/monedaListado.api'
// import { apiMetodosPago } from '../../../base/metodoPago/api/metodosPago.api'
 import { MetodoPagoProp } from '../../../base/metodoPago/interfaces/metodoPago'
import AlertLoading from '../../../../base/components/Alert/AlertLoading'
import { MonedaProps } from '../../../base/moneda/interfaces/moneda'
import { NumeroFormat } from '../../../../base/components/Mask/NumeroFormat'
import useAuth from '../../../../base/hooks/useAuth'
import { toast } from 'react-toastify'
// import { MetodoPagoProps } from '../../../../interfaces/metodoPago'
import Select from 'react-select'
import { apiMetodosPago } from '../../../base/metodoPago/api/metodosPago.api'

interface Props {
  open: boolean
  pedido: RestPedido | null
  onClose: () => void
  onSuccess: () => void
}

type ProductoEditable = ArticuloOperacion & {
  cantidad: number
  precio: number
  descuento: number
}

const ModalPedidoFacturar: FunctionComponent<Props> = ({
  open,
  pedido,
  onClose,
  onSuccess,
}) => {
  const [productos, setProductos] = useState<ProductoEditable[]>([])
  const [additionalDiscount, setAdditionalDiscount] = useState(0)
  const [montoRecibido, setMontoRecibido] = useState(0)
  const [metodosPagoVenta, setMetodosPagoVenta] = useState<
    { metodoPago: MetodoPagoProp | null; monto: number }[]
  >([{ metodoPago: null, monto: 0 }])

  const theme = useTheme()
type FormValues = {
  cliente: ClientProps | null
  emailCliente: string
  moneda: MonedaProps | null
  codigoExcepcion: boolean
  numeroTarjeta: string
  tipoCambio: number
  metodoPago: MetodoPagoProp | null
}
  
const form = useForm<FormValues>({
  defaultValues: {
    cliente: null,
    emailCliente: '',
    moneda: null,
    codigoExcepcion: false,
    numeroTarjeta: '',
    tipoCambio: 1,
    metodoPago: null,
  },
})
const {
    user: {
      sucursal,
      puntoVenta,
      tipoRepresentacionGrafica,
      usuario,
      moneda,
      monedaTienda,
    },
  } = useAuth()
const { control, setValue, getValues, watch, formState: { errors } } = form

  const [initialState, setInitialState] = useState<{
  productos: ProductoEditable[]
  cliente: ClientProps | null
  additionalDiscount: number
  metodoPagoVenta: MetodoPagoVenta | null
} | null>(null)
const [clienteSeleccionado, setClienteSeleccionado] = useState<ClientProps | null>(
    null,
  )
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)

const mapClienteToClientProps = (cliente: any): ClientProps => ({
  _id: cliente._id,
  codigoCliente: cliente.codigoCliente,
  razonSocial: cliente.razonSocial,
  numeroDocumento: cliente.numeroDocumento,
  complemento: cliente.complemento,
  email: cliente.email,
  codigoExcepcion: cliente.codigoExcepcion,
  state: cliente.state,
  usucre: cliente.usucre,
} as ClientProps)
  
const fetchClientes = async (inputValue: string): Promise<ClientProps[]> => {
  try {
    if (inputValue.length > 2) {
      const clientes = await searchClientsApi(inputValue)
      if (clientes) return clientes
    }
    return []
  } catch (e: any) {
    swalException(e)
    return []
  }
}
 useEffect(() => {
  if (!pedido) return

  // 🔹 Mapear productos
  const mappedProductos: ProductoEditable[] =
    pedido.productos?.map((p) => ({
      ...p,
      cantidad: p.articuloPrecio?.cantidad ?? 1,
      precio: p.articuloPrecio?.valor ?? 0,
      descuento: p.articuloPrecio?.descuento ?? 0,
    })) || []

  setProductos(mappedProductos)

  // 🔹 Mapear cliente al tipo correcto
  const mappedCliente = pedido.cliente
    ? mapClienteToClientProps(pedido.cliente)
    : null

  // 🔹 Setear formulario
  setValue('cliente', mappedCliente)
  setValue(
    'emailCliente',
    genReplaceEmpty(mappedCliente?.email, ''),
  )

  // 🔹 Guardar estado inicial (CLAVE)
  setInitialState({
    productos: JSON.parse(JSON.stringify(mappedProductos)),
    cliente: mappedCliente,
    additionalDiscount: pedido.descuentoAdicional || 0,
    metodoPagoVenta: JSON.parse(JSON.stringify(pedido.metodoPagoVenta)),

  })}, [pedido])

const inputMoneda = getValues('moneda')
const cardNumber = getValues('numeroTarjeta')
useEffect(() => {
    const numeroTarjeta = getValues('numeroTarjeta') || ''

    if (numeroTarjeta === '00000000') {
      toast.error('El número de tarjeta no puede ser 00000000')
    } else return
  }, [watch('numeroTarjeta')])
  const { data: monedas, isLoading: monedaLoading } = useQuery<MonedaProps[], Error>({
    queryKey: ['apiMonedas'],
    queryFn: async () => {
      const resp = await apiMonedas()
      if (resp.length > 0) {
        // monedaUsuario
        const sessionMoneda = resp.find(
          (i) => i.codigo === genReplaceEmpty(inputMoneda?.codigo, moneda.codigo),
        )
        // montoTienda
        const mt = resp.find((i) => i.codigo === monedaTienda.codigo)
        if (sessionMoneda && mt) {
          setValue('moneda', sessionMoneda)
          setValue('tipoCambio', mt.tipoCambio)
        }
        return resp
      }
      return []
    },
  })
   const { data: metodosPagoOptions, isLoading: mpLoading } = useQuery<MetodoPagoProp[], Error>({
    queryKey: ['metodosPago'],
    queryFn: async () => {
      const resp = await apiMetodosPago()
      if (resp.length > 0) {
        console.log('metodosPagoOptions', resp)
        return resp
      }
      return []
    },
  })

  
  const getEstadoColor = () => {
  switch (pedido?.state) {
    case 'FINALIZADO':
      return theme.palette.warning.main
    case 'COMPLETADO':
      return theme.palette.info.main
    case 'PENDIENTE':
      return theme.palette.success.main
    default:
      return theme.palette.grey[500]
  }
}
const estadoColor = getEstadoColor()

const bgColor = alphaByTheme(estadoColor, theme, 0.15)
const textColor = getContrastColor(bgColor)
  // 🔹 Totales
  const subtotal = useMemo(
    () =>
      productos.reduce(
        (acc, p) => acc + (p.cantidad * p.precio - p.descuento),
        0,
      ),
    [productos],
  )

  const total = useMemo(
    () => subtotal - additionalDiscount,
    [subtotal, additionalDiscount],
  )

  // 🔹 Handlers
  const updateProducto = (index: number, field: string, value: number) => {
    const updated = [...productos]
    updated[index] = { ...updated[index], [field]: value }
    setProductos(updated)
  }

  const handleCantidad = (index: number, type: 'add' | 'subtract') => {
    const updated = [...productos]
    if (type === 'add') updated[index].cantidad++
    if (type === 'subtract' && updated[index].cantidad > 1)
      updated[index].cantidad--
    setProductos(updated)
  }

  const handleRemove = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    const payload = productos.map((p) => ({
      codigoArticulo: p.codigoArticulo,
      cantidad: p.cantidad,
      precio: p.precio,
      descuento: p.descuento,
    }))

    console.log('FACTURAR →', payload)

    onSuccess()
    onClose()
  }
  const handleAddMetodoPago = () => {
  setMetodosPagoVenta((prev) => [
    ...prev,
    { metodoPago: null, monto: 0 },
  ])
}

const handleRemoveMetodoPago = (index: number) => {
  setMetodosPagoVenta((prev) =>
    prev.filter((_, i) => i !== index),
  )
}

const handleChangeMetodo = (index: number, metodo: MetodoPagoProp | null) => {
  const updated = [...metodosPagoVenta]
  updated[index].metodoPago = metodo
  setMetodosPagoVenta(updated)
}

const handleChangeMonto = (index: number, monto: number) => {
  const updated = [...metodosPagoVenta]
  updated[index].monto = monto
  setMetodosPagoVenta(updated)
}

  if (!pedido) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
  
  <DialogTitle sx={{ pb: 1 }}>
    <Grid container alignItems="center" justifyContent="space-between">

      <Grid>
        <Typography variant="h6" fontWeight="bold">
          Detalles del Pedido #{pedido.numeroPedido}
        </Typography>
      </Grid>

      <Grid>
        <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">

          <Button
            startIcon={<ReceiptOutlined />}
            variant="contained"
            onClick={handleSubmit}
            disabled={productos.length === 0}
          >
            Facturar
          </Button>

          <Button
            endIcon={<CheckCircle />}
            variant="contained"
            disabled={pedido?.state === 'FINALIZADO' || productos.length === 0}
          >
            Finalizar
          </Button>

          <Button
            endIcon={<ControlPointDuplicate />}
            variant="contained"
            color="secondary"
            disabled={
              pedido?.state === 'FINALIZADO' ||
              pedido?.state === 'COMPLETADO' ||
              productos.length === 0
            }
          >
            Completar
          </Button>

          <Tooltip title="Estado de Cuenta">
            <IconButton>
              <RecentActors />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cerrar">
            <IconButton onClick={onClose} sx={{ color: 'error.main' }}>
              <Close />
            </IconButton>
          </Tooltip>

        </Box>
      </Grid>
    </Grid>
  </DialogTitle>

  <DialogContent>
    <Grid container spacing={2}>

      <Grid size={{xs:12, md:6}}>
        <Paper sx={{ p: 2 }}>

          <Box mb={2}>
            <Box
              sx={{
                backgroundColor: bgColor,
                color: textColor,
                borderRadius: 2,
                p: 2,
                border: '1px solid #e0e0e0',
              }}
            >
              <Grid container justifyContent="space-between" alignItems="center">

                <Grid>
                  <Typography variant="h6">
                    {pedido.numeroPedido !== null
                      ? `Pedido: ${pedido.numeroOrden}`
                      : `Mesa: ${pedido.mesa?.nombre || '-'}`}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Mesa: {pedido.mesa?.nombre || '-'} —{' '}
                    {pedido.mesa?.ubicacion || 'S. Principal'}
                  </Typography>
                </Grid>

                <Grid size={{xs:12, md:4}} textAlign={{ xs: 'left', md: 'right' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {pedido.state ? `Estado: ${pedido.state}` : 'Estado: Libre'}
                  </Typography>
                </Grid>

              </Grid>
            </Box>
          </Box>

          {productos.map((p, index) => {
            const totalItem = p.cantidad * p.precio - p.descuento

            return (
              <Accordion key={index} sx={{ mb: 1 }}
              disabled={pedido?.state === 'FINALIZADO'}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Box>
                      <Typography fontWeight="500">
                        {p.nombreArticulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {p.precio.toFixed(2)} Bs
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton onClick={() => handleCantidad(index, 'subtract')}>
                        <Remove />
                      </IconButton>

                      <Typography>{p.cantidad}</Typography>

                      <IconButton onClick={() => handleCantidad(index, 'add')}>
                        <Add />
                      </IconButton>

                      <Typography fontWeight="bold" color="primary">
                        {totalItem.toFixed(2)} Bs
                      </Typography>

                      <IconButton color="error" onClick={() => handleRemove(index)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid size={{xs:6}}>
                      <TextField
                        label="Precio"
                        type="number"
                        fullWidth
                        size="small"
                        value={p.precio}
                        onChange={(e) =>
                          updateProducto(index, 'precio', Number(e.target.value))
                        }
                      />
                    </Grid>

                    <Grid size={{xs:6}}>
                      <TextField
                        label="Descuento"
                        type="number"
                        fullWidth
                        size="small"
                        value={p.descuento}
                        onChange={(e) =>
                          updateProducto(index, 'descuento', Number(e.target.value))
                        }
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )
          })}
 {pedido?.state === 'FINALIZADO' ? (
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                      Este pedido ya ha sido finalizado y no se pueden agregar más
                      productos.
                    </Typography>
                  ) : (
                    <Divider textAlign={'center'} sx={{ mt: 2, mb: 2 }}>
                      <Tooltip title={'Agregar Producto'}>
                        <Button
                          size={'small'}
                          sx={{ lineHeight: 0, fontWeight: 500 }}
                          variant={'text'}
                          startIcon={<ControlPointDuplicate />}
                          // onClick={() => setOpenNuevoProducto(true)}
                        >
                          Nuevo Producto
                        </Button>
                      </Tooltip>
                    </Divider>
                  )}
          <Divider sx={{ my: 2 }} />

          {/* RESUMEN */}
          <Typography variant="h6">Resumen</Typography>

          <Box>
  {/* SUBTOTAL */}
  <Box display="flex" justifyContent="space-between" mb={1}>
    <Typography fontWeight="bold">Sub Total</Typography>
    <Typography variant="subtitle1">
      {numberWithCommas(subtotal, {})}{' '}
      <span style={{ fontSize: '0.8em' }}>BOB</span>
    </Typography>
  </Box>

  <Divider sx={{ my: 1 }} />

  {/* DESCUENTOS / AJUSTES */}
  <Grid container spacing={2} alignItems="center">
    <Grid size={{xs:6}}>
      <Typography fontWeight="bold">Descuento Adicional</Typography>
    </Grid>
    <Grid size={{xs:6}}>
      <FormTextField
        value={additionalDiscount || ''}
        onChange={(e) =>
          setAdditionalDiscount(parseFloat(e.target.value) || 0)
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="body2">BOB</Typography>
            </InputAdornment>
          ),
        }}
        sx={{
          width: '100%',
          '& input': { textAlign: 'right' },
        }}
      />
    </Grid>

    <Grid size={{xs:6}}>
      <Typography fontWeight="bold">Tarjeta de Regalo</Typography>
    </Grid>
    <Grid size={{xs:6}}>
      <FormTextField
        // value={giftCardAmount || ''}
        // onChange={(e) =>
        //   setGiftCardAmount(parseFloat(e.target.value) || 0)
        // }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="body2">BOB</Typography>
            </InputAdornment>
          ),
        }}
        sx={{
          width: '100%',
          '& input': { textAlign: 'right' },
        }}
      />
    </Grid>
  </Grid>

  <Divider sx={{ my: 2 }} />

  {/* TOTAL */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="h6" color="error" fontWeight="bold">
      Total
    </Typography>

    <Typography variant="h5" fontWeight="bold" color="success.main">
      {numberWithCommas(total, {})} BOB
    </Typography>
  </Box>
</Box>

          {/* PAGO */}
          <Grid container spacing={2}>
            <Grid size={{xs:6}}>
              <TextField
                label="Monto recibido"
                type="number"
                fullWidth
                value={montoRecibido}
                onChange={(e) =>
                  setMontoRecibido(Number(e.target.value) || 0)
                }
              />
            </Grid>

            <Grid size={{xs:6}}>
              <TextField
                label="Cambio"
                fullWidth
                value={(montoRecibido - total).toFixed(2)}
                disabled
              />
            </Grid>
          </Grid>

        </Paper>
      </Grid>

      {/* DERECHA */}
      <Grid size={{ xs: 12, md: 6 }}>
  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
    {/* BUSCADOR */}
    <Grid container spacing={2} alignItems="flex-end">
      <Grid size={{ xs: 12, sm: 8 }}>
        <Controller
          name="cliente"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={Boolean(errors.cliente)}>
              <MyInputLabel shrink>Buscar cliente</MyInputLabel>
              <AsyncSelect<ClientProps>
                {...field}
                cacheOptions={false}
                defaultOptions
                styles={{
                  ...getSelectStyles(theme, Boolean(errors.cliente)),
                  // control: (base) => ({ ...base, minHeight: 40, borderRadius: 8 }),
                }}
                menuPosition="fixed"
                placeholder="NIT / Nombre / Código"
                loadOptions={fetchClientes}
                isClearable
                value={field.value || null}
                getOptionValue={(item) => item.codigoCliente || ''}
                getOptionLabel={(item) =>
                  `${item.numeroDocumento}${item.complemento || ''} - ${item.razonSocial}`
                }
                onChange={(cliente) => {
                  field.onChange(cliente)
                  setValue('emailCliente', genReplaceEmpty(cliente?.email, ''))
                }}
                noOptionsMessage={() =>
                  'Ingrese referencia -> Razon Social, Codigo Cliente, Numero documento'
                }
                loadingMessage={() => 'Buscando...'}
              />
            </FormControl>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
         <Button
          variant="outlined"
          fullWidth
          startIcon={<PersonAddAlt1Outlined />}
        >
          Nuevo
        </Button>
      </Grid>
    </Grid>

    <Grid container spacing={2} mt={2}>
      <Grid size={{ xs: 7 }}>
        <Controller
          control={control}
          name="emailCliente"
          render={({ field }) => (
            <TextField
              {...field}
              error={Boolean(errors.emailCliente)}
              fullWidth
              size="small"
              label="Correo Electrónico Alternativo"
              value={field.value || ''}
              disabled={!getValues('cliente')}
            />
          )}
        />       
      </Grid>

      <Grid size={{ xs: 5 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<TableChart />}
        >
          Explorar
        </Button>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ControlPointDuplicate />}
        >
          Cliente 99001
        </Button>
      </Grid>
    </Grid>
    <Box mt={2}>
      <FormGroup>
        <Controller
          name={'codigoExcepcion'}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={!!getValues('codigoExcepcion')}
                />
              }
              label="Permitir facturar incluso si el NIT es inválido"
              name={'codigoExcepcion'}
            />
          )}
        />
      </FormGroup>
    </Box>

    <DatosCliente form={form} />    
  </Paper>
  <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
  {monedaLoading ? (
    <AlertLoading />
  ) : (
    <Controller
      name="moneda"
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={Boolean(errors.moneda)}>
          <MyInputLabel shrink>Moneda de venta</MyInputLabel>
          <Select<MonedaProps>
            {...field}
            styles={getSelectStyles(theme,Boolean(errors.moneda))}
            name="moneda"
            isDisabled={true}
            placeholder="Seleccione la moneda de venta"
            value={field.value ?? undefined}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isSearchable={false}
            menuPosition="fixed"
            options={monedas}
            getOptionValue={(item: MonedaProps) => item.codigo.toString()}
            getOptionLabel={(item: MonedaProps) =>
              `${item.descripcion} (${item.sigla}) - ${numberWithCommas(item.tipoCambio, {})}`
            }
          />
        </FormControl>
      )}
    />
  )}
</Grid>
<Box mt={3}>
  {metodosPagoVenta.map((item, index) => (
    <Grid container spacing={1} key={index} alignItems="center">

      <Grid size={{ xs: 12, md: 5 }}>
        <FormControl fullWidth>
          <MyInputLabel shrink>Método de pago</MyInputLabel>

          <Select<MetodoPagoProp>
            styles={getSelectStyles(theme, false)}
            placeholder="Seleccione método"
            options={metodosPagoOptions || []}
            isSearchable={false}
            menuPosition="fixed"
            value={item.metodoPago}
            onChange={(val) => handleChangeMetodo(index, val)}
            getOptionLabel={(option) => option.descripcion}
            getOptionValue={(option) =>
              option.codigoClasificador.toString()
            }
          />
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <TextField
          label="Monto"
          type="number"
          fullWidth
          size="small"
          value={item.monto}
          onChange={(e) =>
            handleChangeMonto(index, Number(e.target.value) || 0)
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="body2">BOB</Typography>
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 2 }} textAlign="center">
        <IconButton
          color="error"
          onClick={() => handleRemoveMetodoPago(index)}
          disabled={metodosPagoVenta.length === 1} // evita borrar el último
        >
          <Delete />
        </IconButton>
      </Grid>

    </Grid>
  ))}

  {/* BOTÓN AGREGAR */}
  <Grid size={{ xs: 12 }}>
    <Button
      startIcon={<Add />}
      onClick={handleAddMetodoPago}
      variant="outlined"
      fullWidth
    >
      Agregar método de pago
    </Button>
  </Grid>
</Box>
</Grid>
    </Grid>
  </DialogContent>
</Dialog>
  )
}

export default ModalPedidoFacturar