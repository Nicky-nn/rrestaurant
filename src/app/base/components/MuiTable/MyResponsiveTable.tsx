import { Box, Palette, styled } from '@mui/material'
import React, { createContext, useContext } from 'react'

import { getColor } from '../../../utils/getColor.ts' // Ajusta el path si es necesario

type StyledPaletteColors = {
  [K in keyof Palette]: Palette[K] extends { main: string } ? K : never
}[keyof Palette]

// --- 1. CONTEXTO Y OPCIONES ---
interface MyTableOptions {
  dense?: boolean
  colorVariant?: StyledPaletteColors | string
  striped?: boolean
  hover?: boolean
  bordered?: boolean
}

const MyTableContext = createContext<MyTableOptions>({})
export const useMyTableContext = () => useContext(MyTableContext)

// --- INTERFACES INTERNAS PARA ESTILOS ---
interface InternalCellProps extends MyTableOptions {
  customBgColor?: StyledPaletteColors | string
  customTextColor?: StyledPaletteColors | string
  hasCustomBg?: boolean
  customValign?: 'top' | 'middle' | 'bottom' | 'baseline'
}

// --- 2. UTILIDADES Y COMPONENTES ESTILIZADOS ---
// Optimizamos la lista de exclusión para asegurar que NINGUNA prop custom pase al DOM
const shouldForward = (prop: string) =>
  ![
    'dense',
    'colorVariant',
    'striped',
    'hover',
    'bordered',
    'customBgColor',
    'customTextColor',
    'hasCustomBg',
    'customValign',
    'bgColor', // Filtramos explícitamente para que no pase al HTML nativo
    'textColor',
    'valign',
  ].includes(prop)

const MyTableContainer = styled(Box, {
  shouldForwardProp: shouldForward,
})<MyTableOptions>(({ theme, colorVariant, bordered }) => {
  const colors = getColor(theme, colorVariant)
  return {
    overflowX: 'auto',
    width: '100%',
    ...(bordered ? { border: `1px solid ${colors.borderColor}` } : { border: 'none' }),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      border: 'none',
    },
  }
})

const StyledTable = styled('table', {
  shouldForwardProp: shouldForward,
})<MyTableOptions>(({ theme }) => ({
  borderCollapse: 'separate',
  borderSpacing: 0,
  margin: 0,
  padding: 0,
  width: '100%',
  tableLayout: 'fixed',
  border: 'none',
  [theme.breakpoints.down('sm')]: {
    border: 'none',
  },
}))

const StyledCaption = styled('caption', {
  shouldForwardProp: shouldForward,
})<MyTableOptions>(({ theme, colorVariant }) => {
  const colors = getColor(theme, colorVariant)
  return {
    fontSize: '1.1em',
    margin: '0.5em 0 0.3em 0.75em',
    color: colors.textColor,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9em',
    },
  }
})

const StyledThead = styled('thead', {
  shouldForwardProp: shouldForward,
})<MyTableOptions>(({ theme, colorVariant }) => {
  const colors = getColor(theme, colorVariant)
  return {
    backgroundColor: colors.bgColor,
    color: colors.textColor,
    [theme.breakpoints.down('sm')]: {
      border: 'none',
      clip: 'rect(0 0 0 0)',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      width: '1px',
    },
  }
})

const StyledTr = styled('tr', {
  shouldForwardProp: shouldForward,
})<MyTableOptions>(({ theme, striped, hover, colorVariant }) => {
  const colors = getColor(theme, colorVariant)
  return {
    transition: 'background-color 0.2s ease',

    ...(striped && {
      '&:nth-of-type(even)': {
        backgroundColor: colors.stripedColor,
      },
    }),

    ...(hover && {
      '&&:hover': {
        backgroundColor: colors.hoverColor || theme.palette.action.hover,
      },
      // Cuando el TR tiene hover, afectamos a los TD/TH hijos
      '&&:hover td, &&:hover th': {
        filter: theme.palette.mode === 'dark' ? 'brightness(1.20)' : 'brightness(0.95)',
      },
    }),

    'tbody &:last-child td, tbody &:last-child th': {
      borderBottom: 0,
    },

    [theme.breakpoints.down('sm')]: {
      border: `1px solid ${colors.borderColor}`,
      display: 'block',
      marginBottom: '0.6em',
      borderRadius: theme.shape.borderRadius,

      '&:last-child': {
        marginBottom: 0,
      },
      '& td:last-child': {
        borderBottom: 0,
      },
    },
  }
})

