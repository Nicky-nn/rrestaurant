import {
  AccessTime,
  AccountCircleRounded,
  ArrowRight,
  EditNote,
  History,
  Timeline,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Palette,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import React, { FC } from 'react'

import { WorkflowProps } from '../../../interfaces/workflow.ts'
import { alphaByTheme } from '../../../utils/colorUtils.ts'
import { getColor } from '../../../utils/getColor.ts'
import { MyDialogTitle } from '../Dialog/MyDialogTitle.tsx'

// ===== TIPADO FUERTE PARA LOS COLORES =====
type StyledPaletteColors = {
  [K in keyof Palette]: Palette[K] extends { main: string } ? K : never
}[keyof Palette]

// ===== ASIGNACIÓN DINÁMICA DE COLORES DE ESTADO =====
const PALETTE_KEYS: StyledPaletteColors[] = ['primary', 'secondary', 'success', 'error', 'info', 'warning']

const COMMON_STATES: Record<string, StyledPaletteColors> = {
  COMPLETADO: 'success',
  APROBADO: 'success',
  ACTIVO: 'success',
  FINALIZADO: 'green',
  INICIADO: 'orange',
  PENDIENTE: 'warning',
  RECHAZADO: 'error',
  ANULADO: 'error',
  ELABORADO: 'secondary',
  BORRADOR: 'secondary',
  ACEPTADO: 'purple',
}

const getPaletteKeyForState = (state: string | null | undefined): StyledPaletteColors | undefined => {
  if (!state) return undefined
  const upperState = state.toUpperCase().trim()

  if (COMMON_STATES[upperState]) {
    return COMMON_STATES[upperState]
  }

  let hash = 0
  for (let i = 0; i < upperState.length; i++) {
    hash = upperState.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % PALETTE_KEYS.length
  return PALETTE_KEYS[index]
}

export interface WorkflowDialogProps {
  open: boolean
  onClose: () => void
  /** Array datos de trazabilidad */
  data?: WorkflowProps[]
  /** Titulo sugerido. Default Historial de trazabilidad */
  title?: string
  /** Caso se requiera concatenar codigo al titulo enviado o genérico,
   * - Ej: Historial de trazabilidad #[code] */
  code?: string
}

/**
 * COMPONENTE REUSABLE para trazabilidad workflow
 * Ejemplo de uso:
 * - Icono de la tabla: <History />
 * - Button debe contener el icono <History />
 * <WorkflowDialog {...workflow.dialogProps} />
 * @param param0
 * @param param0.open
 * @param param0.onClose
 * @param param0.data
 * @param param0.title
 * @constructor
 */
export const WorkflowDialog: FC<WorkflowDialogProps> = ({
  open,
  onClose,
  data = [],
  title = 'Historial de trazabilidad',
  code = undefined,
}) => {
  const theme = useTheme()
  const isEmpty = !data || data.length === 0

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxWidth: 800, // Ancho personalizado entre sm y md
            width: '100%',
          },
        },
      }}
    >
      <MyDialogTitle onClose={() => onClose()} icon={History} subtitle={code && `${code}`}>
        <Typography
          variant={'h6'}
          component="div"
          sx={{ fontSize: 20, fontWeight: 400, mt: 0.1, lineHeight: 1 }}
        >
          {title}
        </Typography>
      </MyDialogTitle>

      <Divider sx={{ mt: code ? -1 : 0 }} />

      <DialogContent
        sx={{ py: 2, px: 3, bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc' }}
      >
        {isEmpty ? (
          <Alert severity="info" sx={{ mt: 0.5, borderRadius: 2 }}>
            No se encontraron registros de trazabilidad para este registro.
          </Alert>
        ) : (
          <Box sx={{ position: 'relative', mt: 1 }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 20,
                width: 2,
                bgcolor: 'divider',
                zIndex: 0,
                display: { xs: 'none', sm: 'block' },
              }}
            />

            {data.map((event, index) => {
              const isRealChange = event.estadoAnterior !== event.estadoNuevo
              const isLast = index === data.length - 1

              const stateColorKey = getPaletteKeyForState(event.estadoNuevo)
              const styledColors = getColor(theme, stateColorKey)

              return (
                <Box key={index} sx={{ display: 'flex', position: 'relative', mb: isLast ? 0 : 4 }}>
                  <Box
                    sx={{
                      mr: 2,
                      zIndex: 1,
                      display: { xs: 'none', sm: 'flex' },
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: isRealChange ? styledColors.bgColor : 'background.paper',
                        color: isRealChange ? styledColors.textColor : 'text.secondary',
                        boxShadow: isRealChange ? 2 : 1,
                      }}
                    >
                      {isRealChange ? <Timeline sx={{ fontSize: 20 }} /> : <EditNote sx={{ fontSize: 20 }} />}
                    </Avatar>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      transition: 'box-shadow 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={2}
                      mb={2}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={event.estadoAnterior || 'NINGUNO'}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: theme.palette.action.hover,
                            border: '1px solid',
                            borderColor: 'divider',
                            color: 'text.secondary',
                          }}
                        />

                        <Stack direction="row" alignItems="center" spacing={0.5} color="text.disabled">
                          <ArrowRight sx={{ fontSize: 16 }} />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.65rem' }}
                          >
                            {isRealChange ? 'Transición' : 'Edición'}
                          </Typography>
                          <ArrowRight sx={{ fontSize: 16 }} />
                        </Stack>

                        <Chip
                          label={event.estadoNuevo}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: styledColors.bgColor,
                            color: styledColors.textColor,
                            border: '1px solid',
                            borderColor: styledColors.borderColor,
                          }}
                        />
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                        <AccessTime sx={{ fontSize: 16 }} />
                        <Typography variant="body2" fontWeight="medium">
                          {event.fecha}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={2}
                      sx={{
                        p: 1.5,
                        bgcolor: alphaByTheme(theme.palette.grey[300], theme, 0.03, 0.2),
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ flex: 1, fontStyle: event.comentario ? 'normal' : 'italic' }}
                      >
                        {event.comentario || 'Sin comentario de auditoría registrado.'}
                      </Typography>
                      <Chip
                        icon={<AccountCircleRounded sx={{ fontSize: 14 }} />}
                        label={event.usuario}
                        size="small"
                        sx={{
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          fontWeight: 'medium',
                        }}
                      />
                    </Stack>
                  </Paper>
                </Box>
              )
            })}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper', justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="inherit"
          disableElevation
          sx={{ fontWeight: 'bold' }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
