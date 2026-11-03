import {
  Campaign,
  CheckCircle,
  ConfirmationNumber,
  LocalOffer,
  NewReleases,
  OpenInNew,
  People,
  Refresh,
  Send,
  Store,
  Storefront,
  TouchApp,
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
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import React, { FC, useCallback, useEffect, useState } from 'react'

import { getInboxClient } from '../../api/inboxClient'
import { SendBroadcastDialog } from './SendBroadcastDialog'

const GET_BROADCAST_DATA = gql`
  query GetBroadcastData($shop: String!, $sucursal: Int, $limit: Int) {
    broadcastNotifications(shop: $shop, sucursal: $sucursal, limit: $limit) {
      id
      shop
      sucursal
      type
      title
      message
      imageUrl
      targetUrl
      articleId
      couponCode
      recipientsCount
      clickCount
      sentAt
      createdAt
    }
    broadcastNotificationStats(shop: $shop) {
      totalSent
      totalRecipients
      totalClicks
      ctr
    }
  }
`

export interface SucursalOption {
  codigo: number
  alias?: string | null
  municipio?: string | null
  direccion?: string | null
}

export interface BroadcastNotificationItem {
  id: string
  shop: string
  sucursal?: number | null
  type: 'TIENDA' | 'NOVEDAD' | 'CUPON' | 'PROMO' | string
  title: string
  message: string
  imageUrl?: string | null
  targetUrl: string
  articleId?: string | null
  couponCode?: string | null
  recipientsCount: number
  clickCount: number
  sentAt: string
  createdAt: string
}

export interface BroadcastStats {
  totalSent: number
  totalRecipients: number
  totalClicks: number
  ctr: number
}

interface BroadcastCampaignsTabProps {
  shopId: string
  sucursales: SucursalOption[]
  defaultSucursal?: number
}

export const BroadcastCampaignsTab: FC<BroadcastCampaignsTabProps> = ({
  shopId,
  sucursales,
  defaultSucursal,
}) => {
  const [filterSucursal, setFilterSucursal] = useState<number | 'ALL'>('ALL')
  const [campaigns, setCampaigns] = useState<BroadcastNotificationItem[]>([])
  const [stats, setStats] = useState<BroadcastStats>({
    totalSent: 0,
    totalRecipients: 0,
    totalClicks: 0,
    ctr: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const loadData = useCallback(async () => {
    if (!shopId) return
    setLoading(true)
    try {
      const client = getInboxClient()
      const res: any = await client.request(GET_BROADCAST_DATA, {
        shop: shopId,
        sucursal: filterSucursal === 'ALL' ? undefined : filterSucursal,
        limit: 50,
      })

      setCampaigns(res?.broadcastNotifications || [])
      if (res?.broadcastNotificationStats) {
        setStats(res.broadcastNotificationStats)
      }
    } catch (err) {
      console.error('[BroadcastCampaignsTab] Error cargando campañas:', err)
    } finally {
      setLoading(false)
    }
  }, [shopId, filterSucursal])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getTypeChip = (type: string) => {
    switch (type) {
      case 'TIENDA':
        return (
          <Chip
            size="small"
            icon={<Store sx={{ fontSize: '14px !important' }} />}
            label="Tienda"
            sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', fontWeight: 800 }}
          />
        )
      case 'NOVEDAD':
        return (
          <Chip
            size="small"
            icon={<NewReleases sx={{ fontSize: '14px !important' }} />}
            label="Novedad"
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontWeight: 800 }}
          />
        )
      case 'CUPON':
        return (
          <Chip
            size="small"
            icon={<ConfirmationNumber sx={{ fontSize: '14px !important' }} />}
            label="Cupón"
            sx={{ bgcolor: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed', fontWeight: 800 }}
          />
        )
      case 'PROMO':
      default:
        return (
          <Chip
            size="small"
            icon={<LocalOffer sx={{ fontSize: '14px !important' }} />}
            label="Promo"
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 800 }}
          />
        )
    }
  }

  const getBranchLabel = (code?: number | null) => {
    if (code === null || code === undefined) {
      return (
        <Chip
          size="small"
          label="Todas las sucursales"
          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }}
        />
      )
    }
    const found = sucursales.find((s) => s.codigo === code)
    const name = found ? (found.alias ? `${found.alias}` : `Sucursal #${code}`) : `Sucursal #${code}`
    return (
      <Chip
        size="small"
        icon={<Storefront sx={{ fontSize: '14px !important' }} />}
        label={name}
        color="default"
        variant="outlined"
        sx={{ fontWeight: 700 }}
      />
    )
  }

  return (
    <Box>
      {/* Tarjetas de Métricas de Notificaciones */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#ffffff' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CAMPAÑAS EMITIDAS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0f172a">
                    {stats.totalSent}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
                  <Campaign />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#ffffff' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CLIENTES ALCANZADOS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {stats.totalRecipients}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                  <People />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#ffffff' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CLICS / APERTURAS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#7c3aed">
                    {stats.totalClicks}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed' }}>
                  <TouchApp />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#ffffff' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    TASA DE CLICS (CTR)
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={stats.ctr > 5 ? 'success.main' : 'warning.main'}>
                    {stats.ctr}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.14)', color: '#d97706' }}>
                  <TrendingUp />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de Acciones y Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="filter-sucursal-label">Filtrar por sucursal</InputLabel>
              <Select
                labelId="filter-sucursal-label"
                label="Filtrar por sucursal"
                value={filterSucursal}
                onChange={(e) => setFilterSucursal(e.target.value as any)}
              >
                <MenuItem value="ALL">Todas las sucursales</MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s.codigo} value={s.codigo}>
                    {s.alias || (s.codigo === 0 ? 'Casa Matriz' : `Sucursal #${s.codigo}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Actualizar historial">
              <IconButton onClick={loadData} disabled={loading} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={() => setDialogOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            Nueva Notificación Push
          </Button>
        </Stack>
      </Paper>

      {/* Tabla del Historial de Notificaciones */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Historial de Campañas Emitidas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Rastrea en tiempo real cuántos clientes abrieron tus promociones o anuncios (100% gratuito).
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
              Cargando historial de difusiones...
            </Typography>
          </Box>
        ) : campaigns.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#f1f5f9', color: '#94a3b8', mx: 'auto', mb: 2 }}>
              <Campaign sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              Aún no has emitido notificaciones push
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mt: 0.5, mb: 2.5 }}>
              Llega directamente al celular de tus comensales anunciando tu tienda, platos de temporada o códigos de descuento.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => setDialogOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
            >
              Crear mi primera campaña
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>FECHA</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>TIPO</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>DESTINO</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>CONTENIDO</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>
                    ALCANCE
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>
                    CLICS / APERTURAS
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: 12 }}>
                    ENLACE
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((item) => {
                  const campaignCtr =
                    item.recipientsCount > 0
                      ? Number(((item.clickCount / item.recipientsCount) * 100).toFixed(1))
                      : 0

                  return (
                    <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Fecha */}
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" fontWeight={700}>
                          {dayjs(item.sentAt).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(item.sentAt).format('HH:mm')}
                        </Typography>
                      </TableCell>

                      {/* Tipo */}
                      <TableCell>{getTypeChip(item.type)}</TableCell>

                      {/* Sucursal Destino */}
                      <TableCell>{getBranchLabel(item.sucursal)}</TableCell>

                      {/* Contenido (Título + Mensaje + Cupón) */}
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography variant="subtitle2" fontWeight={800} noWrap>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.3 }}>
                          {item.message}
                        </Typography>
                        {item.couponCode && (
                          <Chip
                            size="small"
                            label={`🎟️ ${item.couponCode}`}
                            sx={{ mt: 0.5, height: 20, fontSize: 11, fontWeight: 800, bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }}
                          />
                        )}
                      </TableCell>

                      {/* Alcance / Destinatarios */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <People sx={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="body2" fontWeight={800}>
                            {item.recipientsCount}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Clics y CTR */}
                      <TableCell align="center" sx={{ minWidth: 140 }}>
                        <Stack spacing={0.5} alignItems="center">
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <TouchApp sx={{ fontSize: 16, color: '#7c3aed' }} />
                            <Typography variant="body2" fontWeight={800} color="#7c3aed">
                              {item.clickCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({campaignCtr}%)
                            </Typography>
                          </Stack>
                          {item.recipientsCount > 0 && (
                            <Box sx={{ width: '80%' }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(campaignCtr * 2, 100)}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#e2e8f0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: campaignCtr > 5 ? '#10b981' : '#7c3aed',
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Enlace */}
                      <TableCell align="right">
                        <Tooltip title={item.targetUrl}>
                          <Chip
                            size="small"
                            label={item.targetUrl}
                            icon={<OpenInNew sx={{ fontSize: '14px !important' }} />}
                            onClick={() => window.open(item.targetUrl, '_blank')}
                            clickable
                            sx={{ maxWidth: 160, fontFamily: 'monospace', fontSize: 11 }}
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal para Crear y Emitir Notificación */}
      <SendBroadcastDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={loadData}
        shopId={shopId}
        sucursales={sucursales}
        initialSucursal={filterSucursal === 'ALL' ? (defaultSucursal ?? null) : filterSucursal}
      />
    </Box>
  )
}

