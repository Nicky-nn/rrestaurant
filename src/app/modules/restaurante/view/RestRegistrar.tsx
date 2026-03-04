import { Grid } from '@mui/material'
import { FunctionComponent } from 'react'

import RrAcciones from './registrar/RrAcciones'
import RrCarrito from './registrar/RrCarrito'
import RrCategoriasProductos from './registrar/RrCategoriasProductos'
import RrMesas from './registrar/RrMesas'

/**
 * RestRegistrar
 * Layout de 2 columnas:
 *  - Columna izquierda:  RrMesas + RrCategoriasProductos
 *  - Columna derecha:    RrCarrito + RrAcciones
 * Ambas columnas se estiran a la altura de la columna izquierda (mesas).
 */
const RestRegistrar: FunctionComponent = () => {
  return (
    <Grid container spacing={2}>
      {/* Columna izquierda: Mesas + Categorías/Productos */}
      <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <RrMesas />
        <RrCategoriasProductos />
      </Grid>

      {/* Columna derecha: Carrito + Acciones */}
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <RrCarrito />
        <RrAcciones />
      </Grid>
    </Grid>
  )
}

export default RestRegistrar
