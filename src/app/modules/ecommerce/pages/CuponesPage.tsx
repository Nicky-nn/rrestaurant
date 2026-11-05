import {
  Add,
  Campaign,
  CheckCircle,
  Close,
  ConfirmationNumber,
  ContentCopy,
  Delete,
  DeliveryDining,
  Edit,
  LocalOffer,
  Percent,
  Refresh,
  Search,
  Storefront,
  TrendingUp,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../base/hooks/useAuth'
import { getInboxClient } from '../api/inboxClient'
import { CouponDialog, CouponItem, SucursalOption } from '../components/cupones/CouponDialog'
import { SendBroadcastDialog } from '../components/promotions/SendBroadcastDialog'
import { ecommerceRoutesMap } from '../ecommerceRoutes'

const GET_SHOP_BRANCHES_QUERY = gql`
  query GetShopBranchesForCoupons($id: String!) {
    shop(id: $id) {
      id
      nombre
      sucursales {
        codigo
        alias
        municipio
        direccion
      }
    }
  }
`

const GET_COUPONS_DATA = gql`
  query GetCouponsData($shop: String!, $includeInactive: Boolean) {
    shopCoupons(shop: $shop, includeInactive: $includeInactive) {
      id
      shop
      code
      description
      discountType
      discountValue
      minOrderAmount
      maxDiscountAmount
      totalUsageLimit
      usagePerUserLimit
      totalUses
      firstOrderOnly
      deliveryType
      sucursales
      startDate
      endDate
      isActive
      createdAt
      updatedAt
    }
    shopCouponStats(shop: $shop) {
      activeCouponsCount
      totalUsesCount
      totalDiscountsGiven
    }
  }
`

const DELETE_COUPON_MUTATION = gql`
  mutation DeleteCoupon($id: String!) {
    deleteCoupon(id: $id)
  }
`

const TOGGLE_COUPON_STATUS_MUTATION = gql`
  mutation ToggleCouponStatus($id: String!) {
    toggleCouponStatus(id: $id) {
      id
      isActive
    }
  }
`

const CuponesPage: FC = () => {
  const { user } = useAuth()
  const shopId =
    typeof user?.miEmpresa === 'string'
      ? user.miEmpresa
      : user?.miEmpresa?.tienda || 'sandbox'

  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [stats, setStats] = useState({
    activeCouponsCount: 0,
    totalUsesCount: 0,
    totalDiscountsGiven: 0,
  })
  const [sucursales, setSucursales] = useState<SucursalOption[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'inactivos' | 'vencidos'>('todos')
  const [typeFilter, setTypeFilter] = useState<string>('TODOS')

  // Modales
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null)

  // Modal para difundir push el cupón
  const [broadcastOpen, setBroadcastOpen] = useState<boolean>(false)

  // Cargar sucursales de la tienda
  useEffect(() => {
    if (!shopId) return
    const fetchBranches = async () => {
      try {
        const client = getInboxClient()
        const res: any = await client.request(GET_SHOP_BRANCHES_QUERY, { id: shopId })
        if (res?.shop?.sucursales) {
          setSucursales(res.shop.sucursales)
        }
      } catch (err) {
        console.error('[CuponesPage] Error cargando sucursales:', err)
      }
    }
    fetchBranches()
  }, [shopId])

  // Cargar cupones y estadísticas
  const loadCoupons = useCallback(async () => {
    if (!shopId) return
    setLoading(true)
    try {
      const client = getInboxClient()
      const res: any = await client.request(GET_COUPONS_DATA, {
        shop: shopId,
        includeInactive: true,
      })

      setCoupons(res?.shopCoupons || [])
      if (res?.shopCouponStats) {
        setStats(res.shopCouponStats)
      }
    } catch (err) {
      console.error('[CuponesPage] Error cargando cupones:', err)
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  // Copiar código al portapapeles
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    Swal.fire({
      icon: 'success',
      title: '¡Código copiado!',
      text: `El código "${code}" se copió al portapapeles.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
    })
  }

  // Toggle rápido de estado
  const handleToggleStatus = async (item: CouponItem) => {
    try {
      setCoupons((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, isActive: !c.isActive } : c))
      )
      const client = getInboxClient()
      await client.request(TOGGLE_COUPON_STATUS_MUTATION, { id: item.id })
      loadCoupons()
    } catch (err) {
      console.error('Error toggling coupon status:', err)
      loadCoupons()
    }
  }

  // Eliminar cupón
  const handleDeleteCoupon = async (item: CouponItem) => {
    const res = await Swal.fire({
      title: `¿Eliminar el cupón ${item.code}?`,
      text: 'Esta acción no se puede deshacer. Los clientes ya no podrán canjearlo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    })

    if (!res.isConfirmed) return

    try {
      const client = getInboxClient()
      await client.request(DELETE_COUPON_MUTATION, { id: item.id })
      Swal.fire({ icon: 'success', title: 'Cupón eliminado', timer: 1500, showConfirmButton: false })
      loadCoupons()
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error al eliminar', text: err?.message || 'Error de conexión' })
    }
  }

  // Filtrado de cupones
  const filteredCoupons = useMemo(() => {
    const now = new Date()
    return coupons.filter((c) => {
      // Búsqueda por texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesCode = c.code.toLowerCase().includes(q)
        const matchesDesc = (c.description || '').toLowerCase().includes(q)
        if (!matchesCode && !matchesDesc) return false
      }

      // Filtro por tipo
      if (typeFilter !== 'TODOS' && c.discountType !== typeFilter) {
        return false
      }

      // Filtro por estado
      const isExpired = c.endDate ? now > new Date(c.endDate) : false
      if (statusFilter === 'activos') {
        return c.isActive && !isExpired
      }
      if (statusFilter === 'inactivos') {
        return !c.isActive
      }
      if (statusFilter === 'vencidos') {
        return isExpired
      }

      return true
    })
  }, [coupons, searchQuery, typeFilter, statusFilter])

  const getValidityChip = (c: CouponItem) => {
    const now = new Date()
    if (c.startDate && now < new Date(c.startDate)) {
      return (
        <Chip
          size="small"
          label={`Inicia: ${dayjs(c.startDate).format('DD/MM')}`}
          sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', fontWeight: 700 }}
        />
      )
    }
    if (c.endDate && now > new Date(c.endDate)) {
      return (
        <Chip
          size="small"
          label="Expirado"
          sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', fontWeight: 800 }}
        />
      )
    }
    if (c.endDate) {
      return (
        <Chip
          size="small"
          label={`Vence: ${dayjs(c.endDate).format('DD/MM/YY')}`}
          sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontWeight: 700 }}
        />
      )
    }
    return (
      <Chip
        size="small"
        label="Permanente"
        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }}
      />
    )
  }

  return (
    <SimpleContainerBox>
      <Box sx={{ mb: 3 }}>
        <Breadcrumb
          routeSegments={[
            { name: 'Ecommerce', path: ecommerceRoutesMap.ecommerce.path },
            { name: 'Cupones de Descuento' },
          ]}
        />
      </Box>

      {/* Encabezado Principal */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)',
          color: '#fff',
        }}
      >
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: 'secondary.main',
                  fontWeight: 800,
                  boxShadow: '0 8px 16px rgba(124, 58, 237, 0.4)',
                }}
              >
                <ConfirmationNumber sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Cupones de Descuento y Fidelización
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Crea códigos promocionales con reglas de canje, topes máximos, montos mínimos y cupones exclusivos de bienvenida.
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Refresh />}
                onClick={loadCoupons}
                disabled={loading}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none', fontWeight: 700 }}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Add />}
                onClick={() => {
                  setEditingCoupon(null)
                  setDialogOpen(true)
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 2,
                  boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)',
                }}
              >
                Nuevo Cupón
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tarjetas KPI de Métricas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CUPONES ACTIVOS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="secondary.main">
                    {stats.activeCouponsCount}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
                  <ConfirmationNumber />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CANJES TOTALES
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {stats.totalUsesCount}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
                  <TrendingUp />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    DESCUENTOS OTORGADOS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="success.main">
                    Bs. {stats.totalDiscountsGiven.toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                  <CheckCircle />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TOTAL REGISTRADOS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.secondary">
                    {coupons.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(100, 116, 139, 0.12)', color: '#64748b' }}>
                  <LocalOffer />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Filtros y Búsqueda */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por código o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Descuento</InputLabel>
                <Select
                  label="Tipo de Descuento"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="TODOS">Todos los tipos</MenuItem>
                  <MenuItem value="PERCENTAGE">Porcentaje (%)</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Monto Fijo (Bs.)</MenuItem>
                  <MenuItem value="FREE_DELIVERY">Envío Gratis</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                fullWidth
                value={statusFilter}
                onChange={(_, val) => val && setStatusFilter(val)}
              >
                <ToggleButton value="todos" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Todos ({coupons.length})
                </ToggleButton>
                <ToggleButton value="activos" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Activos ({stats.activeCouponsCount})
                </ToggleButton>
                <ToggleButton value="inactivos" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Pausados
                </ToggleButton>
                <ToggleButton value="vencidos" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Expirados
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de Cupones */}
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredCoupons.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', mx: 'auto', mb: 2 }}>
              <ConfirmationNumber sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No se encontraron cupones de descuento
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mt: 0.5, mb: 2.5 }}>
              Incentiva a tus comensales creando cupones con descuento porcentual, monto fijo o delivery gratuito.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={() => {
                setEditingCoupon(null)
                setDialogOpen(true)
              }}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
            >
              Crear mi primer cupón
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>CÓDIGO</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>BENEFICIO</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>REGLAS & CANJE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>SUCURSALES</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>
                    CANJES / USOS
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>VIGENCIA</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>
                    ACTIVO
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>
                    ACCIONES
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCoupons.map((item) => {
                  const usagePct =
                    item.totalUsageLimit && item.totalUsageLimit > 0
                      ? Math.min(Math.round((item.totalUses / item.totalUsageLimit) * 100), 100)
                      : null

                  return (
                    <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Código */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={item.code}
                            size="small"
                            onClick={() => handleCopyCode(item.code)}
                            onDelete={() => handleCopyCode(item.code)}
                            deleteIcon={<ContentCopy sx={{ fontSize: '14px !important' }} />}
                            sx={{
                              fontWeight: 900,
                              fontFamily: 'monospace',
                              letterSpacing: 1,
                              bgcolor: 'rgba(124, 58, 237, 0.1)',
                              color: '#7c3aed',
                              cursor: 'pointer',
                            }}
                          />
                          {item.firstOrderOnly && (
                            <Tooltip title="Exclusivo para la primera compra">
                              <Chip
                                size="small"
                                label="1ª Compra"
                                sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: '#fef08a', color: '#854d0e' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                        {item.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, maxWidth: 220 }} noWrap>
                            {item.description}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Beneficio */}
                      <TableCell>
                        <Stack spacing={0.3}>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {item.discountType === 'PERCENTAGE'
                              ? `${item.discountValue}% OFF`
                              : item.discountType === 'FIXED_AMOUNT'
                              ? `Bs. ${item.discountValue} OFF`
                              : 'Envío Gratis'}
                          </Typography>
                          {item.discountType === 'PERCENTAGE' && item.maxDiscountAmount && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              Tope máx: <strong>Bs. {item.maxDiscountAmount}</strong>
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Reglas & Canje */}
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Stack spacing={0.3}>
                          {item.minOrderAmount ? (
                            <Typography variant="caption" color="text.secondary">
                              Mínimo: <strong>Bs. {item.minOrderAmount}</strong>
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sin monto mínimo
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Límite: <strong>{item.usagePerUserLimit === 1 ? '1 por cliente' : `${item.usagePerUserLimit} por cliente`}</strong>
                          </Typography>
                          {item.deliveryType !== 'ALL' && (
                            <Chip
                              size="small"
                              label={item.deliveryType === 'DELIVERY' ? 'Solo Delivery' : 'Solo Retiro'}
                              sx={{ height: 18, fontSize: 10, width: 'fit-content' }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      {/* Sucursales */}
                      <TableCell>
                        {!item.sucursales || item.sucursales.length === 0 ? (
                          <Chip size="small" label="Todas las sucursales" sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: 11 }} />
                        ) : (
                          <Tooltip
                            title={item.sucursales
                              .map((cod) => {
                                const s = sucursales.find((x) => x.codigo === cod)
                                return s?.alias || `Sucursal #${cod}`
                              })
                              .join(', ')}
                          >
                            <Chip
                              size="small"
                              icon={<Storefront sx={{ fontSize: '13px !important' }} />}
                              label={`${item.sucursales.length} sucursal(es)`}
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: 11 }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Canjes / Usos */}
                      <TableCell align="center" sx={{ minWidth: 120 }}>
                        <Stack spacing={0.5} alignItems="center">
                          <Typography variant="body2" fontWeight={800}>
                            {item.totalUses}{' '}
                            <span style={{ fontSize: 11, fontWeight: 500, color: '#64748b' }}>
                              {item.totalUsageLimit ? `/ ${item.totalUsageLimit}` : 'usos'}
                            </span>
                          </Typography>
                          {usagePct !== null && (
                            <Box sx={{ width: '80%' }}>
                              <LinearProgress
                                variant="determinate"
                                value={usagePct}
                                sx={{
                                  height: 5,
                                  borderRadius: 3,
                                  bgcolor: '#e2e8f0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: usagePct >= 100 ? '#ef4444' : '#7c3aed',
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Vigencia */}
                      <TableCell>{getValidityChip(item)}</TableCell>

                      {/* Switch Activo */}
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={item.isActive}
                          onChange={() => handleToggleStatus(item)}
                          color="success"
                        />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Difundir cupón por Push a tus clientes">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => {
                                setEditingCoupon(item)
                                setBroadcastOpen(true)
                              }}
                            >
                              <Campaign fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Editar cupón">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditingCoupon(item)
                                setDialogOpen(true)
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar cupón">
                            <IconButton size="small" color="error" onClick={() => handleDeleteCoupon(item)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Modal para Crear / Editar Cupón */}
      <CouponDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingCoupon(null)
        }}
        onSuccess={loadCoupons}
        shopId={shopId}
        sucursales={sucursales}
        editingCoupon={editingCoupon}
      />

      {/* Modal para Difundir Cupón vía Notificación Push */}
      {broadcastOpen && editingCoupon && (
        <SendBroadcastDialog
          open={broadcastOpen}
          onClose={() => {
            setBroadcastOpen(false)
            setEditingCoupon(null)
          }}
          onSuccess={() => {
            Swal.fire({ icon: 'success', title: '¡Campaña de cupón emitida!', timer: 2000 })
          }}
          shopId={shopId}
          sucursales={sucursales}
        />
      )}
    </SimpleContainerBox>
  )
}

export default CuponesPage

