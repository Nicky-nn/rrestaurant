import { Box, Skeleton, Typography } from '@mui/material'
import { ReactNode } from 'react'

// Mapeo de alturas estándar de MUI para inputs tipo 'outlined'
const MUI_INPUT_HEIGHTS = {
  small: 40, // Altura exacta de size="small"
  medium: 56, // Altura exacta de size="medium" (default)
  large: 70, // Estimación para tamaños personalizados o fieldsets grandes
}

interface LoadableFieldProps {
  label?: string // Titulo de la precarga
  isLoading: boolean // Si se debe cargar
  children: ReactNode // Hijo
  size?: 'small' | 'medium' | 'large' // Tamaño según configuración de MUI
  height?: number // Opción para sobreescribir la altura manualmente
}

/**
 * Precarga de un campo o varios campos
 * @param label
 * @param isLoading
 * @param children
 * @param size
 * @param height
 * @constructor
 */
export const PreloadFieldSkeleton = ({
  label,
  isLoading,
  children,
  size = 'small',
  height,
}: LoadableFieldProps) => {
  // Priorizamos 'height' manual, si no, usamos el mapa por 'size'
  const finalHeight = height ?? MUI_INPUT_HEIGHTS[size]
  return (
    <Box sx={{ width: '100%' }}>
      {isLoading ? (
        <>
          {label && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                mb: 0.2,
                ml: 0.3,
                display: 'block',
                color: 'text.secondary',
                lineHeight: '1em',
              }}
            >
              {label}
            </Typography>
          )}
          <Skeleton variant="rounded" width="100%" height={finalHeight} sx={{ borderRadius: 1 }} />
        </>
      ) : (
        <Box sx={{ minHeight: finalHeight }}>{children}</Box>
      )}
    </Box>
  )
}
