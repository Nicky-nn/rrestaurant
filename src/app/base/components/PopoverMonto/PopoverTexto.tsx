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
  TextField,
  TextFieldProps,
  Typography,
  TypographyProps,
} from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'

import { handleFocus } from '../../../utils/helper'

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
  // monto a pasar
  texto: string
  boxProps?: BoxProps
  textoProps?: TypographyProps
  textFieldProps?: Omit<TextFieldProps, 'onChange' | 'value'>
  // Propiedades de Link button, se aplica cuando editar=true antes era LinkProps
  buttonProps?: ButtonProps
  onChange?: (value: string) => void
  editar?: boolean // Si es un monto editable
  error?: boolean // Si hay un error
  helperText?: string // Texto de ayuda
  lista?: boolean // Si el componente es de tipo lista, require que editar sea true
  // Si se requiere forma de lista btn, default false, solo aplica cuando es editable
  listItemButton?: boolean
}

type Props = OwnProps

/**
 * Creamos un texto editable
 * @param props
 * @author isi-template
 * @constructor
 */
const PopoverTexto: FunctionComponent<Props> = (props) => {
  const {
    id,
    texto,
    boxProps = {},
    textoProps = { sx: { fontWeight: 500 } },
    textFieldProps = {},
    buttonProps = {},
    onChange,
    editar = false,
    error = false,
    helperText,
    lista = false,
  } = props

  const [inputTexto, setInputTexto] = useState<string>('')
  const [anchorTexto, setAnchorTexto] = useState<any | null>(null)

  const nid = id
    ? id
    : `${Math.floor(Math.random() * 99999999).toString()}-${Math.floor(Math.random() * 99999)}`

  const open = Boolean(anchorTexto)
  const idPopover = open ? `po-monto-moneda-${nid}` : undefined

  useEffect(() => {
    setInputTexto(texto)
  }, [texto])

  const TypTexto = (
    <>
      <Typography variant={'inherit'} display={'inline'} {...textoProps}>
        {texto}
      </Typography>
    </>
  )

  return (
    <>
      {editar && !lista && (
        <Box id={nid} {...boxProps}>
          <Button
            variant={buttonProps?.variant || 'text'}
            size={buttonProps?.size || 'small'}
            onClick={(event) => {
              setInputTexto(texto)
              setAnchorTexto(event.currentTarget)
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
              textAlign: 'left',
              '&:hover': {
                textDecoration: 'underline',
                textDecorationThickness: 1.1,
              },
            }}
            {...buttonProps}
          >
            {TypTexto}
          </Button>
        </Box>
      )}

      {editar && lista && (
        <Box id={nid} {...boxProps}>
          <StyleListItemButton
            onClick={(event) => {
              setInputTexto(texto)
              setAnchorTexto(event.currentTarget)
            }}
            sx={(theme) => ({
              fontWeight: 400,
              color: error ? theme.palette.error.main : theme.palette.primary.main,
              textAlign: textoProps?.textAlign || 'center',
            })}
          >
            {TypTexto}
          </StyleListItemButton>
        </Box>
      )}

      {!editar && (
        <Box id={nid} sx={{ pr: 0.5, pl: 0.5 }} {...boxProps}>
          {TypTexto}
        </Box>
      )}

      {editar && (
        <Popover
          id={idPopover}
          open={!!anchorTexto}
          anchorEl={anchorTexto}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          onClose={() => {
            setAnchorTexto(null)
          }}
        >
          <Grid container rowSpacing={1} sx={{ width: 300, p: 1.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                size={'small'}
                value={inputTexto}
                onClick={handleFocus}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setInputTexto(event.target.value)
                }}
                error={error}
                helperText={helperText}
                {...textFieldProps}
              />
            </Grid>
            <Grid size={12} sx={{ textAlign: 'center' }}>
              <Button
                size={'small'}
                startIcon={<CheckCircle />}
                variant={'contained'}
                fullWidth
                onClick={() => {
                  if (inputTexto || inputTexto === '') {
                    if (onChange) onChange(inputTexto)
                    setAnchorTexto(null)
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

export default PopoverTexto
