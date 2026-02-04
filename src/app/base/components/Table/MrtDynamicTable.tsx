import { Refresh } from '@mui/icons-material'
import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import {
  MaterialReactTable,
  MRT_ColumnFiltersState,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableInstance,
  useMaterialReactTable,
} from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import React, { useMemo } from 'react'

import { MuiToolbarAlertBannerProps } from '../../../utils/muiTable/materialReactTableUtils.ts'
import { ActionIconButton } from './ActionIconButton.tsx'
import { MrtFlatTable } from './MrtFlatTable.tsx'
import { MrtAuditPopoverAction } from './MrtIconButtonAuditoria.tsx'
import { MrtRowMenu } from './MrtRowMenu.tsx'
import { MrtPaginatedResponse, MrtQueryFnResult, MrtTableConfig } from './mrtTypes.ts'

/*
//   CASO SIN usrMrtQuery
  const queryState = useMrtQueryState()

  const query = useQuery({
    queryKey: ['notas-produccion-registro', codigoSucursal, queryState.debouncedState],
    queryFn: async () => {
      const filterFields = [`state=${apiEstadoNotaProduction.elaborado}`]
      const pgs = genMrtQueryPagination(queryState.debouncedState, {
        filterFields,
      })
      const { pageInfo, docs } = await apiNoDeProListado(pgs)
      return { pageInfo, docs }
    },
  })
  <MrtDynamicTable
    config={config}
    data={query.data}
    state={queryState.state}
    onStateChange={queryState.onStateChange}
    refetch={query.refetch}
    isLoading={query.isLoading}
    isError={query.isError}
    isFetching={query.isFetching}
  />
//************************ caso con useMrtQuery ****************************
// Mapa de filtros para el sistema de filtros inteligentes
const CLIENT_FILTER_TYPES: FilterTypeMap<ClientProps> = {
  lineaCredito: 'boolean', // Convertirá "true" -> true
  telefono: 'number', // Convertirá "25" -> 25
  numeroDocumento: 'string',
}

const clientes = useMrtQuery({
  queryKey: ['clients'],
  queryFn: async (ctx) => {
    const pgs = genMrtQueryPagination(ctx, { filterTypes: CLIENT_FILTER_TYPES })
    return await apiClienteListado(pgs)
  },
  isServerSide: true,
})
<MrtDynamicTable config={config} {...clientes} />
 */

interface Props<T extends Record<string, any>> {
  // Propiedades de configuracion
  config: MrtTableConfig<T>
  // Datos (puede ser Array o Objeto Paginado)
  data?: MrtQueryFnResult<T>
  // Estados de Carga
  isLoading?: boolean
  isFetching?: boolean
  isError?: boolean
  refetch?: () => Promise<any>

  // Sincronización de Estado (Opcional, para modo Servidor)
  state?: {
    pagination?: { pageIndex: number; pageSize: number }
    sorting?: MRT_SortingState
    columnFilters?: MRT_ColumnFiltersState
    globalFilter?: string
    rowSelection?: MRT_RowSelectionState
  }

  // Setters de Estado (Opcional, para modo Servidor)
  onStateChange?: {
    onPaginationChange?: (updater: any) => void
    onSortingChange?: (updater: any) => void
    onColumnFiltersChange?: (updater: any) => void
    onGlobalFilterChange?: (updater: any) => void
    onRowSelectionChange?: (updater: any) => void
  }
}

/**
 * Componente de tabla dinámica completa reutilizable
 * @param config
 * @param externalData
 * @param onStateChange
 * @author isi-template
 * @constructor
 */
