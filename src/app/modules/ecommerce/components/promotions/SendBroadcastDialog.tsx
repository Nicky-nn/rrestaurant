import {
  Campaign,
  Close,
  CloudUpload,
  ConfirmationNumber,
  Delete,
  Image as ImageIcon,
  LocalOffer,
  NewReleases,
  NotificationsActive,
  Send,
  Store,
  Storefront,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { gql } from 'graphql-request'
import React, { FC, useMemo, useState } from 'react'
import Swal from 'sweetalert2'

import { getInboxClient } from '../../api/inboxClient'

const SEND_BROADCAST_MUTATION = gql`
  mutation SendBroadcastNotification($input: SendBroadcastInput!) {
    sendBroadcastNotification(input: $input) {
      id
      shop
      sucursal
      type
      title
      message
      imageUrl
      targetUrl
      recipientsCount
      clickCount
      sentAt
    }
  }
`

interface SucursalOption {
  codigo: number
  alias?: string | null
  municipio?: string | null
  direccion?: string | null
}

interface SendBroadcastDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  shopId: string
  sucursales: SucursalOption[]
  initialSucursal?: number | null
}

export const SendBroadcastDialog: FC<SendBroadcastDialogProps> = ({
  open,
  onClose,
  onSuccess,
  shopId,
  sucursales,
  initialSucursal = null,
}) => {
  const [type, setType] = useState<'TIENDA' | 'NOVEDAD' | 'CUPON' | 'PROMO'>('TIENDA')
  const [sucursal, setSucursal] = useState<number | 'ALL'>(initialSucursal ?? 'ALL')
  const [title, setTitle] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [couponCode, setCouponCode] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)

  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]

    if (!file.type.startsWith('image/')) {
      Swal.fire('Formato no válido', 'Por favor selecciona un archivo de imagen válido (.jpg, .png, .webp).', 'warning')
      return
    }

    try {
      setUploadingImage(true)
      const token = localStorage.getItem('accessToken') || ''
      let rawUrl =
        (import.meta as any).env.VITE_ISI_API_INBOX_URL ||
        (import.meta as any).env.ISI_API_INBOX_URL ||
        'https://api-ecommerce.isipaid.net/api'
      if (rawUrl.startsWith('/')) rawUrl = window.location.origin + rawUrl
      const base = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl
      const endpoint = base.endsWith('/api')
        ? `${base}/upload-image?shop=${shopId}&type=promo`
        : `${base}/api/upload-image?shop=${shopId}&type=promo`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Error al subir imagen' }))
        throw new Error(errJson.error || `Error ${res.status}`)
      }

      const data = await res.json()
      if (data?.url) {
        setImageUrl(data.url)
        Swal.fire({
          icon: 'success',
          title: '¡Imagen cargada!',
          text: 'La imagen fue subida y optimizada con éxito en Cloudflare CDN.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (err: any) {
      console.error('[SendBroadcastDialog] Error subiendo imagen:', err)
      Swal.fire('Error al subir imagen', err.message || 'No se pudo subir la imagen al servidor.', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  // Autocompletar sugerencias amigables al cambiar de tipo
  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: 'TIENDA' | 'NOVEDAD' | 'CUPON' | 'PROMO' | null
  ) => {
    if (!newType) return
    setType(newType)
    if (!title || title.startsWith('¡')) {
      if (newType === 'TIENDA') {
        setTitle('¡Visítanos hoy en nuestra tienda!')
        setMessage('Descubre nuestro menú completo y realiza tus pedidos en línea de manera rápida y fácil.')
      } else if (newType === 'NOVEDAD') {
        setTitle('¡Novedades en nuestro menú!')
        setMessage('Hemos agregado nuevos platos deliciosos que no te puedes perder. ¡Pruébalos hoy!')
      } else if (newType === 'CUPON') {
        setTitle('¡Cupón de descuento especial para ti!')
        setMessage('Usa este cupón exclusivo en tu próximo pedido digital.')
        if (!couponCode) setCouponCode('DESCUENTO10')
      } else if (newType === 'PROMO') {
        setTitle('¡Gran promoción por tiempo limitado!')
        setMessage('Aprovecha increíbles precios en tus productos favoritos solo por hoy.')
      }
    }
  }

  // URL destino calculada dinámicamente
  const targetUrlPreview = useMemo(() => {
    const base = `/${shopId}`
    if (sucursal !== 'ALL') {
      return `${base}?sucursal=${sucursal}`
    }
    return base
  }, [shopId, sucursal])

  const selectedSucursalLabel = useMemo(() => {
    if (sucursal === 'ALL') return 'Todas las sucursales'
    const found = sucursales.find((s) => s.codigo === sucursal)
    return found ? (found.alias ? `${found.alias} (#${found.codigo})` : `Sucursal #${found.codigo}`) : `Sucursal #${sucursal}`
  }, [sucursal, sucursales])

  const handleSend = async () => {
    if (!title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Título requerido',
        text: 'Por favor ingresa un título atractivo para la notificación.',
      })
      return
    }

    if (!message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Mensaje requerido',
        text: 'Por favor escribe el contenido de la notificación push.',
      })
      return
    }

    const confirmRes = await Swal.fire({
      title: '¿Emitir notificación push a tus clientes?',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>Tipo:</strong> ${type}</p>
          <p><strong>Destino:</strong> ${selectedSucursalLabel}</p>
          <p><strong>Título:</strong> ${title.trim()}</p>
          <p><strong>Enlace:</strong> <code>${targetUrlPreview}</code></p>
          <p style="color: #64748b; font-size: 12px; margin-top: 10px;">
            ⚠️ Esta notificación se enviará de inmediato a todos los clientes registrados que hayan activado notificaciones en la app web.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar ahora',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    })

    if (!confirmRes.isConfirmed) return

    setSending(true)
    try {
      const client = getInboxClient()
      const res: any = await client.request(SEND_BROADCAST_MUTATION, {
        input: {
          shop: shopId,
          sucursal: sucursal === 'ALL' ? null : sucursal,
          type,
          title: title.trim(),
          message: message.trim(),
          imageUrl: imageUrl.trim() || null,
          couponCode: type === 'CUPON' && couponCode.trim() ? couponCode.trim().toUpperCase() : null,
          customUrl: targetUrlPreview,
        },
      })

      const notif = res?.sendBroadcastNotification
      const recipients = notif?.recipientsCount ?? 0

      Swal.fire({
        icon: 'success',
        title: '¡Notificación enviada!',
        text: `Se emitió exitosamente a ${recipients} cliente(s). Podrás monitorear los clics en tiempo real.`,
        timer: 3500,
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('[SendBroadcastDialog] Error enviando difusión:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar notificación',
        text: err?.message || 'Ocurrió un problema de conexión al emitir la campaña.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: '#0f172a', color: '#fff' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <Campaign />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#fff">
                Nueva Notificación Push / Campaña
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Envía una alerta instantánea a los celulares de tus clientes sin costo
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }} disabled={sending}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Formulario */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              {/* Tipo de Notificación */}
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  TIPO DE CAMPAÑA
                </Typography>
                <ToggleButtonGroup
                  value={type}
                  exclusive
                  onChange={handleTypeChange}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1,
                      border: '1px solid #cbd5e1',
                    },
                  }}
                >
                  <ToggleButton value="TIENDA">
                    <Store sx={{ fontSize: 18, mr: 0.8 }} />
                    Tienda
                  </ToggleButton>
                  <ToggleButton value="NOVEDAD">
                    <NewReleases sx={{ fontSize: 18, mr: 0.8 }} />
                    Novedad
                  </ToggleButton>
                  <ToggleButton value="CUPON">
                    <ConfirmationNumber sx={{ fontSize: 18, mr: 0.8 }} />
                    Cupón
                  </ToggleButton>
                  <ToggleButton value="PROMO">
                    <LocalOffer sx={{ fontSize: 18, mr: 0.8 }} />
                    Promo
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Selector de Sucursal Destino */}
              <FormControl fullWidth size="small">
                <InputLabel id="sucursal-dest-label">Sucursal Destino</InputLabel>
                <Select
                  labelId="sucursal-dest-label"
                  label="Sucursal Destino"
                  value={sucursal}
                  onChange={(e) => setSucursal(e.target.value as any)}
                >
                  <MenuItem value="ALL">
                    <Storefront sx={{ fontSize: 18, mr: 1, color: 'primary.main', verticalAlign: 'middle' }} />
                    <strong>Todas las sucursales</strong> (Recomendado)
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  {sucursales.map((s) => (
                    <MenuItem key={s.codigo} value={s.codigo}>
                      <Storefront sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                      {s.alias || (s.codigo === 0 ? 'Casa Matriz' : `Sucursal #${s.codigo}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Título */}
              <TextField
                fullWidth
                size="small"
                label="Título de la Notificación *"
                placeholder="Ej: ¡Visítanos hoy o pide en línea!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                inputProps={{ maxLength: 70 }}
                helperText={`${title.length}/70 caracteres recomendados`}
              />

              {/* Mensaje */}
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Mensaje o Descripción *"
                placeholder="Escribe el mensaje persuasivo que leerá el cliente en la pantalla de su teléfono..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                inputProps={{ maxLength: 160 }}
                helperText={`${message.length}/160 caracteres`}
              />

              {/* Cupón (si aplica) */}
              {type === 'CUPON' && (
                <TextField
                  fullWidth
                  size="small"
                  label="Código de Cupón"
                  placeholder="Ej: DESCUENTO10, VERANO2026"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  helperText="Este código se incluirá en el mensaje y en la pantalla de la app."
                />
              )}

              {/* Imagen promocional (Subir o URL) */}
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  IMAGEN O BANNER PROMOCIONAL (OPCIONAL)
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <CloudUpload />}
                    disabled={uploadingImage}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    {uploadingImage ? 'Subiendo imagen...' : 'Subir desde mi equipo'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleUploadImageFile}
                    />
                  </Button>

                  {imageUrl && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => setImageUrl('')}
                      sx={{ textTransform: 'none', fontSize: 12 }}
                    >
                      Quitar imagen
                    </Button>
                  )}
                </Stack>

                <TextField
                  fullWidth
                  size="small"
                  label="O pega una URL externa de imagen"
                  placeholder="https://ejemplo.com/banner-promo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  helperText="Se mostrará expandida en notificaciones de Android, Chrome y en la PWA."
                  slotProps={{
                    input: {
                      startAdornment: <ImageIcon sx={{ fontSize: 18, color: '#94a3b8', mr: 1 }} />,
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Vista Previa Móvil */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 2.5,
                bgcolor: '#f1f5f9',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                VISTA PREVIA EN EL CELULAR
              </Typography>

              {/* Mockup de Notificación Push */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: type === 'PROMO' ? '#f59e0b' : type === 'CUPON' ? '#8b5cf6' : '#2563eb',
                      color: '#fff',
                    }}
                  >
                    <NotificationsActive sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        InBox • {type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11 }}>
                        Ahora
                      </Typography>
                    </Stack>

                    <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.3 }}>
                      {title || 'Título de tu notificación'}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#475569', fontSize: 13, mt: 0.3, lineHeight: 1.4 }}>
                      {message || 'Aquí se mostrará el mensaje que escribas para tus clientes.'}
                    </Typography>

                    {type === 'CUPON' && couponCode && (
                      <Box
                        sx={{
                          mt: 1,
                          display: 'inline-block',
                          px: 1.2,
                          py: 0.4,
                          bgcolor: 'rgba(139, 92, 246, 0.1)',
                          border: '1px dashed #8b5cf6',
                          borderRadius: 1.5,
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#7c3aed',
                        }}
                      >
                        🎟️ Cupón: {couponCode}
                      </Box>
                    )}

                    {imageUrl && (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt="Promo preview"
                        onError={(e: any) => {
                          e.target.style.display = 'none'
                        }}
                        sx={{
                          mt: 1.5,
                          width: '100%',
                          maxHeight: 140,
                          objectFit: 'cover',
                          borderRadius: 1.5,
                          border: '1px solid #e2e8f0',
                        }}
                      />
                    )}
                  </Box>
                </Stack>
              </Paper>

              {/* Información del enlace destino */}
              <Box sx={{ mt: 'auto', p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  🔗 Enlace al abrir la notificación:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#2563eb',
                    wordBreak: 'break-all',
                    bgcolor: '#f8fafc',
                    p: 0.8,
                    borderRadius: 1,
                  }}
                >
                  {targetUrlPreview}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', mt: 0.8, display: 'block' }}>
                  Destino: <strong>{selectedSucursalLabel}</strong>. Al hacer clic, el cliente accederá directamente a esta sucursal en el menú.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} disabled={sending} color="inherit" sx={{ textTransform: 'none', fontWeight: 700 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send />}
          onClick={handleSend}
          disabled={sending || !title.trim() || !message.trim()}
          sx={{ textTransform: 'none', fontWeight: 800, px: 3, borderRadius: 2 }}
        >
          {sending ? 'Emitiendo campaña...' : 'Enviar Notificación'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

