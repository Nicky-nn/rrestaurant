import { KeyboardArrowDown, KeyboardDoubleArrowDown, Refresh } from '@mui/icons-material'
import { alpha, Box, Divider, IconButton, Theme, Tooltip, Typography } from '@mui/material'
import {
  MaterialReactTable,
  MRT_ColumnFiltersState,
  MRT_RowSelectionState,
  MRT_SortingState,
  MRT_TableInstance,
  useMaterialReactTable,
} from 'material-react-table'
import { MRT_Localization_ES } from 'material-react-table/locales/es'
import React, { useCallback, useMemo } from 'react'

import { alphaByTheme, alphaNormal } from '../../../utils/colorUtils.ts'
import { MuiToolbarAlertBannerProps } from '../../../utils/muiTable/materialReactTableUtils.ts'
import { ActionIconButton } from './ActionIconButton.tsx'
import { MrtFlatTable } from './MrtFlatTable.tsx'
import { MrtAuditPopoverAction } from './MrtIconButtonAuditoria.tsx'
import { MrtRowMenu } from './MrtRowMenu.tsx'
import { MrtPaginatedResponse, MrtQueryFnResult, MrtTableConfig } from './mrtTypes.ts'

interface Props<T extends Record<string, any>> {
  // Propiedades de configuracion
  config: MrtTableConfig<T>
  // Datos (puede ser Array o Objeto Paginado)
  data?: MrtQueryFnResult<T>
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

const mrtRowExpandColor = (theme: Theme, props: { dark?: number; light?: number } = {}) =>
  alphaByTheme(theme.palette.primary.main, theme, props.dark ?? 0.3, props.light ?? 0.5)

// Evita recrear la función por defecto en cada render (previene Memory Leaks por closures)
const defaultRefetch = async () => {}

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
  refetch = defaultRefetch,
  state,
  onStateChange,
}: Props<T>) => {
  // 1. NORMALIZACIÓN INTELIGENTE DE DATOS
  const { tableData, totalCount, isServerSideData } = useMemo(() => {
    if (!data) return { tableData: [] as T[], totalCount: 0, isServerSideData: false }

    if ('docs' in (data as any)) {
      const p = data as MrtPaginatedResponse<T>
      return {
        tableData: p.docs || [],
        totalCount: p.pageInfo?.totalDocs ?? 0,
        isServerSideData: true,
      }
    }

    if (Array.isArray(data)) {
      return {
        tableData: data,
        totalCount: data.length,
        isServerSideData: false,
      }
    }

    return { tableData: [] as T[], totalCount: 0, isServerSideData: false }
  }, [data])

  // 2. DETECCIÓN DE MODO
  const hasStateHandlers =
    !!onStateChange?.onPaginationChange ||
    !!onStateChange?.onSortingChange ||
    !!onStateChange?.onColumnFiltersChange ||
    !!onStateChange?.onGlobalFilterChange

  const isManual = config.manualPagination ?? isServerSideData
  const isFullWidth = config.fullWidth ?? true

  const {
    state: _omittedState,
    onRowSelectionChange: _omittedOnSelection,
    ...cleanAdditionalOptions
  } = config.additionalOptions || {}

  // Memorizar el ancho de las acciones para no calcularlo en cada ciclo del render
  const actionColumnSize = useMemo(() => {
    const iconWidth = (config.rowIconsActions?.length || 0) * 32
    const auditWidth = config.showAudit ? 32 : 0
    const menuWidth = config.rowMenuActions ? 32 : 0
    const customActionsWidth = Array.isArray(config.rowActions)
      ? config.rowActions.reduce((acc, curr) => acc + (curr.width || 90), 0)
      : 0
    return iconWidth + auditWidth + menuWidth + customActionsWidth + 10
  }, [config.rowIconsActions, config.showAudit, config.rowMenuActions, config.rowActions])

  // Memorizar los renders en línea
  const renderRowActions = useCallback(
    ({ row }: any) => (
      <Box sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
        {config.rowMenuActions && (
          <MrtRowMenu row={row.original} actions={config.rowMenuActions} refetch={refetch} />
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
        {config.rowActions?.map((action, index) => (
          <Box key={`${action.id}-${index}`} id={`${action.id}-${index}`}>
            {action.render({ row: row.original, refetch })}
          </Box>
        ))}
        {config.showAudit && <MrtAuditPopoverAction data={row.original as any} />}
      </Box>
    ),
    [config.rowMenuActions, config.rowIconsActions, config.rowActions, config.showAudit, refetch],
  )

  const hasDetailPanel = !!config.renderDetailPanel

  const table = useMaterialReactTable<T>({
    columns: config.columns,
    data: tableData,
    rowCount: totalCount ?? 0,
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
      !!config.rowActions || !!config.rowIconsActions || !!config.showAudit || !!config.rowMenuActions,
    enableColumnResizing: true, // habilita el redimensionamiento de columnas
    enableDensityToggle: false, // Habilita el toggle de compacto y normal
    enableMultiRowSelection: config.multiSelection ?? false,
    enableRowSelection: config.enableSelection ?? false,
    enableColumnFilters: true, // Habilita la opción de filtros de columnas
    enableGlobalFilter: false, // Habilita el filtro global, default false
    enableSorting: true, // Habilita el ordenamiento por columna
    // Condicionar explícitamente la habilidad de expandir a la existencia del renderDetailPanel
    enableExpanding: hasDetailPanel,
    defaultColumn: { enableSorting: false }, // Pone en false el ordenamiento por defecto
    enableColumnActions: false, // Habilita las acciones de columna, 3 puntitos
    positionToolbarAlertBanner: 'bottom',
    localization: MRT_Localization_ES,
    layoutMode: isFullWidth ? 'grid' : 'semantic',
    // Estilos de Paper y tabla
    muiTablePaperProps: {
      variant: 'outlined',
      sx: { borderRadius: '12px', border: '1px solid', borderColor: 'divider' },
    },
    muiTableProps: {
      sx: { tableLayout: isFullWidth ? 'fixed' : 'auto', width: '100%' },
    },
    displayColumnDefOptions: {
      'mrt-row-expand': {
        size: 45,
        muiTableHeadCellProps: {
          sx: {
            padding: 0,
            mt: -1,
            position: 'relative',
            '& .Mui-TableHeadCell-Content': { height: '100%', width: '100%' },
            '& .Mui-TableHeadCell-Content-Wrapper': {
              flex: 1,
              height: '100%',
              width: '100%',
            },
            '& .Mui-TableHeadCell-Content-Labels': { flex: 1, height: '100%' },
          },
        },
        Header: ({ table }) => {
          if (!hasDetailPanel) return null
          const allExpanded = table.getIsAllRowsExpanded()
          return (
            <Box
              onClick={table.getToggleAllRowsExpandedHandler()}
              sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover .expand-icon-wrapper': {
                  borderColor: mrtRowExpandColor(theme),
                  backgroundColor: allExpanded
                    ? mrtRowExpandColor(theme)
                    : mrtRowExpandColor(theme, { dark: 0.2, light: 0.5 }),
                },
              })}
            >
              <Box
                className="expand-icon-wrapper"
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: allExpanded ? mrtRowExpandColor(theme) : 'transparent',
                  border: '2px solid',
                  borderColor: allExpanded ? mrtRowExpandColor(theme) : 'transparent',
                  transition: 'all 0.25s ease',
                })}
              >
                <KeyboardDoubleArrowDown
                  sx={(theme) => ({
                    color: allExpanded ? 'white' : theme.palette.primary.main,
                    transform: allExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  })}
                />
              </Box>
            </Box>
          )
        },
        Cell: ({ row }) => {
          if (!row || !hasDetailPanel) return undefined

          // Verificamos si MRT determinó que esta fila NO se puede expandir
          if (!row.getCanExpand()) {
            // Retornamos un contenedor vacío para mantener la estructura y alineación de la tabla
            return <Box sx={{ width: '100%', height: '100%' }} />
          }

          return (
            <Box
              onClick={() => row.toggleExpanded()}
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: alphaNormal(theme.palette.primary.main, 0.1),
                },
                '&:active': {
                  backgroundColor: alphaNormal(theme.palette.primary.main, 0.16),
                },
              })}
            >
              <Box
                className="expand-icon-wrapper"
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: row.getIsExpanded()
                    ? mrtRowExpandColor(theme, { dark: 0.15, light: 0.15 })
                    : 'transparent',
                  border: '1px solid',
                  borderColor: row.getIsExpanded() ? 'primary.main' : 'transparent',
                  transition: 'all 0.25s ease',
                })}
              >
                <KeyboardArrowDown
                  sx={{
                    color: 'primary.main',
                    transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </Box>
            </Box>
          )
        },
      },
      'mrt-row-actions': {
        header: 'Opciones',
        size: actionColumnSize, // Usamos el tamaño memorizado
        minSize: 40,
        muiTableHeadCellProps: {
          sx: {
            '& > .Mui-TableHeadCell-Content': {
              justifyContent: 'center',
              width: '100%',
            },
            textAlign: 'center',
            fontWeight: 700,
          },
        },
        muiTableBodyCellProps: {
          sx: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        },
      },
    },

    renderRowActions, // Usamos la función memorizada

    // Le decimos a MRT qué filas específicas pueden expandirse
    getRowCanExpand: (row) => {
      if (!hasDetailPanel) return false
      // Evaluamos tu función; si retorna null/undefined, la fila no se puede expandir
      const panelContent = config.renderDetailPanel!(row.original)
      return panelContent !== null && panelContent !== undefined
    },
    renderDetailPanel: hasDetailPanel ? ({ row }) => config.renderDetailPanel!(row.original) : undefined,

    muiDetailPanelProps: () => ({
      sx: (theme) => ({
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      }),
    }),
    // Toolbars
    ...((config.title || config.showIconRefetch || config.renderTopToolbarCustomActions) && {
      renderTopToolbarCustomActions: ({ table }) => {
        const tableInstance = table as unknown as MRT_TableInstance<T>
        return (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
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
    muiTableBodyCellProps: { sx: { display: 'flex', alignItems: 'center' } },

    muiTableBodyRowProps: ({ row }) => ({
      ...(config.getRowProps?.(row.original) ?? {}),
    }),
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.paper,
      draggingBorderColor: theme.palette.secondary.main,
      matchHighlightColor: alpha(theme.palette.primary.main, 0.5),
    }),
    ...cleanAdditionalOptions,
  })

  // 4. MODO PLANO
  if (config.isFlat) {
    return <MrtFlatTable data={tableData} columns={config.columns} options={config.flatOptions} />
  }

  return <MaterialReactTable table={table} />
}
