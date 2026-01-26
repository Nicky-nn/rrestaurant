import {
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
  WarningAmber,
} from '@mui/icons-material'
import { Alert, AlertTitle, alpha, Box, Stack, Typography } from '@mui/material'
import React, { FunctionComponent, ReactNode } from 'react'

type ConfirmType = 'success' | 'warning' | 'error' | 'info'

interface OwnProps {
  title: string
  description?: string | ReactNode
  type?: ConfirmType // Parámetro para cambiar el color
  // Acepta Array de strings o de Componentes
  steps?: (string | ReactNode)[]
}

type Props = OwnProps

// Mapa de iconos por tipo (puedes sobrescribirlos si lo deseas)
const iconMap: Record<ConfirmType, ReactNode> = {
  success: <CheckCircleOutline sx={{ fontSize: 32 }} />, // Manteniendo tu Fax para éxito/producción
  warning: <WarningAmber sx={{ fontSize: 32 }} />,
  error: <ErrorOutline sx={{ fontSize: 32 }} />,
  info: <InfoOutlined sx={{ fontSize: 32 }} />,
}

/**
 * Componente que te ayuda a renderizar los mensajes de confirmacion
 * - Generalmente usado en operaciones de confirmacion con useConfirm
 *     const { confirmed } = await confirm({
 *       content: (
 *         <ActionConfirmMessage
 *           title={'Iniciar proceso de producción'}
 *           type={'success'}
 *           description={'Esta a punto de iniciar el proceso de producción'}
 *           steps={[
 *             'Se comprometen todos los insumos en inventario.',
 *             'Producto a procesar y productos adicionales no sufren cambios de estado en el inventario.',
 *           ]}
 *         />
 *       ),
 *     })
 * @param props
 * @constructor
 */
export const ContentConfirmMessage: FunctionComponent<Props> = (props) => {
  const { title, description, type = 'success', steps = [] } = props

  return (
    <Stack spacing={2}>
      <Alert
        severity={type} // Cambia color y estilos base automáticamente
        icon={iconMap[type]}
        sx={{
          borderRadius: 2,
          backgroundColor: (theme) => alpha(theme.palette[type].main, 0.08),
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette[type].main, 0.2),
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <AlertTitle sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: -0.5 }}>
          {title}
        </AlertTitle>
        {description && (
          <>
            {typeof description === 'string' ? (
              <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.4 }}>
                {description}
              </Typography>
            ) : (
              <Box sx={{ width: '100%', mt: -0.2 }}>{description}</Box>
            )}
          </>
        )}
      </Alert>

      {/* BLOQUE DE OPERACIONES: Fuera del Alert para limpieza visual */}
      {steps.length > 0 && (
        <Box
          sx={{
            width: '100%',
            pl: 2.5,
            pr: 2.5,
            pt: 1.5,
            pb: 1.5,
            bgcolor: (theme) => alpha(theme.palette.grey[100], 0.5),
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'grey.300',
          }}
        >
          <Typography
            variant="overline"
            display="block"
            color="text.secondary"
            sx={{ mb: 0.3, fontWeight: 700 }}
          >
            Operaciones:
          </Typography>
          <Stack spacing={1.5}>
            {steps.map((step, index) => (
              <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                {/* El Bullet siempre presente para consistencia */}
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    mt: '7px !important',
                    flexShrink: 0,
                  }}
                />

                {/* RENDERIZADO CONDICIONAL: Texto o Componente */}
                {typeof step === 'string' ? (
                  <Typography variant="body2" sx={{ lineHeight: 1.4, fontWeight: 500 }}>
                    {step}
                  </Typography>
                ) : (
                  // Si es un componente, lo renderizamos directamente
                  <Box sx={{ width: '100%', mt: -0.2 }}>{step}</Box>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
