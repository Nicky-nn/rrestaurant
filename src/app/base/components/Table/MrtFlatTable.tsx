import { alpha, Box, Typography, useTheme } from '@mui/material'
import { MaterialReactTable, type MRT_ColumnDef, type MRT_RowData } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import { useMemo } from 'react'

import { getMrtColors } from './mrtColorUtils.ts'
import { MrtFlatOptions } from './mrtTypes.ts'

interface MrtFlatTableProps<T extends MRT_RowData> {
  data: T[]
  columns: MRT_ColumnDef<T>[]
  options?: MrtFlatOptions
}

/**
 * Componente de tabla simple
 * @param param0
 * @param param0.data
 * @param param0.columns
 * @param param0.options
 * @constructor
 */
export const MrtFlatTable = <T extends MRT_RowData>({ data, columns, options }: MrtFlatTableProps<T>) => {
  const density = options?.dense || 'compact'
  // Extraemos el tema global y memorizamos los colores usando nuestra única propiedad de color
  const theme = useTheme()
  const mrtColors = useMemo(() => getMrtColors(options?.tableColor, theme), [options?.tableColor, theme])

  // Aplicamos hover y striped
  const enableHover = options?.enableRowHover ?? false
  const enableStriped = options?.enableStripedRows ?? true
  const enableBorder = options?.showBorder ?? true

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      // Control de Funcionalidades
      enableTopToolbar={!!options?.title}
      enableBottomToolbar={options?.enablePagination ?? false}
      // --- DESACTIVAR BOTONES EXTRAS ---
      enableToolbarInternalActions={false} // Quita botones de densidad, pantalla completa, etc.
      enableColumnFilters={false} // Quita el botón de filtros
      enableGlobalFilter={false} // Quita la barra de búsqueda (search)
      enableHiding={false} // Quita la opción de mostrar/ocultar columnas
      enableDensityToggle={false} // Quita el botón de densidad
      enableFullScreenToggle={false} // Quita el botón de pantalla completa
      enablePagination={options?.enablePagination ?? false}
      enableSorting={options?.enableSorting ?? false}
      enableColumnActions={false}
      enableRowSelection={false}
      // Si showHeaders es false, MRT no renderizará el <thead>
      enableTableHead={options?.showHeaders ?? true}
      // 1. ESTILOS DEL CONTENEDOR DEL TOOLBAR
      muiTopToolbarProps={{
        sx: {
          // Si hay color usa el fondo tintado, si no, usa el background default
          backgroundColor: options?.tableColor ? mrtColors.headBg : theme.palette.background.default,
          minHeight: '35px !important',
          display: 'flex',
          alignItems: 'center',
          '& .MuiBox-root': {
            p: 0,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          },
        },
      }}
      // 2. ESTILOS DEL TÍTULO
      // 2. EL TÍTULO MANTIENE TU LÓGICA NEUTRA
      renderTopToolbarCustomActions={() => {
        if (!options?.title) return undefined

        // 1. SI ES UN STRING: Renderizamos nuestro diseño premium con acento vertical
        if (typeof options.title === 'string') {
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: '4px',
                  height: '16px',
                  backgroundColor: options?.tableColor ? mrtColors.mainColor : 'text.disabled',
                  borderRadius: '4px',
                  mr: 1.5,
                }}
              />
              <Typography
                variant="subtitle2"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: options?.tableColor ? mrtColors.headText : 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06rem',
                  lineHeight: 1,
                }}
              >
                {options.title}
              </Typography>
            </Box>
          )
        }

        // 2. SI ES UN COMPONENTE REACT: Lo envolvemos para mantener la alineación
        // vertical del Toolbar, pero dejamos que tu componente controle sus propios estilos.
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              px: 2,
            }}
          >
            {options.title}
          </Box>
        )
      }}
      // Estilos de Cabecera (Header)
      muiTableHeadCellProps={{
        sx: {
          backgroundColor: mrtColors.headBg,
          // El texto ahora se calcula matemáticamente para garantizar siempre buen contraste
          color: mrtColors.headText,
          fontWeight: 700,
          py: density === 'compact' ? 1.2 : 1.5,
          borderColor: 'divider',
          letterSpacing: '0.05rem',
          backgroundClip: 'padding-box',
          '&:last-child': { borderRight: 'none' },
        },
      }}
      // Estilos de Contenedor (Paper)
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          width: options?.fullWidth ? '100%' : 'max-content',
          display: 'grid',
          border: enableBorder ? '1px solid' : 'none',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
        },
      }}
      // Limpieza de celda derecha
      muiTableBodyCellProps={{
        sx: { '&:last-child': { borderRight: 'none' } },
      }}
      // APLICAMOS HOVER Y STRIPED CON LOS NUEVOS DEFAULTS
      muiTableBodyRowProps={({ row }) => {
        // Calculamos si esta fila específica debe ser rayada (índices impares: 1, 3, 5...)
        const isStripedRow = enableStriped && row.index % 2 === 1

        return {
          // Activa la clase nativa de hover si corresponde
          hover: enableHover,
          sx: {
            // 1. Limpieza del borde inferior en la última fila
            '&:last-child .MuiTableCell-root': {
              borderBottom: 'none !important',
            },

            // 2. Striped (Forzando el fondo directamente a las celdas de esta fila)
            ...(isStripedRow && {
              '& .MuiTableCell-root': {
                backgroundColor: `${mrtColors.stripedBg} !important`,
              },
            }),

            // 3. Hover sobreescrito (&& asegura ganar en CSS specificity a la clase nativa de MUI)
            ...(enableHover && {
              '&&:hover .MuiTableCell-root': {
                backgroundColor: `${mrtColors.hoverBg} !important`,
              },
            }),
          },
        }
      }}
      muiTableProps={{
        sx: {
          width: '100% !important',
          // Si es fullWidth, usamos 'fixed' para que las columnas se repartan el espacio
          // Si no, 'auto' permite que la tabla crezca según el contenido
          tableLayout: options?.fullWidth ? 'fixed' : 'auto',
        },
      }}
      mrtTheme={{
        baseBackgroundColor: theme.palette.background.paper,
        draggingBorderColor: theme.palette.secondary.main,
        matchHighlightColor: alpha(theme.palette.primary.main, 0.5),
      }}
      initialState={{
        density,
      }}
      // Mensaje de "Sin Datos"
      renderEmptyRowsFallback={() => (
        <div style={{ textAlign: 'center', padding: '0.5rem', color: '#999' }}>
          No hay registros para mostrar
        </div>
      )}
      localization={MRT_Localization_ES}
    />
  )
}
