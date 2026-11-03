import {
  AccessTime,
  Campaign,
  CheckCircle,
  Close,
  Edit,
  Inventory2,
  LocalOffer,
  Refresh,
  Save,
  Search,
  Send,
  Storefront,
  VisibilityOff,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import React, { FC, useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../base/hooks/useAuth'
import { getInboxClient } from '../api/inboxClient'
import { BroadcastCampaignsTab } from '../components/promotions/BroadcastCampaignsTab'
import { ecommerceRoutesMap } from '../ecommerceRoutes'

const GET_SHOP_BRANCHES = gql`
  query GetShopBranchesForCatalog($id: String!) {
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

const GET_ADMIN_ARTICLES = gql`
  query GetAdminArticles($shop: String!, $sucursal: Int!, $query: String) {
    adminArticles(shop: $shop, sucursal: $sucursal, query: $query) {
      _id
      codigoArticulo
      nombreArticulo
      descripcionArticulo
      activo
      tieneModificadores
      esReceta
      imagen {
        variants {
          thumbnail
          medium
          public
        }
      }
      tipoArticulo {
        _id
        codigo
        descripcion
      }
      articuloPrecioBase {
        monedaPrimaria {
          precio
          precioBase
        }
      }
      promoInfo {
        isEnabled
        isPromoEnabled
        customPrice
        originalPrice
        promoType
        promoValue
        finalPrice
        promoMaxQuantityPerOrder
        applyPromoToModifiers
        promoStartDate
        promoEndDate
        promoRecurringDays
        promoStartTime
        promoEndTime
        promoNotifyPush
        promoNotifyTitle
        promoNotifyMessage
        promoNotifyScheduledAt
      }
    }
  }
`

const UPDATE_ARTICLE_CONFIG = gql`
  mutation UpdateArticleConfig(
    $shop: String!
    $sucursal: Int!
    $articleId: String!
    $config: ArticleConfigInput!
  ) {
    updateArticleConfig(
      shop: $shop
      sucursal: $sucursal
      articleId: $articleId
      config: $config
    )
  }
`

const RESEND_PROMO_PUSH = gql`
  mutation ResendPromoPush($shop: String!, $sucursal: Int!, $articleId: String!) {
    resendPromoPush(shop: $shop, sucursal: $sucursal, articleId: $articleId)
  }
`

interface PromoInfo {
  isEnabled?: boolean | null
  isPromoEnabled?: boolean | null
  customPrice?: number | null
  originalPrice?: number | null
  promoType?: 'PERCENTAGE' | 'DISCOUNT_AMOUNT' | 'FIXED_PRICE' | string | null
  promoValue?: number | null
  finalPrice?: number | null
  promoMaxQuantityPerOrder?: number | null
  applyPromoToModifiers?: boolean | null
  promoStartDate?: string | null
  promoEndDate?: string | null
  promoRecurringDays?: number[] | null
  promoStartTime?: string | null
  promoEndTime?: string | null
  promoNotifyPush?: boolean | null
  promoNotifyTitle?: string | null
  promoNotifyMessage?: string | null
  promoNotifyScheduledAt?: string | null
}

interface AdminArticle {
  _id: string
  codigoArticulo?: string | null
  nombreArticulo?: string | null
  descripcionArticulo?: string | null
  activo?: boolean | null
  tieneModificadores?: boolean | null
  esReceta?: boolean | null
  imagen?: {
    variants?: {
      thumbnail?: string | null
      medium?: string | null
      public?: string | null
    } | null
  } | null
  tipoArticulo?: {
    _id?: string | null
    codigo?: string | null
    descripcion?: string | null
  } | null
  articuloPrecioBase?: {
    monedaPrimaria?: {
      precio?: number | null
      precioBase?: number | null
    } | null
  } | null
  promoInfo?: PromoInfo | null
}

interface SucursalOption {
  codigo: number
  alias?: string | null
  municipio?: string | null
  direccion?: string | null
}

interface EditModalState {
  isEnabled: boolean
  customPrice: string
  isPromoEnabled: boolean
  promoType: 'PERCENTAGE' | 'DISCOUNT_AMOUNT' | 'FIXED_PRICE'
  promoValue: string
  promoMaxQuantityPerOrder: string
  promoStartDate: string
  promoEndDate: string
  promoRecurringDays: number[]
  promoStartTime: string
  promoEndTime: string
  promoNotifyPush: boolean
  promoNotifyTitle: string
  promoNotifyMessage: string
  promoNotifyScheduledAt: string
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

const CatalogoPromosPage: FC = () => {
  const { user } = useAuth()
  const shopId =
    typeof user?.miEmpresa === 'string'
      ? user.miEmpresa
      : user?.miEmpresa?.tienda || 'sandbox'
  const defaultSucursal = user?.sucursal?.codigo ?? 0

  const [sucursalCodigo, setSucursalCodigo] = useState<number>(defaultSucursal)
  const [sucursales, setSucursales] = useState<SucursalOption[]>([])
  const [articles, setArticles] = useState<AdminArticle[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<number>(0)

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('TODAS')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'habilitados' | 'deshabilitados' | 'promos'>('todos')

  // Modal de edición de promoción / precio
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null)
  const [modalForm, setModalForm] = useState<EditModalState>({
    isEnabled: true,
    customPrice: '',
    isPromoEnabled: false,
    promoType: 'PERCENTAGE',
    promoValue: '',
    promoMaxQuantityPerOrder: '',
    promoStartDate: '',
    promoEndDate: '',
    promoRecurringDays: [],
    promoStartTime: '',
    promoEndTime: '',
    promoNotifyPush: false,
    promoNotifyTitle: '',
    promoNotifyMessage: '',
    promoNotifyScheduledAt: '',
  })
  const [savingModal, setSavingModal] = useState<boolean>(false)

  const loadBranches = async () => {
    try {
      const client = getInboxClient()
      const res: any = await client.request(GET_SHOP_BRANCHES, { id: shopId })
      if (res?.shop?.sucursales?.length) {
        setSucursales(res.shop.sucursales)
      }
    } catch (err) {
      console.warn('No se pudieron cargar las sucursales de la tienda:', err)
    }
  }

  const loadArticles = async (targetSucursal = sucursalCodigo) => {
    try {
      setLoading(true)
      const client = getInboxClient()
      const res: any = await client.request(GET_ADMIN_ARTICLES, {
        shop: shopId,
        sucursal: targetSucursal,
      })
      setArticles(res?.adminArticles || [])
    } catch (err: any) {
      console.error('Error cargando catálogo de artículos:', err)
      Swal.fire(
        'Error al cargar productos',
        err?.response?.errors?.[0]?.message || err?.message || 'No se pudo obtener el catálogo desde el servidor.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (shopId) {
      loadBranches()
      loadArticles(sucursalCodigo)
    }
  }, [shopId, sucursalCodigo])

  const categories = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => {
      const desc = a.tipoArticulo?.descripcion?.trim()
      if (desc) set.add(desc)
    })
    return ['TODAS', ...Array.from(set).sort()]
  }, [articles])

  const stats = useMemo(() => {
    const total = articles.length
    let enabled = 0
    let disabled = 0
    let promos = 0
    articles.forEach((a) => {
      const isEn = a.promoInfo?.isEnabled !== false
      if (isEn) enabled++
      else disabled++
      if (a.promoInfo?.isPromoEnabled) promos++
    })
    return { total, enabled, disabled, promos }
  }, [articles])

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const isEn = a.promoInfo?.isEnabled !== false
      const hasPromo = Boolean(a.promoInfo?.isPromoEnabled)

      if (statusFilter === 'habilitados' && !isEn) return false
      if (statusFilter === 'deshabilitados' && isEn) return false
      if (statusFilter === 'promos' && !hasPromo) return false

      if (categoryFilter !== 'TODAS') {
        const cat = a.tipoArticulo?.descripcion?.trim() || 'Otros'
        if (cat !== categoryFilter) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const nameMatch = (a.nombreArticulo || '').toLowerCase().includes(q)
        const codeMatch = (a.codigoArticulo || '').toLowerCase().includes(q)
        if (!nameMatch && !codeMatch) return false
      }

      return true
    })
  }, [articles, statusFilter, categoryFilter, searchQuery])

  // Switch rápido para habilitar / deshabilitar un artículo sin abrir el modal
  const handleQuickToggleEnabled = async (article: AdminArticle, nextEnabled: boolean) => {
    const p = article.promoInfo
    try {
      setSavingId(article._id)
      const client = getInboxClient()
      await client.request(UPDATE_ARTICLE_CONFIG, {
        shop: shopId,
        sucursal: sucursalCodigo,
        articleId: article._id,
        config: {
          isEnabled: nextEnabled,
          isPromoEnabled: Boolean(p?.isPromoEnabled),
          customPrice: p?.customPrice ?? null,
          promoType: p?.promoType ?? null,
          promoValue: p?.promoValue ?? null,
          promoMaxQuantityPerOrder: p?.promoMaxQuantityPerOrder ?? null,
          applyPromoToModifiers: Boolean(p?.applyPromoToModifiers),
          promoStartDate: p?.promoStartDate ?? null,
          promoEndDate: p?.promoEndDate ?? null,
          promoRecurringDays: p?.promoRecurringDays ?? null,
          promoStartTime: p?.promoStartTime ?? null,
          promoEndTime: p?.promoEndTime ?? null,
        },
      })

      setArticles((prev) =>
        prev.map((item) =>
          item._id === article._id
            ? {
                ...item,
                promoInfo: {
                  ...item.promoInfo,
                  isEnabled: nextEnabled,
                },
              }
            : item
        )
      )
    } catch (err: any) {
      console.error('Error actualizando estado del artículo:', err)
      Swal.fire(
        'Error',
        err?.response?.errors?.[0]?.message || err?.message || 'No se pudo actualizar el estado del producto.',
        'error'
      )
    } finally {
      setSavingId(null)
    }
  }

  const openEditModal = (article: AdminArticle) => {
    const p = article.promoInfo
    setEditingArticle(article)
    setModalForm({
      isEnabled: p?.isEnabled !== false,
      customPrice: p?.customPrice != null ? String(p.customPrice) : '',
      isPromoEnabled: Boolean(p?.isPromoEnabled),
      promoType:
        p?.promoType === 'DISCOUNT_AMOUNT' || p?.promoType === 'FIXED_PRICE'
          ? p.promoType
          : 'PERCENTAGE',
      promoValue: p?.promoValue != null ? String(p.promoValue) : '',
      promoMaxQuantityPerOrder:
        p?.promoMaxQuantityPerOrder != null ? String(p.promoMaxQuantityPerOrder) : '',
      promoStartDate: p?.promoStartDate
        ? dayjs(p.promoStartDate).format('YYYY-MM-DDTHH:mm')
        : '',
      promoEndDate: p?.promoEndDate
        ? dayjs(p.promoEndDate).format('YYYY-MM-DDTHH:mm')
        : '',
      promoRecurringDays: Array.isArray(p?.promoRecurringDays) ? p!.promoRecurringDays! : [],
      promoStartTime: p?.promoStartTime || '',
      promoEndTime: p?.promoEndTime || '',
      promoNotifyPush: Boolean(p?.promoNotifyPush),
      promoNotifyTitle: p?.promoNotifyTitle || '',
      promoNotifyMessage: p?.promoNotifyMessage || '',
      promoNotifyScheduledAt: p?.promoNotifyScheduledAt
        ? dayjs(p.promoNotifyScheduledAt).format('YYYY-MM-DDTHH:mm')
        : '',
    })
  }

  const applyQuickDuration = (days: number | null) => {
    if (days === null) {
      setModalForm((prev) => ({ ...prev, promoStartDate: '', promoEndDate: '' }))
      return
    }
    const start = dayjs().startOf('minute')
    const end = days === 1 ? dayjs().endOf('day') : start.add(days, 'day').endOf('day')
    setModalForm((prev) => ({
      ...prev,
      promoStartDate: start.format('YYYY-MM-DDTHH:mm'),
      promoEndDate: end.format('YYYY-MM-DDTHH:mm'),
    }))
  }

  const toggleRecurringDay = (day: number) => {
    setModalForm((prev) => {
      const exists = prev.promoRecurringDays.includes(day)
      return {
        ...prev,
        promoRecurringDays: exists
          ? prev.promoRecurringDays.filter((d) => d !== day)
          : [...prev.promoRecurringDays, day],
      }
    })
  }

  const previewPrices = useMemo(() => {
    if (!editingArticle) return { basePrice: 0, finalPrice: 0 }
    const isicorePrice =
      editingArticle.promoInfo?.originalPrice ??
      editingArticle.articuloPrecioBase?.monedaPrimaria?.precio ??
      0
    const customParsed = modalForm.customPrice.trim() ? parseFloat(modalForm.customPrice) : null
    const basePrice = customParsed !== null && !isNaN(customParsed) ? customParsed : isicorePrice

    if (!modalForm.isPromoEnabled) {
      return { basePrice, finalPrice: basePrice }
    }

    const val = modalForm.promoValue.trim() ? parseFloat(modalForm.promoValue) : 0
    if (isNaN(val) || val <= 0) {
      return { basePrice, finalPrice: basePrice }
    }

    let finalPrice = basePrice
    if (modalForm.promoType === 'PERCENTAGE') {
      finalPrice = Math.max(0, Number((basePrice - basePrice * (val / 100)).toFixed(2)))
    } else if (modalForm.promoType === 'DISCOUNT_AMOUNT') {
      finalPrice = Math.max(0, Number((basePrice - val).toFixed(2)))
    } else if (modalForm.promoType === 'FIXED_PRICE') {
      finalPrice = Math.max(0, Number(val.toFixed(2)))
    }

    return { basePrice, finalPrice }
  }, [editingArticle, modalForm])

  const handleSaveModal = async () => {
    if (!editingArticle) return

    if (modalForm.isPromoEnabled) {
      const val = parseFloat(modalForm.promoValue)
      if (isNaN(val) || val <= 0) {
        Swal.fire('Atención', 'Ingresa un valor válido mayor a 0 para la promoción.', 'warning')
        return
      }
      if (modalForm.promoType === 'PERCENTAGE' && val >= 100) {
        Swal.fire('Atención', 'El porcentaje de descuento debe ser menor a 100%.', 'warning')
        return
      }
    }

    try {
      setSavingModal(true)
      const client = getInboxClient()

      const customPriceNum = modalForm.customPrice.trim()
        ? parseFloat(modalForm.customPrice)
        : null
      const promoValueNum =
        modalForm.isPromoEnabled && modalForm.promoValue.trim()
          ? parseFloat(modalForm.promoValue)
          : null
      const maxQtyNum =
        modalForm.isPromoEnabled && modalForm.promoMaxQuantityPerOrder.trim()
          ? parseInt(modalForm.promoMaxQuantityPerOrder, 10)
          : null

      const configInput = {
        isEnabled: modalForm.isEnabled,
        isPromoEnabled: modalForm.isPromoEnabled,
        customPrice: customPriceNum !== null && !isNaN(customPriceNum) ? customPriceNum : null,
        promoType: modalForm.isPromoEnabled ? modalForm.promoType : null,
        promoValue: promoValueNum !== null && !isNaN(promoValueNum) ? promoValueNum : null,
        promoMaxQuantityPerOrder:
          maxQtyNum !== null && !isNaN(maxQtyNum) && maxQtyNum > 0 ? maxQtyNum : null,
        applyPromoToModifiers: false,
        promoStartDate:
          modalForm.isPromoEnabled && modalForm.promoStartDate
            ? new Date(modalForm.promoStartDate).toISOString()
            : null,
        promoEndDate:
          modalForm.isPromoEnabled && modalForm.promoEndDate
            ? new Date(modalForm.promoEndDate).toISOString()
            : null,
        promoRecurringDays:
          modalForm.isPromoEnabled && modalForm.promoRecurringDays.length > 0
            ? modalForm.promoRecurringDays
            : null,
        promoStartTime:
          modalForm.isPromoEnabled && modalForm.promoStartTime ? modalForm.promoStartTime : null,
        promoEndTime:
          modalForm.isPromoEnabled && modalForm.promoEndTime ? modalForm.promoEndTime : null,
        promoNotifyPush: modalForm.isPromoEnabled && modalForm.promoNotifyPush,
        promoNotifyTitle:
          modalForm.isPromoEnabled && modalForm.promoNotifyPush && modalForm.promoNotifyTitle.trim()
            ? modalForm.promoNotifyTitle.trim()
            : null,
        promoNotifyMessage:
          modalForm.isPromoEnabled && modalForm.promoNotifyPush && modalForm.promoNotifyMessage.trim()
            ? modalForm.promoNotifyMessage.trim()
            : null,
        promoNotifyScheduledAt:
          modalForm.isPromoEnabled && modalForm.promoNotifyPush && modalForm.promoNotifyScheduledAt
            ? new Date(modalForm.promoNotifyScheduledAt).toISOString()
            : null,
      }

      await client.request(UPDATE_ARTICLE_CONFIG, {
        shop: shopId,
        sucursal: sucursalCodigo,
        articleId: editingArticle._id,
        config: configInput,
      })

      setEditingArticle(null)
      await loadArticles(sucursalCodigo)

      Swal.fire({
        icon: 'success',
        title: '¡Configuración guardada!',
        text: 'El producto y su promoción se actualizaron en el e-commerce.',
        timer: 1800,
        showConfirmButton: false,
      })
    } catch (err: any) {
      console.error('Error guardando configuración de artículo:', err)
      Swal.fire(
        'Error al guardar',
        err?.response?.errors?.[0]?.message || err?.message || 'No se pudo guardar la configuración.',
        'error'
      )
    } finally {
      setSavingModal(false)
    }
  }

  const handleResendPromo = async (article: AdminArticle) => {
    const p = article.promoInfo
    if (!p?.isPromoEnabled || !p?.promoNotifyMessage) {
      Swal.fire(
        'Sin mensaje de promo',
        'Este artículo debe tener una promoción activa y un mensaje push configurado para poder reenviarse.',
        'warning'
      )
      return
    }

    const confirm = await Swal.fire({
      title: '¿Reenviar notificación push?',
      text: `Se enviará la alerta "${p.promoNotifyTitle || 'Promoción Especial'}" a todos los clientes.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reenviar ahora',
      cancelButtonText: 'Cancelar',
    })

    if (!confirm.isConfirmed) return

    try {
      setSavingId(article._id)
      const client = getInboxClient()
      await client.request(RESEND_PROMO_PUSH, {
        shop: shopId,
        sucursal: sucursalCodigo,
        articleId: article._id,
      })

      Swal.fire({
        icon: 'success',
        title: '¡Push enviado!',
        text: 'La notificación de la promoción fue despachada con éxito.',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err: any) {
      console.error('Error reenviando push de promoción:', err)
      Swal.fire(
        'Error',
        err?.response?.errors?.[0]?.message || err?.message || 'No se pudo reenviar la notificación.',
        'error'
      )
    } finally {
      setSavingId(null)
    }
  }

  return (
    <SimpleContainerBox>
      <Box sx={{ mb: 3 }}>
        <Breadcrumb
          routeSegments={[
            { name: 'Ecommerce', path: ecommerceRoutesMap.ecommerce.path },
            { name: 'Catálogo y Promociones' },
          ]}
        />
      </Box>

      {/* Encabezado y selector de sucursal */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
        }}
      >
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: 'primary.main',
                  fontWeight: 800,
                }}
              >
                <LocalOffer />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Catálogo y Promociones de Productos
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Habilita o deshabilita productos en tu tienda online, configura descuentos, límite de unidades por pedido y vigencia.
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {sucursales.length > 0 && (
                <FormControl
                  size="small"
                  sx={{
                    minWidth: 210,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.25)',
                    },
                    '& .MuiSvgIcon-root': { color: '#fff' },
                  }}
                >
                  <Select
                    value={sucursalCodigo}
                    onChange={(e) => setSucursalCodigo(Number(e.target.value))}
                    sx={{ color: '#fff', fontWeight: 700, fontSize: 13 }}
                  >
                    {sucursales.map((s) => (
                      <MenuItem key={s.codigo} value={s.codigo}>
                        <Storefront sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {s.alias || (s.codigo === 0 ? 'Casa Matriz' : `Sucursal #${s.codigo}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Refresh />}
                onClick={() => loadArticles(sucursalCodigo)}
                disabled={loading}
                sx={{ borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none', fontWeight: 700 }}
              >
                Actualizar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Navegación por Pestañas */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              fontSize: 14,
              py: 2,
              minHeight: 52,
            },
          }}
        >
          <Tab
            icon={<LocalOffer sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Catálogo y Promociones por Producto"
          />
          <Tab
            icon={<Campaign sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Campañas Push & Difusiones"
          />
        </Tabs>
      </Paper>

      {/* Vista de Campañas Push y Difusiones */}
      {activeTab === 1 && (
        <BroadcastCampaignsTab
          shopId={shopId}
          sucursales={sucursales}
          defaultSucursal={sucursalCodigo}
        />
      )}

      {/* Vista de Catálogo de Productos */}
      {activeTab === 0 && (
        <>
          {/* Tarjetas de Resumen Rápido */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        TOTAL PRODUCTOS
                      </Typography>
                      <Typography variant="h5" fontWeight={800}>
                        {stats.total}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
                      <Inventory2 />
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
                        HABILITADOS EN TIENDA
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="success.main">
                        {stats.enabled}
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
                        DESHABILITADOS
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="text.secondary">
                        {stats.disabled}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(100, 116, 139, 0.12)', color: '#64748b' }}>
                      <VisibilityOff />
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
                        CON PROMOCIÓN
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="warning.main">
                        {stats.promos}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.14)', color: '#d97706' }}>
                      <LocalOffer />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Barra de Búsqueda y Filtros */}
          <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por nombre o código..."
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
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      label="Categoría"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat === 'TODAS' ? 'Todas las categorías' : cat}
                        </MenuItem>
                      ))}
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
                      Todos ({stats.total})
                    </ToggleButton>
                    <ToggleButton value="habilitados" sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Habilitados ({stats.enabled})
                    </ToggleButton>
                    <ToggleButton value="deshabilitados" sx={{ textTransform: 'none', fontWeight: 700 }}>
                      Ocultos ({stats.disabled})
                    </ToggleButton>
                    <ToggleButton value="promos" sx={{ textTransform: 'none', fontWeight: 700 }}>
                      En Promo ({stats.promos})
                    </ToggleButton>
                  </ToggleButtonGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de Productos */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredArticles.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Typography variant="h6" color="text.secondary" fontWeight={700}>
              No se encontraron productos con estos filtros
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Prueba cambiando el filtro de categoría o el término de búsqueda.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Precio Tienda</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Promoción / Límite / Vigencia</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>
                    Visible en Tienda
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredArticles.map((article) => {
                  const p = article.promoInfo
                  const isEnabled = p?.isEnabled !== false
                  const isPromo = Boolean(p?.isPromoEnabled)
                  const origPrice =
                    p?.originalPrice ?? article.articuloPrecioBase?.monedaPrimaria?.precio ?? 0
                  const finalPrice = p?.finalPrice ?? origPrice
                  const imgUrl =
                    article.imagen?.variants?.thumbnail ||
                    article.imagen?.variants?.medium ||
                    article.imagen?.variants?.public ||
                    ''

                  let promoBadgeLabel = ''
                  if (isPromo) {
                    if (p?.promoType === 'PERCENTAGE') {
                      promoBadgeLabel = `-${p.promoValue}% OFF`
                    } else if (p?.promoType === 'DISCOUNT_AMOUNT') {
                      promoBadgeLabel = `-Bs. ${p.promoValue}`
                    } else if (p?.promoType === 'FIXED_PRICE') {
                      promoBadgeLabel = `Precio Fijo Bs. ${p.promoValue}`
                    }
                  }

                  return (
                    <TableRow
                      key={article._id}
                      hover
                      sx={{
                        opacity: isEnabled ? 1 : 0.58,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            variant="rounded"
                            src={imgUrl}
                            alt={article.nombreArticulo || ''}
                            sx={{ width: 46, height: 46, bgcolor: 'action.selected' }}
                          >
                            <Storefront fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {article.nombreArticulo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cód: {article.codigoArticulo || 'S/C'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={article.tipoArticulo?.descripcion || 'General'}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        {isPromo || (p?.customPrice != null && p.customPrice !== origPrice) ? (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ textDecoration: 'line-through', color: 'text.secondary', display: 'block' }}
                            >
                              Bs. {Number(origPrice).toFixed(2)}
                            </Typography>
                            <Typography variant="subtitle2" fontWeight={800} color="success.main">
                              Bs. {Number(finalPrice).toFixed(2)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="subtitle2" fontWeight={700}>
                            Bs. {Number(origPrice).toFixed(2)}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {isPromo ? (
                          <Stack spacing={0.5} alignItems="flex-start">
                            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                              <Chip
                                size="small"
                                color="warning"
                                icon={<LocalOffer sx={{ fontSize: '14px !important' }} />}
                                label={promoBadgeLabel || 'En Promoción'}
                                sx={{ fontWeight: 800, height: 22 }}
                              />
                              {p?.promoMaxQuantityPerOrder && p.promoMaxQuantityPerOrder > 0 && (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  label={`Máx. ${p.promoMaxQuantityPerOrder} u./pedido`}
                                  sx={{ fontWeight: 700, height: 22 }}
                                />
                              )}
                            </Stack>
                            {(p?.promoStartDate || p?.promoEndDate) && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime sx={{ fontSize: 13 }} />
                                {p.promoStartDate ? dayjs(p.promoStartDate).format('DD/MM/YY HH:mm') : 'Inicio'}
                                {' → '}
                                {p.promoEndDate ? dayjs(p.promoEndDate).format('DD/MM/YY HH:mm') : 'Sin límite'}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin promoción activa
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title={isEnabled ? 'Visible en la tienda online' : 'Oculto en la tienda online'}>
                          <span>
                            <Switch
                              color="success"
                              checked={isEnabled}
                              disabled={savingId === article._id}
                              onChange={(e) => handleQuickToggleEnabled(article, e.target.checked)}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          {isPromo && p?.promoNotifyMessage && (
                            <Tooltip title="Reenviar Push ahora a los clientes">
                              <span>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  disabled={savingId === article._id}
                                  onClick={() => handleResendPromo(article)}
                                  sx={{
                                    bgcolor: 'primary.50',
                                    '&:hover': { bgcolor: 'primary.100' },
                                    borderRadius: 2,
                                  }}
                                >
                                  <Send fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          <Button
                            size="small"
                            variant={isPromo ? 'contained' : 'outlined'}
                            color={isPromo ? 'warning' : 'primary'}
                            startIcon={<Edit />}
                            onClick={() => openEditModal(article)}
                            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                          >
                            {isPromo ? 'Editar Promo' : 'Configurar Promo'}
                          </Button>
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
      </>
      )}

      {/* Modal para Configurar Precio, Promoción, Límite y Vigencia */}
      <Dialog
        open={Boolean(editingArticle)}
        onClose={() => !savingModal && setEditingArticle(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'warning.main', color: '#111827', width: 38, height: 38 }}>
              <LocalOffer fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                {editingArticle?.nombreArticulo}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configuración de disponibilidad, descuento y vigencia en tienda
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => !savingModal && setEditingArticle(null)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {/* 1. Estado habilitado/deshabilitado */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Producto habilitado en el E-commerce
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Si lo deshabilitas, este producto no aparecerá en el menú digital de esta sucursal.
                  </Typography>
                </Box>
                <Switch
                  color="success"
                  checked={modalForm.isEnabled}
                  onChange={(e) => setModalForm((prev) => ({ ...prev, isEnabled: e.target.checked }))}
                />
              </Stack>
            </Paper>

            {/* 2. Precio base opcional */}
            <Box>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Precio Base Personalizado en E-commerce (Opcional)"
                placeholder={`Precio actual Isicore: Bs. ${
                  editingArticle?.promoInfo?.originalPrice ??
                  editingArticle?.articuloPrecioBase?.monedaPrimaria?.precio ??
                  0
                }`}
                value={modalForm.customPrice}
                onChange={(e) => setModalForm((prev) => ({ ...prev, customPrice: e.target.value }))}
                helperText="Déjalo vacío para usar el precio original de Isicore."
              />
            </Box>

            <Divider />

            {/* 3. Activar Promoción / Descuento */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    color="warning"
                    checked={modalForm.isPromoEnabled}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, isPromoEnabled: e.target.checked }))
                    }
                  />
                }
                label={
                  <Typography variant="subtitle2" fontWeight={800}>
                    Activar Promoción / Descuento para este producto
                  </Typography>
                }
              />

              {modalForm.isPromoEnabled && (
                <Stack spacing={2.2} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipo de Descuento</InputLabel>
                        <Select
                          label="Tipo de Descuento"
                          value={modalForm.promoType}
                          onChange={(e) =>
                            setModalForm((prev) => ({
                              ...prev,
                              promoType: e.target.value as EditModalState['promoType'],
                            }))
                          }
                        >
                          <MenuItem value="PERCENTAGE">Porcentaje de descuento (%)</MenuItem>
                          <MenuItem value="DISCOUNT_AMOUNT">Rebaja en Bolivianos (Bs.)</MenuItem>
                          <MenuItem value="FIXED_PRICE">Precio Fijo Promocional (Bs.)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={
                          modalForm.promoType === 'PERCENTAGE'
                            ? 'Porcentaje de descuento (%)'
                            : modalForm.promoType === 'DISCOUNT_AMOUNT'
                              ? 'Monto a descontar (Bs.)'
                              : 'Nuevo precio fijo (Bs.)'
                        }
                        placeholder={modalForm.promoType === 'PERCENTAGE' ? 'Ej: 20' : 'Ej: 15'}
                        value={modalForm.promoValue}
                        onChange={(e) =>
                          setModalForm((prev) => ({ ...prev, promoValue: e.target.value }))
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* Vista previa del precio final */}
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={700}>
                      Vista previa en tienda:{' '}
                      <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>
                        Bs. {Number(previewPrices.basePrice).toFixed(2)}
                      </span>{' '}
                      → <strong>Bs. {Number(previewPrices.finalPrice).toFixed(2)}</strong>
                    </Typography>
                  </Alert>

                  {/* Límite máximo de productos por pedido */}
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Cantidad máxima permitida por pedido (Opcional)"
                    placeholder="Ej: 2 (Déjalo vacío para sin límite)"
                    value={modalForm.promoMaxQuantityPerOrder}
                    onChange={(e) =>
                      setModalForm((prev) => ({
                        ...prev,
                        promoMaxQuantityPerOrder: e.target.value,
                      }))
                    }
                    helperText="Limita cuántas unidades en promoción puede llevar un cliente en un mismo pedido."
                  />

                  {/* Duración / Fechas de vigencia */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                      Tiempo de vigencia de la promoción
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5, gap: 0.5 }}>
                      <Chip
                        size="small"
                        label="Solo Hoy"
                        onClick={() => applyQuickDuration(1)}
                        clickable
                      />
                      <Chip
                        size="small"
                        label="3 Días"
                        onClick={() => applyQuickDuration(3)}
                        clickable
                      />
                      <Chip
                        size="small"
                        label="7 Días"
                        onClick={() => applyQuickDuration(7)}
                        clickable
                      />
                      <Chip
                        size="small"
                        label="30 Días"
                        onClick={() => applyQuickDuration(30)}
                        clickable
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label="Sin fecha límite"
                        onClick={() => applyQuickDuration(null)}
                        clickable
                      />
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="datetime-local"
                          label="Fecha y hora de inicio"
                          InputLabelProps={{ shrink: true }}
                          value={modalForm.promoStartDate}
                          onChange={(e) =>
                            setModalForm((prev) => ({ ...prev, promoStartDate: e.target.value }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="datetime-local"
                          label="Fecha y hora de fin"
                          InputLabelProps={{ shrink: true }}
                          value={modalForm.promoEndDate}
                          onChange={(e) =>
                            setModalForm((prev) => ({ ...prev, promoEndDate: e.target.value }))
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Happy Hour / Días y horas recurrentes opcional */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                      Horario o Días Específicos (Happy Hour — Opcional)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Selecciona días y horas solo si quieres que la promoción se active en horarios específicos.
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 1.5 }}>
                      {DAYS_OF_WEEK.map((d) => {
                        const selected = modalForm.promoRecurringDays.includes(d.value)
                        return (
                          <Chip
                            key={d.value}
                            size="small"
                            label={d.label}
                            color={selected ? 'primary' : 'default'}
                            variant={selected ? 'filled' : 'outlined'}
                            onClick={() => toggleRecurringDay(d.value)}
                            clickable
                            sx={{ fontWeight: 700 }}
                          />
                        )
                      })}
                    </Stack>

                    {modalForm.promoRecurringDays.length > 0 && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="time"
                            label="Hora inicio"
                            InputLabelProps={{ shrink: true }}
                            value={modalForm.promoStartTime}
                            onChange={(e) =>
                              setModalForm((prev) => ({ ...prev, promoStartTime: e.target.value }))
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="time"
                            label="Hora fin"
                            InputLabelProps={{ shrink: true }}
                            value={modalForm.promoEndTime}
                            onChange={(e) =>
                              setModalForm((prev) => ({ ...prev, promoEndTime: e.target.value }))
                            }
                          />
                        </Grid>
                      </Grid>
                    )}
                    {/* Notificacion Push a Clientes con BullMQ */}
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            Notificación Push a Clientes (BullMQ)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Envía una notificación al celular de los clientes anunciando esta promoción.
                          </Typography>
                        </Box>
                        <Switch
                          color="primary"
                          checked={modalForm.promoNotifyPush}
                          onChange={(e) =>
                            setModalForm((prev) => ({
                              ...prev,
                              promoNotifyPush: e.target.checked,
                              promoNotifyTitle:
                                e.target.checked && !prev.promoNotifyTitle
                                  ? `Promoción en ${editingArticle?.nombreArticulo || 'nuestro menú'}`
                                  : prev.promoNotifyTitle,
                            }))
                          }
                        />
                      </Stack>

                      {modalForm.promoNotifyPush && (
                        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Título de la notificación"
                            placeholder="Ej: ¡Oferta Especial de Almuerzo!"
                            value={modalForm.promoNotifyTitle}
                            onChange={(e) =>
                              setModalForm((prev) => ({ ...prev, promoNotifyTitle: e.target.value }))
                            }
                          />
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            label="Mensaje personalizado"
                            placeholder="Ej: Aprovecha 50% de descuento en nuestra hamburguesa clásica solo por hoy."
                            value={modalForm.promoNotifyMessage}
                            onChange={(e) =>
                              setModalForm((prev) => ({ ...prev, promoNotifyMessage: e.target.value }))
                            }
                          />
                          <TextField
                            fullWidth
                            size="small"
                            type="datetime-local"
                            label="Hora programada de envío (opcional)"
                            helperText="Si no especificas fecha y hora, se enviará cuando comience la promoción o de inmediato."
                            InputLabelProps={{ shrink: true }}
                            value={modalForm.promoNotifyScheduledAt}
                            onChange={(e) =>
                              setModalForm((prev) => ({ ...prev, promoNotifyScheduledAt: e.target.value }))
                            }
                          />
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setEditingArticle(null)}
            disabled={savingModal}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={savingModal ? <CircularProgress size={16} color="inherit" /> : <Save />}
            onClick={handleSaveModal}
            disabled={savingModal}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
          >
            {savingModal ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </DialogActions>
      </Dialog>
    </SimpleContainerBox>
  )
}

export default CatalogoPromosPage

