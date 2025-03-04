import { CheckCircle } from '@mui/icons-material'
import { Button, ListItemButton, Popover, styled, SxProps, Theme } from '@mui/material'
import Grid from '@mui/material/Grid2'
import React, { FunctionComponent, useEffect, useState } from 'react'

import ParseMontoMoneda from '../Mask/ParseMontoMoneda'
import NumberSpinnerField from '../NumberSpinnerField/NumberSpinnerField'

const StyleListItemButton = styled(ListItemButton)(({ theme }) => ({
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  display: 'block',
  textAlign: 'right',
}))

interface OwnProps {
  id: string
  monto: number
  montoText?: number // En caso se requiera enmascarar el monto, si no se envia se mostrara el monto
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  sxMontoProps?: SxProps<Theme>
  editar?: boolean
}

type Props = OwnProps

/**
 * Detalle Extra para cada uno de los items del carrito de compras
 * @param props
 * @constructor
 */
const ListaMonto: FunctionComponent<Props> = (props) => {
  const {
    id,
    onChange,
    monto,
    montoText = monto,
    min,
    max,
    step,
    editar = true,
    sxMontoProps,
  } = props
  const [anchorMonto, setAnchorMonto] = useState<any | null>(null)

  const [inputMonto, setInputMonto] = useState<number | undefined | null>(null)

  const open = Boolean(anchorMonto)
  const idPopover = open ? `popover-monto-${id}` : undefined

  useEffect(() => {
    setInputMonto(monto)
  }, [monto])

  return (
    <>
      <StyleListItemButton
        onClick={(event) => {
          if (editar) {
            setInputMonto(monto)
            setAnchorMonto(event.currentTarget)
          }
        }}
      >
        <ParseMontoMoneda monto={montoText} sx={sxMontoProps} />
      </StyleListItemButton>

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

export default ListaMonto
