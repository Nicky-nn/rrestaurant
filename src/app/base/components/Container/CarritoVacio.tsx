// Esto evita depender de @mui/icons-material si el entorno del preview tiene problemas de resolución de paquetes
import { Box, Button, Paper, SxProps, Theme, Typography } from '@mui/material'
import { ElementType, FC, ReactNode } from 'react'

/** icono por defecto */
const ShoppingCartIcon = (props: any) => (
  <svg
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    style={{ fontSize: 'inherit' }}
    {...props}
  >
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

export interface EmptyStateProps {
  /** Título principal del estado vacío */
  title?: string
  /** Subtítulo o descripción de ayuda */
  subtitle?: string
  /** Icono de MUI o componente personalizado a renderizar */
  icon?: ElementType
  /** Tamaño del icono en píxeles (por defecto 48) */
  iconSize?: number
  /** Si es true, muestra el subtítulo en color 'warning.main', de lo contrario usa 'text.secondary' */
  isWarning?: boolean
  /** Variante visual del contenedor Paper */
  variant?: 'outlined' | 'elevation'
  /** Nivel de sombra (solo si variant es 'elevation') */
  elevation?: number
  /** Texto del botón de acción principal (opcional) */
  actionLabel?: string
  /** Función callback que se ejecuta al hacer clic en el botón de acción */
  onActionClick?: () => void
  /** Permite inyectar un elemento personalizado como acción en lugar del botón por defecto */
  customAction?: ReactNode
  /** Propiedad para extender o sobreescribir estilos del Paper contenedor */
  sx?: SxProps<Theme>
}

/**
 * Componente carrito de compras, ventas vacio
 * @param param0
 * @param param0.title
 * @param param0.subtitle
 * @param param0.icon
 * @param param0.iconSize
 * @param param0.isWarning
 * @param param0.variant
 * @param param0.elevation
 * @param param0.actionLabel
 * @param param0.onActionClick
 * @param param0.customAction
 * @param param0.sx
 * @autor isi-template
 * @version 2026.4
 * @constructor
 */
export const CarritoVacio: FC<EmptyStateProps> = ({
  title = 'Carrito Vacío',
  subtitle = 'Se requiere al menos un artículo para procesar.',
  icon: IconComponent = ShoppingCartIcon,
  iconSize = 48,
  isWarning = false,
  variant = 'outlined',
  elevation = 0,
  actionLabel,
  onActionClick,
  customAction,
  sx,
}) => {
  return (
    <Paper
      variant={variant}
      elevation={variant === 'elevation' ? elevation : 0}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: 'action.hover',
        borderRadius: 2,
        borderStyle: variant === 'outlined' ? 'dashed' : 'solid', // Borde punteado elegante para estados vacíos
        minHeight: 150,
        transition: 'all 0.3s ease-in-out',
        ...sx, // Permite sobreescribir cualquier estilo desde fuera
      }}
    >
      {/* Icon Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: isWarning ? 'warning.main' : 'text.secondary',
          opacity: 0.6,
          transform: 'scale(1)',
          transition: 'transform 0.2s',
          fontSize: iconSize,
          '&:hover': {
            transform: 'scale(1.08)',
          },
        }}
      >
        <IconComponent />
      </Box>

      {/* Titulo principal */}
      <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom sx={{ maxWidth: 400 }}>
        {title}
      </Typography>

      {/* Mensaje de subtitulo */}
      {subtitle && (
        <Typography
          variant="body2"
          color={isWarning ? 'warning.main' : 'text.secondary'}
          sx={{ mb: actionLabel || customAction ? 3 : 0, maxWidth: 320, fontWeight: isWarning ? 500 : 400 }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Botón de acción  */}
      {actionLabel && !customAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onActionClick}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 2,
            fontWeight: 'bold',
          }}
        >
          {actionLabel}
        </Button>
      )}

      {/* Acción adicional */}
      {customAction && <Box sx={{ width: '100%' }}>{customAction}</Box>}
    </Paper>
  )
}
