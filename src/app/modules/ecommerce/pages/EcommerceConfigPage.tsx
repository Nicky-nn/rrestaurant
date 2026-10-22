import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  CloudUpload,
  Image as ImageIcon,
  Movie as MovieIcon,
  Refresh,
  Save,
  VideoLibrary,
} from '@mui/icons-material'
import { gql } from 'graphql-request'
import React, { FC, useEffect, useState } from 'react'
import Swal from 'sweetalert2'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../base/hooks/useAuth'
import { getInboxClient } from '../api/inboxClient'
import { ecommerceRoutesMap } from '../ecommerceRoutes'

const GET_SHOP_CONFIG = gql`
  query GetShopEcommerceConfig($id: String!) {
    shop(id: $id) {
      id
      nombre
      logo {
        variants {
          public
        }
      }
      ecommerceConfig {
        videoUrl
        videoHorizontalUrl
        bannerUrl
        infoAdicional
        tags
        puntosActivos
        puntosEquivalenciaBs
        puntosMinimoCompra
        porcentajeMaximoPagoPuntos
      }
    }
  }
`

const UPDATE_ECOMMERCE_CONFIG = gql`
  mutation UpdateEcommerceConfig($shop: String!, $config: EcommerceConfigInput!) {
    updateEcommerceConfig(shop: $shop, config: $config) {
      videoUrl
      videoHorizontalUrl
      bannerUrl
      infoAdicional
      tags
      puntosActivos
      puntosEquivalenciaBs
      puntosMinimoCompra
      porcentajeMaximoPagoPuntos
    }
  }
`

interface FormState {
  bannerUrl: string
  videoUrl: string
  videoHorizontalUrl: string
  infoAdicional: string
  tagsText: string
  puntosActivos: boolean
  puntosEquivalenciaBs: string
  puntosMinimoCompra: string
  porcentajeMaximoPagoPuntos: string
}

const defaultForm: FormState = {
  bannerUrl: '',
  videoUrl: '',
  videoHorizontalUrl: '',
  infoAdicional: '',
  tagsText: '',
  puntosActivos: false,
  puntosEquivalenciaBs: '10',
  puntosMinimoCompra: '50',
  porcentajeMaximoPagoPuntos: '50',
}