export const MrtDynamicTable = <T extends Record<string, any>>({
  config,
  data,
  isLoading = false,
  isFetching = false,
  isError = false,
  refetch = async () => {},
  state,
  onStateChange,
}: Props<T>) => {
  // 1. NORMALIZACIÓN INTELIGENTE DE DATOS
  const { tableData, totalCount, isServerSideData } = useMemo(() => {
    if (!data) return { tableData: [] as T[], totalCount: 0, isServerSideData: false }

    // Caso A: Respuesta paginada { docs, pageInfo }
    if ('docs' in (data as any)) {
      const p = data as MrtPaginatedResponse<T>
      return {
        tableData: p.docs || [],
        totalCount: p.pageInfo?.totalDocs ?? 0,
        isServerSideData: true,
      }
    }

    // Caso B: Array simple (Cliente)
    if (Array.isArray(data)) {
      return {
        tableData: data,
        totalCount: data.length,
        isServerSideData: false,
      }
    }

    return { tableData: [] as T[], totalCount: 0, isServerSideData: false }
  }, [data])

  // 2. DETECCIÓN DE MODO (Servidor vs Cliente)
  // Detectamos si el componente recibe handlers de estado, paginacion, busqueda, etc
  const hasStateHandlers =
    !!onStateChange?.onPaginationChange ||
    !!onStateChange?.onSortingChange ||
    !!onStateChange?.onColumnFiltersChange ||
    !!onStateChange?.onGlobalFilterChange

  // Prioridad: config.manualPagination explícito > detección automática basada en data
  const isManual = config.manualPagination ?? isServerSideData
  const isFullWidth = config.fullWidth ?? true

  const {
    state: _omittedState,
    onRowSelectionChange: _omittedOnSelection,
    ...cleanAdditionalOptions
  } = config.additionalOptions || {}

  const table = useMaterialReactTable<T>({
    columns: config.columns,
    data: tableData, // Aquí tableData es estrictamente T[]
    rowCount: totalCount ?? 0, // Cantidad total de registros
    // Modos de Control
    manualPagination: isManual,
    manualFiltering: isManual,
    manualSorting: isManual,
    // Estados
    initialState: {
      showColumnFilters: true,
      density: 'compact',
      ...config.additionalOptions?.initialState,
    },
    state: {
      isLoading,
      showProgressBars: isFetching,
      showAlertBanner: isError,
      density: 'compact',
      ...state,
    },
    // Eventos
    ...(hasStateHandlers && {
      onPaginationChange: onStateChange?.onPaginationChange,
      onSortingChange: onStateChange?.onSortingChange,
      onColumnFiltersChange: onStateChange?.onColumnFiltersChange,
      onGlobalFilterChange: onStateChange?.onGlobalFilterChange,
      onRowSelectionChange: onStateChange?.onRowSelectionChange,
    }),

    ...(onStateChange?.onRowSelectionChange && {
      onRowSelectionChange: onStateChange?.onRowSelectionChange,
    }),

    // Ui generales
    enableRowActions:
      !!config.rowActions ||
      !!config.rowIconsActions ||
      !!config.showAudit ||
      !!config.rowMenuActions, // Activa las acciones de fila
    enableColumnResizing: true, // habilita el redimensionamiento de columnas
    enableDensityToggle: false, // Habilita el toggle de compacto y normal
    enableMultiRowSelection: config.multiSelection ?? false,
    enableRowSelection: config.enableSelection ?? false,
    enableColumnFilters: true, // Habilita la opción de filtros de columnas
    enableGlobalFilter: false, // Habilita el filtro global, default false
    enableSorting: true, // Habilita el ordenamiento por columna
    defaultColumn: {
      // Pone en false el ordenamiento por defecto
      enableSorting: false,
    },
    enableColumnActions: false, // Habilita las acciones de columna, 3 puntitos
    positionToolbarAlertBanner: 'bottom',
    localization: MRT_Localization_ES,
    layoutMode: isFullWidth ? 'grid' : 'semantic',
    // Estilos de Paper y tabla
    muiTablePaperProps: {
      variant: 'outlined',
      sx: {
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: isFullWidth ? 'fixed' : 'auto',
        width: '100%',
      },
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Opciones',
        size: (() => {
          // 1. Calculamos el ancho de los iconos base (35px c/u)
          const iconWidth = (config.rowIconsActions?.length || 0) * 32
          const auditWidth = config.showAudit ? 32 : 0
          const menuWidth = config.rowMenuActions ? 32 : 0

          // Sumamos los anchos definidos por el usuario o un default de 80px por botón
          const customActionsWidth = Array.isArray(config.rowActions)
            ? config.rowActions.reduce((acc, curr) => acc + (curr.width || 90), 0)
            : 0

          // Retornamos la suma total + un pequeño margen de seguridad
          return iconWidth + auditWidth + menuWidth + customActionsWidth + 10
        })(),
        minSize: 40,
        muiTableHeadCellProps: {
          sx: {
            '& > .Mui-TableHeadCell-Content': { justifyContent: 'center', width: '100%' },
            textAlign: 'center',
            fontWeight: 700,
          },
        },
        muiTableBodyCellProps: {
          sx: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
        },
      },
    },
    // Renderizado de acciones
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
        {config.rowMenuActions && (
          <MrtRowMenu
            row={row.original}
            actions={config.rowMenuActions}
            refetch={refetch}
          />
        )}
        {config.rowIconsActions?.map((action, i) => {
          const isHidden = action.hidden ? action.hidden(row.original) : false
          if (isHidden) return null
          return (
            <ActionIconButton
              key={i}
              row={row.original}
              refetch={refetch}
              {...action}
              disabled={action.enabled ? !action.enabled(row.original) : false}
              loading={action.loading ? action.loading(row.original) : false}
            />
          )
        })}
        {config.rowActions?.map((action) => (
          <Box key={action.id}>{action.render({ row: row.original, refetch })}</Box>
        ))}
        {config.showAudit && <MrtAuditPopoverAction data={row.original as any} />}
      </Box>
    ),
    // panel de detalles
    renderDetailPanel: config.renderDetailPanel
      ? ({ row }) => config.renderDetailPanel!(row.original)
      : undefined,
    muiDetailPanelProps: {
      sx: {
        width: '100%',
        '& > .MuiTableCell-root': { p: 0, borderBottom: 'none', width: '100%' },
        '& > .MuiTableCell-root > .MuiCollapse-root': {
          width: '100% !important',
          maxWidth: 'unset !important',
          display: 'block',
        },
      },
    },
    // Toolbars
    ...((config.title ||
      config.showIconRefetch ||
      config.renderTopToolbarCustomActions) && {
      renderTopToolbarCustomActions: ({ table }) => {
        const tableInstance = table as unknown as MRT_TableInstance<T>
        return (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            {(config.showIconRefetch || config.title) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {config.showIconRefetch && (
                  <Tooltip title="Actualizar" disableInteractive placement={'top'}>
                    <span>
                      <IconButton
                        onClick={() => refetch()}
                        disabled={isFetching}
                        size="small"
                        color={'default'}
                      >
                        <Refresh
                          sx={{
                            animation: isFetching ? 'spin 1s linear infinite' : 'none',
                          }}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {config.title && (
                  <Typography variant="subtitle1" fontWeight={700}>
                    {config.title}
                  </Typography>
                )}
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              </Box>
            )}
            {config.renderTopToolbarCustomActions?.({
              table: tableInstance,
              data: tableData,
              refetch,
            })}
          </Box>
        )
      },
    }),
    ...(config.renderBottomToolbarCustomActions && {
      renderBottomToolbarCustomActions: ({ table }) => {
        const tableInstance = table as unknown as MRT_TableInstance<T>
        return (
          <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
            {config.renderBottomToolbarCustomActions!({
              table: tableInstance,
              data: tableData,
              refetch,
            })}
          </Box>
        )
      },
    }),
    muiToolbarAlertBannerProps: MuiToolbarAlertBannerProps(isError),
    muiFilterTextFieldProps: {
      // Estilo de los inputs de filtro
      sx: {
        m: '0.1rem 0',
        backgroundColor: (theme) => theme.palette.background.default,
        width: '80%',
      },
      variant: 'outlined',
      size: 'small',
      placeholder: 'Filtrar...',
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50],
      showFirstButton: true,
      showLastButton: true,
    },
    muiTableBodyCellProps: {
      sx: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    muiTableBodyRowProps: ({ row }) => {
      // Obtenemos las propiedades personalizadas de la configuración del módulo
      const customProps = config.getRowProps?.(row.original) ?? {}
      return {
        ...customProps, // Mantenemos eventos como onClick y props base
        hover: true,
      }
    },
    ...cleanAdditionalOptions,
  })

  /************************************************************************************/
  /************************************************************************************/

  // 4. MODO PLANO (Early Return)
  if (config.isFlat) {
    return (
      <MrtFlatTable
        data={tableData}
        columns={config.columns}
        options={config.flatOptions}
      />
    )
  }

  return <MaterialReactTable table={table} />
}
