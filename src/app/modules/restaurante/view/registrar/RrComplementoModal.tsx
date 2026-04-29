import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Fragment, FunctionComponent, useEffect, useRef, useState } from 'react'

import useAuth from '../../../../base/hooks/useAuth'
import { articuloToArticuloOperacionInputService } from '../../../../base/services/articuloToArticuloOperacionInputService'
import { useArticuloComposicionVenta } from '../../queries/useArticuloComposicionVenta'
import {
  Articulo,
  ArticuloModificadorOpcionOperacion,
  ArticuloModificadorOperacionInput,
  ArticuloRecetaIngredienteOperacion,
  ArticuloRecetaOperacionInput,
} from '../../types'
import RrNotasRapidas, { guardarUsoNotasLocal } from './RrNotasRapidas'

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RrComplementoModalProps {
  open: boolean
  onClose: () => void
  articulo: Articulo
  onAdd?: (payload: {
    articulo: Articulo
    cantidad: number
    notasIds: string[]
    /** Variaciones de receta: ingredientes removidos y/o extras */
    variacionReceta: ArticuloRecetaOperacionInput[]
    /** Modificadores seleccionados para enviar al servidor */
    modificadoresInput: ArticuloModificadorOperacionInput[]
    /** Precio unitario con modificadores y receta extra incluidos */
    precioUnitario: number
  }) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPrecio = (art: Articulo): number => art.articuloPrecioBase?.monedaPrimaria?.precio ?? 0

const getSigla = (art: Articulo): string => art.articuloPrecioBase?.monedaPrimaria?.moneda?.sigla ?? 'Bs'

/** Precio según UM específica; busca en articuloPrecioBase y articuloPrecio[]; fallback a articuloPrecioBase */
const getPrecioParaUM = (art: Articulo, codigoUM?: string): number => {
  if (!codigoUM) return getPrecio(art)
  if (art.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida === codigoUM) {
    return art.articuloPrecioBase.monedaPrimaria?.precio ?? 0
  }
  const found = (art.articuloPrecio ?? []).find(
    (ap) => ap.articuloUnidadMedida?.codigoUnidadMedida === codigoUM,
  )
  return found?.monedaPrimaria?.precio ?? getPrecio(art)
}

// ─── Selección de modificador: "gIdx::oIdx" → cantidad ────────────────────────
// Clave compuesta por índice de grupo + índice de opción dentro del grupo.
// NO usar articuloId: cuando un mismo artículo aparece con distintas UM (ej. PAP-01 Regular/Grande/XL)
// todos compartirían la misma clave y un clic activaría todas.

type ModificadorSeleccion = Record<string, number>

const mkKey = (gIdx: number, oIdx: number) => `${gIdx}::${oIdx}`

// ─── Stepper inline para cantidad ─────────────────────────────────────────────

interface StepperProps {
  qty: number
  onIncrement: () => void
  onDecrement: () => void
  maxReached?: boolean
  colorName?: 'primary' | 'secondary'
}

const QtyStepperInline: FunctionComponent<StepperProps> = ({
  qty,
  onIncrement,
  onDecrement,
  maxReached,
  colorName = 'primary',
}) => {
  if (qty === 0) {
    // Solo botón "+" para agregar
    return (
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation()
          onIncrement()
        }}
        disabled={maxReached}
        sx={{
          width: 28,
          height: 28,
          bgcolor: maxReached
            ? 'action.disabledBackground'
            : (theme) => alpha(theme.palette[colorName].main, 0.1),
          color: maxReached ? 'action.disabled' : `${colorName}.main`,
          borderRadius: 1.5,
          '&:hover': {
            bgcolor: maxReached ? undefined : (theme) => alpha(theme.palette[colorName].main, 0.2),
          },
          '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
          flexShrink: 0,
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 0.5,
        boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
        flexShrink: 0,
      }}
    >
      <Box
        component="button"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          onDecrement()
        }}
        sx={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          bgcolor: (theme) => alpha(theme.palette[colorName].main, 0.1),
          color: `${colorName}.main`,
          borderRadius: 1.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: (theme) => alpha(theme.palette[colorName].main, 0.2) },
          p: 0,
        }}
      >
        <RemoveIcon sx={{ fontSize: 16 }} />
      </Box>

      <Typography
        variant="body2"
        fontWeight={700}
        color={`${colorName}.main`}
        sx={{ minWidth: 16, textAlign: 'center', px: 0.5, lineHeight: 1 }}
      >
        {qty}
      </Typography>

      <Box
        component="button"
        disabled={maxReached}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          onIncrement()
        }}
        sx={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          bgcolor: maxReached ? 'action.disabledBackground' : `${colorName}.main`,
          color: maxReached ? 'action.disabled' : `${colorName}.contrastText`,
          borderRadius: 1.5,
          cursor: maxReached ? 'default' : 'pointer',
          '&:hover': { bgcolor: maxReached ? undefined : `${colorName}.dark` },
          p: 0,
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const RrComplementoModal: FunctionComponent<RrComplementoModalProps> = ({
  open,
  onClose,
  articulo,
  onAdd,
}) => {
  const { user } = useAuth()
  const codigoSucursal = user.sucursal.codigo
  const containerRef = useRef<HTMLDivElement>(null)

  const esReceta = Boolean(articulo.esReceta)
  const tieneModificadores = Boolean(articulo.tieneModificadores)

  // ── Estado local ──────────────────────────────────────────────────────────
  // Para receta: ingredientes removidos o con extra
  const [ingredientesRemovidos, setIngredientesRemovidos] = useState<Set<string>>(new Set())
  const [ingredientesExtra, setIngredientesExtra] = useState<Record<string, number>>({})

  // Para modificadores: mapa {articuloId: cantidad}
  const [modificadorSeleccion, setModificadorSeleccion] = useState<ModificadorSeleccion>({})
  // Orden de selección: el primero en este array consume el cupo gratuito
  const [modificadorOrden, setModificadorOrden] = useState<string[]>([])

  // Notas: siempre vacío al abrir; LS solo ordena por uso
  const [selectedNotas, setSelectedNotas] = useState<Set<string>>(new Set())
  const [cantidad, setCantidad] = useState(1)
  const [iconLoaded, setIconLoaded] = useState(false)

  // ── Reset completo al abrir (cada artículo es independiente) ─────────────
  useEffect(() => {
    if (open) {
      setIngredientesRemovidos(new Set())
      setIngredientesExtra({})
      setModificadorSeleccion({})
      setModificadorOrden([])
      setSelectedNotas(new Set()) // notas siempre vacías al abrir, LS solo ordena
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
    script.onload = () => setIconLoaded(true)
    script.onerror = () => {
      setIconLoaded(false)
      console.error('No se pudo cargar el script de Lordicon')
    }
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  // ── Query composicion venta ───────────────────────────────────────────────
  const { data: composicion, isLoading } = useArticuloComposicionVenta(
    {
      codigoSucursal,
      articuloId: articulo._id ?? '',
      esReceta,
      tieneModificadores,
    },
    { enabled: open && Boolean(articulo._id), staleTime: 0 },
  )
  console.log('composicion', composicion)

  // ── Notas rápidas del tipo de artículo ───────────────────────────────────
  const notas: string[] = articulo.tipoArticulo?.notas ?? []

  // ── Precio base ──────────────────────────────────────────────────────────
  const precioBase = getPrecio(articulo)
  const sigla = getSigla(articulo)

  // ── Precio adicional de modificadores con costo ───────────────────────────
  // Regla:
  //   - elegibleParaGratis: false → siempre paga, nunca consume cupo
  //   - elegibleParaGratis: true → puede consumir cupos gratuitos del grupo
  //     (el campo siempre llega como boolean desde el servidor)
  //   - Los cupos se asignan según el orden de selección (primero en marcar = primero en gratis)
  const precioModificadoresExtra = (composicion?.modificadores ?? []).reduce((accGrupo, grupo, gIdx) => {
    const cuposGratis = (grupo.opcionesGratuitas ?? 0) * cantidad

    // Ancla del grupo: opción base para calcular delta de agrandados
    const anclaOpCalc = (grupo.opciones ?? []).find((o) => o.esOpcionAncla === true)
    const precioAnclaCalc = anclaOpCalc?.articulo
      ? getPrecioParaUM(anclaOpCalc.articulo, anclaOpCalc.articuloUnidadMedida?.codigoUnidadMedida)
      : null
    const tieneAnclaCalc = precioAnclaCalc !== null

    // Todas las opciones seleccionadas, ordenadas por orden de selección
    const opcionesSeleccionadas = (grupo.opciones ?? [])
      .map((op, oIdx) => ({
        artId: mkKey(gIdx, oIdx),
        precio: op.articulo ? getPrecioParaUM(op.articulo, op.articuloUnidadMedida?.codigoUnidadMedida) : 0,
        qty: modificadorSeleccion[mkKey(gIdx, oIdx)] ?? 0,
        elegible: op.elegibleParaGratis === true,
      }))
      .filter((o) => o.qty > 0)
      .sort((a, b) => modificadorOrden.indexOf(a.artId) - modificadorOrden.indexOf(b.artId))

    let costoGrupo = 0
    let cuposRestantes = cuposGratis

    for (const op of opcionesSeleccionadas) {
      if (op.elegible) {
        // Eligible: consume cupos; excedente paga completo
        const gratisQty = Math.min(cuposRestantes, op.qty)
        costoGrupo += op.precio * (op.qty - gratisQty)
        cuposRestantes -= gratisQty
      } else if (tieneAnclaCalc && cuposRestantes > 0) {
        // No eligible + ancla: paga delta (agrandado), consume cupos
        const anclaQty = Math.min(cuposRestantes, op.qty)
        costoGrupo += Math.max(0, op.precio - precioAnclaCalc!) * anclaQty
        costoGrupo += op.precio * (op.qty - anclaQty)
        cuposRestantes -= anclaQty
      } else {
        // No eligible sin ancla o sin cupos: paga completo
        costoGrupo += op.precio * op.qty
      }
    }

    return accGrupo + costoGrupo
  }, 0)

  // ── Precio adicional de ingredientes EXTRA de la receta ────────────────────
  // cantidadBase = porciones ya incluidas en la receta base.
  // Las primeras `cantidadBase` unidades extra NO se cobran (ya están en el precio del plato),
  // a partir de cantidadBase+1 en adelante SÍ se cobra.
  const precioRecetaExtra = (composicion?.receta?.ingredientes ?? []).reduce((acc, ing, idx) => {
    // Misma clave que usa setExtraQty y el render (ing-${idx} como fallback si _id es undefined)
    const artId = ing.articulo?._id ?? `ing-${idx}`
    const qty = ingredientesExtra[artId] ?? 0
    if (qty > 0 && ing.permiteExtra && ing.articulo) {
      const cantidadBase = ing.cantidadBase ?? 0
      const qtyCobrable = Math.max(0, qty - cantidadBase)
      acc += getPrecio(ing.articulo) * qtyCobrable
    }
    return acc
  }, 0)

  const precioTotal = (precioBase + precioModificadoresExtra + precioRecetaExtra) * cantidad

  // ── Handlers: receta ──────────────────────────────────────────────────────
  const toggleRemovido = (artId: string) => {
    setIngredientesRemovidos((prev) => {
      const next = new Set(prev)
      if (next.has(artId)) next.delete(artId)
      else next.add(artId)
      return next
    })
  }

  const setExtraQty = (artId: string, delta: number) => {
    setIngredientesExtra((prev) => {
      const current = prev[artId] ?? 0
      const nextQty = Math.max(0, current + delta)
      if (nextQty === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [artId]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [artId]: nextQty }
    })
  }

  // ── Handlers: modificadores (validación por grupo) ────────────────────────
  const setOpcionQty = (
    gIdx: number,
    oIdx: number,
    delta: number,
    grupoOpciones: ArticuloModificadorOpcionOperacion[],
    maxSeleccion: number,
  ) => {
    const key = mkKey(gIdx, oIdx)
    setModificadorSeleccion((prev) => {
      const current = prev[key] ?? 0
      const next = Math.max(0, current + delta)

      // Verificar límite máximo del GRUPO (no global)
      if (delta > 0 && maxSeleccion > 0) {
        const totalGrupo = grupoOpciones.reduce((s, _op, opIdx) => s + (prev[mkKey(gIdx, opIdx)] ?? 0), 0)
        if (totalGrupo >= maxSeleccion) return prev
      }

      // Actualizar orden de selección
      if (current === 0 && next > 0) {
        // Recién seleccionado: añadir al final del orden
        setModificadorOrden((ord) => (ord.includes(key) ? ord : [...ord, key]))
      } else if (next === 0) {
        // Deseleccionado: quitar del orden
        setModificadorOrden((ord) => ord.filter((id) => id !== key))
      }

      if (next === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: next }
    })
  }

  // ── Validación: grupos obligatorios (minSeleccion > 0) ───────────────────
  const puedeAgregar = (composicion?.modificadores ?? []).every((grupo, gIdx) => {
    const minSel = grupo.minSeleccion ?? 0
    if (minSel === 0) return true
    const total = (grupo.opciones ?? []).reduce(
      (s, _op, oIdx) => s + (modificadorSeleccion[mkKey(gIdx, oIdx)] ?? 0),
      0,
    )
    return total >= minSel * cantidad
  })

  // ── Imagen del artículo ───────────────────────────────────────────────────
  const imagenUrl =
    articulo.imagen?.variants?.medium ??
    articulo.imagen?.variants?.public ??
    articulo.imagen?.variants?.thumbnail ??
    null

  // ── Render ────────────────────────────────────────────────────────────────
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
            }}
          >
            {iconLoaded ? (
              <Box
                ref={containerRef}
                sx={{ width: '60%', maxWidth: 180, aspectRatio: '1/1', mixBlendMode: 'multiply' }}
              >
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore - lord-icon is a custom web component not defined in JSX */}
                <lord-icon
                  src="https://cdn.lordicon.com/elcmkycs.json"
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
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Cargando opciones...
              </Typography>
            </Box>
          ) : (
            <>
              {/* ── Sección: Receta (ingredientes) ─────────────────────────── */}
              {esReceta && composicion?.receta && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    variant="overline"
                    fontWeight={700}
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 1, letterSpacing: '0.1em', fontSize: '0.7rem' }}
                  >
                    Ingredientes — {composicion.receta.nombre}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(composicion.receta.ingredientes ?? []).map(
                      (ing: ArticuloRecetaIngredienteOperacion, idx: number) => {
                        const artId = ing.articulo?._id ?? `ing-${idx}`
                        const nombre = ing.articulo?.nombreArticulo ?? 'Ingrediente'
                        const removido = ingredientesRemovidos.has(artId)
                        const extraQty = ingredientesExtra[artId] ?? 0

                        return (
                          <Fragment key={artId}>
                            {ing.esRemovible && (
                              <Chip
                                label={`Sin ${nombre}`}
                                onClick={() => {
                                  toggleRemovido(artId)
                                  if (extraQty > 0 && !removido) {
                                    setIngredientesExtra((prev) => {
                                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                      const { [artId]: _, ...rest } = prev
                                      return rest
                                    })
                                  }
                                }}
                                variant="outlined"
                                size="medium"
                                sx={{
                                  fontWeight: removido ? 600 : 400,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  borderColor: removido ? 'secondary.main' : 'divider',
                                  color: removido ? 'secondary.main' : 'text.primary',
                                  bgcolor: removido
                                    ? (theme) => alpha(theme.palette.secondary.main, 0.1)
                                    : 'transparent',
                                  '&:hover': {
                                    bgcolor: removido
                                      ? (theme) => alpha(theme.palette.secondary.main, 0.15)
                                      : 'action.hover',
                                  },
                                }}
                              />
                            )}
                            {ing.permiteExtra && (
                              <Box
                                onClick={() => {
                                  setExtraQty(artId, 1)
                                  if (removido) toggleRemovido(artId)
                                }}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  border: '1px solid',
                                  borderColor: extraQty > 0 ? 'secondary.main' : 'divider',
                                  borderRadius: '16px',
                                  pl: 1.5,
                                  pr: extraQty > 0 ? 0.25 : 0.5,
                                  py: 0.25,
                                  bgcolor:
                                    extraQty > 0
                                      ? (theme) => alpha(theme.palette.secondary.main, 0.1)
                                      : 'transparent',
                                  transition: 'all 0.15s ease',
                                  cursor: 'pointer',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: extraQty > 0 ? 600 : 400,
                                    color: extraQty > 0 ? 'secondary.main' : 'text.primary',
                                    fontSize: '0.78rem',
                                    userSelect: 'none',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Extra {nombre}
                                </Typography>
                                <QtyStepperInline
                                  qty={extraQty}
                                  colorName="secondary"
                                  onIncrement={() => {
                                    setExtraQty(artId, 1)
                                    if (removido) toggleRemovido(artId)
                                  }}
                                  onDecrement={() => setExtraQty(artId, -1)}
                                />
                              </Box>
                            )}
                          </Fragment>
                        )
                      },
                    )}
                  </Box>
                </Box>
              )}

              {/* ── Sección: Modificadores ─────────────────────────────────── */}
              {tieneModificadores && (composicion?.modificadores ?? []).length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  {(composicion?.modificadores ?? []).map((grupo, gIdx) => {
                    const esObligatorio = (grupo.minSeleccion ?? 0) > 0
                    const maxSel = (grupo.maxSeleccion ?? 0) * cantidad
                    const grupoOpciones = grupo.opciones ?? []
                    const totalSelGrupo = grupoOpciones.reduce(
                      (s, _op, oIdx) => s + (modificadorSeleccion[mkKey(gIdx, oIdx)] ?? 0),
                      0,
                    )
                    const grupoLleno = maxSel > 0 && totalSelGrupo >= maxSel
                    const minAlcanzado = totalSelGrupo >= (grupo.minSeleccion ?? 0) * cantidad

                    // Ancla del grupo para agrandados
                    const anclaOpDisplay = grupoOpciones.find((o) => o.esOpcionAncla === true)
                    const precioAnclaDisplay = anclaOpDisplay?.articulo
                      ? getPrecioParaUM(
                          anclaOpDisplay.articulo,
                          anclaOpDisplay.articuloUnidadMedida?.codigoUnidadMedida,
                        )
                      : null
                    const tieneAnclaDisplay = precioAnclaDisplay !== null

                    // Cupos cubiertos por gratuidad (eligible) y por ancla (no-eligible con agrandado)
                    const cuposGratisDisplay = (grupo.opcionesGratuitas ?? 0) * cantidad
                    const freeQtyPerArt: Record<string, number> = {}
                    const anclaQtyPerArt: Record<string, number> = {}
                    if (cuposGratisDisplay > 0) {
                      const candidatas = grupoOpciones
                        .map((op, oIdx) => ({
                          artId: mkKey(gIdx, oIdx),
                          qty: modificadorSeleccion[mkKey(gIdx, oIdx)] ?? 0,
                          elegible: op.elegibleParaGratis === true,
                        }))
                        .filter((o) => o.qty > 0)
                        .sort((a, b) => modificadorOrden.indexOf(a.artId) - modificadorOrden.indexOf(b.artId))
                      let restantes = cuposGratisDisplay
                      for (const o of candidatas) {
                        if (restantes <= 0) break
                        if (o.elegible) {
                          const gratisQty = Math.min(restantes, o.qty)
                          freeQtyPerArt[o.artId] = gratisQty
                          restantes -= gratisQty
                        } else if (tieneAnclaDisplay) {
                          const anclaQty = Math.min(restantes, o.qty)
                          anclaQtyPerArt[o.artId] = anclaQty
                          restantes -= anclaQty
                        }
                      }
                    }

                    // Cupos libres (sin asignar) para mostrar en UI
                    const cuposUsadosGrupo =
                      Object.values(freeQtyPerArt).reduce((s, v) => s + v, 0) +
                      Object.values(anclaQtyPerArt).reduce((s, v) => s + v, 0)
                    const cuposLibresGrupo = cuposGratisDisplay - cuposUsadosGrupo

                    return (
                      <Box
                        key={grupo._id ?? gIdx}
                        sx={{ mb: gIdx < (composicion?.modificadores ?? []).length - 1 ? 2.5 : 0 }}
                      >
                        {/* Cabecera del grupo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography
                            variant="overline"
                            fontWeight={700}
                            color={esObligatorio && !minAlcanzado ? 'warning.main' : 'text.secondary'}
                            sx={{ letterSpacing: '0.1em', fontSize: '0.7rem', lineHeight: 1.4 }}
                          >
                            {grupo.nombre}
                          </Typography>

                          {/* Indicadores de reglas */}
                          {esObligatorio && (
                            <Chip
                              label={
                                minAlcanzado
                                  ? `✓ Mín. ${(grupo.minSeleccion ?? 0) * cantidad}`
                                  : `Mín. ${(grupo.minSeleccion ?? 0) * cantidad}`
                              }
                              size="small"
                              color={minAlcanzado ? 'success' : 'warning'}
                              variant={minAlcanzado ? 'filled' : 'outlined'}
                              sx={{ height: 18, fontSize: '0.6rem' }}
                            />
                          )}
                          {maxSel > 0 && (
                            <Chip
                              label={`${totalSelGrupo}/${maxSel}`}
                              size="small"
                              variant="outlined"
                              color={grupoLleno ? 'primary' : 'default'}
                              sx={{ height: 18, fontSize: '0.6rem' }}
                            />
                          )}
                          {(grupo.opcionesGratuitas ?? 0) > 0 && (
                            <Chip
                              label={`${(grupo.opcionesGratuitas ?? 0) * cantidad} gratis`}
                              size="small"
                              color="success"
                              sx={{ height: 18, fontSize: '0.6rem' }}
                            />
                          )}
                        </Box>

                        {/* Opciones: diseño grid de tarjetas sin imagen */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                            gap: 1,
                          }}
                        >
                          {grupoOpciones.map((op: ArticuloModificadorOpcionOperacion, oIdx: number) => {
                            const artId = op.articulo?._id ?? ''
                            const selKey = mkKey(gIdx, oIdx)
                            // nombreOpcion es alias visual; se concatena con nombreArticulo según la arquitectura
                            const nombre = op.nombreOpcion
                              ? `${op.articulo?.nombreArticulo ?? ''} ${op.nombreOpcion}`.trim()
                              : (op.articulo?.nombreArticulo ?? 'Opción')
                            const qty = modificadorSeleccion[selKey] ?? 0
                            const selected = qty > 0
                            const precio = op.articulo
                              ? getPrecioParaUM(op.articulo, op.articuloUnidadMedida?.codigoUnidadMedida)
                              : 0
                            const opSigla = op.articulo ? getSigla(op.articulo) : sigla
                            // Verificar disponibilidad de stock para artículos que verifican stock.
                            // NOTA: lotes está deprecated y siempre llega null desde el servidor,
                            // por eso la verificación se hace exclusivamente por disponible del almacén
                            // (mostrarAlmacenConStock:true → filtra almacenes con disponible > 0).
                            const necesitaVerificarStock = op.articulo?.verificarStock === true
                            const stockCheck = necesitaVerificarStock
                              ? articuloToArticuloOperacionInputService(
                                  op.articulo! as unknown as Parameters<
                                    typeof articuloToArticuloOperacionInputService
                                  >[0],
                                  user.moneda,
                                  {
                                    cantidad: 1,
                                    autoAlmacen: true,
                                    autoLote: false,
                                    mostrarLoteConStock: false,
                                    mostrarAlmacenConStock: true,
                                  },
                                )
                              : null
                            // Sin stock: no hay almacén con disponible > 0
                            const sinStock = necesitaVerificarStock && stockCheck?.almacen === null
                            // Max del grupo alcanzado Y esta opción ya tiene 0 → deshabilitado
                            const maxAlcanzado = grupoLleno && !selected
                            const disabled = maxAlcanzado || sinStock
                            // Cuántas unidades cubiertas por el cupo gratuito del grupo
                            const cubiertoPorGratis = freeQtyPerArt[selKey] ?? 0
                            const esCompletamenteGratis = selected && cubiertoPorGratis >= qty
                            const esParcialmenteGratis =
                              selected && cubiertoPorGratis > 0 && cubiertoPorGratis < qty
                            // Agrandado: no-eligible cubierto por ancla del grupo
                            const cubiertoPorAncla = anclaQtyPerArt[selKey] ?? 0
                            const esDescuentoAncla = cubiertoPorAncla > 0 && op.elegibleParaGratis !== true
                            const precioDisplay =
                              esDescuentoAncla && precioAnclaDisplay !== null
                                ? Math.max(0, precio - precioAnclaDisplay)
                                : precio

                            return (
                              <Box
                                key={selKey}
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  height: 72,
                                  p: 1.5,
                                  border: '2px solid',
                                  borderColor: sinStock
                                    ? 'error.light'
                                    : selected
                                      ? esCompletamenteGratis
                                        ? 'success.main'
                                        : 'primary.main'
                                      : 'divider',
                                  borderRadius: 3,
                                  bgcolor: sinStock
                                    ? (theme) => alpha(theme.palette.error.main, 0.04)
                                    : selected
                                      ? esCompletamenteGratis
                                        ? (theme) => alpha(theme.palette.success.main, 0.08)
                                        : (theme) => alpha(theme.palette.primary.main, 0.06)
                                      : 'background.paper',
                                  transition: 'all 0.15s ease',
                                  opacity: disabled ? 0.5 : 1,
                                  cursor: disabled ? 'not-allowed' : 'pointer',
                                  userSelect: 'none',
                                }}
                                onClick={() => {
                                  if (!disabled) setOpcionQty(gIdx, oIdx, 1, grupoOpciones, maxSel)
                                }}
                              >
                                {/* Fila superior: nombre (izq) + precio (der) */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={selected ? 700 : 500}
                                    color={
                                      selected
                                        ? esCompletamenteGratis
                                          ? 'success.main'
                                          : 'primary.main'
                                        : 'text.primary'
                                    }
                                    sx={{
                                      flex: 1,
                                      lineHeight: 1.25,
                                      overflow: 'hidden',
                                      display: '-webkit-box',
                                      WebkitBoxOrient: 'vertical',
                                      WebkitLineClamp: 2,
                                    }}
                                  >
                                    {nombre}
                                  </Typography>
                                  {/* Precio al lado derecho del nombre */}
                                  {!sinStock && precio > 0 && !esCompletamenteGratis && (
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                      color={
                                        selected
                                          ? esDescuentoAncla
                                            ? 'warning.main'
                                            : 'primary.main'
                                          : 'text.secondary'
                                      }
                                      sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                                    >
                                      {`+${opSigla}${precioDisplay.toFixed(2)}`}
                                    </Typography>
                                  )}
                                </Box>

                                {/* Fila inferior: chips de estado (izq) + stepper (der) */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 0.5,
                                  }}
                                >
                                  {/* Chips de estado */}
                                  <Box
                                    sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', overflow: 'hidden' }}
                                  >
                                    {sinStock ? (
                                      <Chip
                                        label="Sin stock"
                                        size="small"
                                        color="error"
                                        sx={{ height: 18, fontSize: '0.6rem' }}
                                      />
                                    ) : esCompletamenteGratis ? (
                                      <Chip
                                        label="GRATIS"
                                        size="small"
                                        color="success"
                                        sx={{ height: 18, fontSize: '0.6rem' }}
                                      />
                                    ) : (
                                      <>
                                        {esParcialmenteGratis && (
                                          <Chip
                                            label={`${cubiertoPorGratis} gratis`}
                                            size="small"
                                            color="success"
                                            sx={{ height: 18, fontSize: '0.6rem' }}
                                          />
                                        )}
                                        {esDescuentoAncla && precioAnclaDisplay !== null && (
                                          <Chip
                                            label={`-${opSigla}${precioAnclaDisplay.toFixed(2)}`}
                                            size="small"
                                            color="warning"
                                            sx={{
                                              height: 18,
                                              fontSize: '0.6rem',
                                              '& .MuiChip-label': { px: 0.75 },
                                            }}
                                          />
                                        )}
                                        {op.elegibleParaGratis === true && cuposLibresGrupo > 0 && (
                                          <Chip
                                            label="APTO PARA REGALO"
                                            size="medium"
                                            color="warning"
                                            sx={{
                                              height: 18,
                                              fontSize: '0.6rem',
                                              '& .MuiChip-label': { px: 0.75 },
                                            }}
                                          />
                                        )}
                                      </>
                                    )}
                                  </Box>

                                  {/* Stepper compacto */}
                                  <QtyStepperInline
                                    qty={qty}
                                    maxReached={grupoLleno || sinStock}
                                    onIncrement={() => setOpcionQty(gIdx, oIdx, 1, grupoOpciones, maxSel)}
                                    onDecrement={() => setOpcionQty(gIdx, oIdx, -1, grupoOpciones, maxSel)}
                                  />
                                </Box>
                              </Box>
                            )
                          })}
                        </Box>

                        {gIdx < (composicion?.modificadores ?? []).length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    )
                  })}
                </Box>
              )}
            </>
          )}

          {/* ── Notas rápidas ────────────────────────────────────────────────
              selectedNotas siempre empieza vacío al abrir.
              El LS solo ordena las notas (más utilizadas primero),
              no las pre-selecciona. ── */}
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
          {/* Selector de cantidad del pedido */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setCantidad((v) => Math.max(1, v - 1))}
              disabled={cantidad <= 1}
              sx={{ borderRadius: 0, width: 34, height: 34 }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body1" fontWeight={700} sx={{ minWidth: 28, textAlign: 'center', px: 0.5 }}>
              {cantidad}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCantidad((v) => v + 1)}
              sx={{ borderRadius: 0, width: 34, height: 34 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Botón agregar */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={!puedeAgregar}
            onClick={() => {
              guardarUsoNotasLocal(selectedNotas, articulo.tipoArticulo?._id ?? articulo._id)

              if (onAdd) {
                // ── 1. Notas finales: notas rápidas + ingredientes removidos como texto ──
                const notasIdsFinales = Array.from(selectedNotas)
                ;(composicion?.receta?.ingredientes ?? []).forEach((ing) => {
                  const artId = ing.articulo?._id ?? ''
                  if (ingredientesRemovidos.has(artId) && ing.esRemovible && ing.articulo) {
                    notasIdsFinales.push(`Sin ${ing.articulo.nombreArticulo}`)
                  }
                })

                // ── 2. variacionReceta: un item por ingrediente modificado (removido o extra) ──
                const variacionReceta: ArticuloRecetaOperacionInput[] = []
                ;(composicion?.receta?.ingredientes ?? []).forEach((ing, idx) => {
                  // Misma clave que usa setExtraQty: ing._id con fallback a ing-${idx}
                  const artId = ing.articulo?._id ?? `ing-${idx}`
                  const extraQty = ing.permiteExtra ? (ingredientesExtra[artId] ?? 0) : 0
                  const isRemovido = ing.esRemovible ? ingredientesRemovidos.has(artId) : false

                  if (!isRemovido && extraQty === 0) return // sin cambio

                  if (isRemovido) {
                    const baseComp = ing.articulo
                      ? articuloToArticuloOperacionInputService(
                          ing.articulo as unknown as Parameters<
                            typeof articuloToArticuloOperacionInputService
                          >[0],
                          user.moneda,
                          // FIX: autoLote:false — fragmento GQL no incluye detalle.lotes
                          { cantidad: 1, autoAlmacen: true, autoLote: false, mostrarLoteConStock: false },
                        )
                      : null

                    const codigoUmRem =
                      ing.articuloUnidadMedida?.codigoUnidadMedida ??
                      baseComp?.articuloUnidadMedida?.codigoUnidadMedida ??
                      ing.articulo?.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida ??
                      ing.articulo?.articuloPrecio?.find((ap) => ap.articuloUnidadMedida?.codigoUnidadMedida)
                        ?.articuloUnidadMedida?.codigoUnidadMedida ??
                      ''

                    if (!codigoUmRem) {
                      console.warn(
                        '[RrComplementoModal] codigoUm vacío para ingrediente removido',
                        ing.articulo?.codigoArticulo,
                      )
                      return
                    }

                    variacionReceta.push({
                      codigoArticulo: baseComp?.codigoArticulo || ing.articulo?.codigoArticulo || '',
                      codigoAlmacen: baseComp?.almacen?.codigoAlmacen || '0',
                      codigoLote: undefined, // FIX: lote solo aplica en monetanero, no en pedido restaurante
                      articuloPrecio: {
                        codigoArticuloUnidadMedida: codigoUmRem,
                        cantidad: 0, // removido:true → backend exige cantidad estrictamente 0
                        precio: 0,
                        descuento: 0,
                        impuesto: 0,
                      },
                      removido: true,
                      esExtra: false,
                    })
                  }

                  if (extraQty > 0) {
                    const baseComp = ing.articulo
                      ? articuloToArticuloOperacionInputService(
                          ing.articulo as unknown as Parameters<
                            typeof articuloToArticuloOperacionInputService
                          >[0],
                          user.moneda,
                          // FIX: autoLote:false — fragmento GQL no incluye detalle.lotes
                          {
                            cantidad: extraQty,
                            autoAlmacen: true,
                            autoLote: false,
                            mostrarLoteConStock: false,
                          },
                        )
                      : null

                    const codigoUmExtra =
                      ing.articuloUnidadMedida?.codigoUnidadMedida ??
                      baseComp?.articuloUnidadMedida?.codigoUnidadMedida ??
                      ing.articulo?.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida ??
                      ing.articulo?.articuloPrecio?.find((ap) => ap.articuloUnidadMedida?.codigoUnidadMedida)
                        ?.articuloUnidadMedida?.codigoUnidadMedida ??
                      ''

                    if (!codigoUmExtra) {
                      console.warn(
                        '[RrComplementoModal] codigoUm vacío para ingrediente extra',
                        ing.articulo?.codigoArticulo,
                      )
                      return
                    }

                    // Las primeras `cantidadBase` porciones ya están en el precio del plato → precio=0.
                    // A partir de cantidadBase+1 en adelante se cobra el precio unitario.
                    const cantidadBase = ing.cantidadBase ?? 0
                    const precioPorExtra =
                      Math.max(0, extraQty - cantidadBase) > 0 ? getPrecio(ing.articulo!) : 0

                    variacionReceta.push({
                      codigoArticulo: baseComp?.codigoArticulo || ing.articulo?.codigoArticulo || '',
                      codigoAlmacen: baseComp?.almacen?.codigoAlmacen || '0',
                      codigoLote: undefined, // FIX: lote solo aplica en monetanero, no en pedido restaurante
                      articuloPrecio: {
                        codigoArticuloUnidadMedida: codigoUmExtra,
                        cantidad: extraQty,
                        precio: precioPorExtra,
                        descuento: 0,
                        impuesto: 0,
                      },
                      removido: false,
                      esExtra: true,
                    })
                  }
                })

                // ── 3. modificadoresInput: opciones seleccionadas del grupo de modificador ──
                const modificadoresInput: ArticuloModificadorOperacionInput[] = []
                ;(composicion?.modificadores ?? []).forEach((grupo, gIdx) => {
                  // ── Calcular gratuidad POR GRUPO (una sola vez, no por opción) ──────────
                  // Regla backend: esOpcionGratuita:true solo si op.elegibleParaGratis=true
                  // y cabe dentro de los cupos disponibles del grupo.
                  // Cupos se asignan a las opciones elegibles más baratas primero.
                  const cuposGratis = grupo.opcionesGratuitas ?? 0
                  const anclaOpPayload = (grupo.opciones ?? []).find((o) => o.esOpcionAncla === true)
                  const tieneAnclaPayload = anclaOpPayload != null

                  // Asignar cupos a todas las opciones seleccionadas por orden de selección:
                  // eligible consumen cupo como gratis; no-eligible con ancla consumen cupo como agrandado.
                  const todasOrdenadassPayload = (grupo.opciones ?? [])
                    .map((o, oIdxP) => ({
                      artId: mkKey(gIdx, oIdxP),
                      elegible: o.elegibleParaGratis === true,
                      qty: modificadorSeleccion[mkKey(gIdx, oIdxP)] ?? 0,
                    }))
                    .filter((o) => o.qty > 0)
                    .sort((a, b) => modificadorOrden.indexOf(a.artId) - modificadorOrden.indexOf(b.artId))

                  const cuposAsignados = new Map<string, number>()
                  let cuposRestantes = cuposGratis
                  for (const el of todasOrdenadassPayload) {
                    if (cuposRestantes <= 0) break
                    if (el.elegible || tieneAnclaPayload) {
                      const gratuitas = Math.min(el.qty, cuposRestantes)
                      cuposAsignados.set(el.artId, gratuitas)
                      cuposRestantes -= gratuitas
                    }
                  }

                  // ── Construir payload por cada opción seleccionada ────────────────────
                  ;(grupo.opciones ?? []).forEach((op, oIdxP) => {
                    const artId = op.articulo?._id ?? ''
                    const qty = modificadorSeleccion[mkKey(gIdx, oIdxP)] ?? 0
                    if (qty === 0 || !op.articulo) return

                    const baseComp = articuloToArticuloOperacionInputService(
                      op.articulo as unknown as Parameters<typeof articuloToArticuloOperacionInputService>[0],
                      user.moneda,
                      // autoLote:false — el backend de RestPedido.modificadores no acepta codigoLote
                      // (el schema de Mongoose requiere lote.codigoArticulo completo).
                      // El check de sinStock en el render ya impide seleccionar opciones sin stock.
                      { cantidad: qty, autoAlmacen: true, autoLote: false, mostrarLoteConStock: false },
                    )

                    const codigoUm =
                      op.articuloUnidadMedida?.codigoUnidadMedida ??
                      baseComp?.articuloUnidadMedida?.codigoUnidadMedida ??
                      op.articulo.articuloPrecioBase?.articuloUnidadMedida?.codigoUnidadMedida ??
                      op.articulo.articuloPrecio?.find((ap) => ap.articuloUnidadMedida?.codigoUnidadMedida)
                        ?.articuloUnidadMedida?.codigoUnidadMedida ??
                      ''
                    const codigoArt = baseComp?.codigoArticulo || op.articulo.codigoArticulo || ''
                    const codigoAlm = baseComp?.almacen?.codigoAlmacen || '0'

                    // codigoUm es obligatorio; sin él el backend falla. Ignorar la opción si no se resuelve.
                    if (!codigoUm) {
                      console.warn('[RrComplementoModal] codigoUm vacío para', codigoArt, '— opción ignorada')
                      return
                    }

                    const cantGratuita = cuposAsignados.get(mkKey(gIdx, oIdxP)) ?? 0
                    const cantPaga = qty - cantGratuita

                    // Nombre compuesto: alias (nombreOpcion) + nombreArticulo, igual que en el render
                    const nombreCompuesto = op.nombreOpcion
                      ? `${op.articulo.nombreArticulo ?? ''} ${op.nombreOpcion}`.trim()
                      : (op.articulo.nombreArticulo ?? '')

                    if (cantGratuita > 0) {
                      modificadoresInput.push({
                        articuloModificadorId: grupo._id ?? '',
                        codigoArticulo: codigoArt,
                        codigoAlmacen: codigoAlm,
                        // codigoLote omitido: el backend falla cuando lote.codigoArticulo no existe
                        articuloPrecio: {
                          codigoArticuloUnidadMedida: codigoUm,
                          cantidad: cantGratuita,
                          // Precio real: el backend aplica la lógica de gratuidad/ancla con esOpcionGratuita
                          precio: getPrecioParaUM(op.articulo, codigoUm),
                          descuento: 0,
                          impuesto: 0,
                        },
                        esOpcionGratuita: true,
                        // Extra para mostrar el nombre en el carrito (no se envía al backend)
                        ...({ nombreArticulo: nombreCompuesto } as any),
                      })
                    }

                    if (cantPaga > 0) {
                      modificadoresInput.push({
                        articuloModificadorId: grupo._id ?? '',
                        codigoArticulo: codigoArt,
                        codigoAlmacen: codigoAlm,
                        // codigoLote omitido: el backend falla cuando lote.codigoArticulo no existe
                        articuloPrecio: {
                          codigoArticuloUnidadMedida: codigoUm,
                          cantidad: cantPaga,
                          precio: getPrecioParaUM(op.articulo, codigoUm),
                          descuento: 0,
                          impuesto: 0,
                        },
                        esOpcionGratuita: false,
                        // Extra para mostrar el nombre en el carrito (no se envía al backend)
                        ...({ nombreArticulo: nombreCompuesto } as any),
                      })
                    }
                  })
                })

                onAdd({
                  articulo,
                  cantidad,
                  notasIds: notasIdsFinales,
                  variacionReceta,
                  modificadoresInput,
                  // Nunca enviar 0: el backend controla gratuidad; aquí solo informamos precio real.
                  precioUnitario:
                    precioBase + precioModificadoresExtra + precioRecetaExtra ||
                    getPrecio(articulo) ||
                    (articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0),
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
            <span>{puedeAgregar ? 'Agregar' : 'Selección requerida'}</span>
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
              {sigla} {precioTotal.toFixed(2)}
            </Box>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default RrComplementoModal