const getCellStyles = (dense?: boolean) => ({
  padding: dense ? '0.4em 0.6em' : '0.625em',
  verticalAlign: 'baseline',
  fontSize: dense ? '0.9em' : '0.93em',
})

const StyledTh = styled('th', {
  shouldForwardProp: shouldForward,
})<InternalCellProps>(({
  theme,
  dense,
  bordered,
  colorVariant,
  customBgColor,
  customTextColor,
  hasCustomBg,
  customValign,
}) => {
  const tableColors = getColor(theme, colorVariant)
  const cellColors = hasCustomBg ? getColor(theme, customBgColor) : tableColors

  const explicitTextColors = customTextColor ? getColor(theme, customTextColor) : null
  const finalTextColor = explicitTextColors
    ? explicitTextColors.strongTextColor
    : hasCustomBg
      ? cellColors.textColor
      : 'inherit'

  return {
    ...getCellStyles(dense),
    verticalAlign: customValign || 'baseline',
    borderBottom: `1px solid ${hasCustomBg ? cellColors.borderColor : tableColors.borderColor}`,
    // 3. CAMBIO: 'transparent' en lugar de 'inherit'
    backgroundColor: hasCustomBg ? cellColors.bgColor : 'transparent',
    color: finalTextColor,
    letterSpacing: '0.05em',
    padding: theme.spacing(1.2, 1.3),
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    ...(bordered && {
      borderRight: `1px solid ${hasCustomBg ? cellColors.borderColor : tableColors.borderColor}`,
      '&:last-child': {
        borderRight: 'none',
      },
    }),
  }
})

const StyledTd = styled('td', {
  shouldForwardProp: shouldForward,
})<InternalCellProps>(({
  theme,
  dense,
  bordered,
  colorVariant,
  customBgColor,
  customTextColor,
  hasCustomBg,
  customValign,
}) => {
  const tableColors = getColor(theme, colorVariant)
  const cellColors = hasCustomBg ? getColor(theme, customBgColor) : tableColors

  const explicitTextColors = customTextColor ? getColor(theme, customTextColor) : null
  const finalTextColor = explicitTextColors
    ? explicitTextColors.strongTextColor
    : hasCustomBg
      ? cellColors.textColor
      : theme.palette.text.primary

  return {
    ...getCellStyles(dense),
    verticalAlign: customValign || 'baseline',
    borderBottom: `1px solid ${hasCustomBg ? cellColors.borderColor : tableColors.borderColor}`,
    // 3. CAMBIO: 'transparent' en lugar de 'inherit'
    backgroundColor: hasCustomBg ? cellColors.bgColor : 'transparent',
    color: finalTextColor,
    ...(bordered && {
      borderRight: `1px solid ${hasCustomBg ? cellColors.borderColor : tableColors.borderColor}`,
      '&:last-child': {
        borderRight: 'none',
      },
    }),
    [theme.breakpoints.down('sm')]: {
      borderBottom: `1px solid ${hasCustomBg ? cellColors.borderColor : tableColors.borderColor}`,
      borderRight: 'none',
      width: '100% !important',
      display: 'block',
      '&::before': {
        content: 'attr(data-label)',
        display: 'block',
        textAlign: 'left',
        marginBottom: theme.spacing(0.5),
        fontWeight: 600,
        fontSize: '0.80rem',
        textTransform: 'uppercase',
        color: finalTextColor,
      },
    },
  }
})

// --- 3. COMPONENTES PÚBLICOS. EJEMPLO DE USO ---
/**
 * <MyTable colorVariant={'secondary'} striped={true} bordered={true} hover={true}>
 *   <MyTableCaption>DESGLOSE DE COSTOS Y PRECIOS</MyTableCaption>
 *   <MyTableHead>
 *     <MyTableRow autoCapitalize={'on'}>
 *       <MyTableHeader align={'right'}>ARTICULO</MyTableHeader>
 *       <MyTableHeader>COSTO BÁSE</MyTableHeader>
 *       <MyTableHeader>PRECIO FINAL</MyTableHeader>
 *     </MyTableRow>
 *   </MyTableHead>
 *   <MyTableBody>
 *     <MyTableRow>
 *       <MyTableCell>Silpancho (Producción)</MyTableCell>
 *       <MyTableCell align={'center'} bgColor={'teal'} label="Costo Base">
 *         18.50
 *       </MyTableCell>
 *       <MyTableCell label="Precio Final">28.00</MyTableCell>
 *     </MyTableRow>
 *   </MyTableBody>
 * </MyTable>
 */

