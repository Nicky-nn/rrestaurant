import { AssignmentReturn } from '@mui/icons-material'
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import React, { FunctionComponent } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput'
import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard'
import { NcdInputProps } from '../../interfaces/ncdInterface'
import InputNumber from 'rc-input-number'

interface OwnProps {
  form: UseFormReturn<NcdInputProps>
}

type Props = OwnProps

const NcdFacturaDevolucion: FunctionComponent<Props> = (props) => {
  const {
    form: {
      control,
      getValues,
      formState: { errors },
    },
  } = props

  const { update } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'detalleFactura', // unique name for your Field Array
  })
  return (
    <>
      <SimpleCard
        title={
          <Box display="flex" alignItems="center">
            <AssignmentReturn sx={{ mr: 1 }} />
            DATOS DE LA DEVOLUCIÓN
          </Box>
        }
      >
        <Grid container spacing={3}>
          <Grid size={{ lg: 12, md: 12, xs: 12 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small" aria-label="datos de la devolucion">
                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ width: 100, fontWeight: 'bold' }}>NRO. ITEM</TableCell>
                    <TableCell sx={{ width: 160, fontWeight: 'bold' }}>CANTIDAD</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>DESCRIPCIÓN</TableCell>
                    <TableCell align="right" sx={{ width: 160, fontWeight: 'bold' }}>PRECIO UNIT.</TableCell>
                    <TableCell align="right" sx={{ width: 160, fontWeight: 'bold' }}>DESCUENTO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getValues('detalleFactura').length > 0 &&
                    getValues('detalleFactura').map((item, index) => {
                      return (
                        <TableRow key={item.nroItem} hover>
                          <TableCell>{item.nroItem}</TableCell>
                          <TableCell>
                            <InputNumber
                              min={0.1}
                              max={item.cantidadOriginal}
                              value={item.cantidad}
                              onChange={(cantidad: number | null) => {
                                if (cantidad) {
                                  if (cantidad >= 0) {
                                    update(index, {
                                      ...item,
                                      cantidad,
                                    })
                                  }
                                }
                              }}
                              formatter={numberWithCommas}
                            />
                          </TableCell>
                          <TableCell>{item.descripcion}</TableCell>
                          <TableCell align="right">
                            {numberWithCommas(item.precioUnitario, {})}
                          </TableCell>
                          <TableCell align="right">
                            {numberWithCommas(item.montoDescuento, {})}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </SimpleCard>
    </>
  )
}

export default NcdFacturaDevolucion
