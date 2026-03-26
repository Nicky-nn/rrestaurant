import { Print, Refresh, Settings } from '@mui/icons-material'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import { MaterialReactTable, MRT_TableOptions, useMaterialReactTable } from 'material-react-table'
import { FunctionComponent, useMemo, useState } from 'react'

import AuditIconButton from '../../../../base/components/Auditoria/AuditIconButton'
import { SimpleContainerBox } from '../../../../base/components/Container/SimpleBox'
import StackMenu from '../../../../base/components/MyMenu/StackMenu'
import { MrtRowMenu } from '../../../../base/components/Table/MrtRowMenu'
import { MrtMenuAction } from '../../../../base/components/Table/mrtTypes'
import Breadcrumb from '../../../../base/components/Template/Breadcrumb/Breadcrumb'
import useAuth from '../../../../base/hooks/useAuth'
import { MuiTableAdvancedOptionsProps } from '../../../../utils/muiTable/muiTableAdvancedOptionsProps'
import { useArticuloInventarioListado } from '../../../restaurante/queries/useArticuloInventarioListado'
import { Articulo } from '../../../restaurante/types'
import { impresorasRoutesMap } from '../../impresorasRoutes'
import AsociarImpresoraDialog from './AsociarImpresoraDialog'
import ConfiguracionImpresorasDialog from './ConfiguracionImpresorasDialog'
import GestionImpresorasDialog from './GestionImpresorasDialog'
import { tableColumns } from './TableImpresorasHeaders'

interface ListImpresorasProps {}

const ListImpresoras: FunctionComponent<ListImpresorasProps> = () => {
  const { user } = useAuth()
  const columns = useMemo(() => tableColumns, [])

  const [openAsociarDialog, setOpenAsociarDialog] = useState(false)
  const [articuloSelected, setArticuloSelected] = useState<Articulo | null>(null)

  const [openGestionDialog, setOpenGestionDialog] = useState(false)
  const [openConfigDialog, setOpenConfigDialog] = useState(false)

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useArticuloInventarioListado({
    cds: 1,
    entidad: {
      codigoSucursal: user?.sucursal?.codigo || 0,
      codigoPuntoVenta: user?.puntoVenta?.codigo || 0,
    },
    // Si necesitas un filtro específico del GraphQL para impresoras, agrégalo en query: 'prop=val'
  })

  const reversedData = useMemo(() => {
    return data ? [...data].reverse() : []
  }, [data])

  const table = useMaterialReactTable({
    ...(MuiTableAdvancedOptionsProps as MRT_TableOptions<Articulo>),
    manualPagination: false, // <-- IMPORTANTE: Paginamos el Array localmente
    manualFiltering: false, // <-- Permitimos filtros visuales locales
    manualSorting: false, // <-- Ordenamiento local automático
    columns,
    data: reversedData,
    enableRowVirtualization: true,
    enablePagination: true,
    enableRowActions: true,
    positionActionsColumn: 'first',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Acciones',
        size: 100,
        grow: false,
      },
    },
    renderRowActions: ({ row }) => {
      // Acciones de menú para los artículos
      const menuActions: MrtMenuAction<Articulo>[] = [
        {
          label: 'Asociar Impresora',
          icon: <Print fontSize="small" />,
          color: 'primary',
          onClick: () => {
            setArticuloSelected(row.original)
            setOpenAsociarDialog(true)
          },
        },
      ]

      return (
        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <MrtRowMenu row={row.original} actions={menuActions} refetch={async () => refetch()} />
          <AuditIconButton row={row.original} />
        </Box>
      )
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Tooltip title="Actualizar Lista">
          <IconButton onClick={() => refetch()}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    muiTablePaperProps: {
      elevation: 0,
      variant: 'outlined',
      sx: {
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        margin: 0, // Quitamos el margen de la tabla
        overflow: 'hidden',
      },
    },
    muiTableContainerProps: {
      sx: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        '&::-webkit-scrollbar': { height: 6, width: 6 },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          borderRadius: 4,
        },
      }),
    },
    initialState: {
      showColumnFilters: true,
      pagination: { pageSize: 10, pageIndex: 0 }, // Máximo 10 por página
    },
    state: {
      isLoading,
      showAlertBanner: isError,
      density: 'compact',
    },
  })

  return (
    <>
      <SimpleContainerBox>
        <Breadcrumb routeSegments={[impresorasRoutesMap.gestion]} />
        <StackMenu asideSidebarFixed>
          <Button
            size={'small'}
            variant="contained"
            color="primary"
            startIcon={<Print />}
            onClick={() => setOpenGestionDialog(true)}
          >
            Agregar Impresora
          </Button>
          <Button
            size={'small'}
            variant="outlined"
            color="secondary"
            startIcon={<Settings />}
            onClick={() => setOpenConfigDialog(true)}
          >
            Configuración
          </Button>
        </StackMenu>

        <Box mt={2}>
          <MaterialReactTable table={table} />
        </Box>

        {/* Dialog para asociar impresoras */}
        {articuloSelected && (
          <AsociarImpresoraDialog
            open={openAsociarDialog}
            onClose={(success) => {
              setOpenAsociarDialog(false)
              setArticuloSelected(null)
              if (success) {
                refetch()
              }
            }}
            articulo={articuloSelected}
            allArticulos={data || []}
          />
        )}

        {/* Dialog centralizado para CRUD de las Impresoras (Sitios) */}
        {openGestionDialog && (
          <GestionImpresorasDialog open={openGestionDialog} onClose={() => setOpenGestionDialog(false)} />
        )}

        {/* Dialog local para configurar impresoras de comanda/recibos */}
        {openConfigDialog && (
          <ConfiguracionImpresorasDialog open={openConfigDialog} onClose={() => setOpenConfigDialog(false)} />
        )}
      </SimpleContainerBox>
    </>
  )
}

export default ListImpresoras