const EcommerceConfigPage: FC = () => {
  const { user } = useAuth()
  const shopId =
    typeof user?.miEmpresa === 'string'
      ? user.miEmpresa
      : user?.miEmpresa?.tienda || 'sandbox'

  const [form, setForm] = useState<FormState>(defaultForm)
  const [shopName, setShopName] = useState<string>('')
  const [shopLogo, setShopLogo] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // Subida de imagen de Banner a Cloudflare Images
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [uploadingBanner, setUploadingBanner] = useState<boolean>(false)

  // Subida de video con compresión FFmpeg
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoTarget, setVideoTarget] = useState<'horizontal' | 'cuadrado'>('horizontal')
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false)
  const [compressionResult, setCompressionResult] = useState<{
    originalMB: number
    compressedMB: number
    url: string
  } | null>(null)

  const getApiBase = () => {
    let rawUrl =
      import.meta.env.VITE_ISI_API_INBOX_URL ||
      import.meta.env.ISI_API_INBOX_URL ||
      'https://api-ecommerce.isipaid.net/api'
    if (rawUrl.startsWith('/')) {
      rawUrl = window.location.origin + rawUrl
    }
    return rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl
  }

  const getVideoUploadEndpoint = () => {
    const base = getApiBase()
    return base.endsWith('/api') ? `${base}/upload-video` : `${base}/api/upload-video`
  }

  const getImageUploadEndpoint = () => {
    const base = getApiBase()
    return base.endsWith('/api') ? `${base}/upload-image` : `${base}/api/upload-image`
  }

  // Cargar configuración actual
  const loadConfig = async () => {
    try {
      setLoading(true)
      const client = getInboxClient()
      const data: any = await client.request(GET_SHOP_CONFIG, { id: shopId })

      if (data?.shop) {
        setShopName(data.shop.nombre || shopId)
        setShopLogo(data.shop.logo?.variants?.public || '')
        const cfg = data.shop.ecommerceConfig || {}
        setForm({
            bannerUrl: cfg.bannerUrl || '',
            videoUrl: cfg.videoUrl || '',
            videoHorizontalUrl: cfg.videoHorizontalUrl || '',
            infoAdicional: cfg.infoAdicional || '',
            tagsText: Array.isArray(cfg.tags) ? cfg.tags.join(', ') : '',
            puntosActivos: Boolean(cfg.puntosActivos),
            puntosEquivalenciaBs: cfg.puntosEquivalenciaBs?.toString() || '10',
            puntosMinimoCompra: cfg.puntosMinimoCompra?.toString() || '50',
            porcentajeMaximoPagoPuntos: cfg.porcentajeMaximoPagoPuntos?.toString() || '50',
        })
      }
    } catch (err: any) {
      console.error('Error cargando configuración de e-commerce:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (shopId) {
      loadConfig()
    }
  }, [shopId])

  // Subir imagen de banner directamente a Cloudflare Images
  const handleUploadBanner = async () => {
    if (!bannerFile) {
      Swal.fire('Atención', 'Por favor selecciona un archivo de imagen primero', 'warning')
      return
    }

    const token = localStorage.getItem('accessToken') || ''
    const endpoint = `${getImageUploadEndpoint()}?shop=${shopId}&type=banner`

    try {
      setUploadingBanner(true)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': bannerFile.type || 'image/jpeg',
        },
        body: bannerFile,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      setForm((prev) => ({ ...prev, bannerUrl: result.url }))
      setBannerFile(null)

      // Auto-guardar inmediatamente en el backend
      try {
        const tagsArray = form.tagsText
          ? form.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
          : []
        const client = getInboxClient()
        await client.request(UPDATE_ECOMMERCE_CONFIG, {
          shop: shopId,
          config: {
            bannerUrl: result.url || null,
            videoUrl: form.videoUrl || null,
            videoHorizontalUrl: form.videoHorizontalUrl || null,
            infoAdicional: form.infoAdicional || null,
            tags: tagsArray.length > 0 ? tagsArray : null,
            puntosActivos: form.puntosActivos,
            puntosEquivalenciaBs: form.puntosEquivalenciaBs ? parseFloat(form.puntosEquivalenciaBs) : null,
            puntosMinimoCompra: form.puntosMinimoCompra ? parseFloat(form.puntosMinimoCompra) : null,
            porcentajeMaximoPagoPuntos: form.porcentajeMaximoPagoPuntos ? parseFloat(form.porcentajeMaximoPagoPuntos) : null,
          },
        })
      } catch (autoSaveErr) {
        console.warn('Error auto-guardando banner:', autoSaveErr)
      }

      Swal.fire({
        icon: 'success',
        title: '¡Banner Subido a Cloudflare Images!',
        text: `Imagen alojada con éxito en Cloudflare Images CDN (${result.sizeKB} KB).`,
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err: any) {
      console.error('Error al subir banner:', err)
      Swal.fire('Error al subir imagen', err.message || 'Verifica permisos de administrador en Redis/Isicore', 'error')
    } finally {
      setUploadingBanner(false)
    }
  }

  // Subir video y comprimir en el servidor con FFmpeg
  const handleUploadVideo = async () => {
    if (!videoFile) {
      Swal.fire('Atención', 'Por favor selecciona un archivo de video primero', 'warning')
      return
    }

    const token = localStorage.getItem('accessToken') || ''
    const endpoint = `${getVideoUploadEndpoint()}?shop=${shopId}&target=${videoTarget}`

    try {
      setUploadingVideo(true)
      setCompressionResult(null)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': videoFile.type || 'video/mp4',
        },
        body: videoFile,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      setCompressionResult(result)

      const newVideoHorizontal = videoTarget === 'horizontal' ? result.url : form.videoHorizontalUrl
      const newVideoSquare = videoTarget === 'cuadrado' ? result.url : form.videoUrl

      setForm((prev) => ({
        ...prev,
        videoHorizontalUrl: newVideoHorizontal,
        videoUrl: newVideoSquare,
      }))
      setVideoFile(null)

      // Auto-guardar inmediatamente en el backend para que persista al recargar
      try {
        const tagsArray = form.tagsText
          ? form.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
          : []
        const client = getInboxClient()
        await client.request(UPDATE_ECOMMERCE_CONFIG, {
          shop: shopId,
          config: {
            bannerUrl: form.bannerUrl || null,
            videoUrl: newVideoSquare || null,
            videoHorizontalUrl: newVideoHorizontal || null,
            infoAdicional: form.infoAdicional || null,
            tags: tagsArray.length > 0 ? tagsArray : null,
            puntosActivos: form.puntosActivos,
            puntosEquivalenciaBs: form.puntosEquivalenciaBs ? parseFloat(form.puntosEquivalenciaBs) : null,
            puntosMinimoCompra: form.puntosMinimoCompra ? parseFloat(form.puntosMinimoCompra) : null,
            porcentajeMaximoPagoPuntos: form.porcentajeMaximoPagoPuntos ? parseFloat(form.porcentajeMaximoPagoPuntos) : null,
          },
        })
      } catch (autoSaveErr) {
        console.warn('Error auto-guardando video en GraphQL:', autoSaveErr)
      }

      const reductionPct = Math.round(
        ((result.originalMB - result.compressedMB) / result.originalMB) * 100
      )

      Swal.fire({
        icon: 'success',
        title: '¡Video Comprimido, Subido y Guardado!',
        html: `
          <p>Tu video fue comprimido con <strong>FFmpeg</strong>, subido a MinIO y <strong>guardado automáticamente</strong> en la configuración de la tienda.</p>
          <div style="margin-top: 10px; font-size: 14px; text-align: left; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div>📦 <strong>Original:</strong> ${result.originalMB} MB</div>
            <div>⚡ <strong>Comprimido:</strong> ${result.compressedMB} MB</div>
            <div>📉 <strong>Ahorro:</strong> -${reductionPct}% de peso</div>
          </div>
        `,
      })
    } catch (err: any) {
      console.error('Error al subir video:', err)
      Swal.fire('Error al subir video', err.message || 'Verifica permisos de administrador en Redis/Isicore', 'error')
    } finally {
      setUploadingVideo(false)
    }
  }

  // Guardar configuración completa en el backend
  const handleSave = async () => {
    try {
      setSaving(true)

      const tagsArray = form.tagsText
        ? form.tagsText
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []

      const configInput = {
        bannerUrl: form.bannerUrl || null,
        videoUrl: form.videoUrl || null,
        videoHorizontalUrl: form.videoHorizontalUrl || null,
        infoAdicional: form.infoAdicional || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        puntosActivos: form.puntosActivos,
        puntosEquivalenciaBs: form.puntosEquivalenciaBs
          ? parseFloat(form.puntosEquivalenciaBs)
          : null,
        puntosMinimoCompra: form.puntosMinimoCompra
          ? parseFloat(form.puntosMinimoCompra)
          : null,
        porcentajeMaximoPagoPuntos: form.porcentajeMaximoPagoPuntos
          ? parseFloat(form.porcentajeMaximoPagoPuntos)
          : null,
      }

      const client = getInboxClient()
      await client.request(UPDATE_ECOMMERCE_CONFIG, {
        shop: shopId,
        config: configInput,
      })

      Swal.fire({
        icon: 'success',
        title: 'Configuración Guardada',
        text: 'La configuración de la tienda online se actualizó correctamente.',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (err: any) {
      console.error('Error guardando configuración:', err)
      Swal.fire(
        'Error',
        err.message || 'No se pudo guardar la configuración. Revisa tus permisos.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <SimpleContainerBox>
      <div className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: 'Ecommerce', path: ecommerceRoutesMap.ecommerce.path },
            { name: 'Configuración de Tienda' },
          ]}
        />
      </div>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>
            Configuración E-commerce: {shopName || shopId}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Sube tu banner a Cloudflare Images, videos con compresión FFmpeg a MinIO e información de tienda.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadConfig}
            disabled={loading}
            sx={{ borderRadius: '8px' }}
          >
            Recargar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSave}
            disabled={saving || loading}
            sx={{ borderRadius: '8px', px: 3, fontWeight: 600 }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* 1. SECCIÓN: SUBIDA DE BANNER A CLOUDFLARE IMAGES */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '12px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <ImageIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Banner de Portada (Cloudflare Images CDN)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  Sube tu imagen de portada a Cloudflare Images. Se distribuirá a través de la red global de Cloudflare para carga ultra rápida.
                </Typography>

                {shopLogo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Box component="img" src={shopLogo} alt="Logo" sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'contain', border: '1px solid #e2e8f0' }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                        {shopName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Logo oficial sincronizado de Isipass
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Subir archivo de imagen a Cloudflare Images */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{ flexGrow: 1, borderRadius: '8px', textTransform: 'none' }}
                  >
                    {bannerFile ? bannerFile.name : 'Seleccionar Imagen (.jpg, .png, .webp)'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setBannerFile(e.target.files[0])
                        }
                      }}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      uploadingBanner ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <CloudUpload />
                      )
                    }
                    onClick={handleUploadBanner}
                    disabled={!bannerFile || uploadingBanner}
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {uploadingBanner ? 'Subiendo a Cloudflare...' : 'Subir a Cloudflare'}
                  </Button>
                </Stack>

                {form.bannerUrl ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Vista previa del Banner activo:
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 180,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#000',
                      }}
                    >
                      <Box
                        component="img"
                        src={form.bannerUrl}
                        alt="Vista previa banner"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block', wordBreak: 'break-all' }}>
                      URL Cloudflare CDN: {form.bannerUrl}
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '8px' }}>
                    Selecciona una imagen y presiona <strong>Subir a Cloudflare</strong> para asignarla como banner.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 2. SECCIÓN: SUBIDA Y COMPRESIÓN DE VIDEO CON FFMPEG */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '12px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <MovieIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Subir Video (Compresión FFmpeg a MinIO)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  Sube cualquier video (hasta 150MB). El servidor lo comprime con <strong>FFmpeg</strong> y lo almacena en el servidor MinIO.
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                    ¿Para qué tipo de vista es este video?
                  </Typography>
                  <RadioGroup
                    row
                    value={videoTarget}
                    onChange={(e) => setVideoTarget(e.target.value as any)}
                  >
                    <FormControlLabel
                      value="horizontal"
                      control={<Radio size="small" />}
                      label="Horizontal (16:9 - Cabecera)"
                    />
                    <FormControlLabel
                      value="cuadrado"
                      control={<Radio size="small" />}
                      label="Cuadrado (1:1 - Tradicional)"
                    />
                  </RadioGroup>
                </FormControl>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<VideoLibrary />}
                    sx={{ flexGrow: 1, borderRadius: '8px', textTransform: 'none' }}
                  >
                    {videoFile ? videoFile.name : 'Seleccionar Video (.mp4 / .mov)'}
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setVideoFile(e.target.files[0])
                        }
                      }}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={
                      uploadingVideo ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <CloudUpload />
                      )
                    }
                    onClick={handleUploadVideo}
                    disabled={!videoFile || uploadingVideo}
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  >
                    {uploadingVideo ? 'Comprimiendo...' : 'Procesar con FFmpeg'}
                  </Button>
                </Stack>

                {uploadingVideo && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                    Comprimiendo video con FFmpeg en el backend y guardando en MinIO...
                  </Alert>
                )}

                {compressionResult && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
                    ¡Comprimido y subido a MinIO! De <strong>{compressionResult.originalMB} MB</strong> a solo <strong>{compressionResult.compressedMB} MB</strong>.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 3. SECCIÓN: VIDEOS ACTIVOS */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Videos Alojados en Servidor MinIO
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  Previsualización de los videos alojados en MinIO optimizados para la tienda online.
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Video Horizontal (16:9 - Cabecera / Banner)"
                      value={form.videoHorizontalUrl}
                      onChange={(e) => setForm({ ...form, videoHorizontalUrl: e.target.value })}
                      helperText="Este video se reproduce en la cabecera panorámica de la tienda"
                      sx={{ mb: 2 }}
                    />
                    {form.videoHorizontalUrl && (
                      <Box sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden', bgcolor: '#000' }}>
                        <video
                          src={form.videoHorizontalUrl}
                          controls
                          muted
                          style={{ width: '100%', maxHeight: 200, display: 'block' }}
                        />
                      </Box>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Video Cuadrado (1:1 - Tradicional)"
                      value={form.videoUrl}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      helperText="Video cuadrado original conservado para retrocompatibilidad"
                      sx={{ mb: 2 }}
                    />
                    {form.videoUrl && (
                      <Box sx={{ width: '100%', borderRadius: '8px', overflow: 'hidden', bgcolor: '#000' }}>
                        <video
                          src={form.videoUrl}
                          controls
                          muted
                          style={{ width: '100%', maxHeight: 200, display: 'block' }}
                        />
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 4. SECCIÓN: INFORMACIÓN ADICIONAL Y PROGRAMA DE PUNTOS */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '12px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Información Comercial
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  Datos que verán tus clientes en el ecommerce.
                </Typography>

                <TextField
                  fullWidth
                  label="Tags / Especialidades (separados por coma)"
                  placeholder="Hamburguesas, Parrillada, Comida rápida"
                  value={form.tagsText}
                  onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Información Adicional / Horarios"
                  placeholder="Ej: Abrimos todos los días. Delivery propio hasta el 4to anillo."
                  value={form.infoAdicional}
                  onChange={(e) => setForm({ ...form, infoAdicional: e.target.value })}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: '12px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Programa de Puntos de Lealtad
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.puntosActivos}
                        onChange={(e) => setForm({ ...form, puntosActivos: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={form.puntosActivos ? 'Activo' : 'Inactivo'}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  Premia a tus clientes frecuentes con puntos canjeables en sus pedidos.
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Equivalencia"
                      value={form.puntosEquivalenciaBs}
                      disabled={!form.puntosActivos}
                      onChange={(e) => setForm({ ...form, puntosEquivalenciaBs: e.target.value })}
                      helperText="Puntos por 1 Bs"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Compra Mínima (Bs)"
                      value={form.puntosMinimoCompra}
                      disabled={!form.puntosActivos}
                      onChange={(e) => setForm({ ...form, puntosMinimoCompra: e.target.value })}
                      helperText="Para ganar puntos"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Máx Pago con Puntos (%)"
                      value={form.porcentajeMaximoPagoPuntos}
                      disabled={!form.puntosActivos}
                      onChange={(e) =>
                        setForm({ ...form, porcentajeMaximoPagoPuntos: e.target.value })
                      }
                      helperText="Porcentaje del pedido"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Botón inferior de Guardar */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadConfig}
                disabled={loading}
                sx={{ borderRadius: '8px' }}
              >
                Descartar / Recargar
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={saving || loading}
                sx={{ borderRadius: '8px', px: 4, py: 1.5, fontWeight: 700, fontSize: 16 }}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios de Tienda'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </SimpleContainerBox>
  )
}

export default EcommerceConfigPage
