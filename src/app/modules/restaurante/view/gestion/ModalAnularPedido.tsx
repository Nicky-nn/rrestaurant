import { Box, Button, Checkbox, FormControlLabel, Modal, TextField, Typography, Grid } from '@mui/material'
import { MRT_ColumnDef } from 'material-react-table'
import React, { useEffect, useMemo, useState } from 'react'

import { MrtDynamicTable } from '../../../../base/components/Table/MrtDynamicTable.tsx'
import { MrtTableConfig } from '../../../../base/components/Table/mrtTypes.ts'
import useAuth from '../../../../base/hooks/useAuth'
import { useRestPedidoAnular } from '../../mutations/useRestPedidoAnular'
import { RestPedido } from '../../types'
import { getAnularPedidoColumns, ItemAnular } from './anularPedidoColumns.tsx'

interface ModalAnularPedidoProps {
  open: boolean
  pedido: RestPedido | null
  onClose: () => void
  onSuccess: () => void
}

export const ModalAnularPedido: React.FC<ModalAnularPedidoProps> = ({ open, pedido, onClose, onSuccess }) => {
  const { user } = useAuth()
  const anularMutation = useRestPedidoAnular()

  const [motivo, setMotivo] = useState('')
  const [selectAllItems, setSelectAllItems] = useState(false)
  const [selectAllStock, setSelectAllStock] = useState(false)
  const [itemsAnular, setItemsAnular] = useState<ItemAnular[]>([])

  useEffect(() => {
    if (open && pedido) {
      setItemsAnular(pedido.productos?.map(p => ({ ...p, selected: true, restoreStock: true })) ?? [])
      setMotivo('')
      setSelectAllItems(true)
      setSelectAllStock(true)
    }
  }, [open, pedido])

  const handleSelectAllItems = (checked: boolean) => {
    setSelectAllItems(checked)
    setItemsAnular(prev => prev.map(p => ({ ...p, selected: checked })))
  }

  const handleSelectAllStock = (checked: boolean) => {
    setSelectAllStock(checked)
    setItemsAnular(prev => prev.map(p => ({ ...p, restoreStock: checked })))
  }

  const anularColumns = useMemo(() => getAnularPedidoColumns(setItemsAnular), [setItemsAnular])

  const anularConfig = useMemo<MrtTableConfig<ItemAnular>>(
    () => ({
      id: 'anular-productos',
      columns: anularColumns,
      manualPagination: false,
      additionalOptions: {
        enablePagination: false,
        enableBottomToolbar: false,
        enableTopToolbar: false,
        enableSorting: false,
        enableColumnActions: false,
        enableColumnFilters: false,
        enableGlobalFilter: false,
        muiTablePaperProps: {
          elevation: 0,
          sx: { border: '1px solid #e0e0e0', mt: 2 }
        }
      }
    }),
    [anularColumns]
  )

  const handleConfirmAnular = async () => {
    if (!pedido || !pedido._id) return

    const selectedItems = itemsAnular.filter((item) => item.selected)
    const itemsInput = selectedItems.map((item) => ({
      nroItem: item.nroItem!,
      restablecerStock: item.restoreStock,
    }))

    try {
      await anularMutation.mutateAsync({
        id: pedido._id,
        entidad: {
          codigoSucursal: user.sucursal.codigo,
          codigoPuntoVenta: user.puntoVenta.codigo,
        },
        numeroPedido: pedido.numeroPedido!,
        descripcionMotivo: motivo,
        restablecerStock: selectAllStock,
        input: itemsInput.length > 0 ? itemsInput : undefined,
      } as any)
      onSuccess()
      onClose()
    } catch (e) {
      console.error('Error al anular pedido', e)
    }
  }

  if (!pedido) return null

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxHeight: '85vh',
          width: '90vw',
          maxWidth: '800px',
          overflowY: 'auto',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Anular Pedido {pedido.numeroPedido}
        </Typography>
        <TextField
          label="Motivo de Anulación"
          fullWidth
          margin="normal"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          multiline
          rows={2}
        />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAllItems}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              }
              label="Seleccionar Todos los Ítems"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectAllStock}
                  onChange={(e) => handleSelectAllStock(e.target.checked)}
                />
              }
              label="Seleccionar Todos para Restablecer Stock"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <MrtDynamicTable config={anularConfig} data={itemsAnular} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button onClick={onClose} color="inherit" variant="text">
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmAnular} disabled={anularMutation.isPending}>
            Confirmar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
