import { yupResolver } from '@hookform/resolvers/yup'
import AddBoxIcon from '@mui/icons-material/AddBox'
import BusinessIcon from '@mui/icons-material/Business'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useConfirm } from 'material-ui-confirm'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { date, object, ref, string } from 'yup'

import { apiLoteGlobalRegistro } from '../../../../../base/api/apiLoteGlobalRegistro.ts'
import { ContentConfirmMessage } from '../../../../../base/components/Dialog/ContentConfirmMessage.tsx'
import SimpleDatePicker from '../../../../../base/components/MyInputs/SimpleDatePicker.tsx'
import SimpleDateTimePickerField from '../../../../../base/components/MyInputs/SimpleDateTimePickerField.tsx'
import {
  LoteApiInputProps,
  LoteInputProps,
  LoteProps,
} from '../../../../../interfaces/lote.ts'
import { dateToDMYHHMMSS, dayjsToDMY } from '../../../../../utils/dayjsHelper.ts'
import { notSuccess } from '../../../../../utils/notification.ts'
import { swalClose, swalException, swalLoading } from '../../../../../utils/swal.ts'

// --- Esquema de Validación con Yup ---
const schema = object({
  codigoLote: string()
    .required('El código de lote es obligatorio')
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  descripcion: string()
    .required('La descripción es obligatoria')
    .min(5, 'Debe ser más descriptivo'),
  codigoArticulo: string().required('El artículo es requerido'),
  fechaFabricacion: date().typeError('Fecha inválida').required('Requerido'),
  fechaAdmision: date().typeError('Fecha inválida').required('Requerido'),
  fechaVencimiento: date()
    .typeError('Fecha inválida')
    .required('Requerido y debe ser posterior a la fabricación')
    .min(ref('fechaFabricacion'), 'El vencimiento debe ser posterior a la fabricación'),
}).required()

interface NuevoLoteDialogProps {
  open: boolean
  onSubmit: (resp: LoteProps) => void
  onClose: () => void
  codigoArticulo: string
}

/**
 * Registro de un lote en modo dialog
 * @param open
 * @param onClose
 * @param onSubmit
 * @param codigoArticulo
 * @author isi-template
 * @constructor
 */
const LoteSeleccionRegistroDialog: React.FC<NuevoLoteDialogProps> = ({
  open,
  onClose,
  onSubmit,
  codigoArticulo,
}) => {
  const defaultForm = {
    codigoArticulo: '',
    codigoLote: '',
    descripcion: '',
    fechaAdmision: new Date(),
    fechaFabricacion: dayjs(),
    fechaVencimiento: dayjs(),
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoteInputProps>({
    defaultValues: { ...defaultForm, codigoArticulo },
    resolver: yupResolver<any, any, any>(schema),
  })

  const confirm = useConfirm()

  /**
   * Guardamos los datos del lote
   * @param data
   */
  const handleFormSubmit = async (data: LoteInputProps) => {
    const input: LoteApiInputProps = {
      descripcion: data.descripcion,
      atributo1: data.atributo1,
      atributo2: data.atributo2,
      fechaAdmision: dateToDMYHHMMSS(data.fechaAdmision)!, //  DateDMYHHMMSS
      fechaFabricacion: dayjsToDMY(data.fechaFabricacion)!, // DateDMY
      fechaVencimiento: dayjsToDMY(data.fechaVencimiento)!, // string //DateDMY
    }
    const { confirmed } = await confirm({
      content: (
        <ContentConfirmMessage
          title={'Nuevo Lote'}
          description={'¿Desea crear el lote?'}
        />
      ),
    })
    if (confirmed) {
      swalLoading()
      const resp = await apiLoteGlobalRegistro(
        data.codigoLote,
        data.codigoArticulo,
        input,
        {
          codigoSucursal: 0,
          codigoPuntoVenta: 0,
        },
      ).catch((e) => {
        swalException(e)
        return null
      })

      if (resp) {
        swalClose()
        notSuccess()
        onSubmit(resp)
        onClose()
      }
    }
  }

  /*********************************************************************************/
  /*********************************************************************************/

  useEffect(() => {
    if (open && codigoArticulo) {
      reset({
        ...defaultForm,
        codigoArticulo,
      })
    }
  }, [open, codigoArticulo])
  /*********************************************************************************/
  /*********************************************************************************/
  /*********************************************************************************/

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          m: 0,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1.3,
        }}
      >
        <AddBoxIcon />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Nuevo registro de Lote
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <Box
                sx={{
                  py: 1,
                  px: 3,
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <BusinessIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Articulo
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {codigoArticulo}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Fila 1: Lote y Artículo */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="codigoLote"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Código de Lote"
                    fullWidth
                    size={'small'}
                    variant="outlined"
                    error={!!errors.codigoLote}
                    helperText={errors.codigoLote?.message}
                    placeholder="Ej: 4500XXX"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="fechaAdmision"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SimpleDateTimePickerField
                    value={field.value || null}
                    label="Fecha de admisión"
                    onChange={field.onChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
            {/* Fila 2: Descripción Completa */}
            <Grid size={12}>
              <Controller
                name="descripcion"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Descripción del lote"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            {/* Fila 3: Fechas */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="fechaFabricacion"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SimpleDatePicker
                    label="Fecha fabricación"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={field.onChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="fechaVencimiento"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <SimpleDatePicker
                    label="Fecha vencimiento"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={field.onChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="atributo1"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Atributo 1"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    size={'small'}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="atributo2"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Atributo 2"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    size={'small'}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, bgcolor: 'background.default', justifyContent: 'center' }}
        >
          <Button onClick={onClose} color="error" sx={{ fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ fontWeight: 'bold' }}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : 'Guardar Lote'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default LoteSeleccionRegistroDialog
