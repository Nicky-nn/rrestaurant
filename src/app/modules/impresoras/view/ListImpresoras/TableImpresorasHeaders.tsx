import { Box, Chip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { MRT_ColumnDef } from 'material-react-table'

import { Articulo } from '../../../restaurante/types'

export const tableColumns: MRT_ColumnDef<Articulo>[] = [
  {
    accessorKey: 'codigoArticulo',
    header: 'Código',
    size: 130,
    enableSorting: true,
  },
  {
    accessorKey: 'nombreArticulo',
    header: 'Nombre',
  },
  {
    accessorKey: 'descripcionArticulo',
    header: 'Descripción',
  },
  {
    accessorKey: 'tipoArticulo.descripcion',
    header: 'Tipo de Artículo',
  },
  {
    accessorKey: 'impresoras',
    header: 'Sitios Impresoras',
    filterVariant: 'select',
    filterFn: (row, id, filterValue) => {
      if (!filterValue || filterValue === 'todas') return true

      const impresoras = row.original.impresoras
      if (!impresoras || !Array.isArray(impresoras)) return false

      return impresoras.some((impresora) => impresora.nombre === filterValue)
    },
    Cell: ({ cell }) => {
      const impresoras = cell.getValue() as { nombre: string; descripcion?: string }[] | null | undefined

      if (!impresoras || !Array.isArray(impresoras) || impresoras.length === 0) {
        return (
          <Chip
            label="Sin impresoras"
            size="small"
            color="default"
            variant="outlined"
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === 'dark' ? alpha(theme.palette.action.hover, 0.5) : '#f5f5f5',
              fontStyle: 'italic',
            })}
          />
        )
      }

      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {impresoras.map((impresora, index) => {
            if (!impresora || !impresora.nombre) {
              return <Chip key={index} label="Sin nombre" size="small" color="warning" variant="outlined" />
            }

            return (
              <Chip
                key={index}
                label={
                  impresora.descripcion ? `${impresora.nombre} - ${impresora.descripcion}` : impresora.nombre
                }
                size="small"
                color="primary"
                variant="outlined"
                sx={(theme) => ({
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.3 : 0.12,
                  ),
                  fontWeight: '500',
                  border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.8 : 1)}`,
                  marginBottom: '2px',
                  '&:hover': {
                    backgroundColor: alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === 'dark' ? 0.4 : 0.18,
                    ),
                  },
                })}
              />
            )
          })}
        </Box>
      )
    },
  },
]
