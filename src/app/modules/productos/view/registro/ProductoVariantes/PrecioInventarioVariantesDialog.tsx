import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  OutlinedInput,
  TextField,
  Typography,
} from '@mui/material'
import InputNumber from 'rc-input-number'
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react'
import Select from 'react-select'

import { NumeroFormat } from '../../../../../base/components/Mask/NumeroFormat'
import { MyInputLabel } from '../../../../../base/components/MyInputs/MyInputLabel'
import { numberWithCommas } from '../../../../../base/components/MyInputs/NumberInput'
import { reactSelectStyle } from '../../../../../base/components/MySelect/ReactSelect'
import SimpleCard from '../../../../../base/components/Template/Cards/SimpleCard'
import { genReplaceEmpty, handleSelect, isEmptyValue } from '../../../../../utils/helper'
import { notError } from '../../../../../utils/notification'
import { swalException } from '../../../../../utils/swal'
import { apiSinUnidadMedida } from '../../../../sin/api/sinUnidadMedida.api'
import { SinUnidadMedidaProps } from '../../../../sin/interfaces/sin.interface'
import { apiSucursales } from '../../../../sucursal/api/sucursales.api'
import { SucursalProps } from '../../../../sucursal/interfaces/sucursal'
import { ProductoVarianteInputProps } from '../../../interfaces/producto.interface'

interface OwnProps {
  variante: ProductoVarianteInputProps
  id: string
  keepMounted: boolean
  open: boolean
  onClose: (value?: any) => void
}

type Props = OwnProps

