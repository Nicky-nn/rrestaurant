import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ClearIcon from '@mui/icons-material/Clear'
import ExtensionIcon from '@mui/icons-material/Extension'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import useAuth from '../../../../base/hooks/useAuth'
import { useHorizontalDragScroll } from '../../../../base/hooks/useHorizontalDragScroll'
import { useArticuloInventarioListado } from '../../queries/useArticuloInventarioListado'
import { Articulo } from '../../types'
import RrComplementoModal from './RrComplementoModal'

dayjs.extend(customParseFormat)

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Algoritmo de Levenshtein y Fuzzy Search ────────────────────────────────────

const levenshtein = (a: string, b: string): number => {
  const an = a ? a.length : 0
  const bn = b ? b.length : 0
  if (an === 0) return bn
  if (bn === 0) return an
  const matrix = new Array<number[]>(bn + 1)
  for (let i = 0; i <= bn; ++i) {
    matrix[i] = new Array<number>(an + 1)
    matrix[i][0] = i
  }
  const firstRow = matrix[0]
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }
  return matrix[bn][an]
}

const isFuzzyMatch = (text: string, query: string): boolean => {
  const t = text.trim().toLowerCase()
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (t.includes(q)) return true

  const textWords = t.split(/[\s,.-]+/)
  const queryWords = q.split(/[\s,.-]+/)

  return queryWords.every((qWord) => {
    if (textWords.some((tWord) => tWord.includes(qWord))) return true
    const maxDist = qWord.length <= 3 ? 0 : qWord.length <= 5 ? 1 : 2
    return textWords.some((tWord) => levenshtein(tWord, qWord) <= maxDist)
  })
}

const parseFecha = (fecha?: string): number => {
  if (!fecha) return 0
  const d = dayjs(fecha, 'DD/MM/YYYY HH:mm:ss', true)
  return d.isValid() ? d.valueOf() : 0
}

const isDisponible = (articulo: Articulo): boolean => {
  if (articulo.verificarStock === true) {
    const total = articulo.inventario?.reduce((acc, inv) => acc + (inv.totalDisponible ?? 0), 0) ?? 0
    return total > 0
  }
  return true
}

const getImagenUrl = (articulo: Articulo): string | null =>
  articulo.imagen?.variants?.thumbnail ??
  articulo.imagen?.variants?.medium ??
  articulo.imagen?.variants?.square ??
  articulo.imagen?.variants?.public ??
  null

// ─── Sort types ───────────────────────────────────────────────────────────────

type SortNombrePrecio = 'ninguno' | 'nombre' | 'precio_asc' | 'precio_desc'
type SortCategoriasOrden = 'recientes' | 'antiguas'
type SortProductosOrden = 'recientes' | 'antiguos'

/** Modo de layout dinámico de la barra de categorías */
type CatBarMode = 'single' | 'double' | 'arrows'

interface SortConfig {
  nombrePrecio: SortNombrePrecio
  categoriasOrden: SortCategoriasOrden
  productosOrden: SortProductosOrden
}

const SORT_DEFAULT: SortConfig = {
  nombrePrecio: 'ninguno',
  categoriasOrden: 'antiguas',
  productosOrden: 'antiguos',
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <Card sx={{ borderRadius: 2 }}>
    <Skeleton variant="rectangular" height={100} />
    <Box sx={{ px: 1, py: 0.75, minHeight: 44 }}>
      <Skeleton variant="text" sx={{ fontSize: '0.78rem' }} />
      <Skeleton variant="text" width="55%" sx={{ fontSize: '0.73rem' }} />
    </Box>
  </Card>
)

