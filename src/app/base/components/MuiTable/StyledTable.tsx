import {
  Box,
  Palette,
  styled,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
} from '@mui/material'

import { getColor } from '../../../utils/getColor.ts'

type StyledPaletteColors = {
  [K in keyof Palette]: Palette[K] extends { main: string } ? K : never
}[keyof Palette]

interface StyledTableContainerProps {
  /** Paleta de colores para el borde exterior, default inherit */
  bgColor?: StyledPaletteColors | string
}

/**
 * Contenedor estilizado para la tabla. Reemplaza a TableContainer con Paper.
 * Mantiene un borde neutro estándar para no saturar visualmente aplicaciones densas.
 * @author isi-template
 */
export const StyledTableContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<StyledTableContainerProps>(({ theme, bgColor }) => {
  const colors = getColor(theme, bgColor)

  return {
    width: '100%',
    overflowX: 'auto',
    // Aplicamos el borde tintado al contenedor
    border: `1px solid ${colors.borderColor}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  }
})
/**************************************************************************************************/

interface StyledTableRowProps {
  /** Color base para calcular el hover tintado específico de esta fila */
  bgColor?: StyledPaletteColors | string
  /** Activar o desactivar hover explícitamente para esta fila */
  hover?: boolean
  /** Fila intercalada explícita para esta fila */
  striped?: boolean
}

/**
 * Define los estilos para la fila
 * - Es independiente y reemplaza los estilos generados por BODY
 * @author isi-template
 */
export const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== 'bgColor' && prop !== 'hover' && prop !== 'striped',
})<StyledTableRowProps>(({ theme, bgColor, hover, striped }) => {
  const colors = getColor(theme, bgColor)

  return {
    // APLICAMOS EL COLOR DEL BORDE A LAS CELDAS DE ESTA FILA
    '& .MuiTableCell-root': {
      borderBottomColor: colors.borderColor,
    },

    // (Toda tu lógica anterior de Hover y Striped se mantiene intacta)
    ...(hover === false && {
      '&&:hover': {
        backgroundColor: 'transparent !important',
      },
      '&&:nth-of-type(odd):hover': {
        backgroundColor: striped !== false ? `${colors.stripedColor} !important` : 'transparent !important',
      },
    }),
    ...(hover !== false &&
      bgColor && {
        '&&:hover': {
          backgroundColor: `${colors.hoverColor} !important`,
        },
      }),
    ...(striped === false && {
      '&&:nth-of-type(odd)': {
        backgroundColor: 'transparent !important',
      },
    }),
    ...(striped !== false &&
      bgColor && {
        '&&:nth-of-type(odd)': {
          backgroundColor: colors.stripedColor,
        },
      }),
  }
})

/**************************************************************************************************/

interface StyledTableHeadProps {
  /** Paleta de colores, default inherit */
  bgColor?: StyledPaletteColors | string
}

/**
 * Componente estilizado para el encabezado de la tabla. Reemplaza a TableHead.
 * @author isi-template
 */
export const StyledTableHead = styled(TableHead, {
  shouldForwardProp: (prop) => prop !== 'bgColor',
})<StyledTableHeadProps>(({ theme, bgColor }) => {
  // Toda la lógica compleja de cálculo de fondos se reemplaza por esta única línea
  const colors = getColor(theme, bgColor)
  return {
    '& .MuiTableCell-head': {
      backgroundColor: colors.bgColor,
      color: colors.textColor,
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.85rem',
      // Aplicamos el padding de 5.68px (1.2) vertical y 10.4px (1.3) horizontal
      letterSpacing: '0.05em',
      padding: theme.spacing(1.2, 1.3),
      transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.short,
      }),
      borderBottom: `1px solid ${colors.borderColor}`,
      // Asegura que los fondos se pinten correctamente debajo de los bordes en elementos sticky
      backgroundClip: 'padding-box',
    },
    '& tr th:last-child': {
      borderRight: 0,
    },
  }
})

/*************************************************************************************************/

interface StyledTableBodyProps {
  /** Color base para calcular el hover/striped de todo el cuerpo */
  bgColor?: StyledPaletteColors | string
  /** Activar filas intercaladas globalmente */
  striped?: boolean
  /** Activar hover globalmente, default true */
  hover?: boolean
}

/**
 * Creamos el componente estilizado para el body table se aplica en reemplazo de TableBody
 * @author isi-template
 */
export const StyledTableBody = styled(TableBody, {
  shouldForwardProp: (prop) => prop !== 'striped' && prop !== 'hover' && prop !== 'bgColor',
})<StyledTableBodyProps>(({ theme, striped = true, hover = false, bgColor }) => {
  const colors = getColor(theme, bgColor)

  return {
    // 1. LIMPIEZA DE BORDES FINALES
    '& .MuiTableRow-root .MuiTableCell-root:last-child': {
      borderRight: 'none !important',
    },
    '& .MuiTableRow-root:last-child .MuiTableCell-root': {
      borderBottom: 'none !important',
    },

    // 2. ESTADO GLOBAL: Striped
    ...(striped && {
      '& .MuiTableRow-root:nth-of-type(odd)': {
        backgroundColor: colors.stripedColor,
      },
    }),

    // 3. ESTADO GLOBAL: Hover
    ...(hover && {
      '& .MuiTableRow-root:hover': {
        backgroundColor: `${colors.hoverColor} !important`,
        transition: theme.transitions.create('background-color', {
          duration: theme.transitions.duration.shortest,
        }),
      },
    }),

    // 4. ESTILOS DE CELDA (Padding y Borde)
    '& .MuiTableCell-body': {
      padding: theme.spacing(0.71, 1.3),
      // Sobrescribimos el borde por defecto de MUI con nuestro color custom
      borderBottomColor: colors.borderColor,
    },
  }
})

interface StyledTableCellProps extends TableCellProps {
  /** Color de fondo custom para la celda */
  bgColor?: string
  /** Color de texto custom para la celda */
  textColor?: string
}

export const StyledTableCell = styled(TableCell, {
  // Evitamos que estas props se filtren al HTML nativo
  shouldForwardProp: (prop) => prop !== 'bgColor' && prop !== 'textColor',
})<StyledTableCellProps>(({ bgColor, textColor }) => ({
  ...(bgColor && { backgroundColor: `${bgColor} !important` }),
  ...(textColor && { color: `${textColor} !important` }),
}))
