import { Delete, Edit } from '@mui/icons-material'
import {
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import React, { ChangeEvent, FunctionComponent, useState } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { arrayMove, List } from 'react-movable'

import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard'
import { cartesianProduct, genRandomString, isEmptyValue } from '../../../../utils/helper'
import { notError } from '../../../../utils/notification'
import { swalConfirmDialog } from '../../../../utils/swal'
import {
  OpcionesProductoProps,
  ProductoInputProps,
  ProductoVarianteInputProps,
} from '../../interfaces/producto.interface'
import ProductoAdicionarOpcionDialog from './ProductoOpciones/ProductoAdicionarOpcionDialog'

interface OwnProps {
  form: UseFormReturn<ProductoInputProps>
}

type Props = OwnProps

/**
 * @description si tiene opciones como talla, peso, etc
 * @param props
 * @constructor
 */
const ProductoOpciones: FunctionComponent<Props> = (props) => {
  const {
    form: {
      control,
      setValue,
      getValues,
      watch,
      formState: { errors },
    },
  } = props
  const { replace } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'variantes', // unique name for your Field Array
  })
  const [varianteWatch, opcionesProducto, varianteUnica] = watch([
    'variante',
    'opcionesProducto',
    'varianteUnica',
  ])

  const [openProductOpcion, setOpenProductOpcion] = useState<boolean>(false)
  const [opcionesEdit, setOpcionesEdit] = useState<OpcionesProductoProps | undefined>(
    undefined,
  )

  // Generacion de variantes de productos
  const generarVariantes = (opciones: any): ProductoVarianteInputProps[] | void => {
    const preVariantes: any = []
    opciones.forEach((op: any) => {
      preVariantes.push(op.valores)
    })
    const variantes =
      cartesianProduct(preVariantes).map((pv: any, index) => ({
        ...varianteWatch,
        id: genRandomString(),
        codigoProducto: !isEmptyValue(varianteWatch.codigoProducto)
          ? `${varianteWatch.codigoProducto}-${index + 1}`
          : '',
        codigoBarras: !isEmptyValue(varianteWatch.codigoBarras)
          ? `${varianteWatch.codigoBarras}-${index + 1}`
          : '',
        titulo: pv.join(' / '),
        nombre: `${getValues('titulo')} ${pv.join(' / ')}`,
      })) || []

    // Generamos las nuevas opciones y variantes
    setValue('opcionesProducto', opciones)
    replace(variantes)
  }

  // Eliminamos el item de la variante.i
  const eliminarVariante = async (opcion: OpcionesProductoProps, valor: string) => {
    const newValor = opcion.valores.filter((op) => op !== valor)
    if (newValor.length > 0) {
      await swalConfirmDialog({
        text: `Confirma que desea eliminar <strong>${opcion.nombre} ${valor}</strong>. 
            Esta acción también eliminará las variantes de productos relacionados con ${valor}`,
      }).then((resp) => {
        if (resp.isConfirmed) {
          const newOpcionesProducto = opcionesProducto.map((op) =>
            op.nombre === opcion.nombre
              ? {
                  ...op,
                  valores: newValor,
                }
              : op,
          )
          generarVariantes(newOpcionesProducto)
        }
      })
    } else {
      notError('Debe existir al menos 1 valor presente')
    }
  }

  // Eliminamos todo el item
  const eliminarOpcion = async (opcion: OpcionesProductoProps) => {
    await swalConfirmDialog({
      text: `¿Confirma que desea eliminar <strong>${opcion.nombre}</strong>. y todos sus valores?`,
    }).then((resp) => {
      if (resp.isConfirmed) {
        const newOpcionesProducto = opcionesProducto.filter(
          (op) => op.nombre !== opcion.nombre,
        )
        generarVariantes(newOpcionesProducto)
      }
    })
  }

  const modificarOpciones = async (opcion: OpcionesProductoProps) => {
    setOpcionesEdit(opcion)
    setOpenProductOpcion(true)
  }
  return (
    <>
      <SimpleCard title={'OPCIONES'}>
        <Grid container columnSpacing={3} rowSpacing={{ xs: 2, sm: 2, md: 0, lg: 0 }}>
          <Grid item lg={12} md={12} xs={12}>
            <FormControl>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!varianteUnica}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setValue('varianteUnica', !e.target.checked)
                      }}
                    />
                  }
                  label="Este producto tiene opciones, como Talla Marca, Color, etc"
                />
              </FormGroup>
            </FormControl>
          </Grid>

          {!varianteUnica && (
            <Grid item lg={12} md={12} xs={12}>
              <Button
                size={'small'}
                onClick={() => {
                  setOpenProductOpcion(true)
                }}
              >
                Adicionar Opción de producto
              </Button>

              <List
                values={opcionesProducto}
                onChange={({ oldIndex, newIndex }) => {
                  generarVariantes(arrayMove(opcionesProducto, oldIndex, newIndex))
                }}
                renderList={({ children, props, isDragged }) => (
                  <div className="responsive-table">
                    <table
                      className="table-dense"
                      style={{
                        cursor: isDragged ? 'grabbing' : undefined,
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={{ width: '30%' }}>Nombre</th>
                          <th>Valores</th>
                          <th style={{ width: '15%' }}>Opciones</th>
                        </tr>
                      </thead>
                      <tbody {...props}>{children}</tbody>
                    </table>
                  </div>
                )}
                renderItem={({ value, props, isDragged, isSelected }: any) => {
                  const row = (
                    <tr
                      {...props}
                      style={{
                        ...props.style,
                        cursor: isDragged ? 'grabbing' : 'grab',
                        backgroundColor: isDragged || isSelected ? '#EEE' : '#fafafa',
                      }}
                    >
                      <td data-label="Nombre">{value.nombre}</td>
                      <td data-label="Valores">
                        {value.valores.map((val: string) => (
                          <Chip
                            style={{ marginRight: 10 }}
                            key={val}
                            label={val}
                            color={'info'}
                            variant="outlined"
                            size={'small'}
                            onDelete={() => eliminarVariante(value, val)}
                          />
                        ))}
                      </td>
                      <td
                        data-label="Opciones"
                        width={'50px'}
                        style={{ textAlign: 'right' }}
                      >
                        <div style={{ width: 80 }}>
                          <Tooltip title={'Modificar'} placement={'top'}>
                            <IconButton
                              aria-label="modify"
                              onClick={() => modificarOpciones(value)}
                              color={'primary'}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={'Eliminar'} placement={'top'}>
                            <IconButton
                              aria-label="delete"
                              onClick={() => eliminarOpcion(value)}
                              color={'error'}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                  return isDragged ? (
                    <table style={{ ...props.style, borderSpacing: 0 }}>
                      <tbody>{row}</tbody>
                    </table>
                  ) : (
                    row
                  )
                }}
              />
            </Grid>
          )}
        </Grid>
      </SimpleCard>

      <ProductoAdicionarOpcionDialog
        keepMounted={false}
        id="productoOpcion"
        opcion={opcionesEdit}
        open={openProductOpcion}
        onClose={(val) => {
          setOpcionesEdit(undefined)
          if (val) {
            const repetido = opcionesProducto.filter((op) => op.id === val.id)
            if (repetido.length === 0) {
              const newValue = [...opcionesProducto, { ...val }]
              generarVariantes(newValue)
              setOpenProductOpcion(false)
            } else {
              // Buscamos y actualizamos el registro
              const updateValue = opcionesProducto.map((item) => {
                if (item.id === val.id) {
                  return val
                }
                return item
              })
              generarVariantes(updateValue)
              setOpenProductOpcion(false)
            }
          } else {
            setOpenProductOpcion(false)
          }
        }}
      />
    </>
  )
}

export default ProductoOpciones
