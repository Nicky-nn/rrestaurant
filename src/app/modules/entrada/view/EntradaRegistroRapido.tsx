import React, { FunctionComponent, useEffect, useMemo } from 'react'
import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox.tsx'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb.tsx'
import { entradaRoutesMap } from '../entradaRoutes.tsx'
import StackMenu from '../../../base/components/MyMenu/StackMenu.tsx'
import { StackMenuItem } from '../../../base/components/MyMenu/StackMenuItem.tsx'
import { Button, Grid } from '@mui/material'
import { CategoryOutlined, SaveAsOutlined } from '@mui/icons-material'
import { useEntradaOperaciones } from '../hooks/useEntradaOperaciones.tsx'
import { useNavigate } from 'react-router-dom'
import { FieldErrors, FormProvider, useForm } from 'react-hook-form'
import { ENTRADA_POR_CAJA_DEFAULT, EntradaPorCajaInputProp } from '../interfaces'
import dayjs from 'dayjs'
import { yupResolver } from '@hookform/resolvers/yup'
import { entradaPorCajaInputValidator } from '../validator/entradaValidator.ts'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useUtils } from '../../base/hooks/useUtils.tsx'
import { swalClose, swalLoading } from '../../../utils/swal.ts'
import useCajas from '../../../base/hooks/useCajas.tsx'
import AperturaCajaDialog from '../../cajas/view/AperturaCajaDialog.tsx'
import SimpleCard from '../../../base/components/Template/Cards/SimpleCard.tsx'
import EntradaDatosGenerales from './upsert/EntradaDatosGenerales.tsx'
import EntradaSeleccionArticulos from './upsert/EntradaSeleccionArticulos.tsx'
import { apiMonedaSimpleListado } from '../../../base/api/apiMonedaSimpleListado.ts'
import { KeyValuePropV2 } from '../../../base/interfaces/base.ts'
import { EntidadInputProps } from '../../../interfaces'
import { entradaPorCajaToApiCompose } from '../services/entradaPorCajaCompose.ts'
import { apiEntradaPorCajaRegistro } from '../api/apiEntradaPorCajaRegistro.ts'

interface OwnProps {}

type Props = OwnProps

const EntradaRegistroRapido: FunctionComponent<Props> = () => {
  const navigate = useNavigate()
  const { moneda, user, entidad } = useEntradaOperaciones()
  const { toast, showError, requestConfirm } = useUtils()

  const { cajaActiva, aperturaCajaActivo } = useCajas()
  const sinCaja = !cajaActiva || !aperturaCajaActivo

  /** Custom responsables de caja */
  const responsables: KeyValuePropV2<string, string>[] = useMemo(() => {
    return sinCaja
      ? [{ key: user.usuario, value: user.usuario }]
      : aperturaCajaActivo.responsables.map((r) => ({ key: r, value: r }))
  }, [user, sinCaja, aperturaCajaActivo])

  const form = useForm<EntradaPorCajaInputProp>({
    defaultValues: {
      ...ENTRADA_POR_CAJA_DEFAULT,
      fechaDocumento: dayjs(new Date()),
    },
    resolver: yupResolver(entradaPorCajaInputValidator),
  })

  const { setValue } = form

  /** Obtiene los datos de monedas */
  const { data: monedas, isSuccess } = useQuery({
    queryKey: ['monedas'],
    queryFn: async () => {
      const resp = await apiMonedaSimpleListado()
      return resp || []
    },
  })

  /*** Guardamos los datos */
  const { mutate } = useMutation({
    mutationFn: async (props: { entidad: EntidadInputProps; data: EntradaPorCajaInputProp }) => {
      const { entidad, data } = props
      const input = entradaPorCajaToApiCompose(data)
      return apiEntradaPorCajaRegistro(entidad, input)
    },
    onMutate: () => swalLoading(),
    onSuccess: async (resp) => {
      toast.success(`Se ha registrado la entrada ${resp.codigo}, volviendo a la página principal...`)
      navigate(entradaRoutesMap.gestion.path)
    },
    onError: (err) => showError(err),
    onSettled: async () => swalClose(),
  })

  /**
   * Formulario de upsert de entrada rapida
   * @param data
   */
  const onSubmit = async (data: EntradaPorCajaInputProp) => {
    const { confirmed } = await requestConfirm({
      title: '¿Está seguro de registrar la entrada rápida?',
      confirmButtonColor: 'success',
      description: `${data.descripcionMovimiento}`,
      steps: [
        'Retira el monto total de entrada de caja activa (Si corresponde)',
        'Se adicionarán los items al stock de inventario, almacen y lote(si corresponde).',
        'Una vez registrado, no se podrá revertir.',
      ],
    })
    if (confirmed) {
      mutate({ entidad, data })
    }
    return
  }

  useEffect(() => {
    if (isSuccess && monedas && monedas.length > 0) {
      const codigoMoneda = sinCaja ? moneda?.codigo : aperturaCajaActivo?.moneda?.codigo

      const monedaSeleccionada = monedas.find((m) => m.codigo === codigoMoneda)

      if (monedaSeleccionada) {
        setValue('moneda', monedaSeleccionada)
        setValue('tipoCambio', monedaSeleccionada.tipoCambio)
      }
    }
  }, [isSuccess, monedas, sinCaja, moneda?.codigo, aperturaCajaActivo, setValue])

  /*************************************************************************/
  /*************************************************************************/
  /*************************************************************************/
  /*************************************************************************/
  /*************************************************************************/
  const onError = (error: FieldErrors<EntradaPorCajaInputProp>) => {
    console.log(error)
  }

  return (
    <SimpleContainerBox maxWidth={'xl'}>
      <AperturaCajaDialog open={sinCaja} onSuccess={() => {}} />

      <Breadcrumb routeSegments={[entradaRoutesMap.gestion, entradaRoutesMap.registro]} />

      <StackMenu asideSidebarFixed>
        <StackMenuItem>
          <Button
            variant="contained"
            startIcon={<SaveAsOutlined />}
            color={'success'}
            onClick={() => form.handleSubmit(onSubmit, onError)()}
          >
            Registrar entrada rápida
          </Button>
        </StackMenuItem>
      </StackMenu>

      <FormProvider {...form}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 12, md: 5, lg: 4 }}>
            <EntradaDatosGenerales responsables={responsables} />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 7, lg: 8 }}>
            <SimpleCard title={'Productos / Articulos'} childIcon={<CategoryOutlined />}>
              <Grid container spacing={3} size={12}>
                <Grid size={12}>
                  <EntradaSeleccionArticulos />
                </Grid>
                <Grid size={12}></Grid>
              </Grid>
            </SimpleCard>
          </Grid>
        </Grid>
      </FormProvider>
    </SimpleContainerBox>
  )
}

export default EntradaRegistroRapido
