import { yupResolver } from '@hookform/resolvers/yup'
import { Save } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import React, { FunctionComponent } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import SimpleContainer from '../../../base/components/Container/SimpleContainer'
import StackMenu from '../../../base/components/MyMenu/StackMenu'
import { StackMenuItem } from '../../../base/components/MyMenu/StackMenuActionTable'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { genRandomString } from '../../../utils/helper'
import { notError, notSuccess } from '../../../utils/notification'
import { swalAsyncConfirmDialog, swalException } from '../../../utils/swal'
import { apiProductoRegistro } from '../api/productoRegistro.api'
import {
  PRODUCTO_INITIAL_VALUES,
  ProductoInputProps,
} from '../interfaces/producto.interface'
import { productosRouteMap } from '../ProductosRoutesMap'
import { productoComposeService } from '../services/ProductoComposeService'
import {
  productoRegistroValidationSchema,
  productoRegistroValidator,
} from '../validator/productoRegistroValidator'
import ProductoInventario from './ProductoInventario/ProductoInventario'
import ProductoClasificador from './registro/ProductoClasificador'
import Homologacion from './registro/ProductoHomologacion'
import ProductoOpciones from './registro/ProductoOpciones'
import ProductoPrecio from './registro/ProductoPrecio'
import ProductoProveedor from './registro/ProductoProveedor'
import ProductoVariantes from './registro/ProductoVariantes'

interface OwnProps {}

type Props = OwnProps

/**
 * @description Formulario de registro de productos incluido sus homologaciones
 * @param props
 * @constructor
 */
const ProductoRegistro: FunctionComponent<Props> = (props) => {
  const navigate = useNavigate()

  const form = useForm<ProductoInputProps>({
    defaultValues: {
      ...PRODUCTO_INITIAL_VALUES,
      variante: { ...PRODUCTO_INITIAL_VALUES.variante, id: genRandomString(10) },
    },
    resolver: yupResolver<any>(productoRegistroValidationSchema),
  })

  /**
   * @description Registro de producto en base de datos, una registro, mandamos a modificación
   * @param values
   */
  const onSubmit: SubmitHandler<ProductoInputProps> = async (values) => {
    const val = await productoRegistroValidator(values)
    if (val.length > 0) {
      notError(val.join('<br>'))
    } else {
      const apiInput = productoComposeService(values)
      await swalAsyncConfirmDialog({
        preConfirm: async () => {
          const resp: any = await apiProductoRegistro(apiInput).catch((err) => ({
            error: err,
          }))
          if (resp.error) {
            swalException(resp.error)
            return false
          }
          return resp
        },
      }).then((resp) => {
        if (resp.isConfirmed) {
          notSuccess()
          navigate(`${productosRouteMap.modificar.path}/${resp.value._id}`, {
            replace: true,
          })
        }
        if (resp.isDenied) {
          swalException(resp.value)
        }
        return
      })
    }
  }

  return (
    <SimpleContainer>
      <Breadcrumb routeSegments={[productosRouteMap.gestion, productosRouteMap.nuevo]} />

      <StackMenu asideSidebarFixed>
        <StackMenuItem>
          <Button
            startIcon={<Save />}
            variant={'contained'}
            onClick={form.handleSubmit(onSubmit)}
          >
            Registrar Producto
          </Button>
        </StackMenuItem>
      </StackMenu>

      <Grid container spacing={2}>
        <Grid item lg={8} md={8} xs={12}>
          <Grid container spacing={1}>
            <Grid item lg={12} md={12} xs={12}>
              <Homologacion form={form} />
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              {<ProductoPrecio form={form} />}
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              {<ProductoInventario form={form} />}
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              {<ProductoOpciones form={form} />}
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              {<ProductoVariantes form={form} />}
            </Grid>
          </Grid>
        </Grid>
        <Grid item lg={4} md={4} xs={12}>
          <Grid container spacing={1}>
            <Grid item lg={12} md={12} xs={12}>
              {<ProductoClasificador form={form} />}
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              {<ProductoProveedor form={form} />}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </SimpleContainer>
  )
}

export default ProductoRegistro
