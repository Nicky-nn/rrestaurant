import { Box, Paper, Typography } from '@mui/material'
import { FunctionComponent } from 'react'

import { MesaUI } from '../../interfaces/mesa.interface'

interface RrCarritoProps {
  mesaSeleccionada?: MesaUI | null
}

const RrCarrito: FunctionComponent<RrCarritoProps> = ({ mesaSeleccionada }) => {
  return (
    <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Carrito JSON
      </Typography>

      {mesaSeleccionada ? (
        <Box
          component="pre"
          sx={{
            fontSize: '0.75rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            backgroundColor: '#f5f5f5',
            p: 1,
            borderRadius: 1,
          }}
        >
          {JSON.stringify(mesaSeleccionada, null, 2)}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Selecciona una mesa
        </Typography>
      )}
    </Paper>
  )
}

export default RrCarrito
