import { CheckCircle } from '@mui/icons-material'
import {
  Box,
  BoxProps,
  Button,
  Link,
  Popover,
  Typography,
  TypographyProps,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { FunctionComponent, useEffect, useState } from 'react'

import { numberWithCommasPlaces } from '../MyInputs/NumberInput'
import NumberSpinnerField from '../NumberSpinnerField/NumberSpinnerField'

interface OwnProps {
  id: string
  label?: React.ReactElement | string // Text antecedido al monto
  monto: number // monto a pasar
  sigla?: string // sigla de la moneda
  decimales?: number // numero de decimales, default 2
  boxProps?: BoxProps
  siglaProps?: TypographyProps
  montoProps?: TypographyProps
  onChange: (value?: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  editar?: boolean
}

type Props = OwnProps

/**
 * Creamos un monto con su sigla moneda y ademas que el monto sea editable
 * @param props
 * @constructor
 */
const ParseMontoMonedaEditable: FunctionComponent<Props> = (props) => {
  const {
    id,
    label,
    monto,
    sigla,
    decimales,
    boxProps = {},
    siglaProps = {},
    montoProps = {},
    onChange,
    min = 0.01,
    max,
    step = 0.01,
    unit,
    editar = true,
  } = props

  const [inputMonto, setInputMonto] = useState<number | undefined | null>(null)
  const [anchorMonto, setAnchorMonto] = useState<any | null>(null)

  const open = Boolean(anchorMonto)
  const idPopover = open ? `popover-monto-moneda-${id}` : undefined

  useEffect(() => {
    setInputMonto(monto)
  }, [monto])

  return (
    <>
      <Box id={id} {...boxProps}>
        {label && label}
        <Link
          href={'#'}
          onClick={(event) => {
            if (editar) {
              setInputMonto(monto)
              setAnchorMonto(event.currentTarget)
            }
          }}
          sx={{ fontWeight: 'bold' }}
        >
          <Typography variant={'inherit'} display={'inline'} {...montoProps}>
            {numberWithCommasPlaces(monto, decimales || 2)}
          </Typography>
          {sigla && (
            <Typography
              fontSize={'smaller'}
              sx={{ ml: 0.7 }}
              display={'inline'}
              {...siglaProps}
            >
              {sigla}
            </Typography>
          )}
        </Link>
      </Box>

      <Popover
        id={idPopover}
        open={!!anchorMonto}
        anchorEl={anchorMonto}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={() => {
          setAnchorMonto(null)
        }}
      >
        <Grid container rowSpacing={1} sx={{ width: 230, p: 1.5 }}>
          <Grid size={12}>
            <NumberSpinnerField
              fullWidth
              value={inputMonto}
              min={min}
              max={max}
              step={step}
              onChange={setInputMonto}
              spinnerTabIndex={false}
              unit={unit}
            />
          </Grid>
          <Grid size={12} sx={{ textAlign: 'center' }}>
            <Button
              size={'small'}
              aria-hidden={false}
              startIcon={<CheckCircle />}
              variant={'contained'}
              fullWidth
              onClick={() => {
                if (inputMonto || inputMonto === 0) {
                  onChange(inputMonto)
                  setAnchorMonto(null)
                }
              }}
            >
              Aplicar
            </Button>
          </Grid>
        </Grid>
      </Popover>
    </>
  )
}

export default ParseMontoMonedaEditable
