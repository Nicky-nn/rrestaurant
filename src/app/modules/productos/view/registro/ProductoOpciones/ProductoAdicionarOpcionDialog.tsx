import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
} from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { OnChangeValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { MyInputLabel } from '../../../../../base/components/MyInputs/MyInputLabel'
import { reactSelectStyle } from '../../../../../base/components/MySelect/ReactSelect'
import {
  genRandomString,
  genReplaceEmpty,
  isEmptyValue,
} from '../../../../../utils/helper'
import { OpcionesProductoProps } from '../../../interfaces/producto.interface'
import { OPCIONES_PRODUCTO } from '../../../utils/clasificadores'

interface OwnProps {
  id: string
  keepMounted: boolean
  open: boolean
  opcion?: OpcionesProductoProps
  onClose: (value?: any) => void
}

type Props = OwnProps

const components = {
  DropdownIndicator: null,
}

interface SelectOption {
  label: string
  value: string
}

/**
 * @description Dialogo para adicionar opciones de producto
 * @param props
 * @constructor
 */
const ProductoAdicionarOpcionDialog: FunctionComponent<Props> = (props) => {
  const { onClose, open, opcion, ...other } = props
  const [tipo, setTipo] = useState<OnChangeValue<SelectOption, false>>(null)
  const [valor, setValor] = useState<OnChangeValue<SelectOption, true>>([])
  const [idValor, setIdValor] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (!isEmptyValue(opcion)) {
        setTipo({ value: opcion?.nombre!, label: opcion?.nombre! })
        setValor(
          opcion!.valores!.map((item: string) => {
            return { label: item!, value: item! }
          }),
        )
        setIdValor(opcion!.id!)
      } else {
        setTipo(null)
        setValor([])
        setIdValor(null)
      }
    }
  }, [open])

  const handleChangeTipo = (option: any) => {
    setTipo(option)
    setValor([])
  }

  const handleCancel = () => {
    onClose()
  }

  // REGISTRO Y VALIDACION DE DATOS
  const handleSubmit = async () => {
    onClose({
      id: genReplaceEmpty(idValor, genRandomString()),
      nombre: tipo?.value,
      valores: valor.map((v) => v.value),
    })
  }

  const handleChangeValor = (value: OnChangeValue<SelectOption, true>) => {
    setValor(value)
  }

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: 500 } }}
      maxWidth="sm"
      open={open}
      {...other}
    >
      <DialogTitle>Adicionar opción de producto</DialogTitle>
      <DialogContent dividers>
        <form>
          <Grid container spacing={3}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <FormControl fullWidth>
                <MyInputLabel shrink>Seleccione nombre de opción</MyInputLabel>
                <CreatableSelect
                  styles={reactSelectStyle(false)}
                  menuPosition={'fixed'}
                  onChange={handleChangeTipo}
                  defaultValue={undefined}
                  value={tipo}
                  options={OPCIONES_PRODUCTO}
                  placeholder="Seleccione o escriba un nuevo tipo"
                />
              </FormControl>
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              <FormControl fullWidth>
                <MyInputLabel shrink>Registre los valores de la opción</MyInputLabel>
                <CreatableSelect
                  components={components}
                  styles={reactSelectStyle(false)}
                  menuPosition={'fixed'}
                  isClearable
                  isMulti
                  value={valor}
                  onChange={handleChangeValor}
                  placeholder="Presione Enter o Tab para crear un nuevo valor..."
                />
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button autoFocus color={'error'} variant={'contained'} onClick={handleCancel}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!tipo || valor.length === 0}
          style={{ marginRight: 15 }}
          variant={'contained'}
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductoAdicionarOpcionDialog
