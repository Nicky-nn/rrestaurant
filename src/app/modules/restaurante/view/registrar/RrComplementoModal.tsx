import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { FunctionComponent, useEffect, useRef, useState } from 'react'

import useAuth from '../../../../base/hooks/useAuth'
import { useArticuloInventarioComplementoListado } from '../../queries/useArticuloInventarioComplementoListado'
import { Articulo, ArticuloComplemento } from '../../types'
import RrNotasRapidas, { guardarUsoNotasLocal } from './RrNotasRapidas'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RrComplementoModalProps {
  open: boolean
  onClose: () => void
  articulo: Articulo
  listaComplemento: ArticuloComplemento[]
  onAdd?: (payload: {
    articulo: Articulo
    cantidad: number
    notasIds: string[]
    complementos: Array<{
      _id: string
      nombre: string
      precio: number
      cantidad: number
      articulo?: Articulo
    }>
  }) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPrecio = (art: Articulo): number => art.articuloPrecioBase?.monedaPrimaria?.precio ?? 0

const formatPrice = (value: number): string => `BOB${value.toFixed(2)}`

// ─── Component ────────────────────────────────────────────────────────────────

const RrComplementoModal: FunctionComponent<RrComplementoModalProps> = ({
  open,
  onClose,
  articulo,
  listaComplemento,
  onAdd,
}) => {
  const { user } = useAuth()
  const codigoSucursal = user.sucursal.codigo
  const codigoPuntoVenta = user.puntoVenta.codigo
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Estado local ──────────────────────────────────────────────────────────
  const [selectedComplementos, setSelectedComplementos] = useState<Record<string, number>>({})
  const [selectedNotas, setSelectedNotas] = useState<Set<string>>(new Set())
  const [cantidad, setCantidad] = useState(1)
  const [iconLoaded, setIconLoaded] = useState(false)

  // ── Reset local state on open ─────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setSelectedComplementos({})
      setSelectedNotas(new Set())
      setCantidad(1)
    }
  }, [open, articulo._id])

  // ── Lordicon script ───────────────────────────────────────────────────────
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]')
    if (existingScript) {
      setIconLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.lordicon.com/lordicon.js'
    script.async = true

    script.onload = () => {
      setIconLoaded(true)
    }

    script.onerror = () => {
      setIconLoaded(false)
      console.error('No se pudo cargar el script de Lordicon')
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // ── Complementos desde API ────────────────────────────────────────────────
  const ids = listaComplemento.map((c) => c.id).filter((id): id is string => Boolean(id))

  const { data: complementos, isLoading: loadingComplementos } = useArticuloInventarioComplementoListado(
    { cds: 1, entidad: { codigoSucursal, codigoPuntoVenta }, ids },
    { enabled: open && ids.length > 0 },
  )

  // ── Notas rápidas — ya vienen en articulo.tipoArticulo.notas (ArticuloFragment) ──
  const notas: string[] = articulo.tipoArticulo?.notas ?? []

  // ── Precio total calculado ────────────────────────────────────────────────
  const precioBase = getPrecio(articulo)
  const precioComplementos = Object.entries(selectedComplementos).reduce((acc, [compId, qty]) => {
    const comp = complementos?.find((c) => c._id === compId)
    return acc + (comp ? getPrecio(comp) * qty : 0)
  }, 0)
  const precioTotal = (precioBase + precioComplementos) * cantidad

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleComplemento = (id: string, remove = false) => {
    setSelectedComplementos((prev) => {
      const next = { ...prev }
      if (remove) {
        if (next[id] > 1) {
          next[id] -= 1
        } else {
          delete next[id]
        }
      } else {
        next[id] = (next[id] || 0) + 1
      }
      return next
    })
  }

  const hasComplementosSelected = Object.keys(selectedComplementos).length > 0

  // ── Imagen del artículo ───────────────────────────────────────────────────
  const imagenUrl =
    articulo.imagen?.variants?.medium ??
    articulo.imagen?.variants?.public ??
    articulo.imagen?.variants?.thumbnail ??
    null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          height: 'auto',
          maxHeight: '90vh',
        },
      }}
    >
      {/* ── Panel izquierdo: imagen ── */}
      <Box
        sx={{
          width: { xs: 0, sm: '40%' },
          display: { xs: 'none', sm: 'block' },
          flexShrink: 0,
          position: 'relative',
          bgcolor: 'grey.200',
          overflow: 'hidden',
        }}
      >
        {imagenUrl ? (
          <Box
            component="img"
            src={imagenUrl}
            alt={articulo.nombreArticulo}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              bgcolor: 'transparent',
            }}
          >
            {iconLoaded ? (
              <Box
                ref={containerRef}
                sx={{ width: '60%', maxWidth: 180, aspectRatio: '1/1', mixBlendMode: 'multiply' }}
              >
                {/* @ts-expect-error - lord-icon is a custom web component not defined in JSX */}
                <lord-icon
                  src="https://cdn.lordicon.com/elcmkycs.json" /* TODO: Cambiar por la URL real del Black Tea 🍵 */
                  trigger="loop"
                  state="hover-pinch"
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            ) : (
              <IconButton disabled>
                <ShoppingCartOutlined sx={{ fontSize: 100 }} />
              </IconButton>
            )}
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontStyle: 'italic', fontSize: '0.68rem', mt: -1 }}
            >
              Sin imagen
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Panel derecho: info + selección ── */}
      <DialogContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          overflow: 'hidden',
        }}
      >
        {/* Cabecera */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3, pr: 1 }}>
            {articulo.nombreArticulo}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Contenido con scroll */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, pb: 2 }}>
          {/* ── Complementos ── */}
          {ids.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="overline"
                fontWeight={700}
                color="text.secondary"
                display="block"
                sx={{ mb: 1, letterSpacing: '0.1em', fontSize: '0.7rem' }}
              >
                Complementos
              </Typography>

              {loadingComplementos ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Cargando...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {/* Opción por defecto: "Sin Complementos" */}
                  <Box
                    onClick={() => setSelectedComplementos({})}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 2,
                      py: 0.75,
                      border: '1px solid',
                      borderColor: !hasComplementosSelected ? 'primary.main' : 'divider',
                      borderRadius: 8, // Aspecto de Chip (pill)
                      cursor: 'pointer',
                      bgcolor: !hasComplementosSelected
                        ? (theme) => alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: !hasComplementosSelected ? 'primary.main' : 'text.disabled',
                        bgcolor: !hasComplementosSelected
                          ? (theme) => alpha(theme.palette.primary.main, 0.15)
                          : 'action.hover',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={!hasComplementosSelected ? 600 : 400}
                      color={!hasComplementosSelected ? 'primary.main' : 'text.primary'}
                    >
                      Sin Complemento
                    </Typography>
                  </Box>

                  {(complementos ?? []).map((comp) => {
                    const compId = comp._id ?? ''
                    const qty = selectedComplementos[compId] || 0
                    const selected = qty > 0
                    const precio = getPrecio(comp)
                    const compImagenUrl =
                      comp.imagen?.variants?.thumbnail ??
                      comp.imagen?.variants?.public ??
                      comp.imagen?.variants?.medium ??
                      null

                    return (
                      <Box
                        key={compId}
                        onClick={() => toggleComplemento(compId, false)}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          toggleComplemento(compId, true)
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          px: 2,
                          py: 0.75,
                          border: '1px solid',
                          borderColor: selected ? 'primary.main' : 'divider',
                          borderRadius: 8, // Aspecto de Chip (pill)
                          cursor: 'pointer',
                          bgcolor: selected
                            ? (theme) => alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                          transition: 'all 0.15s ease',
                          minWidth: 120,
                          '&:hover': {
                            borderColor: selected ? 'primary.main' : 'text.disabled',
                            bgcolor: selected
                              ? (theme) => alpha(theme.palette.primary.main, 0.15)
                              : 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {compImagenUrl && (
                            <Box
                              component="img"
                              src={compImagenUrl}
                              alt={comp.nombreArticulo}
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={selected ? 600 : 400}
                            color={selected ? 'primary.main' : 'text.primary'}
                          >
                            {comp.nombreArticulo}
                            {qty > 1 && (
                              <Typography
                                component="span"
                                sx={{ color: 'primary.main', ml: 0.5, fontWeight: 900, fontSize: '0.8rem' }}
                              >
                                x{qty}
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                        {precio > 0 && (
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color={selected ? 'primary.main' : 'text.secondary'}
                          >
                            +{formatPrice(precio)}
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              )}
            </Box>
          )}

          {/* ── Notas rápidas ── */}
          <RrNotasRapidas
            notasPredefinidas={notas}
            selectedNotas={selectedNotas}
            onChange={setSelectedNotas}
            permitePersonalizada={true}
            storageId={articulo.tipoArticulo?._id ?? articulo._id}
            open={open}
          />
        </Box>

        {/* ── Footer: cantidad + agregar ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Selector de cantidad */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1.5px solid',
              borderColor: 'divider',
              borderRadius: 2,
              px: 0.5,
              py: 0.25,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCantidad((v) => Math.max(1, v - 1))}
              disabled={cantidad <= 1}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body1" fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>
              {cantidad}
            </Typography>
            <IconButton size="small" onClick={() => setCantidad((v) => v + 1)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Botón agregar */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              guardarUsoNotasLocal(selectedNotas, articulo.tipoArticulo?._id ?? articulo._id)
              if (onAdd) {
                const arrComps = Object.entries(selectedComplementos).map(([cId, qty]) => {
                  const compData = complementos?.find((c) => c._id === cId)
                  return {
                    _id: cId,
                    nombre: compData?.nombreArticulo || `Complemento ${cId}`,
                    precio: compData ? getPrecio(compData) : 0,
                    cantidad: qty,
                    articulo: compData,
                  }
                })

                onAdd({
                  articulo,
                  cantidad,
                  notasIds: Array.from(selectedNotas),
                  complementos: arrComps,
                })
              }
              onClose()
            }}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              px: 2.5,
            }}
          >
            <span>Agregar</span>
            <Box
              component="span"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                borderRadius: 1.5,
                px: 1,
                py: 0.25,
                fontSize: '0.9rem',
              }}
            >
              {formatPrice(precioTotal)}
            </Box>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default RrComplementoModal
