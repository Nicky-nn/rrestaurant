import React, { FunctionComponent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

interface ModalProductosProps {
  id: string
  keepMounted: boolean
  open: boolean
  onClose: () => void
  tiposPedidos: any
  cart: any[]
  setCart: (cart: any[]) => void
  selectedOption: any
}

const ModalProductos: FunctionComponent<ModalProductosProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Agregar Producto</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Buscador de productos / Selector a implementar.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalProductos
