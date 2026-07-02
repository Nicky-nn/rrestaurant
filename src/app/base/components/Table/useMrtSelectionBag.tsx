import { MRT_RowSelectionState } from 'material-react-table'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseMrtSelectionBagProps<T> {
  open: boolean
  currentDocs?: T[]
  idKey: keyof T
}

/*
// USAMOS NUESTRO HOOK, DESPUES DE CARGAR LOS DATOS data.docs
const { rowSelection, selectedItems, handleRemoveItem, onRowSelectionChange } =
  useMrtSelectionBag<ArticuloProps>({
    open,
    currentDocs: datos.data?.docs,
    idKey: 'codigoArticulo', // Le decimos cuál es la llave principal
  })

// EN TABLE CONFIG o useMaterialReactTable()
// Configuración del data table
const config: MrtTableConfig<ArticuloProps> = {
  id: 'listado-articulos-inventario-a2dd',
  columns,
  manualPagination: true,
  showIconRefetch: true,
  additionalOptions: {
    getRowId: (row) => row.codigoArticulo,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: { cursor: 'pointer' },
    }),
    muiSelectCheckboxProps: {
      sx: {
        '&.Mui-disabled': {
          backgroundColor: (theme) => theme.palette.text.disabled,
        },
      },
    },
    enableRowSelection: (row) => !bloquearCodigosArticulo.includes(row.original.codigoArticulo),
    enableMultiRowSelection: seleccionMultiple,
  },
}

// EN EL RENDER
// Este BOX es opcional
<Box
  sx={(theme) => ({
    p: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    minHeight: '40px',
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: 3,
    mb: 1,
  })}
>
  {selectedItems.map((art) => (
    <Chip
      key={art.codigoArticulo}
      label={`${art.codigoArticulo} - ${art.nombreArticulo || 'Artículo'}`}
      onDelete={() => handleRemoveItem(art.codigoArticulo)}
      color="primary"
      variant="outlined"
      size="small"
    />
  ))}
  {selectedItems.length === 0 && (
    <span style={{ color: '#999', fontSize: '0.85rem', margin: 'auto 0' }}>
      No hay artículos seleccionados
    </span>
  )}
</Box>
<MrtDynamicTable
  config={config}
  {...datos}
  state={{
    ...datos.state,
    rowSelection,
  }}
  onStateChange={{
    ...datos.onStateChange,
    onRowSelectionChange: onRowSelectionChange, // <--- LE PASAMOS EL INTERCEPTOR
  }}
 */

/**
 * Implementamos la selección para material-react-table, con bolsa pre-seleccionada (chips)
 * @param param0
 * @param param0.currentDocs
 * @param param0.idKey
 * @author isi-template
 */
export function useMrtSelectionBag<T extends Record<string, any>>({
  open,
  currentDocs = [],
  idKey,
}: UseMrtSelectionBagProps<T>) {
  // 1. Estados principales
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, T>>({})

  // Caché pasiva
  const docCache = useRef<Record<string, T>>({})

  // 2. Control de limpieza en el renderizado (Adiós Cascading Renders)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      // Al abrir, vaciamos la selección actual y la bolsa visual.
      // React unifica esto en el render inicial.
      setRowSelection({})
      setSelectedItemsMap({})
    }
  }

  // 3. Alimentar la caché silenciosamente
  useEffect(() => {
    if (currentDocs && currentDocs.length > 0) {
      currentDocs.forEach((doc) => {
        docCache.current[String(doc[idKey])] = doc
      })
    }
  }, [currentDocs, idKey])

  // 4. INTERCEPTOR: Actualizamos la bolsa SOLO cuando el usuario hace clic
  const onRowSelectionChange = useCallback(
    (updaterOrValue: MRT_RowSelectionState | ((prev: MRT_RowSelectionState) => MRT_RowSelectionState)) => {
      setRowSelection((prevSelection) => {
        const nextSelection =
          typeof updaterOrValue === 'function' ? updaterOrValue(prevSelection) : updaterOrValue

        setSelectedItemsMap((prevMap) => {
          const newMap = { ...prevMap }
          let changed = false

          Object.keys(nextSelection).forEach((id) => {
            if (!newMap[id] && docCache.current[id]) {
              newMap[id] = docCache.current[id]
              changed = true
            }
          })

          Object.keys(newMap).forEach((id) => {
            if (!nextSelection[id]) {
              delete newMap[id]
              changed = true
            }
          })

          return changed ? newMap : prevMap
        })

        return nextSelection
      })
    },
    [],
  )

  // 5. Eliminar desde los Chips
  const handleRemoveItem = useCallback(
    (id: string) => {
      onRowSelectionChange((prev) => {
        const newSelection = { ...prev }
        delete newSelection[id]
        return newSelection
      })
    },
    [onRowSelectionChange],
  )

  // 6. Lista final lista para la UI
  const selectedItems = useMemo(() => Object.values(selectedItemsMap), [selectedItemsMap])

  return {
    rowSelection,
    onRowSelectionChange,
    selectedItems,
    handleRemoveItem,
  }
}
