import { CheckCircle } from '@mui/icons-material'
import {
  Box,
  BoxProps,
  Button,
  Grid,
  Link,
  LinkProps,
  ListItemButton,
  Popover,
  styled,
  Typography,
  TypographyProps,
} from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'

import { handleFocus } from '../../../utils/helper'
import { numberWithCommasPlaces } from '../MyInputs/NumberInput'
import NumberSpinnerField, {
  type NumberInputProps,
} from '../NumberSpinnerField/NumberSpinnerField'

const StyleListItemButton = styled(ListItemButton)(({ theme }) => ({
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  display: 'block',
  textAlign: 'right',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
}))

interface OwnProps {
  id?: string
  label?: React.ReactElement | string // Text antecedido al monto
  monto: number // monto a pasar
  sigla?: string // sigla de la moneda
  decimales?: number // numero de decimales, default 2
  boxProps?: BoxProps
  siglaProps?: TypographyProps
  montoProps?: TypographyProps
  linkProps?: LinkProps // Propiedades de Link, se aplica cuando editar=true
  numberProps?: Omit<
    NumberInputProps,
    'onChange, min, max, step, unit, decimalScale, helperText'
  > // Propiedades de NumberInput, se aplica cuando editar=true
  onChange?: (value?: number) => void
  min?: number // Min de incremento, default 0
  max?: number // Max de incremento, default Infinity
  step?: number // Step de incremento, default 1
  unit?: string // Unidad a mostrar  Ej. %, BOB, Kg, etc
  editar?: boolean // Si es un monto editable
  error?: boolean // Si hay un error
  helperText?: string // Texto de ayuda
  lista?: boolean // Si el componente es de tipo lista, require que editar sea true
}

type Props = OwnProps

/**
 * Creamos un monto con su sigla moneda y ademas que el monto sea editable
 * @param props
 * @author isi-template
 * @constructor
 */
const MontoMonedaTexto: FunctionComponent<Props> = (props) => {
  const {
    id,
    label,
    monto,
    sigla,
    decimales = 2,
    boxProps = {},
    siglaProps = {},
    montoProps = { sx: { fontWeight: 500 } },
    linkProps = {},
    numberProps = {},
    onChange,
    min = 0,
    max,
    step = 1,
    unit,
    editar = false,
    error = false,
    helperText,
    lista = false,
  } = props

  const [inputMonto, setInputMonto] = useState<number | undefined | null>(null)
  const [anchorMonto, setAnchorMonto] = useState<any | null>(null)

  const nid = id
    ? id
    : `${Math.floor(Math.random() * 99999999).toString()}-${Math.floor(Math.random() * 99999)}`

  const open = Boolean(anchorMonto)
  const idPopover = open ? `po-monto-moneda-${nid}` : undefined

  useEffect(() => {
    setInputMonto(monto)
  }, [monto])

  const TypMonto = (
    <>
      <Typography variant={'inherit'} display={'inline'} {...montoProps}>
        {numberWithCommasPlaces(monto, decimales)}
      </Typography>
      {sigla && (
        <Typography
          fontSize={'smaller'}
          sx={{ ml: 0.5 }}
          display={'inline'}
          {...siglaProps}
        >
          {sigla}
        </Typography>
      )}
    </>
  )

  return (
    <>
      <Box id={nid} {...boxProps}>
        {label && label}
        {editar && !lista && (
          <Link
            href={'#'}
            onClick={(event) => {
              setInputMonto(monto)
              setAnchorMonto(event.currentTarget)
            }}
            color={error ? 'error' : linkProps?.color || 'primary'}
            {...linkProps}
          >
            {TypMonto}
          </Link>
        )}

        {editar && lista && (
          <StyleListItemButton
            onClick={(event) => {
              setInputMonto(monto)
              setAnchorMonto(event.currentTarget)
            }}
            sx={(theme) => ({
              fontWeight: 400,
              textDecoration: 'underline',
              textUnderlineOffset: 2,
              color: error ? theme.palette.error.main : theme.palette.text.primary,
            })}
          >
            {TypMonto}
          </StyleListItemButton>
        )}

        {!editar && TypMonto}
      </Box>
      {editar && (
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
          <Grid container rowSpacing={1} sx={{ width: 240, p: 1.5 }}>
            <Grid size={12}>
              <NumberSpinnerField
                fullWidth
                value={inputMonto}
                min={min}
                max={max}
                step={step}
                onClick={handleFocus}
                onChange={setInputMonto}
                spinnerTabIndex={false}
                unit={unit}
                decimalScale={decimales}
                error={error}
                helperText={helperText}
                {...numberProps}
              />
            </Grid>
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Button
                size={'small'}
                startIcon={<CheckCircle />}
                variant={'contained'}
                fullWidth
                onClick={() => {
                  if (inputMonto || inputMonto === 0) {
                    if (onChange) onChange(inputMonto)
                    setAnchorMonto(null)
                  }
                }}
              >
                Aplicar
              </Button>
            </Grid>
          </Grid>
        </Popover>
      )}
    </>
  )
}

export default MontoMonedaTexto
