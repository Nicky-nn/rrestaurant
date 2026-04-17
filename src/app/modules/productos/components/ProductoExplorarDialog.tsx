import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React, { FunctionComponent, useState } from 'react'

import { ProductoVarianteProps } from '../interfaces/producto.interface'
import ProductosVariantes from './ProductosVariantes'

interface OwnProps {
  id: string
  keepMounted: boolean
  open: boolean
  onClose: (value?: ProductoVarianteProps[]) => void
  codigoActividad: string
}

type Props = OwnProps

const ProductoExplorarDialog: FunctionComponent<Props> = (props) => {
  const { onClose, codigoActividad, open, ...other } = props
  const [rowSelection, setProductosVariantes] = useState<ProductoVarianteProps[]>([])
  const handleAddProds = () => {
    if (rowSelection.length > 0) {
      onClose(rowSelection)
    }
  }

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100vh' } }}
        maxWidth="xl"
        open={open}
        {...other}
      >
        <DialogTitle>Explorar Productos</DialogTitle>
        <DialogContent dividers>
          <ProductosVariantes
            codigoActividad={codigoActividad}
            setProductosVariantes={setProductosVariantes}
          />
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', marginLeft: 10 }}>
          <Button
            autoFocus
            color={'error'}
            variant={'contained'}
            onClick={() => onClose()}
          >
            Cerrar
          </Button>
          <Button
            sx={{ mr: 2 }}
            disabled={rowSelection.length === 0}
            autoFocus
            color={'primary'}
            variant={'contained'}
            onClick={() => handleAddProds()}
          >
            Adicionar Productos
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductoExplorarDialog
