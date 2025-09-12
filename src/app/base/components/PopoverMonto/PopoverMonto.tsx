import { Button, Grid, Popover, PopoverProps } from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'

import NumberSpinnerField from '../NumberSpinnerField/NumberSpinnerField'

interface OwnProps extends Omit<PopoverProps, 'id' | 'onClose' | 'open'> {
  id: string
  label: string
  inputId: string
  min?: number
  max?: number
  value?: number
  step?: number
  decimalScale?: number
  unit?: string
  btnDisabled?: boolean
  onClose: (value?: number | null) => void
  open: boolean
}

type Props = OwnProps
/**
 * Componente para mostrar un input de tipo number con un boton para cambiar el valor
 * Se debe definir un estado
 * const [anclaNumber, setAnclaNumber] = useState<HTMLButtonElement | null>(null)
 * cuando se emita onClose se debe actualizar el estado setAnclaNumber(null)
 * anchorEl es obligatorio
 * @param props
 * @author isi-template
 * @constructor
 * @deprecated, usar el componente MontoMonedaTexto
 */
const PopoverMonto: FunctionComponent<Props> = (props) => {
  const {
    id,
    value,
    inputId,
    label,
    min,
    max,
    step,
    decimalScale,
    btnDisabled,
    unit,
    open,
    onClose,
    ...other
  } = props
  const [nn, setNn] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    if (open) setNn(value || min || undefined)
  }, [open])

  return (
    <Popover
      id={id}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      onClose={() => onClose(undefined)}
      open={open}
      {...other}
    >
      <Grid container rowSpacing={1} sx={{ width: 200, p: 2, pt: 3 }}>
        <Grid size={12}>
          <NumberSpinnerField
            label={label}
            id={inputId}
            value={nn}
            onChange={(n) => setNn(n)}
            size="small"
            min={min}
            max={max ?? Infinity}
            step={step}
            decimalScale={decimalScale}
            unit={unit}
          />
        </Grid>
        <Grid size={12}>
          <Button
            size={'small'}
            variant={'contained'}
            disabled={btnDisabled ?? false}
            fullWidth
            onClick={() => {
              onClose(nn)
            }}
          >
            Aplicar
          </Button>
        </Grid>
      </Grid>
    </Popover>
  )
}

export default PopoverMonto
