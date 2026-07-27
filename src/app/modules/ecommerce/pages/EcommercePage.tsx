import AccessTimeIcon from '@mui/icons-material/AccessTime'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { gql, GraphQLClient } from 'graphql-request'
import React, { useEffect, useState } from 'react'
import SimpleContainer from '../../../base/components/Container/SimpleContainer'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../base/hooks/useAuth'
import { useRestPedidoListado } from '../../restaurante/queries/useRestPedidoListado'
import EcommerceCartDrawer from '../components/EcommerceCartDrawer'
import { ecommerceRoutesMap } from '../ecommerceRoutes'
import { getInboxClient } from '../api/inboxClient'
import { useChangeOrderStatus } from '../mutations/useChangeOrderStatus'


const EcommercePage: React.FC = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('todas')
  const [viewMode, setViewMode] = useState<'activas' | 'todas'>('activas')
  const [selectedPedido, setSelectedPedido] = useState<any>(null)
  const { mutate: changeOrderStatus } = useChangeOrderStatus()



  const { data: listOrdersData, isLoading: isLoadingInbox } = useQuery({
    queryKey: ['listOrders', user?.miEmpresa, user?.sucursal?.codigo, user?.puntoVenta?.codigo, viewMode],
    queryFn: async () => {
      const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
      const codigoSucursal = user?.sucursal?.codigo || 0
      const pdv = user?.puntoVenta?.codigo || 0

      let dateFilter = ''
      if (viewMode === 'activas') {
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' })
        const parts = formatter.formatToParts(now)
        const ye = parts.find(p => p.type === 'year')?.value
        const mo = parts.find(p => p.type === 'month')?.value
        const da = parts.find(p => p.type === 'day')?.value
        const dateFrom = `${ye}-${mo}-${da}T00:00:00.000-04:00`
        const dateTo = `${ye}-${mo}-${da}T23:59:59.999-04:00`
        dateFilter = `, dateFrom: "${dateFrom}", dateTo: "${dateTo}"`
      }

      const client = getInboxClient()
      const q = gql`
        query ListOrders {
          listOrders(
            filter: {
              shop: "${shop}",
              codigoSucursal: ${codigoSucursal},
              pdv: ${pdv}${dateFilter}
            },
            page: 1,
            limit: 1000
          ) {
            totalCount
            totalPages
            currentPage
            orders
          }
        }
      `

      try {
        const data: any = await client.request(q)
        console.log('Respuesta ListOrders API:', data)
        return data
      } catch (error) {
        console.error('Error ListOrders API:', error)
        throw error
      }
    },
    enabled: !!user,
  })

  // Extract order IDs from the inbox response
  const rawOrders = listOrdersData?.listOrders?.orders || []

  // Expresión regular para validar MongoDB ObjectId (24 caracteres hexadecimales)
  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id)

  const orderIds = rawOrders
    .map((o: any) => (typeof o === 'string' ? o : o.id || o._id || o.pedidoId || o._idPedido))
    .filter(Boolean)
    .filter(isValidObjectId)
    .join(',')

  const limitPedidos = rawOrders.length > 0 ? rawOrders.length + 1 : 1000

  const { data: pedidosData, isLoading: isLoadingPedidos } = useRestPedidoListado(
    {
      entidad: {
        codigoSucursal: user?.sucursal?.codigo || 0,
        codigoPuntoVenta: user?.puntoVenta?.codigo || 0,
      },
      limit: limitPedidos,
      page: 1,
      query: orderIds ? `_id=${orderIds}` : '_id=NONE', // pass something that yields empty if no ids
    },
    {
      enabled: !!orderIds,
    },
  )

  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) {
      setFilter(newFilter)
    }
  }

  const isLoading = isLoadingInbox || (!!orderIds && isLoadingPedidos)
  const allPedidos: any[] = pedidosData?.docs || []

  // Auto-sincronizar CANCELADO: enviar la mutación al backend (fuente de la verdad)
  useEffect(() => {
    if (!allPedidos.length || !rawOrders.length) return
    const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
    allPedidos.forEach((pedido: any) => {
      if (pedido.state !== 'ANULADO') return
      const inboxOrder = rawOrders.find((o: any) => {
        const oId = typeof o === 'string' ? o : o.id || o._id || o.pedidoId || o._idPedido
        return oId === pedido._id
      }) || {}
      const inboxEstado: string = (inboxOrder as any).estadoInbox
      if (inboxEstado && inboxEstado !== 'CANCELADO') {
        changeOrderStatus({ id: pedido._id, status: 'CANCELADO', shop })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidosData, listOrdersData])

  let pedidos = [...allPedidos]

  pedidos = pedidos.filter((pedido: any) => {
    const inboxOrder = rawOrders.find((o: any) => {
      const oId = typeof o === 'string' ? o : o.id || o._id || o.pedidoId || o._idPedido
      return oId === pedido._id
    }) || {}
    const rawState2 = inboxOrder.estadoInbox || pedido.state || 'PENDIENTE'
    const orderState = rawState2 === 'ANULADO' ? 'CANCELADO' : rawState2

    if (filter === 'entregado') {
      if (orderState !== 'ENTREGADO' && orderState !== 'FINALIZADO') return false
    } else {
      if (viewMode === 'activas' && (orderState === 'ENTREGADO' || orderState === 'FINALIZADO' || orderState === 'CANCELADO')) return false
    }

    if (filter === 'salon') {
      if (pedido.tipoVenta === 'LLEVAR' || pedido.tipo === 'LLEVAR') return false
    }
    if (filter === 'llevar') {
      if (pedido.tipoVenta !== 'LLEVAR' && pedido.tipo !== 'LLEVAR') return false
    }
    return true
  })

  pedidos = pedidos.sort((a: any, b: any) => {
    const inboxA = rawOrders.find((o: any) => {
      const oId = typeof o === 'string' ? o : o.id || o._id || o.pedidoId || o._idPedido
      return oId === a._id
    }) || {}
    const inboxB = rawOrders.find((o: any) => {
      const oId = typeof o === 'string' ? o : o.id || o._id || o.pedidoId || o._idPedido
      return oId === b._id
    }) || {}
    const dateA = new Date(inboxA.createdAt || a.createdAt || a.fechaDocumento || 0).getTime()
    const dateB = new Date(inboxB.createdAt || b.createdAt || b.fechaDocumento || 0).getTime()
    return dateB - dateA
  })

  return (
    <SimpleContainer maxWidth="xl">
      <Breadcrumb routeSegments={[ecommerceRoutesMap.ecommerce]} />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'activas' | 'todas')}
            variant="standard"
            disableUnderline
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: theme.palette.text.primary,
              '& .MuiSelect-select': { py: 0, pr: 3 },
              '& .MuiSvgIcon-root': { color: theme.palette.text.primary }
            }}
          >
            <MenuItem value="activas">Activas</MenuItem>
            <MenuItem value="todas">Todas</MenuItem>
          </Select>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar por # Orden, Mesa o Localizador..."
            sx={{
              width: '50%',
              backgroundColor: theme.palette.action.hover,
              borderRadius: '12px',
              '& fieldset': { border: 'none' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="order filter"
            size="small"
            sx={{
              backgroundColor: theme.palette.action.hover,
              borderRadius: '12px',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '12px !important',
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  color: theme.palette.text.primary,
                },
              },
            }}
          >
            <ToggleButton value="todas">Todas</ToggleButton>
            <ToggleButton value="salon">Salón</ToggleButton>
            <ToggleButton value="llevar">Llevar</ToggleButton>
            <ToggleButton value="entregado">Entregado</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Cards section */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {pedidos.map((pedido: any) => {
              // Find matching inbox order
              const inboxOrder =
                rawOrders.find((o: any) => {
                  const oId = typeof o === 'string' ? o : o.id || o._id || o.pedidoId || o._idPedido
                  return oId === pedido._id
                }) || {}

              // Normalizar ANULADO (Isicore) → CANCELADO (nuestro sistema)
              const rawState = inboxOrder.estadoInbox || pedido.state || 'PENDIENTE'
              const orderState = rawState === 'ANULADO' ? 'CANCELADO' : rawState

              // Determine styles based on status
              let statusType = 'primary'
              if (orderState === 'ENVIADO' || orderState === 'NUEVO' || orderState === 'PENDIENTE')
                statusType = 'error'
              else if (orderState === 'PREPARANDO' || orderState === 'EN_PROCESO') statusType = 'warning'
              else if (orderState === 'LISTO') statusType = 'info'
              else if (orderState === 'EN_CAMINO' || orderState === 'ESPERANDO_DELIVERY') statusType = 'secondary'
              else if (
                orderState === 'ENTREGADO' ||
                orderState === 'FINALIZADO' ||
                orderState === 'COMPLETADO'
              )
                statusType = 'success'
              else if (orderState === 'CANCELADO' || orderState === 'ANULADO') statusType = 'default'
              else statusType = 'primary' // fallback

              let statusColorMain = theme.palette.primary.main
              if (statusType === 'default') {
                statusColorMain = theme.palette.text.disabled
              } else {
                statusColorMain = (theme.palette as any)[statusType]?.main || theme.palette.primary.main
              }
              const statusColorBg = alpha(statusColorMain, 0.15)

              const isLlevar = pedido.tipoVenta === 'LLEVAR'
              const icon = isLlevar ? (
                <ShoppingBagIcon fontSize="small" color="success" />
              ) : (
                <RestaurantIcon fontSize="small" color="action" />
              )

              const typeText = isLlevar ? 'PARA LLEVAR' : 'LOCALIZADOR / MESA'
              const locationText =
                pedido.mesa?.nombre || pedido.localizador || (isLlevar ? 'Para llevar' : 'Sin asignar')

              const rawDate = inboxOrder.createdAt || pedido.fechaDocumento
              let timeText = '00:00'
              if (rawDate) {
                const d = new Date(rawDate)
                if (!isNaN(d.getTime())) {
                  timeText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              }

              let deliveredTimeText = null
              if (orderState === 'ENTREGADO' || orderState === 'FINALIZADO') {
                const uDate = inboxOrder.updatedAt || pedido.updatedAt
                if (uDate) {
                  const ud = new Date(uDate)
                  if (!isNaN(ud.getTime())) {
                    deliveredTimeText = ud.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                }
              }

              const itemsCount = pedido.productos?.length || 0
              const orderDisplayId =
                inboxOrder.nroPedido ||
                pedido.numeroOrden ||
                pedido.numeroPedido ||
                pedido._id?.slice(-4) ||
                '---'

              const isDeliveryOrder = pedido.tipo === 'DELIVERY' || pedido.mesa?.ubicacion === 'DELIVERY'
              const isLlevarOrder = pedido.tipo === 'LLEVAR' || pedido.tipoVenta === 'LLEVAR'

              let cardBgColor = theme.palette.background.default
              let cardBorderColor = theme.palette.divider

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pedido._id}>
                  <Card
                    onClick={() => setSelectedPedido({ ...pedido, state: orderState, originalState: pedido.state, metodoPagoInbox: inboxOrder.metodoPago })}
                    sx={{
                      borderRadius: '16px',
                      boxShadow: 'none',
                      border: `1px solid ${cardBorderColor}`,
                      backgroundColor: cardBgColor,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 'bold',
                              color: theme.palette.text.secondary,
                              letterSpacing: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            ORDEN
                            {isDeliveryOrder && (
                              <Chip label="DELIVERY" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha('#0288d1', 0.1), color: '#0288d1', fontWeight: 'bold' }} />
                            )}
                            {isLlevarOrder && (
                              <Chip label="LLEVAR" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha('#ed6c02', 0.1), color: '#ed6c02', fontWeight: 'bold' }} />
                            )}
                            {!isDeliveryOrder && !isLlevarOrder && (
                              <Chip label="SALÓN" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha(theme.palette.text.secondary, 0.1), color: theme.palette.text.secondary, fontWeight: 'bold' }} />
                            )}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{ fontWeight: 'bold', lineHeight: 1, color: theme.palette.text.primary }}
                          >
                            #{orderDisplayId}
                          </Typography>
                        </Box>
                        <Chip
                          label={({
                            NUEVO: 'NUEVO',
                            PENDIENTE: 'PENDIENTE',
                            PREPARANDO: 'PREPARANDO',
                            EN_PROCESO: 'EN PROCESO',
                            LISTO: 'LISTO',
                            ESPERANDO_DELIVERY: 'ESP. REPARTIDOR',
                            EN_CAMINO: 'EN CAMINO',
                            ENTREGADO: 'ENTREGADO',
                            FINALIZADO: 'FINALIZADO',
                            COMPLETADO: 'COMPLETADO',
                            PROGRAMADO: 'PROGRAMADO',
                            CANCELADO: 'CANCELADO',
                          } as Record<string, string>)[orderState] || orderState}
                          size="small"
                          sx={{
                            backgroundColor: statusColorBg,
                            color: statusColorMain,
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '12px',
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          mb: 3,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: theme.palette.action.hover,
                            borderRadius: '8px',
                            p: 1,
                            display: 'flex',
                            mr: 2,
                          }}
                        >
                          {icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 'bold', color: theme.palette.text.secondary }}
                          >
                            {typeText}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
                          >
                            {locationText}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon
                            fontSize="small"
                            sx={{ color: theme.palette.text.secondary, mr: 1 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                statusType === 'warning'
                                  ? theme.palette.error.main
                                  : theme.palette.text.secondary,
                              fontWeight: 'bold',
                            }}
                          >
                            {timeText}
                          </Typography>
                          {deliveredTimeText && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.success.main,
                                fontWeight: 'bold',
                                ml: 1,
                              }}
                            >
                              (Entregado: {deliveredTimeText})
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary, fontWeight: 'bold' }}
                        >
                          {itemsCount} ítems
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>

      {/* Drawer for managing the selected order / cart */}
      <EcommerceCartDrawer
        open={Boolean(selectedPedido)}
        onClose={() => {
          setSelectedPedido(null)
        }}
        pedido={selectedPedido}
      />
    </SimpleContainer>
  )
}

export default EcommercePage