// ─── Product card ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  articulo: Articulo
  onClick?: (a: Articulo) => void
  onAddProduct?: (payload: {
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
  /** Si true, oculta el área de imagen (modo compacto para filas sin imágenes) */
  compact?: boolean
}

const ProductCard: FunctionComponent<ProductCardProps> = memo(
  ({ articulo, onClick, onAddProduct, compact = false }) => {
    const [complementoModalOpen, setComplementoModalOpen] = useState(false)
    const listaComplemento = articulo.listaComplemento ?? []
    const tieneComplementos = listaComplemento.length > 0
    const disponible = isDisponible(articulo)
    const imagenUrl = getImagenUrl(articulo)
    const precio = articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0
    const sigla = articulo.articuloPrecioBase?.monedaPrimaria?.moneda?.sigla ?? 'Bs'

    return (
      <>
        <Tooltip
          title={`${articulo.nombreArticulo} - ${sigla} ${precio.toFixed(2)}${!disponible ? ' (AGOTADO)' : ''}`}
          placement="top"
          arrow
          enterDelay={400}
          enterNextDelay={200}
        >
          <Card
            sx={{
              borderRadius: 2,
              opacity: disponible ? 1 : 0.6,
              transition: 'opacity 0.2s, box-shadow 0.2s, transform 0.2s',
              userSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
              // Borde de color secondary cuando el artículo tiene complementos
              border: '2px solid',
              borderColor: tieneComplementos ? 'secondary.main' : 'transparent',
              '&:hover': disponible ? { boxShadow: 6, transform: 'translateY(-3px)' } : {},
            }}
          >
            <CardActionArea
              disabled={!disponible}
              onClick={() => {
                if (!disponible) return
                if (tieneComplementos) {
                  setComplementoModalOpen(true)
                } else {
                  onClick?.(articulo)
                  onAddProduct?.({
                    articulo,
                    cantidad: 1,
                    notasIds: [],
                    complementos: [],
                  })
                }
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                flexGrow: 1,
              }}
            >
              {/* Área de imagen: solo se muestra si no es modo compacto */}
              {!compact && (
                <Box sx={{ position: 'relative', width: '100%', height: 100, flexShrink: 0 }}>
                  {imagenUrl ? (
                    <CardMedia
                      component="img"
                      image={imagenUrl}
                      alt={articulo.nombreArticulo ?? ''}
                      sx={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                      }}
                    >
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                        Sin imagen
                      </Typography>
                    </Box>
                  )}

                  {!disponible && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        textAlign: 'center',
                        py: 0.25,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.4 }}
                      >
                        AGOTADO
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Barra accent primary para cards sin imagen (modo compacto) */}
              {compact && (
                <Box
                  sx={{
                    width: '100%',
                    height: 3,
                    bgcolor: disponible ? 'primary.main' : 'error.main',
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Texto: nombre + precio */}
              <Box
                sx={{
                  px: 1,
                  pt: compact ? 0.75 : 0.5,
                  pb: compact ? 1.25 : 1,
                  flexShrink: 0,
                  minHeight: compact ? 52 : 44,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  gap: 0.25,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.21em', // Altura mínima para 2 líneas
                  }}
                >
                  {articulo.nombreArticulo}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: disponible ? 'text.secondary' : 'error.main',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sigla} {precio.toFixed(2)}
                  {compact && !disponible && (
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.75,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: 'error.main',
                        letterSpacing: 0.5,
                      }}
                    >
                      · AGOTADO
                    </Typography>
                  )}
                </Typography>
              </Box>
            </CardActionArea>

            {/* Badge de complementos — fuera del CardActionArea para no interferir con el click del card */}
            {tieneComplementos && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  zIndex: 2,
                }}
              >
                <Tooltip
                  title={`${listaComplemento.length} complemento${listaComplemento.length !== 1 ? 's' : ''} — click para ver detalles`}
                  arrow
                >
                  <Chip
                    icon={<ExtensionIcon sx={{ fontSize: '0.75rem !important' }} />}
                    label={listaComplemento.length}
                    size="small"
                    color="secondary"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setComplementoModalOpen(true)
                    }}
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      '& .MuiChip-icon': { ml: 0.5 },
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                </Tooltip>
              </Box>
            )}
          </Card>
        </Tooltip>

        {/* Modal en archivo separado RrComplementoModal.tsx */}
        {tieneComplementos && (
          <RrComplementoModal
            open={complementoModalOpen}
            onClose={() => setComplementoModalOpen(false)}
            articulo={articulo}
            listaComplemento={listaComplemento}
            onAdd={onAddProduct}
          />
        )}
      </>
    )
  },
) as FunctionComponent<ProductCardProps>

// ─── Category tab (Box) ────────────────────────────────────────────────────────

interface CategoryTabProps {
  label: string
  selected: boolean
  onClick: () => void
}

const CategoryTab: FunctionComponent<CategoryTabProps> = memo(({ label, selected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flexShrink: 0,
      px: 1.5,
      py: 0.6,
      borderRadius: 2,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontWeight: selected ? 700 : 400,
      fontSize: '0.8rem',
      color: selected ? 'primary.contrastText' : 'text.primary',
      bgcolor: selected ? 'primary.main' : 'action.hover',
      border: '1px solid',
      borderColor: selected ? 'primary.main' : 'divider',
      transition: 'all 0.15s',
      '&:hover': {
        bgcolor: selected ? 'primary.dark' : 'action.selected',
      },
    }}
  >
    {label}
  </Box>
)) as FunctionComponent<CategoryTabProps>

// ─── Main component ────────────────────────────────────────────────────────────

interface RrCategoriasProductosProps {
  espacios?: { _id?: string; descripcion?: string | null; default?: number | null }[]
  espacioSeleccionado?: string | null
  onChangeEspacio?: (espacioId: string | null) => void
  onAddProduct?: (payload: {
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

/**
 * RrCategoriasProductos
 * Panel de categorías y productos del menú.
 * Permite navegar entre categorías y seleccionar productos para agregar al carrito.
 */
const RrCategoriasProductos: FunctionComponent<RrCategoriasProductosProps> = ({
  espacios = [],
  espacioSeleccionado = null,
  onChangeEspacio,
  onAddProduct,
}) => {
  const { user } = useAuth()
  const codigoSucursal = user.sucursal.codigo
  const codigoPuntoVenta = user.puntoVenta.codigo

  const { data: articulos = [], isLoading } = useArticuloInventarioListado({
    cds: 1,
    entidad: { codigoSucursal, codigoPuntoVenta },
    verificarPrecio: true,
    verificarInventario: true,
    query: 'articuloVenta=true',
  })

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null)
  const [searchModalArticulo, setSearchModalArticulo] = useState<Articulo | null>(null)
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null)
  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>(SORT_DEFAULT)
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ── Barra de categorías dinámica ──────────────────────────────────────────
  const [catBarMode, setCatBarMode] = useState<CatBarMode>('single')
  const catMeasureRef = useRef<HTMLDivElement | null>(null)
  const catArrowScrollRef = useRef<HTMLDivElement | null>(null)
  const [catArrowAtStart, setCatArrowAtStart] = useState(true)
  const [catArrowAtEnd, setCatArrowAtEnd] = useState(false)

  // Atajo de teclado: Alt+A enfoca el buscador
  // Usa e.code en lugar de e.key para compatibilidad con Mac (Alt+A genera 'å')
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'KeyA') {
        e.preventDefault()
        e.stopPropagation()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handler, { capture: true })
    return () => window.removeEventListener('keydown', handler, { capture: true })
  }, [])

  const {
    ref: categoriaRef,
    handlers: catHandlers,
    style: catStyle,
  } = useHorizontalDragScroll({
    enableWheelDrag: true,
    inertiaEnabled: true,
    snapEnabled: false,
  })

  // Actualizar estado de flechas
  const updateCatArrowState = useCallback(() => {
    const el = catArrowScrollRef.current
    if (!el) return
    setCatArrowAtStart(el.scrollLeft <= 2)
    setCatArrowAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  const handleCatArrowLeft = useCallback(() => {
    catArrowScrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' })
  }, [])

  const handleCatArrowRight = useCallback(() => {
    catArrowScrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' })
  }, [])

  // ── Categorías únicas ordenadas ────────────────────────────────────────────
  const categorias = useMemo(() => {
    const map = new Map<string, { codigo: string; nombre: string; min: number; max: number }>()
    articulos.forEach((a) => {
      const codigo = a.tipoArticulo?.codigo != null ? String(a.tipoArticulo.codigo) : undefined
      const nombre = a.tipoArticulo?.descripcion
      if (codigo && nombre) {
        const ts = parseFecha(a.createdAt)
        if (!map.has(codigo)) {
          map.set(codigo, { codigo, nombre, min: ts, max: ts })
        } else {
          const entry = map.get(codigo)!
          if (ts > 0 && ts < entry.min) entry.min = ts
          if (ts > entry.max) entry.max = ts
        }
      }
    })
    const list = Array.from(map.values())
    if (sortConfig.categoriasOrden === 'recientes') {
      list.sort((a, b) => b.max - a.max)
    } else {
      list.sort((a, b) => a.min - b.min)
    }
    return list
  }, [articulos, sortConfig.categoriasOrden])

  // Medir altura del div oculto para decidir modo de la barra (aquí ya tenemos categorias)
  useLayoutEffect(() => {
    const measureEl = catMeasureRef.current
    if (!measureEl) return
    const ROW_H = 44 // altura aprox de una fila de pills
    const check = () => {
      const h = measureEl.scrollHeight
      if (h <= ROW_H * 1.5) setCatBarMode('single')
      else if (h <= ROW_H * 2.6) setCatBarMode('double')
      else setCatBarMode('arrows')
    }
    check()
    const obs = new ResizeObserver(check)
    obs.observe(measureEl)
    return () => obs.disconnect()
  }, [categorias])

  // Resetear scroll de flechas al cambiar de modo o categorías
  useEffect(() => {
    if (catBarMode !== 'arrows') return
    const el = catArrowScrollRef.current
    if (el) {
      el.scrollLeft = 0
      updateCatArrowState()
    }
  }, [categorias, catBarMode, updateCatArrowState])

  // Categoría activa: la seleccionada por el usuario, o la primera disponible por defecto
  const categoriaActiva = useMemo(
    () => categoriaSeleccionada ?? categorias[0]?.codigo ?? null,
    [categoriaSeleccionada, categorias],
  )

  // ── Productos filtrados y ordenados (vista normal por categoría) ────────────
  const productosMostrados = useMemo(() => {
    const lista = categoriaActiva
      ? articulos.filter((a) => String(a.tipoArticulo?.codigo) === String(categoriaActiva))
      : [...articulos]

    if (sortConfig.nombrePrecio === 'nombre') {
      lista.sort((a, b) =>
        (a.nombreArticulo ?? '').localeCompare(b.nombreArticulo ?? '', undefined, {
          sensitivity: 'base',
        }),
      )
    } else if (sortConfig.nombrePrecio === 'precio_asc') {
      lista.sort(
        (a, b) =>
          (a.articuloPrecioBase?.monedaPrimaria?.precio ?? 0) -
          (b.articuloPrecioBase?.monedaPrimaria?.precio ?? 0),
      )
    } else if (sortConfig.nombrePrecio === 'precio_desc') {
      lista.sort(
        (a, b) =>
          (b.articuloPrecioBase?.monedaPrimaria?.precio ?? 0) -
          (a.articuloPrecioBase?.monedaPrimaria?.precio ?? 0),
      )
    } else {
      if (sortConfig.productosOrden === 'recientes') {
        lista.sort((a, b) => parseFecha(b.createdAt) - parseFecha(a.createdAt))
      } else {
        lista.sort((a, b) => parseFecha(a.createdAt) - parseFecha(b.createdAt))
      }
    }

    return lista
  }, [articulos, categoriaActiva, sortConfig])

  // ── Resultados de búsqueda agrupados por categoría ──────────────────────────
  const resultadosAgrupados = useMemo(() => {
    const q = searchTerm.trim()
    if (!q) return null
    const grupos = new Map<string, { codigo: string; nombre: string; productos: Articulo[] }>()
    articulos.forEach((a) => {
      if (!isFuzzyMatch(a.nombreArticulo || '', q)) return
      const codigo = a.tipoArticulo?.codigo != null ? String(a.tipoArticulo.codigo) : '__sin__'
      const nombre = a.tipoArticulo?.descripcion ?? 'Sin categoría'
      if (!grupos.has(codigo)) grupos.set(codigo, { codigo, nombre, productos: [] })
      grupos.get(codigo)!.productos.push(a)
    })
    return Array.from(grupos.values())
  }, [articulos, searchTerm])

  const filterOpen = Boolean(filterAnchorEl)
  const isSortModified =
    sortConfig.nombrePrecio !== 'ninguno' ||
    sortConfig.categoriasOrden !== 'antiguas' ||
    sortConfig.productosOrden !== 'antiguos'

  // ── Paginación progresiva con onScroll ────────────────────────────────────
  const ITEMS_POR_PAGINA = 40
  const CARD_MIN_WIDTH = 140
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [columnas, setColumnas] = useState(4)
  const [itemsVisibles, setItemsVisibles] = useState(ITEMS_POR_PAGINA)

  // Medir columnas reales del grid con ResizeObserver
  useEffect(() => {
    if (resizeObserverRef.current) resizeObserverRef.current.disconnect()
    resizeObserverRef.current = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const cols = Math.max(1, Math.floor(entry.contentRect.width / CARD_MIN_WIDTH))
      setColumnas((prev) => (prev !== cols ? cols : prev))
    })
    if (gridRef.current) resizeObserverRef.current.observe(gridRef.current)
    return () => resizeObserverRef.current?.disconnect()
  }, [])

  // Reset al cambiar la lista o las columnas
  useEffect(() => {
    setItemsVisibles(ITEMS_POR_PAGINA)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }, [productosMostrados, columnas])

  // Cargar más al hacer scroll: cuando queden < 400px para el fondo
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 400) {
      setItemsVisibles((prev) => {
        const next = prev + ITEMS_POR_PAGINA
        return next > productosMostrados.length ? productosMostrados.length : next
      })
    }
  }, [productosMostrados.length])

  const productosRenderizados = useMemo(
    () => productosMostrados.slice(0, itemsVisibles),
    [productosMostrados, itemsVisibles],
  )

  const hasMore = productosRenderizados.length < productosMostrados.length

  // Agrupar por filas para detectar si alguno en la fila tiene imagen
  // Si toda la fila carece de imagen → compact=true en esas cards
  const filasMarcadas = useMemo(() => {
    const result: Array<{ articulo: Articulo; compact: boolean }> = []
    for (let i = 0; i < productosRenderizados.length; i += columnas) {
      const fila = productosRenderizados.slice(i, i + columnas)
      const filaConImagen = fila.some((a) => getImagenUrl(a) !== null)
      fila.forEach((a) => result.push({ articulo: a, compact: !filaConImagen }))
    }
    return result
  }, [productosRenderizados, columnas])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Paper
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 1,
      }}
    >
      {/* Fila buscador + iconos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, mb: 0.75 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar producto... (Alt+A)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          inputRef={searchInputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
          }}
        />
        <Tooltip title="Filtros y ordenamiento">
          <IconButton
            size="small"
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            color={isSortModified ? 'primary' : 'default'}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={`Espacio: ${espacioSeleccionado ? (espacios.find((e) => e._id === espacioSeleccionado)?.descripcion ?? 'Espacio') : 'Salón Principal'}`}
        >
          <IconButton size="small" onClick={(e) => setMoreAnchorEl(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Fila de categorías — se oculta mientras hay búsqueda activa */}
      {!searchTerm.trim() && (
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          {/* ── Div oculto para medir altura real con flex-wrap ── */}
          <Box
            ref={catMeasureRef}
            aria-hidden="true"
            sx={{
              position: 'absolute',
              visibility: 'hidden',
              pointerEvents: 'none',
              zIndex: -1,
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
            }}
          >
            {categorias.map((cat) => (
              <CategoryTab key={cat.codigo} label={cat.nombre} selected={false} onClick={() => {}} />
            ))}
          </Box>

          {/* ── Modo 1 fila: drag-scroll horizontal ── */}
          {(catBarMode === 'single' || isLoading) && (
            <Box
              ref={categoriaRef}
              {...catHandlers}
              sx={{
                ...catStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                overflowX: 'auto',
                overflowY: 'hidden',
                pb: 0.5,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                minHeight: 40,
              }}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      width={80}
                      height={32}
                      sx={{ flexShrink: 0, borderRadius: 2 }}
                    />
                  ))
                : categorias.map((cat) => (
                    <CategoryTab
                      key={cat.codigo}
                      label={cat.nombre}
                      selected={String(categoriaActiva) === String(cat.codigo)}
                      onClick={() => setCategoriaSeleccionada(cat.codigo)}
                    />
                  ))}
            </Box>
          )}

          {/* ── Modo 2 filas: flex-wrap ── */}
          {catBarMode === 'double' && !isLoading && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.75,
                pb: 0.5,
                minHeight: 40,
              }}
            >
              {categorias.map((cat) => (
                <CategoryTab
                  key={cat.codigo}
                  label={cat.nombre}
                  selected={String(categoriaActiva) === String(cat.codigo)}
                  onClick={() => setCategoriaSeleccionada(cat.codigo)}
                />
              ))}
            </Box>
          )}

          {/* ── Modo flechas: 1 fila con botones izq/der ── */}
          {catBarMode === 'arrows' && !isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minHeight: 40, pb: 0.5 }}>
              <IconButton
                size="small"
                onClick={handleCatArrowLeft}
                disabled={catArrowAtStart}
                sx={{ flexShrink: 0, p: 0.4 }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              <Box
                ref={catArrowScrollRef}
                onScroll={updateCatArrowState}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  overflowX: 'hidden',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollBehavior: 'smooth',
                }}
              >
                {categorias.map((cat) => (
                  <CategoryTab
                    key={cat.codigo}
                    label={cat.nombre}
                    selected={String(categoriaActiva) === String(cat.codigo)}
                    onClick={() => setCategoriaSeleccionada(cat.codigo)}
                  />
                ))}
              </Box>

              <IconButton
                size="small"
                onClick={handleCatArrowRight}
                disabled={catArrowAtEnd}
                sx={{ flexShrink: 0, p: 0.4 }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ my: 0.75, flexShrink: 0 }} />

      {/* Scroll container */}
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 0.5,
        }}
      >
        {isLoading ? (
          /* Skeleton mientras carga */
          <Box
            ref={gridRef}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 1,
              alignContent: 'start',
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Box>
        ) : resultadosAgrupados !== null ? (
          /* ── Vista de búsqueda: grupos por categoría ── */
          resultadosAgrupados.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron productos para &ldquo;{searchTerm}&rdquo;
              </Typography>
            </Box>
          ) : (
            /* Lista  agrupada por categoría */
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {resultadosAgrupados.map((grupo) => (
                <Box key={grupo.codigo} sx={{ mb: 1 }}>
                  {/* Cabecera de categoría */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        color: 'primary.main',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {grupo.nombre}
                    </Typography>
                    <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                    >
                      {grupo.productos.length}
                    </Typography>
                  </Box>
                  {/* Lista de productos */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                    {grupo.productos.map((articulo) => {
                      const disponible = isDisponible(articulo)
                      const precio = articulo.articuloPrecioBase?.monedaPrimaria?.precio ?? 0
                      const sigla = articulo.articuloPrecioBase?.monedaPrimaria?.moneda?.sigla ?? 'Bs'
                      return (
                        <Box
                          key={articulo._id ?? articulo.codigoArticulo}
                          onClick={() => {
                            if (!disponible) return
                            const tieneComps = (articulo.listaComplemento ?? []).length > 0
                            if (tieneComps) {
                              setSearchModalArticulo(articulo)
                            } else {
                              onAddProduct?.({ articulo, cantidad: 1, notasIds: [], complementos: [] })
                            }
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.25,
                            py: 0.6,
                            borderRadius: 1.5,
                            cursor: disponible ? 'pointer' : 'default',
                            opacity: disponible ? 1 : 0.5,
                            bgcolor: 'action.hover',
                            transition: 'background-color 0.15s',
                            '&:hover': disponible ? { bgcolor: 'action.selected' } : {},
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.82rem',
                              fontWeight: 500,
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mr: 1,
                            }}
                          >
                            {articulo.nombreArticulo}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                            {!disponible && (
                              <Typography
                                sx={{
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  color: 'error.main',
                                  letterSpacing: 0.5,
                                }}
                              >
                                AGOTADO
                              </Typography>
                            )}
                            <Typography
                              sx={{
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: 'text.secondary',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {sigla} {precio.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )
        ) : (
          /* ── Vista normal: grid plano filtrado por categoría ── */
          <Box
            ref={gridRef}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 1,
              alignContent: 'start',
            }}
          >
            {productosRenderizados.length === 0 ? (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No hay productos en esta categoría
                </Typography>
              </Box>
            ) : (
              <>
                {filasMarcadas.map(({ articulo, compact }) => (
                  <ProductCard
                    key={articulo._id ?? articulo.codigoArticulo}
                    articulo={articulo}
                    compact={compact}
                    onAddProduct={onAddProduct}
                  />
                ))}
                {hasMore && <div style={{ gridColumn: '1 / -1', height: 1 }} />}
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Modal complementos para búsqueda */}
      {searchModalArticulo && (
        <RrComplementoModal
          open={Boolean(searchModalArticulo)}
          onClose={() => setSearchModalArticulo(null)}
          articulo={searchModalArticulo}
          listaComplemento={searchModalArticulo.listaComplemento ?? []}
          onAdd={(payload) => {
            onAddProduct?.(payload)
            setSearchModalArticulo(null)
          }}
        />
      )}

      {/* Popover de espacios */}
      <Popover
        open={Boolean(moreAnchorEl)}
        anchorEl={moreAnchorEl}
        onClose={() => setMoreAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1, minWidth: 200 } } }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', px: 1, pt: 0.5, pb: 0.5 }}
        >
          Espacio
        </Typography>
        <MenuItem
          selected={!espacioSeleccionado}
          onClick={() => {
            onChangeEspacio?.(null)
            setMoreAnchorEl(null)
          }}
          sx={{ fontSize: '0.875rem', borderRadius: 1 }}
        >
          Salón Principal
        </MenuItem>
        {espacios.map((e) => (
          <MenuItem
            key={e._id}
            selected={espacioSeleccionado === e._id}
            onClick={() => {
              onChangeEspacio?.(e._id as string)
              setMoreAnchorEl(null)
            }}
            sx={{ fontSize: '0.875rem', borderRadius: 1 }}
          >
            {e.descripcion || 'Sin nombre'}
          </MenuItem>
        ))}
      </Popover>

      {/* Popover de filtros */}
      <Popover
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 2, minWidth: 240 } } }}
      >
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Orden por nombre / precio
        </Typography>
        <RadioGroup
          value={sortConfig.nombrePrecio}
          onChange={(_, v) => setSortConfig((prev) => ({ ...prev, nombrePrecio: v as SortNombrePrecio }))}
        >
          <FormControlLabel value="ninguno" control={<Radio size="small" />} label="Sin orden" />
          <FormControlLabel value="nombre" control={<Radio size="small" />} label="Ordenar por nombre" />
          <FormControlLabel
            value="precio_asc"
            control={<Radio size="small" />}
            label="Precio: menor a mayor"
          />
          <FormControlLabel
            value="precio_desc"
            control={<Radio size="small" />}
            label="Precio: mayor a menor"
          />
        </RadioGroup>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Orden por fecha de categorías
        </Typography>
        <RadioGroup
          value={sortConfig.categoriasOrden}
          onChange={(_, v) =>
            setSortConfig((prev) => ({ ...prev, categoriasOrden: v as SortCategoriasOrden }))
          }
        >
          <FormControlLabel
            value="recientes"
            control={<Radio size="small" />}
            label="Categorías: más recientes primero"
          />
          <FormControlLabel
            value="antiguas"
            control={<Radio size="small" />}
            label="Categorías: más antiguas primero"
          />
        </RadioGroup>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Orden por fecha de productos
        </Typography>
        <RadioGroup
          value={sortConfig.productosOrden}
          onChange={(_, v) => setSortConfig((prev) => ({ ...prev, productosOrden: v as SortProductosOrden }))}
        >
          <FormControlLabel
            value="recientes"
            control={<Radio size="small" />}
            label="Productos: más recientes primero"
          />
          <FormControlLabel
            value="antiguos"
            control={<Radio size="small" />}
            label="Productos: más antiguos primero"
          />
        </RadioGroup>
      </Popover>
    </Paper>
  )
}

export default RrCategoriasProductos
