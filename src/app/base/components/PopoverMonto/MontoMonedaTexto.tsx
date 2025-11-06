import { CheckCircle } from '@mui/icons-material'
import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Grid,
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
  paddingRight: theme.spacing(0.5),
  paddingLeft: theme.spacing(0.5),
  display: 'block',
  '& .MuiTypography-root': {
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
  '& .MuiTypography-root:hover': {
    // textDecorationColor: theme.palette.primary.main,
    textDecorationThickness: 1,
  },
}))

interface OwnProps {
  // Id del componente
  id?: string
  // Text antecedido al monto
  label?: React.ReactElement | string
  // monto a pasar
  monto: number
  // sigla de la moneda
  sigla?: string
  // numero de decimales, default 2
  decimales?: number
  boxProps?: BoxProps
  siglaProps?: TypographyProps
  montoProps?: TypographyProps
  // Propiedades de Link button, se aplica cuando editar=true antes era LinkProps
  buttonProps?: ButtonProps
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
  // Si se requiere forma de lista btn, default false, solo aplica cuando es editable
  listItemButton?: boolean
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
    buttonProps = {},
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
      {editar && !lista && (
        <Box id={nid} {...boxProps}>
          {label && label}
          <Button
            variant={buttonProps?.variant || 'text'}
            size={buttonProps?.size || 'small'}
            onClick={(event) => {
              setInputMonto(monto)
              setAnchorMonto(event.currentTarget)
            }}
            color={error ? 'error' : buttonProps?.color || 'primary'}
            sx={{
              textDecoration: 'underline',
              textUnderlineOffset: 2,
              userSelect: 'text',
              p: 0,
              pl: 0.5,
              pr: 0.5,
              textDecorationThickness: 1,
              '&:hover': {
                textDecoration: 'underline',
                textDecorationThickness: 1.1,
              },
            }}
            {...buttonProps}
          >
            {TypMonto}
          </Button>
        </Box>
      )}

      {editar && lista && (
        <Box id={nid} {...boxProps}>
          {label && label}
          <StyleListItemButton
            onClick={(event) => {
              setInputMonto(monto)
              setAnchorMonto(event.currentTarget)
            }}
            sx={(theme) => ({
              fontWeight: 400,
              color: error ? theme.palette.error.main : theme.palette.primary.main,
              textAlign: montoProps?.textAlign || 'center',
            })}
          >
            {TypMonto}
          </StyleListItemButton>
        </Box>
      )}

      {!editar && (
        <Box id={nid} sx={{ pr: 0.5, pl: 0.5 }} {...boxProps}>
          {label && label}
          {TypMonto}
        </Box>
      )}

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
