import { MRT_TableOptions } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'

import {
  MuiDisplayColumnDefOptions,
  MuiFilterTextFieldProps,
  MuiSearchTextFieldProps,
  MuiTablePaginationProps,
  MuiTablePaperProps,
  MuiTableProps,
} from './materialReactTableUtils'
/*
  // ESTADO DATATABLE
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  // const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<MRT_SortingState>([])
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: PAGE_DEFAULT.page,
    pageSize: PAGE_DEFAULT.limit,
  })
  const [rowCount, setRowCount] = useState<number>(0)
  // const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // FIN ESTADO DATATABLE

  const columns = useMemo<MRT_ColumnDef<User>[]>(
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
      },
      {
        accessorKey: 'state',
        header: 'Estado',
        accessorFn: (row) => (
          <Chip
            color={
              row.state === apiEstado.validada
                ? 'success'
                : row.state === apiEstado.pendiente
                  ? 'warning'
                  : 'error'
            }
            label={row.state}
            size={'small'}
          />
        ),
        filterVariant: 'select',
        filterSelectOptions: muiTableApiEstado,
        filterFn: (row, id, filterValue) =>
          row.original.state.toLowerCase().startsWith(filterValue.toLowerCase()),
      },
    ])
  );

  // API FETCH
  const { data, isError, isRefetching, isLoading, refetch } = useQuery<TYPE[]>({
    queryKey: [ 'rolesTableTableData', columnFilters, pagination.pageIndex, pagination.pageSize, sorting],
    queryFn: async () => {
      const query = genApiQuery(columnFilters)
      const fetchPagination: PageProps = {
        ...PAGE_DEFAULT,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        reverse: sorting.length <= 0,
        query,
      }
      const { pageInfo, docs } = await apiRoles(fetchPagination)
      setRowCount(pageInfo.totalDocs)
      return docs
    },
    refetchOnWindowFocus: true,
    refetchInterval: false,
  })
  // FIN API FETCH

  // USE TABLE
  const table = useMaterialReactTable({
    ...(MuiTableAdvancedOptionsProps as MRT_TableOptions<ArticuloProp>),
    columns: columns,
    data: data || [],
    muiToolbarAlertBannerProps: MuiToolbarAlertBannerProps(isError),
    state: {
      isLoading,
      columnFilters,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      density: 'compact',
      sorting,
    },
    renderTopToolbarCustomActions: () => (
      <MuiRenderTopToolbarCustomActions refetch={refetch} />
    ),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    rowCount,
    positionToolbarAlertBanner: 'bottom',
    renderRowActions: ({ row }) => (<>
      <SimpleMenu
        menuButton={
          <IconButton aria-label="menuGestionRoles">
            <MenuOpen />
          </IconButton>
        }
      >
        <SimpleMenuItem>
          <Link to={genPath(articuloRoutesMap.actualizar.path, { id: row.original._id })}>
            <Edit /> Actualizar
          </Link>
        </SimpleMenuItem>
      </SimpleMenu>
      <AuditIconButton row={row.original} />
      </>
    ),
  })
   // FIN RENDER
 */

/**
 * @description propiedades de la tabla muy básica según especificaciones de MUI
 * @author isi-template
 * cambio v2 = muiTableHeadCellFilterTextFieldProps -> muiFilterTextFieldProps
 * renderTopToolbarCustomActions = MuiRenderTopToolbarCustomActions = nos permite añadir el btn de refresh manualmente
 * renderRowActions = MuiRenderRowActions = nos permite añadir acciones de fila
 */
export const MuiTableAdvancedOptionsProps: MRT_TableOptions<any> = {
  columns: [],
  data: [],
  manualFiltering: true,
  manualPagination: true,
  manualSorting: true,
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
  // mrtTheme: (theme) => ({
  //   ...MuiTableMrtTheme(theme),
  // }),
  muiSearchTextFieldProps: MuiSearchTextFieldProps,
  displayColumnDefOptions: MuiDisplayColumnDefOptions,
}
