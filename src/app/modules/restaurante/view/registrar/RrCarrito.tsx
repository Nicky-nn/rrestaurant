import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import { alpha, Box, IconButton, Paper, Stack, Typography, useTheme } from '@mui/material'
import { FunctionComponent, useEffect, useState } from 'react'

import InputSearchClients from '../../../clients/components/InputSearchClients'
import { ESTADO_MESA, MesaUI, OpcionesParaLlevar, TIPO_PEDIDO, TipoPedido } from '../../interfaces/mesa.interface'
import RrOpciones from './RrOpciones'

interface RrCarritoProps {
  mesaSeleccionada?: MesaUI | null
}

const RrCarrito: FunctionComponent<RrCarritoProps> = ({ mesaSeleccionada }) => {
  const theme = useTheme()
  const [openOpciones, setOpenOpciones] = useState(false)
  const [tipoPedido, setTipoPedido] = useState<TipoPedido>(TIPO_PEDIDO.SALON)
  const [opcionesLlevar, setOpcionesLlevar] = useState<OpcionesParaLlevar | null>(null)

  // Sincronizar datos del carrito según si la mesa ya tiene una orden existente.
  useEffect(() => {
    if (mesaSeleccionada?.pedido) {
      const _tipo = (mesaSeleccionada.pedido.tipo as TipoPedido) || TIPO_PEDIDO.SALON
      setTipoPedido(_tipo)

      if (mesaSeleccionada.pedido.cliente) {
        setOpcionesLlevar({
          cliente: mesaSeleccionada.pedido.cliente,
          horaRecojo: '', 
          solicitarUtensilios: false,
        })
      } else {
        setOpcionesLlevar(null)
      }
    } else {
      // Mesa Libre / Nueva
      setTipoPedido(TIPO_PEDIDO.SALON)
      setOpcionesLlevar(null)
    }
  }, [mesaSeleccionada])

  // Obtener el nombre del área desde localStorage (o default)
  const getNombreArea = () => {
    try {
      const cachedData = localStorage.getItem('ubicacion')
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        return parsed?.descripcion || 'Salón Principal'
      }
    } catch {
      // Ignorar error de parseo
    }
    return 'Salón Principal'
  }

  const nombreArea = getNombreArea()

  // Función para determinar el color de la cabecera
  const getColorByEstado = () => {
    if (!mesaSeleccionada) return theme.palette.primary.main
    switch (mesaSeleccionada.estado) {
      case ESTADO_MESA.LIBRE:
        return theme.palette.success.main // Verde claro para mesa libre
      case ESTADO_MESA.OCUPADO:
      case ESTADO_MESA.OCUPADO_OTRO:
        return theme.palette.warning.main // Amarillo/Naranja para mesa ocupada
      default:
        return theme.palette.primary.main
    }
  }

  const headerColor = getColorByEstado()

  // Helpers para icono y textos según el tipo de pedido
  const HeaderIcon =
    tipoPedido === TIPO_PEDIDO.LLEVAR
      ? LocalMallOutlinedIcon
      : tipoPedido === TIPO_PEDIDO.DELIVERY
      ? DeliveryDiningOutlinedIcon
      : StorefrontOutlinedIcon

  const titleText =
    tipoPedido === TIPO_PEDIDO.LLEVAR
      ? 'Para Llevar'
      : tipoPedido === TIPO_PEDIDO.DELIVERY
      ? `Delivery – ${opcionesLlevar?.metodoDelivery === 'PEDIDOS_YA' ? 'PedidosYa' : 'Propio'}`
      : mesaSeleccionada?.label || 'Mesa no seleccionada'

  const subtitleText =
    tipoPedido === TIPO_PEDIDO.LLEVAR
      ? 'Pedido para recoger'
      : tipoPedido === TIPO_PEDIDO.DELIVERY
      ? opcionesLlevar?.metodoDelivery === 'PEDIDOS_YA' && opcionesLlevar?.nombreRepartidor
        ? `Repartidor: ${opcionesLlevar.nombreRepartidor}`
        : 'Envío a domicilio'
      : `Área: ${nombreArea}`

  return (
    <Paper sx={{ p: 1.5, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {mesaSeleccionada ? (
        <>
          {/* Header de Mesa (Diseño Nuevo) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1, // Padding interno reducido
              mb: 1, // Margen inferior reducido
              borderRadius: 2,
              border: `1px solid ${alpha(headerColor, 0.3)}`,
              bgcolor: alpha(headerColor, 0.05),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Icono de Tienda / Mesa */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(headerColor, 0.15),
                  color: headerColor,
                  width: 36, // Tamaño reducido
                  height: 36,
                  borderRadius: 1.5,
                }}
              >
                <HeaderIcon fontSize="small" />
              </Box>

              {/* Textos Mesa y Área */}
              <Box>
                <Typography variant="body1" fontWeight="700" color={headerColor} lineHeight={1.2}>
                  {titleText}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0 }}>
                  {subtitleText}
                </Typography>
              </Box>
            </Stack>

            {/* Lápiz para opciones */}
            <IconButton size="small" sx={{ color: headerColor }} onClick={() => setOpenOpciones(true)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Buscador de cliente — siempre visible */}
          <Box sx={{ mb: 1 }}>
            <InputSearchClients
              hideLabel={true}
              value={opcionesLlevar?.cliente ?? null}
              withCreditLine={false}
              onClientSelect={(c) => {
                setOpcionesLlevar((prev) => ({
                  cliente: c,
                  horaRecojo: prev?.horaRecojo || '',
                  solicitarUtensilios: prev?.solicitarUtensilios || false,
                }))
              }}
              onListShowed={() => {}}
              autoSelectDefaultCode="00"
              editable={true}
              onChangeEditable={(modifications) => {
                if (modifications) {
                  setOpcionesLlevar((prev) => {
                    if (!prev?.cliente) return prev
                    const nextCliente = { ...prev.cliente, ...modifications }
                    if (JSON.stringify(prev.cliente) === JSON.stringify(nextCliente)) {
                      return prev
                    }
                    return { ...prev, cliente: nextCliente }
                  })
                }
              }}
            />
          </Box>


          <Typography variant="h6" gutterBottom>
            Carrito JSON
          </Typography>

          <Box
            component="pre"
            sx={{
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              backgroundColor: '#f5f5f5',
              p: 1,
              borderRadius: 1,
              flexGrow: 1,
              overflowY: 'auto',
            }}
          >
            {JSON.stringify(mesaSeleccionada, null, 2)}
          </Box>

          {/* Dialogo RrOpciones */}
          <RrOpciones
            open={openOpciones}
            onClose={() => setOpenOpciones(false)}
            tipoPedido={tipoPedido}
            setTipoPedido={setTipoPedido}
            mesaSeleccionada={mesaSeleccionada}
            opcionesLlevar={opcionesLlevar}
            setOpcionesLlevar={setOpcionesLlevar}
          />
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Carrito JSON
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Selecciona una mesa
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  )
}

export default RrCarrito