const PrecioInventarioVariantesDialog: FunctionComponent<Props> = (props: Props) => {
  const { variante, onClose, open, ...other } = props
  const [unidadesMedida, setUnidadesMedida] = useState<SinUnidadMedidaProps[]>([])
  const [sucursales, setSucursales] = useState<SucursalProps[]>([])
  const [data, setData] = useState<ProductoVarianteInputProps>(variante)

  const fetchUnidadesMedida = async () => {
    await apiSinUnidadMedida()
      .then((data) => {
        setUnidadesMedida(data)
      })
      .catch((err) => {
        swalException(err)
        return []
      })
  }

  const fetchSucursales = async () => {
    try {
      const sucursales = await apiSucursales()
      if (sucursales.length > 0) {
        setSucursales(sucursales)
      } else {
        throw new Error(
          'No se ha podido cargar los datos de la sucursal, vuelva a intentar',
        )
      }
    } catch (e: any) {
      swalException(e)
    }
  }

  useEffect(() => {
    setData(variante)
  }, [open])

  const handleCancel = () => {
    onClose()
  }

  // REGISTRO Y VALIDACION DE DATOS
  const handleSubmit = async (): Promise<void> => {
    // Verificamos algunos campos
    if (isNaN(data.precio)) {
      notError('Debe ingresar un valor en precio')
      return
    }
    if (isNaN(data.precioComparacion!)) {
      notError('Debe ingresar un valor en precio de comparación')
      return
    }
    if (data.precio <= 0) {
      notError('Precio debe ser mayor a 0')
      return
    }
    if (data.costo > data.precio) {
      notError('El costo debe ser menor al precio')
      return
    }
    if (isEmptyValue(data.codigoProducto)) {
      notError('Debe ingresar un codigo de producto válido')
      return
    }
    onClose(data)
  }

  useEffect(() => {
    fetchSucursales().then()
    fetchUnidadesMedida().then()
  }, [])
  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: 800 } }}
      maxWidth="md"
      open={open}
      {...other}
    >
      <DialogTitle>Modificar Variante "{data.titulo}"</DialogTitle>
      <DialogContent dividers>
        <Grid container rowSpacing={2}>
          <Grid item>
            <SimpleCard title={'PRECIO'}>
              <Grid container columnSpacing={3} rowSpacing={3}>
                <Grid item lg={12} md={12} xs={12}>
                  <FormControl fullWidth>
                    <MyInputLabel shrink>Unidad Medida</MyInputLabel>
                    <Select<SinUnidadMedidaProps>
                      styles={reactSelectStyle()}
                      menuPosition={'fixed'}
                      name="unidadMedida"
                      placeholder={'Seleccione la unidad de medida'}
                      value={data.unidadMedida}
                      onChange={async (unidadMedida: any) => {
                        setData({ ...data, unidadMedida })
                      }}
                      options={unidadesMedida}
                      getOptionValue={(item) => item.codigoClasificador}
                      getOptionLabel={(item) =>
                        `${item.codigoClasificador} - ${item.descripcion}`
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item lg={4} md={4} xs={12}>
                  <FormControl fullWidth required>
                    <MyInputLabel shrink>Precio</MyInputLabel>
                    <OutlinedInput
                      placeholder={'0.00'}
                      value={data.precio}
                      onFocus={handleSelect}
                      onChange={(precio) => {
                        setData({ ...data, precio: parseFloat(precio.target.value)! })
                      }}
                      inputComponent={NumeroFormat as any}
                      inputProps={{}}
                      size={'small'}
                    />
                  </FormControl>
                </Grid>

                <Grid item lg={4} md={4} xs={12}>
                  <FormControl fullWidth component={'div'} required>
                    <MyInputLabel shrink>Precio de comparación</MyInputLabel>
                    <OutlinedInput
                      placeholder={'0.00'}
                      value={data.precioComparacion}
                      onFocus={handleSelect}
                      onChange={(precioComparacion) => {
                        setData({
                          ...data,
                          precioComparacion: parseFloat(precioComparacion.target.value!),
                        })
                      }}
                      inputComponent={NumeroFormat as any}
                      inputProps={{}}
                      size={'small'}
                    />
                  </FormControl>
                </Grid>

                <Grid item lg={4} md={4} xs={12}>
                  <FormControl fullWidth component={'div'}>
                    <MyInputLabel shrink>Costo</MyInputLabel>
                    <InputNumber
                      min={0}
                      placeholder={'0.00'}
                      value={data.costo}
                      onFocus={handleSelect}
                      onChange={(costo: number | null) => {
                        setData({ ...data, costo: costo! })
                      }}
                      formatter={numberWithCommas}
                    />
                    <FormHelperText>Información protegida</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </SimpleCard>
          </Grid>

          <Grid item>
            <SimpleCard title={'INVENTARIO'}>
              <Grid container columnSpacing={3} rowSpacing={2}>
                <Grid item lg={4} md={4} xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label="SKU (Código de producto)"
                      value={data.codigoProducto}
                      onChange={(e) => {
                        setData({ ...data, codigoProducto: e.target.value })
                      }}
                      variant="outlined"
                      size="small"
                    />
                  </FormControl>
                </Grid>

                <Grid item lg={8} md={8} xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label="Código de Barras"
                      value={data.codigoBarras || ''}
                      onChange={(e) => {
                        setData({ ...data, codigoBarras: e.target.value })
                      }}
                      variant="outlined"
                      size="small"
                    />
                  </FormControl>
                </Grid>

                <Grid item lg={6} md={6} xs={12}>
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={data.incluirCantidad}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setData({ ...data, incluirCantidad: e.target.checked })
                          }}
                        />
                      }
                      label="¿Incluir cantidad al inventario?"
                    />
                  </FormControl>
                </Grid>
                {data.incluirCantidad && (
                  <Grid item lg={6} md={6} xs={12}>
                    <FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!data.verificarStock}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              setData({ ...data, verificarStock: !e.target.checked })
                            }}
                          />
                        }
                        label="¿Continuar venta aun si el item este agotado?"
                      />
                    </FormControl>
                  </Grid>
                )}

                <Grid item lg={12} md={12} xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    &nbsp;CANTIDAD
                  </Typography>
                  <div className={'responsive-table'}>
                    <table>
                      <thead>
                        <tr>
                          <th data-name="COD" style={{ width: 50 }}>
                            COD
                          </th>
                          <th>NOMBRE SUCURSAL</th>
                          <th style={{ width: 250 }}>CANTIDAD DISPONIBLE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sucursales.length > 0 &&
                          sucursales.map((s, index: number) => (
                            <tr key={s.codigo}>
                              <td data-label="COD">{s.codigo}</td>
                              <td data-label="SUCURSAL">
                                {s.municipio} - {s.direccion}
                              </td>
                              <td data-label="CANTIDAD" style={{ textAlign: 'right' }}>
                                {data.incluirCantidad ? (
                                  <FormControl
                                    error={
                                      genReplaceEmpty(
                                        data.inventario[s.codigo]?.stock,
                                        0,
                                      ) < 1
                                    }
                                    fullWidth
                                    component={'div'}
                                  >
                                    <MyInputLabel shrink>Cantidad</MyInputLabel>
                                    <InputNumber
                                      min={0}
                                      style={{ color: 'red' }}
                                      placeholder={'0.00'}
                                      value={genReplaceEmpty(
                                        data.inventario[s.codigo]?.stock,
                                        0,
                                      )}
                                      onFocus={handleSelect}
                                      onChange={(precioComparacion: number | null) => {
                                        const newArray = [...data.inventario]
                                        newArray[index] = {
                                          sucursal: s,
                                          stock: precioComparacion!,
                                        }
                                        setData({
                                          ...data,
                                          inventario: newArray,
                                        })
                                      }}
                                      formatter={numberWithCommas}
                                    />
                                    <FormHelperText id="component-error-text">
                                      Valor mayor a 0
                                    </FormHelperText>
                                  </FormControl>
                                ) : (
                                  <Typography variant="subtitle2">No medido</Typography>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Grid>
              </Grid>
            </SimpleCard>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button autoFocus color={'error'} variant={'contained'} onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} style={{ marginRight: 25 }} variant={'contained'}>
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrecioInventarioVariantesDialog
