import { Box, BoxProps, useMediaQuery, useTheme } from '@mui/material'
import { Fragment, JSX, ReactNode, UIEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Tipos para las props
interface GridConfig {
  columns: number
  spacing: number // Este es el multiplicador de spacing, no el valor en px
}

interface GridBreakpoints {
  xs: GridConfig
  sm: GridConfig
  md: GridConfig
  lg: GridConfig
  xl: GridConfig
}

interface VirtualizedGridProps<T> extends BoxProps {
  data: T[]
  itemHeight?: number
  gridConfig?: Partial<GridBreakpoints>
  containerHeight?: string | number
  containerWidth?: string | number
  renderItem: (item: T) => ReactNode
  overscanCount?: number
}

interface Dimensions {
  width: number
  height: number
}

const defaultGridConfig: GridBreakpoints = {
  xs: { columns: 2, spacing: 1 },
  sm: { columns: 3, spacing: 1 },
  md: { columns: 4, spacing: 1 },
  lg: { columns: 5, spacing: 1 },
  xl: { columns: 6, spacing: 1 },
}

// Función para convertir el spacing a px numérico
const getSpacingValue = (spacing: number, theme: any): number => {
  const spacingValue = theme.spacing(spacing)
  return parseInt(spacingValue.replace('px', ''), 10)
}

// FORMA DE USO
// <VirtualizedScrollContainer
//   data={data:T}
//   itemHeight={127}
//   gridConfig={{
//     xs: { columns: 2, spacing: 1 },
//     sm: { columns: 3, spacing: 1 },
//     md: { columns: 4, spacing: 1 },
//     lg: { columns: 6, spacing: 1 },
//     xl: { columns: 7, spacing: 1 },
//   }}
//   containerHeight={'calc(65vh - 170px)'}
//   renderItem={(item: T) => (
//     <ArticuloTarjeta
//       key={item._id.toString()}
//     />
//   )}
//   sx={{
//     backgroundColor: theme.palette.background.default,
//     [theme.breakpoints.down('md')]: {
//       display: 'none',
//     },
//   }}
// />

/**
 * Componente de contenedor virtualizado
 * @author isi-template
 * @param data
 * @param itemHeight
 * @param gridConfig
 * @param containerHeight
 * @param containerWidth
 * @param renderItem
 * @param overscanCount
 * @param sxBox
 * @constructor
 */
function VirtualizedScrollContainer<T>({
  data, // Datos de consulta T = any[]
  itemHeight = 100, // Alto de cada fila
  gridConfig = defaultGridConfig, // Configuracion de grid en funcion a xs, sm, md, lg, xl
  containerHeight = '100vh', // Alto del contenedor general
  containerWidth = '100%', // Ancho de contenedor
  renderItem, // Elemento T del tipado de Data para renderizar cada item
  overscanCount = 2,
  ...props
}: VirtualizedGridProps<T>): JSX.Element {
  const theme = useTheme()
  const { sx = {}, ...others } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })

  // Detección de breakpoints segun documentacion MUI
  const isXs = useMediaQuery(theme.breakpoints.only('xs'))
  const isSm = useMediaQuery(theme.breakpoints.only('sm'))
  const isMd = useMediaQuery(theme.breakpoints.only('md'))
  const isLg = useMediaQuery(theme.breakpoints.only('lg'))
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))

  // Combinar configuración default con props
  const mergedConfig: GridBreakpoints = {
    ...defaultGridConfig,
    ...gridConfig,
  }

  // Determinar configuración actual basada en el breakpoint
  const getCurrentConfig = useCallback((): GridConfig => {
    if (isXs) return mergedConfig.xs
    if (isSm) return mergedConfig.sm
    if (isMd) return mergedConfig.md
    if (isLg) return mergedConfig.lg
    return mergedConfig.xl
  }, [isXs, isSm, isMd, isLg, isXl, mergedConfig])

  const currentConfig = useMemo(() => getCurrentConfig(), [getCurrentConfig])

  // Obtener el valor numérico del spacing
  const spacingValue = useMemo(
    () => getSpacingValue(currentConfig.spacing, theme),
    [currentConfig.spacing, theme],
  )

  // Calcular dimensiones
  const calculateDimensions = useCallback((): void => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      setDimensions({ width, height })
    }
  }, [])

  // Manejador de scroll
  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Actualizar cuando cambia el tamaño o el breakpoint
  useEffect(() => {
    calculateDimensions()
  }, [isXs, isSm, isMd, isLg, isXl, calculateDimensions])

  // Observar cambios de tamaño
  useEffect(() => {
    calculateDimensions()

    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [calculateDimensions])

  // Calculamos filas visibles
  const { visibleRows, totalHeight, startIndex, endIndex } = useMemo(() => {
    if (dimensions.height === 0 || currentConfig.columns === 0) {
      return { visibleRows: [], totalHeight: 0, startIndex: 0, endIndex: 0 }
    }

    const rowHeight = itemHeight + spacingValue * 2 // spacing arriba y abajo
    const rowsPerScreen = Math.ceil(dimensions.height / rowHeight)
    const rowCount = Math.ceil(data.length / currentConfig.columns)
    const totalHeight = rowCount * rowHeight

    // Calcular índices de filas visibles
    let startIndex = Math.floor(scrollTop / rowHeight) - overscanCount
    startIndex = Math.max(0, startIndex)

    let endIndex = startIndex + rowsPerScreen + overscanCount * 2
    endIndex = Math.min(rowCount - 1, endIndex)

    // Generar filas visibles
    const visibleRows = []
    for (let i = startIndex; i <= endIndex; i++) {
      const startIdx = i * currentConfig.columns
      const endIdx = Math.min(startIdx + currentConfig.columns, data.length)
      visibleRows.push({
        index: i,
        items: data.slice(startIdx, endIdx),
        offset: i * rowHeight,
      })
    }

    return { visibleRows, totalHeight, startIndex, endIndex }
  }, [data, dimensions.height, scrollTop, currentConfig, itemHeight, overscanCount, spacingValue])

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        height: containerHeight,
        width: containerWidth,
        overflow: 'auto',
        position: 'relative',
        ...sx,
      }}
      {...others}
    >
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        {visibleRows.map(({ index, items, offset }) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateY(${offset}px)`,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: `repeat(${currentConfig.columns}, 1fr)`,
              gap: theme.spacing(currentConfig.spacing),
              padding: theme.spacing(currentConfig.spacing),
            }}
          >
            {items.map((item, i) => (
              <Fragment key={`${index}-${i}`}>{renderItem(item)}</Fragment>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default VirtualizedScrollContainer
