import { ImportExport } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import React, { FunctionComponent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

import useAuth from '../../../../base/hooks/useAuth'
import { notSuccess } from '../../../../utils/notification'
import { swalConfirm, swalException } from '../../../../utils/swal'
import { fetchSinMotivoAnulacion } from '../../../sin/api/sinMotivoAnulacion.api'
import { SinMotivoAnulacionProps } from '../../../sin/interfaces/sin.interface'
import { apiNcdAnular } from '../../api/apiNcdAnular'
import { NcdProps } from '../../interfaces/ncdInterface'

interface OwnProps {
  id: string
  keepMounted: boolean
  open: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (value?: any) => void
  factura: NcdProps | null
}

type Props = OwnProps

/**
 * @description Cuadro de dialogo para la anulación de una nota de credito debito
 * @param props
 * @constructor
 */
const AnularNcdDialog: FunctionComponent<Props> = (props: Props) => {
  const { onClose, open, factura, ...other } = props
  const [motivosAnulacion, setMotivosAnulacion] = useState<SinMotivoAnulacionProps[]>([])
  const [loading, setLoading] = useState(false)
  const initalValues: { codigoMotivo: number | null } = {
    codigoMotivo: null,
  }
  const [value, setValue] = useState(initalValues)
  const {
    user: { sucursal, puntoVenta },
  } = useAuth()

  useEffect(() => {
    if (open) {
      setValue(initalValues)
    }
  }, [open])

  useEffect(() => {
    const fetch = async (): Promise<void> => {
      await fetchSinMotivoAnulacion().then((res) => {
        const filteredMotivos =
          // se ignore 1 y 3
          res?.filter(
            (motivo) =>
              //@ts-ignore
              motivo.codigoClasificador !== '1' && motivo.codigoClasificador !== '3',
          ) || []
        setMotivosAnulacion(filteredMotivos || [])
      })
    }
    fetch().then()
  }, [])

  const handleCancel = () => {
    onClose()
  }

  const handleOk = async () => {
    let aux = true
    if (!value.codigoMotivo) {
      toast.error('Seleccione el motivo de la anulación')
      aux = false
    }
    if (!factura?.cuf) {
      toast.error('Seleccione el documento')
      aux = false
    }
    if (aux) {
      Swal.fire({
        ...swalConfirm,
        html: '¿Confirma que desea anular el documento? <br> este proceso no se podra revertir',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          setLoading(true)
          return apiNcdAnular(
            factura?.cuf!,
            value.codigoMotivo!,
            sucursal.codigo,
            puntoVenta.codigo,
          )
        },
        allowOutsideClick: () => !Swal.isLoading(),
      })
        .then((result) => {
          if (result.isConfirmed) {
            notSuccess(
              `Documento ${factura?.numeroNotaCreditoDebito} anulado correctamente`,
            )
            onClose(true)
            setLoading(false)
          }
        })
        .catch((err) => {
          swalException(err)
          setLoading(false)
        })
    }
  }

  return (
    <>
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: 435 } }}
        maxWidth="sm"
        open={open}
        {...other}
      >
        <DialogTitle>Anular Documento</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{  xs: 12, sm: 12, md: 12, lg: 12 }}>
              Número de Nota: {factura?.numeroNotaCreditoDebito || ''} <br />
              Cliente: {factura?.cliente.razonSocial || ''} <br />
              Fecha Emisión: {factura?.fechaEmision || ''} <br />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <FormControl sx={{ width: '100%' }} size="small">
                <InputLabel id="demo-select-small">Motivo de la anulación</InputLabel>
                <Select
                  labelId="Motivo de la anulación"
                  value={value.codigoMotivo || ''}
                  label="Motivo de la anulación"
                  onChange={(e) => {
                    setValue({
                      ...value,
                      codigoMotivo: parseInt(e.target.value?.toString() || '0'),
                    })
                  }}
                >
                  {motivosAnulacion.map((ma) => (
                    <MenuItem key={ma.codigoClasificador} value={ma.codigoClasificador}>
                      {ma.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            disabled={loading}
            color={'error'}
            variant={'contained'}
            size={'small'}
            onClick={handleCancel}
          >
            Cancelar
          </Button>

          <LoadingButton
            loading={loading}
            onClick={handleOk}
            color={'primary'}
            startIcon={<ImportExport />}
            loadingPosition="start"
            size={'small'}
            variant={'contained'}
            style={{ marginRight: 15 }}
          >
            Anular Nota
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AnularNcdDialog
