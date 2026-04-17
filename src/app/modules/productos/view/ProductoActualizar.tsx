import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { Description, Save } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import React, { FunctionComponent, useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import SimpleContainer from '../../../base/components/Container/SimpleContainer'
import StackMenu from '../../../base/components/MyMenu/StackMenu'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { genRandomString, isEmptyValue } from '../../../utils/helper'
import { notDanger, notError, notSuccess } from '../../../utils/notification'
import {
  swalAsyncConfirmDialog,
  swalClose,
  swalException,
  swalLoading,
} from '../../../utils/swal'
import { apiSinActividadesPorDocumentoSector } from '../../sin/api/sinActividadesPorDocumentoSector'
import { SinActividadesDocumentoSectorProps } from '../../sin/interfaces/sin.interface'
import { apiProductoModificar } from '../api/productoModificar.api'
import { apiProductoPorId } from '../api/productoPorId.api'
import {
  PRODUCTO_INITIAL_VALUES,
  ProductoInputProps,
} from '../interfaces/producto.interface'
import { productosRouteMap } from '../ProductosRoutesMap'
import {
  productoComposeService,
  productoInputComposeService,
} from '../services/ProductoComposeService'
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

const ProductoActualizar: FunctionComponent<Props> = (props) => {
  const { id }: { id?: string } = useParams()
  const navigate = useNavigate()

  const form = useForm<ProductoInputProps>({
    defaultValues: {
      ...PRODUCTO_INITIAL_VALUES,
      variante: { ...PRODUCTO_INITIAL_VALUES.variante, id: genRandomString(5) },
    },
    resolver: yupResolver<any>(productoRegistroValidationSchema),
  })

  const varianteUnicaTempWatch = form.watch('varianteUnicaTemp')

  const onSubmit: SubmitHandler<ProductoInputProps> = async (values) => {
    const val = await productoRegistroValidator(values)
    if (val.length > 0) {
      notError(val.join('<br>'))
    } else {
      const apiInput = productoComposeService(values)
      await swalAsyncConfirmDialog({
        preConfirm: async () => {
          const resp: any = await apiProductoModificar(id!, apiInput).catch((err) => ({
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
        }
        if (resp.isDenied) {
          swalException(resp.value)
        }
        return
      })
    }
  }

  const fetchProductoPorId = async (id: string) => {
    try {
      swalLoading()
      const response = await apiProductoPorId(id)
      swalClose()
      if (response) {
        const actividades: SinActividadesDocumentoSectorProps[] =
          await apiSinActividadesPorDocumentoSector()
        const actividad = actividades.find(
          (item) =>
            item.codigoActividad ===
            response.variantes[0].sinProductoServicio.codigoActividad,
        )
        const prodInput = productoInputComposeService(response, actividad!)
        form.reset(prodInput)
      } else {
        notDanger('No se ha podido encontrar datos del producto')
        navigate(-1)
      }
    } catch (e: any) {
      swalException(e)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (!isEmptyValue(id)) {
        await fetchProductoPorId(id!).then()
      } else {
        notDanger('Require codigo del producto')
        navigate(-1)
      }
    })()
  }, [])

  return (
    <SimpleContainer>
      <Breadcrumb
        routeSegments={[
          { name: 'Productos', path: '/productos/gestion' },
          { name: 'Modificar Producto' },
        ]}
      />

      <StackMenu asideSidebarFixed>
        <Button
          color={'secondary'}
          startIcon={<Description />}
          variant={'contained'}
          onClick={() => {
            // dispatch(productoReset());
            navigate(productosRouteMap.nuevo.path)
          }}
        >
          {productosRouteMap.nuevo.name}
        </Button>
        <Button
          startIcon={<Save />}
          variant={'contained'}
          onClick={form.handleSubmit(onSubmit)}
        >
          Guardar Cambios
        </Button>
      </StackMenu>

      <Grid container spacing={2}>
        <Grid item lg={8} md={8} xs={12}>
          <Grid container spacing={1}>
            <Grid item lg={12} md={12} xs={12}>
              <Homologacion form={form} />
            </Grid>
            {varianteUnicaTempWatch && (
              <>
                <Grid item lg={12} md={12} xs={12}>
                  <ProductoPrecio form={form} />
                </Grid>
                <Grid item lg={12} md={12} xs={12}>
                  <ProductoInventario form={form} />
                </Grid>
              </>
            )}
            <Grid item lg={12} md={12} xs={12}>
              <ProductoOpciones form={form} />
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              <ProductoVariantes form={form} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item lg={4} md={4} xs={12}>
          <Grid container spacing={1}>
            <Grid item lg={12} md={12} xs={12}>
              <ProductoClasificador form={form} />
            </Grid>
            <Grid item lg={12} md={12} xs={12}>
              <ProductoProveedor form={form} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </SimpleContainer>
  )
}

export default ProductoActualizar
