import { alpha } from '@mui/material'
import { MaterialReactTable, type MRT_ColumnDef, type MRT_RowData } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'

import { MrtFlatOptions } from './mrtTypes.ts'

interface MrtFlatTableProps<T extends MRT_RowData> {
  data: T[]
  columns: MRT_ColumnDef<T>[]
  options?: MrtFlatOptions
}

export const MrtFlatTable = <T extends MRT_RowData>({ data, columns, options }: MrtFlatTableProps<T>) => {
  const density = options?.dense || 'compact'
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      // Control de Funcionalidades
      enableTopToolbar={false}
      enableBottomToolbar={options?.enablePagination ?? false}
      enablePagination={options?.enablePagination ?? false}
      enableSorting={options?.enableSorting ?? false}
      enableColumnActions={false}
      enableColumnFilters={false}
      enableRowSelection={false}
      // Si showHeaders es false, MRT no renderizará el <thead>
      enableTableHead={options?.showHeaders ?? true}
      // Estilos de Cabecera (Header)
      muiTableHeadCellProps={{
        sx: {
          backgroundColor: options?.headerBackgroundColor || 'rgba(0,0,0,0.02)',
          color: options?.headerTextColor || 'text.primary',
          fontWeight: 700,
          fontSize: '0.8rem',
          py: density === 'compact' ? 0.9 : 1.5,
          borderBottom: '2px solid',
          borderColor: 'divider',
          letterSpacing: '0.05rem',
        },
      }}
      // Estilos de Contenedor (Paper)
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          width: options?.fullWidth ? '100%' : 'max-content',
          display: 'grid', // Ayuda a que los toolbars y la tabla se alineen al ancho
          border: options?.showBorder ? '1px solid' : 'none',
          borderColor: 'divider',
          borderRadius: '8px',
          overflow: 'hidden',
        },
      }}
      muiTableProps={{
        sx: {
          width: '100% !important',
          // Si es fullWidth, usamos 'fixed' para que las columnas se repartan el espacio
          // Si no, 'auto' permite que la tabla crezca según el contenido
          tableLayout: options?.fullWidth ? 'fixed' : 'auto',
        },
      }}
      mrtTheme={(theme) => ({
        baseBackgroundColor: theme.palette.background.paper,
        draggingBorderColor: theme.palette.secondary.main,
        matchHighlightColor: alpha(theme.palette.primary.main, 0.5),
      })}
      initialState={{
        density,
      }}
      // Mensaje de "Sin Datos"
      renderEmptyRowsFallback={() => (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          No hay registros para mostrar
        </div>
      )}
      localization={MRT_Localization_ES}
    />
  )
}
