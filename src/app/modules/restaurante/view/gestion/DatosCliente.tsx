import React, { FunctionComponent } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material'
import { UseFormReturn } from 'react-hook-form'
import { ClientProps } from '../../../clients/interfaces/client'

interface DatosClienteProps {
  form: UseFormReturn<any>
}

const DatosCliente: FunctionComponent<DatosClienteProps> = ({ form }) => {
  const cliente: ClientProps | null = form.watch('cliente')

  if (!cliente) return null

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ p: 1, bgcolor: 'background.default' }}>
        Datos del Cliente Seleccionado
      </Typography>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '30%' }}>
              Razón Social / Nombre
            </TableCell>
            <TableCell>
              {cliente.razonSocial || `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim()}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
              NIT/CI/CEX
            </TableCell>
            <TableCell>
              {cliente.numeroDocumento} {cliente.complemento ? ` - ${cliente.complemento}` : ''}
              {cliente.tipoDocumentoIdentidad && cliente.tipoDocumentoIdentidad.descripcion
                ? ` (${cliente.tipoDocumentoIdentidad.descripcion})`
                : ''}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
              Correo Electrónico
            </TableCell>
            <TableCell>{cliente.email || 'N/A'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DatosCliente
