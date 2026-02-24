import { alpha } from '@mui/material'
import { MRT_TableOptions } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'

import {
  MuiDisplayColumnDefOptions,
  MuiFilterTextFieldProps,
  MuiTablePaginationProps,
  MuiTablePaperProps,
  MuiTableProps,
} from './materialReactTableUtils'

/*
  // ESTADO DATATABLE
  // const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // FIN ESTADO DATATABLE

  const columns = useMemo<MRT_ColumnDef<Props>[]>(
    () => [
     {
        accessorFn: (row) => new Date(row.lastLogin),
        id: 'lastLogin',
        header: 'Last Login',
        Cell: ({ cell }) => new Date(cell.getValue<Date>()).toLocaleString(),
        filterFn: 'greaterThan',
        filterVariant: 'date',
        enableGlobalFilter: false,
        enableColumnFilter: false,
        size: 100,
        muiTableBodyCellProps: {
          align: 'right',
        },
      },
    ])
  );

  // API FETCH
  const { data, isError, isRefetching, isLoading, refetch } = useQuery<Props[]>(
    {
      queryKey: ['idFetch'],
      queryFn: async () => {
        const docs = await apiFetch()
        return docs || []
      },
      refetchOnWindowFocus: false,
      refetchInterval: false,
    },
  )
  // FIN API FETCH

  // RENDER
  <MaterialReactTable
      {...(MuiTableNormalOptionsProps as MRT_TableOptions<PuntoVentaProps>)}
      columns={columns}
      data={data ?? []}
      initialState={{ showColumnFilters: true }}
      muiToolbarAlertBannerProps={MuiToolbarAlertBannerProps(isError)}
      renderTopToolbarCustomActions={() => (
        <MuiRenderTopToolbarCustomActions refetch={refetch}>
          <Button>
            Option
          </Button>
        </MuiRenderTopToolbarCustomActions>
      )}
      state={{
        isLoading,
        showAlertBanner: isError,
        showProgressBars: isRefetching,
        density: 'compact',
        // rowSelection
      }}
      renderRowActions={({ row }) => (
        <>
          <SimpleMenu
            menuButton={
              <>
                <IconButton aria-label="menuGestionRoles">
                  <MenuOpen />
                </IconButton>
              </>
            }
          >
            <SimpleMenuItem
              onClick={(e) => {
                e.preventDefault()
                // row.original.argumento
              }}
            >
              <Edit /> Modificar
            </SimpleMenuItem>
          <AuditIconButton row={row.original} />
        </>
      )}
    />
   // FIN RENDER
 */

/**
 * @description propiedades de la tabla muy básica según especificaciones de MUI
 * @author isi-template
 * cambio v2 = muiTableHeadCellFilterTextFieldProps -> muiFilterTextFieldProps
 * renderTopToolbarCustomActions = MuiRenderTopToolbarCustomActions = nos permite añadir el btn de refresh manualmente
 * renderRowActions = MuiRenderRowActions = nos permite añadir acciones de fila
 */
export const MuiTableNormalOptionsProps: MRT_TableOptions<any> = {
  columns: [],
  data: [],
  enableDensityToggle: false,
  enableGlobalFilter: false,
  localization: MRT_Localization_ES,
  enableRowActions: true,
  positionActionsColumn: 'first',
  muiFilterTextFieldProps: MuiFilterTextFieldProps,
  enableColumnResizing: true,
  layoutMode: 'grid',
  paginationDisplayMode: 'default',
  positionToolbarAlertBanner: 'head-overlay',
  muiPaginationProps: {
    ...MuiTablePaginationProps,
  },
  muiTablePaperProps: {
    ...MuiTablePaperProps,
  },
  muiTableProps: MuiTableProps,
  displayColumnDefOptions: MuiDisplayColumnDefOptions,
  mrtTheme: (theme) => ({
    baseBackgroundColor: theme.palette.background.paper,
    draggingBorderColor: theme.palette.secondary.main,
    matchHighlightColor: alpha(theme.palette.primary.main, 0.5),
  }),
  muiDetailPanelProps: () => ({
    sx: (theme) => ({
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    }),
  }),
  // enableRowVirtualization: true,
  // rowVirtualizerOptions: { overscan: 10 }, //optionally customize the row virtualizer
}
