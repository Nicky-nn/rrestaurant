import {
  AutoFixHigh,
  Close,
  ConfirmationNumber,
  DeliveryDining,
  HelpOutline,
  LocalOffer,
  Percent,
  Save,
  Store,
  Storefront,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
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

import { getInboxClient } from '../../api/inboxClient'

const CREATE_COUPON_MUTATION = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      id
      code
      discountType
      discountValue
      isActive
    }
  }
`

const UPDATE_COUPON_MUTATION = gql`
  mutation UpdateCoupon($id: String!, $input: UpdateCouponInput!) {
    updateCoupon(id: $id, input: $input) {
      id
      code
      discountType
      discountValue
      isActive
    }
  }
`

export interface CouponItem {
  id: string
  shop: string
  code: string
  description?: string | null
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY' | string
  discountValue: number
  minOrderAmount?: number | null
  maxDiscountAmount?: number | null
  totalUsageLimit?: number | null
  usagePerUserLimit: number
  totalUses: number
  firstOrderOnly: boolean
  deliveryType: 'ALL' | 'DELIVERY' | 'PICKUP' | string
  sucursales?: number[] | null
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SucursalOption {
  codigo: number
  alias?: string | null
  municipio?: string | null
  direccion?: string | null
}

interface CouponDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  shopId: string
  sucursales: SucursalOption[]
  editingCoupon?: CouponItem | null
}

export const CouponDialog: FC<CouponDialogProps> = ({
  open,
  onClose,
  onSuccess,
  shopId,
  sucursales,
  editingCoupon,
}) => {
  const isEditing = Boolean(editingCoupon)

  const [code, setCode] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState<string>('20')
  const [minOrderAmount, setMinOrderAmount] = useState<string>('')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('')
  const [hasTotalLimit, setHasTotalLimit] = useState<boolean>(false)
  const [totalUsageLimit, setTotalUsageLimit] = useState<string>('100')
  const [usagePerUserLimit, setUsagePerUserLimit] = useState<number>(1)
  const [firstOrderOnly, setFirstOrderOnly] = useState<boolean>(false)
  const [deliveryType, setDeliveryType] = useState<'ALL' | 'DELIVERY' | 'PICKUP'>('ALL')
  const [allSucursales, setAllSucursales] = useState<boolean>(true)
  const [selectedSucursales, setSelectedSucursales] = useState<number[]>([])
  const [hasDates, setHasDates] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // Reset o Cargar datos al abrir modal
  useEffect(() => {
    if (editingCoupon) {
      setCode(editingCoupon.code)
      setDescription(editingCoupon.description || '')
      setDiscountType(editingCoupon.discountType as any)
      setDiscountValue(String(editingCoupon.discountValue ?? ''))
      setMinOrderAmount(editingCoupon.minOrderAmount ? String(editingCoupon.minOrderAmount) : '')
      setMaxDiscountAmount(editingCoupon.maxDiscountAmount ? String(editingCoupon.maxDiscountAmount) : '')
      setHasTotalLimit(Boolean(editingCoupon.totalUsageLimit))
      setTotalUsageLimit(editingCoupon.totalUsageLimit ? String(editingCoupon.totalUsageLimit) : '100')
      setUsagePerUserLimit(editingCoupon.usagePerUserLimit ?? 1)
      setFirstOrderOnly(Boolean(editingCoupon.firstOrderOnly))
      setDeliveryType((editingCoupon.deliveryType as any) || 'ALL')
      if (editingCoupon.sucursales && Array.isArray(editingCoupon.sucursales) && editingCoupon.sucursales.length > 0) {
        setAllSucursales(false)
        setSelectedSucursales(editingCoupon.sucursales)
      } else {
        setAllSucursales(true)
        setSelectedSucursales([])
      }
      setHasDates(Boolean(editingCoupon.startDate || editingCoupon.endDate))
      setStartDate(editingCoupon.startDate ? dayjs(editingCoupon.startDate).format('YYYY-MM-DDTHH:mm') : '')
      setEndDate(editingCoupon.endDate ? dayjs(editingCoupon.endDate).format('YYYY-MM-DDTHH:mm') : '')
      setIsActive(editingCoupon.isActive)
    } else {
      // Valores por defecto para nuevo cupón
      setCode('')
      setDescription('')
      setDiscountType('PERCENTAGE')
      setDiscountValue('15')
      setMinOrderAmount('')
      setMaxDiscountAmount('')
      setHasTotalLimit(false)
      setTotalUsageLimit('100')
      setUsagePerUserLimit(1)
      setFirstOrderOnly(false)
      setDeliveryType('ALL')
      setAllSucursales(true)
      setSelectedSucursales([])
      setHasDates(false)
      setStartDate('')
      setEndDate('')
      setIsActive(true)
    }
  }, [editingCoupon, open])

  // Generador inteligente de códigos atractivos estilo Rappi/PedidosYa
  const handleGenerateCode = () => {
    const prefixes = ['PROMO', 'DESCUENTO', 'SUPER', 'OFERTA', 'INBOX', 'DELIVERY', 'MENU']
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomNum = Math.floor(10 + Math.random() * 90)
    setCode(`${randomPrefix}${randomNum}`)
  }

  const toggleSucursal = (cod: number) => {
    if (selectedSucursales.includes(cod)) {
      setSelectedSucursales(selectedSucursales.filter((c) => c !== cod))
    } else {
      setSelectedSucursales([...selectedSucursales, cod])
    }
  }

  // Texto resumen del descuento para la vista previa del cupón
  const previewDiscountText = useMemo(() => {
    if (discountType === 'PERCENTAGE') {
      return `${discountValue || 0}% OFF`
    }
    if (discountType === 'FIXED_AMOUNT') {
      return `Bs. ${discountValue || 0} OFF`
    }
    return 'ENVÍO GRATIS'
  }, [discountType, discountValue])

  const handleSave = async () => {
    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode) {
      Swal.fire({ icon: 'warning', title: 'Código requerido', text: 'Ingresa un código para el cupón (ej: BIENVENIDO20).' })
      return
    }

    const numVal = parseFloat(discountValue)
    if (discountType !== 'FREE_DELIVERY' && (isNaN(numVal) || numVal <= 0)) {
      Swal.fire({ icon: 'warning', title: 'Valor de descuento inválido', text: 'Ingresa un valor mayor a cero.' })
      return
    }

    if (discountType === 'PERCENTAGE' && numVal > 100) {
      Swal.fire({ icon: 'warning', title: 'Porcentaje inválido', text: 'El descuento no puede superar el 100%.' })
      return
    }

    if (!allSucursales && selectedSucursales.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sucursales requeridas',
        text: 'Selecciona al menos una sucursal o marca "Todas las sucursales".',
      })
      return
    }

    setSaving(true)
    try {
      const client = getInboxClient()
      const payload: any = {
        code: normalizedCode,
        description: description.trim() || null,
        discountType,
        discountValue: discountType === 'FREE_DELIVERY' ? 0 : numVal,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscountAmount: discountType === 'PERCENTAGE' && maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        totalUsageLimit: hasTotalLimit && totalUsageLimit ? parseInt(totalUsageLimit, 10) : null,
        usagePerUserLimit: usagePerUserLimit || 1,
        firstOrderOnly,
        deliveryType,
        sucursales: allSucursales ? null : selectedSucursales,
        startDate: hasDates && startDate ? new Date(startDate).toISOString() : null,
        endDate: hasDates && endDate ? new Date(endDate).toISOString() : null,
        isActive,
      }

      if (isEditing) {
        await client.request(UPDATE_COUPON_MUTATION, {
          id: editingCoupon!.id,
          input: payload,
        })
        Swal.fire({ icon: 'success', title: '¡Cupón actualizado!', timer: 2000 })
      } else {
        payload.shop = shopId
        await client.request(CREATE_COUPON_MUTATION, {
          input: payload,
        })
        Swal.fire({ icon: 'success', title: '¡Cupón creado exitosamente!', timer: 2000 })
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('[CouponDialog] Error al guardar cupón:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar cupón',
        text: err?.response?.errors?.[0]?.message || err?.message || 'Error al conectar con el servidor.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ p: 2.5, bgcolor: '#0f172a', color: '#fff' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 42, height: 42 }}>
              <ConfirmationNumber />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#fff">
                {isEditing ? `Editar Cupón: ${editingCoupon?.code}` : 'Nuevo Cupón de Descuento'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Configura reglas de canje, topes máximos y límites de uso (estándar Rappi / PedidosYa)
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }} disabled={saving}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Formulario de Configuración */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              {/* Código y Botón Generar */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label="Código del Cupón *"
                    placeholder="Ej: BIENVENIDO20, BURGER50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    inputProps={{ style: { textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 } }}
                    helperText="Los clientes escribirán este código en el carrito."
                  />
                  <Tooltip title="Generar código automático">
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleGenerateCode}
                      sx={{ height: 40, px: 2, textTransform: 'none', fontWeight: 700 }}
                      startIcon={<AutoFixHigh />}
                    >
                      Generar
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Tipo de Descuento */}
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  TIPO DE DESCUENTO
                </Typography>
                <ToggleButtonGroup
                  value={discountType}
                  exclusive
                  onChange={(_, val) => val && setDiscountType(val)}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1,
                    },
                  }}
                >
                  <ToggleButton value="PERCENTAGE">
                    <Percent sx={{ fontSize: 16, mr: 0.5 }} />
                    Porcentaje (%)
                  </ToggleButton>
                  <ToggleButton value="FIXED_AMOUNT">
                    <LocalOffer sx={{ fontSize: 16, mr: 0.5 }} />
                    Monto Fijo (Bs.)
                  </ToggleButton>
                  <ToggleButton value="FREE_DELIVERY">
                    <DeliveryDining sx={{ fontSize: 18, mr: 0.5 }} />
                    Envío Gratis
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Valor del Descuento y Tope Máximo */}
              <Grid container spacing={2}>
                {discountType !== 'FREE_DELIVERY' && (
                  <Grid size={{ xs: 12, sm: discountType === 'PERCENTAGE' ? 6 : 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={discountType === 'PERCENTAGE' ? 'Porcentaje (%) *' : 'Monto de rebaja (Bs.) *'}
                      placeholder={discountType === 'PERCENTAGE' ? 'Ej: 20' : 'Ej: 15'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {discountType === 'PERCENTAGE' ? '%' : 'Bs.'}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}

                {discountType === 'PERCENTAGE' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Tope Máximo (Opcional)"
                      placeholder="Ej: 30"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      helperText="Máximo descuento a otorgar en Bs."
                      InputProps={{
                        endAdornment: <InputAdornment position="end">Bs.</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}
              </Grid>

              {/* Monto Mínimo de Pedido */}
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Monto Mínimo de Compra en Carrito (Opcional)"
                placeholder="Ej: 50"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                helperText="El cliente debe alcanzar este subtotal para aplicar el cupón."
                InputProps={{
                  endAdornment: <InputAdornment position="end">Bs.</InputAdornment>,
                }}
              />

              <Divider sx={{ my: 1 }} />

              {/* Reglas de Uso y Restricciones */}
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                Reglas y Límites de Canje
              </Typography>

              {/* Solo Primera Compra */}
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Solo para la primera compra
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Exclusivo para captar nuevos comensales que nunca hayan hecho un pedido en tu tienda.
                    </Typography>
                  </Box>
                  <Switch
                    checked={firstOrderOnly}
                    onChange={(e) => setFirstOrderOnly(e.target.checked)}
                    color="secondary"
                  />
                </Stack>
              </Paper>

              {/* Límite por Usuario */}
              <FormControl fullWidth size="small">
                <InputLabel>Límite de usos por cliente</InputLabel>
                <Select
                  label="Límite de usos por cliente"
                  value={usagePerUserLimit}
                  onChange={(e) => setUsagePerUserLimit(Number(e.target.value))}
                >
                  <MenuItem value={1}>1 uso por cliente (Estándar)</MenuItem>
                  <MenuItem value={2}>2 usos por cliente</MenuItem>
                  <MenuItem value={3}>3 usos por cliente</MenuItem>
                  <MenuItem value={5}>5 usos por cliente</MenuItem>
                  <MenuItem value={999}>Ilimitado por cliente</MenuItem>
                </Select>
              </FormControl>

              {/* Límite Global de Usos */}
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: hasTotalLimit ? 1.5 : 0 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Límite de usos globales
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ej: Válido para los primeros 100 clientes que canjeen el cupón.
                    </Typography>
                  </Box>
                  <Switch
                    checked={hasTotalLimit}
                    onChange={(e) => setHasTotalLimit(e.target.checked)}
                    color="primary"
                  />
                </Stack>

                {hasTotalLimit && (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Cantidad máxima de canjes disponibles"
                    value={totalUsageLimit}
                    onChange={(e) => setTotalUsageLimit(e.target.value)}
                  />
                )}
              </Paper>

              {/* Tipo de Entrega Válido */}
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de pedido válido</InputLabel>
                <Select
                  label="Tipo de pedido válido"
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                >
                  <MenuItem value="ALL">Válido para Delivery y Retiro en Tienda</MenuItem>
                  <MenuItem value="DELIVERY">Solo pedidos con Delivery</MenuItem>
                  <MenuItem value="PICKUP">Solo retiro en tienda (Para llevar)</MenuItem>
                </Select>
              </FormControl>

              {/* Sucursales Válidas */}
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Sucursales válidas
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allSucursales}
                      onChange={(e) => setAllSucursales(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={600}>Válido en todas las sucursales</Typography>}
                />

                {!allSucursales && (
                  <Stack spacing={0.5} sx={{ mt: 1, pl: 2 }}>
                    {sucursales.map((s) => (
                      <FormControlLabel
                        key={s.codigo}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedSucursales.includes(s.codigo)}
                            onChange={() => toggleSucursal(s.codigo)}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {s.alias || (s.codigo === 0 ? 'Casa Matriz' : `Sucursal #${s.codigo}`)}
                          </Typography>
                        }
                      />
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* Rango de Vigencia */}
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: hasDates ? 1.5 : 0 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Definir fecha y hora de vigencia
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      El cupón se activará y expirará automáticamente en las fechas indicadas.
                    </Typography>
                  </Box>
                  <Switch
                    checked={hasDates}
                    onChange={(e) => setHasDates(e.target.checked)}
                    color="primary"
                  />
                </Stack>

                {hasDates && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="datetime-local"
                        label="Fecha de inicio"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="datetime-local"
                        label="Fecha de expiración"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                )}
              </Paper>

              {/* Descripción */}
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Descripción interna / cliente (Opcional)"
                placeholder="Ej: 20% de descuento por aniversario de la tienda."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Switch Activo */}
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Estado del Cupón
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Puedes pausar el cupón en cualquier momento sin eliminarlo.
                    </Typography>
                  </Box>
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="success"
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Vista Previa del Ticket Cupón */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 2.5,
                bgcolor: '#f8fafc',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                VISTA PREVIA DEL CUPÓN (CARRITO)
              </Typography>

              {/* Ticket de Cupón Estilo Rappi / PedidosYa */}
              <Paper
                elevation={3}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                  color: '#fff',
                  position: 'relative',
                  border: '2px dashed rgba(255, 255, 255, 0.4)',
                  overflow: 'hidden',
                  mb: 2.5,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Chip
                      size="small"
                      label={discountType === 'FREE_DELIVERY' ? 'DELIVERY' : 'DESCUENTO'}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 11,
                        mb: 1,
                      }}
                    />
                    <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                      {previewDiscountText}
                    </Typography>
                  </Box>

                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44, color: '#fff' }}>
                    <ConfirmationNumber sx={{ fontSize: 24 }} />
                  </Avatar>
                </Stack>

                <Box
                  sx={{
                    mt: 2,
                    p: 1.2,
                    bgcolor: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 2,
                    border: '1px dashed rgba(255,255,255,0.5)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                    CÓDIGO DE CANJE:
                  </Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: 2, color: '#fef08a' }}>
                    {code ? code.toUpperCase() : 'TU-CODIGO'}
                  </Typography>
                </Box>

                <Stack spacing={0.5} sx={{ mt: 2, fontSize: 12, opacity: 0.9 }}>
                  {minOrderAmount && (
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      • Pedido mínimo: <strong>Bs. {minOrderAmount}</strong>
                    </Typography>
                  )}
                  {discountType === 'PERCENTAGE' && maxDiscountAmount && (
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      • Tope máximo de rebaja: <strong>Bs. {maxDiscountAmount}</strong>
                    </Typography>
                  )}
                  {firstOrderOnly && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#fde047', fontWeight: 700 }}>
                      • Exclusivo para tu primera compra
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    • Canjes: <strong>{usagePerUserLimit === 1 ? '1 por cliente' : `${usagePerUserLimit} por cliente`}</strong>
                  </Typography>
                  {hasDates && endDate && (
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      • Vence: <strong>{dayjs(endDate).format('DD/MM/YYYY HH:mm')}</strong>
                    </Typography>
                  )}
                </Stack>
              </Paper>

              <Alert severity="info" sx={{ mt: 'auto', borderRadius: 2 }}>
                Los cupones se validan en tiempo real en el checkout antes de emitir la orden de pago.
              </Alert>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} disabled={saving} color="inherit" sx={{ textTransform: 'none', fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving || !code.trim()}
          sx={{ textTransform: 'none', fontWeight: 800, px: 3, borderRadius: 2 }}
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Cupón'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