/**
 * Contenedor principal de la tabla
 * @param param0
 * @param param0.dense
 * @param param0.colorVariant
 * @param param0.striped
 * @param param0.hover
 * @param param0.bordered
 * @param param0.children
 * @param param0.props
 * @constructor
 * @autor isi-template
 */
export const MyTable: React.FC<MyTableOptions & React.HTMLAttributes<HTMLTableElement>> = ({
  dense,
  colorVariant,
  striped,
  hover,
  bordered = true,
  children,
  ...props
}) => {
  return (
    <MyTableContext.Provider value={{ dense, colorVariant, striped, hover, bordered }}>
      <MyTableContainer colorVariant={colorVariant} bordered={bordered}>
        <StyledTable {...props}>{children}</StyledTable>
      </MyTableContainer>
    </MyTableContext.Provider>
  )
}

/**
 * Caption de uso
 * @param param0
 * @param param0.children
 * @param param0.props
 * @constructor
 */
export const MyTableCaption: React.FC<React.HTMLAttributes<HTMLTableCaptionElement>> = ({
  children,
  ...props
}) => {
  const context = useMyTableContext()
  return (
    <StyledCaption {...context} {...props}>
      {children}
    </StyledCaption>
  )
}

/**
 * Cabecera
 * @param param0
 * @param param0.children
 * @param param0.props
 * @constructor
 */
export const MyTableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  ...props
}) => {
  const context = useMyTableContext()
  return (
    <StyledThead {...context} {...props}>
      {children}
    </StyledThead>
  )
}

/**
 * Contenedor del body
 */
export const MyTableBody = styled('tbody')({})

/**
 * Contenedor de la fila
 * @param param0
 * @param param0.children
 * @param param0.props
 * @constructor
 */
export const MyTableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, ...props }) => {
  const context = useMyTableContext()
  return (
    <StyledTr {...context} {...props}>
      {children}
    </StyledTr>
  )
}

interface MyTableHeaderProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit'
  bgColor?: StyledPaletteColors | string
  textColor?: StyledPaletteColors | string
}

/**
 * Cabecera de la tabla
 * @param param0
 * @param param0.children
 * @param param0.align
 * @param param0.bgColor
 * @param param0.textColor
 * @param param0.props
 * @author isi-template
 * @constructor
 */
export const MyTableHeader: React.FC<MyTableHeaderProps> = ({
  children,
  align = 'left',
  bgColor,
  textColor,
  ...props
}) => {
  const context = useMyTableContext()
  const hasCustomBg = !!bgColor

  return (
    <StyledTh
      {...context}
      {...props}
      align={align as any}
      customBgColor={bgColor}
      customTextColor={textColor}
      hasCustomBg={hasCustomBg}
    >
      {children}
    </StyledTh>
  )
}

interface MyTableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  label?: string
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit'
  bgColor?: StyledPaletteColors | string
  textColor?: StyledPaletteColors | string
  valign?: 'top' | 'middle' | 'bottom' | 'baseline'
}

/**
 * Celda de la tabla
 * @param param0
 * @param param0.label
 * @param param0.align
 * @param param0.bgColor
 * @param param0.textColor
 * @param param0.children
 * @param param0.props
 * @author isi-template
 * @constructor
 */
export const MyTableCell: React.FC<MyTableCellProps> = ({
  label,
  align,
  valign,
  bgColor,
  textColor,
  children,
  ...props
}) => {
  const context = useMyTableContext()
  const hasCustomBg = !!bgColor

  return (
    <StyledTd
      {...context}
      {...props}
      data-label={label}
      align={align as any}
      customValign={valign}
      customBgColor={bgColor}
      customTextColor={textColor}
      hasCustomBg={hasCustomBg}
    >
      {children}
    </StyledTd>
  )
}
