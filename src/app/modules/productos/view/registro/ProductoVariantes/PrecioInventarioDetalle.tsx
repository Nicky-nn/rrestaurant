import { Box, Typography } from '@mui/material'
import React, { FunctionComponent } from 'react'

import { numberWithCommas } from '../../../../../base/components/MyInputs/NumberInput'
import { genReplaceEmpty } from '../../../../../utils/helper'
import { ProductoVarianteInputProps } from '../../../interfaces/producto.interface'

interface OwnProps {
  row: ProductoVarianteInputProps
}

type Props = OwnProps

const PrecioInventarioDetalle: FunctionComponent<Props> = (props) => {
  const { row, ...other } = props
  return (
    <Box
      sx={{
        display: 'grid',
        margin: 1,
        gridTemplateColumns: '1fr 1fr',
        width: '100%',
      }}
    >
      <Typography>Unidad Medida: {row.unidadMedida?.descripcion || ''}</Typography>

      <Typography>
        Precio Comparación:{' '}
        {numberWithCommas(genReplaceEmpty(row.precioComparacion, 0), {})}
      </Typography>

      <Typography>
        Costo: {numberWithCommas(genReplaceEmpty(row.costo, 0), {})}
      </Typography>

      <Typography>Código de barras: {row.codigoBarras || ''}</Typography>
    </Box>
  )
}

export default PrecioInventarioDetalle
