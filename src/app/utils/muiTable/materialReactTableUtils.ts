import { PaperProps, TextFieldProps, Theme } from '@mui/material'
import { AlertProps } from '@mui/material/Alert'
import { TableProps } from '@mui/material/Table'
import { MRT_DisplayColumnDef, MRT_RowData, MRT_TableOptions } from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'

/**
 * @description Espacio de para las acciones de fila
 * @author isi-template
 * @deprecated
 */
export const muiTableApiEstado = ['ANULADO', 'VALIDADA', 'ELABORADO', 'PENDIENTE']

export const tableThemeLigth = 'rgba(254, 254, 254, 1)'

export type DcdoProps<TData extends MRT_RowData, TValue = unknown> = Partial<{
  [key: string]: Partial<MRT_DisplayColumnDef<TData, TValue>>
}>

/**
 * @description Espacio de para las acciones de fila
 * @author isi-template
 */
export const MuiDisplayColumnDefOptions: DcdoProps<any> = {
  'mrt-row-actions': {
    muiTableHeadCellProps: {
      align: 'left',
      headers: 'Acciones',
    },
    size: 135,
    grow: false,
  },
}

/**
 * @description Custom columns
 * @author isi-template
 * @param size
 * @constructor
 */
export const MuiDisplayColumnDefOptionsV2 = (size: number = 50): DcdoProps<any> => ({
  'mrt-row-actions': {
    muiTableHeadCellProps: {
      align: 'left',
      headers: 'Acciones',
    },
    size,
    grow: true,
  },
})

/**
 * @description Input para búsquedas
 * @author isi-template
 */
export const MuiSearchTextFieldProps: TextFieldProps = {
  variant: 'outlined',
  placeholder: 'Búsqueda',
  InputLabelProps: { shrink: true },
  size: 'small',
}

/**
 * @author isi-template
 * @param isError
 * @constructor
 */
export const MuiToolbarAlertBannerProps = (isError: boolean): AlertProps | undefined =>
  isError ? { color: 'error', children: 'Error en cargar los datos' } : undefined

/**
 * @description Ancho de los inputs y propiedades segun mui
 * muiFilterTextFieldProps
 * @author isi-template
 */
export const MuiFilterTextFieldProps: TextFieldProps = {
  sx: { m: '0.5rem 0', width: '95%' },
  variant: 'outlined',
  size: 'small',
}

/**
 * @description propiedades de la tabla segun especificaciones de MUI
 * @author isi-template
 */
export const MuiTableProps: TableProps = {
  sx: {
    tableLayout: 'fixed',
    // border: '1px solid rgba(81, 81, 81, .1)',
    caption: {
      captionSide: 'top',
      padding: 0.5,
    },
  },
}
/**
 * @description propiedades de la tabla segun especificaciones de MUI
 * @author isi-template
 */
export const MuiTableCompactProps: TableProps = {
  sx: {
    tableLayout: 'fixed',
    border: '1px solid rgba(81, 81, 81, .2)',
    caption: {
      captionSide: 'top',
      padding: 0.5,
    },
  },
}

/**
 * Custom thema para la tabla
 * @author isi-template
 * @param theme
 * @constructor
 */
export const MuiTableMrtTheme = (theme: Theme) => ({
  baseBackgroundColor:
    theme.palette.mode === 'light' ? tableThemeLigth : theme.palette.primary.main, // Color en funcio a useTheme que se haya elegido
  draggingBorderColor: theme.palette.secondary.main,
})

/**
 * @description propiedades de la tabla paginación
 * @author isi-template
 */
export const MuiTablePaginationProps: any = {
  color: 'secondary',
  rowsPerPageOptions: [5, 10, 20, 50, 100],
  shape: 'rounded',
  variant: 'outlined',
}

/**
 * @description propiedades de la tabla segun especificaciones de MUI
 * @author isi-template
 */
export const MuiTablePaperProps: PaperProps = {
  variant: 'outlined',
}

/*
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
    {...(MuiTableBasicOptionsProps as MRT_TableOptions<FirmaDigitalProp>)}
    columns={columns || []}
    data={data ?? []}
    initialState={{ showColumnFilters: false }}
    muiToolbarAlertBannerProps={MuiToolbarAlertBannerProps(isError)}
    renderTopToolbarCustomActions={() => (
      <MuiRenderTopToolbarCustomActions refetch={refetch} />
    )}
    state={{
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      density: 'compact',
    }}
    renderRowActions={({ row }) => (
      <FirmaDigitalMenu row={row.original} refetch={refetch} />
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
export const MuiTableBasicOptionsProps: MRT_TableOptions<any> = {
  columns: [],
  data: [],
  enableColumnActions: false,
  enableColumnFilters: false,
  enablePagination: false,
  enableSorting: false,
  enableTableHead: false,
  enableDensityToggle: false,
  enableColumnPinning: false,
  enableHiding: false,
  enableFullScreenToggle: false,
  enableFilters: false,
  enableRowActions: false,
  enableBottomToolbar: false,
  muiTableProps: MuiTableCompactProps,
  muiTableBodyRowProps: { hover: false },
  initialState: {
    density: 'compact',
  },
  localization: MRT_Localization_ES,
}
