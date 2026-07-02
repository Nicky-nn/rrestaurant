import { Box, Chip, Link, Popover, SxProps, Theme, Typography, useTheme } from '@mui/material'
import { grey } from '@mui/material/colors'
import React, { FC, memo, useMemo, useState } from 'react'

import { getColor } from '../../../utils/getColor.ts'

interface ArticuloParteProps {
  codigoArticulo: string
  nombreArticulo: string
  descripcionArticulo?: string
}

interface ArticuloDetallePopoverProps {
  articulo: ArticuloParteProps
  sx?: SxProps<Theme>
}

/** Componente Reusable Base */
const ArticuloPopoverBase: FC<ArticuloDetallePopoverProps> = ({ articulo, sx }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const theme = useTheme()

  // Optimización: Computamos los colores una sola vez y los memorizamos
  // para evitar múltiples llamadas a getColor en cada renderizado o dentro de los props sx
  const customColors = useMemo(
    () => ({
      bg500: getColor(theme, grey[500]).bgColor,
      border500: getColor(theme, grey[500]).borderColor,
      border700: getColor(theme, grey[700]).borderColor,
    }),
    [theme],
  )

  /** Click que selecciona el texto */
  const handleLinkClick = (event: React.MouseEvent<HTMLElement>) => {
    // Si el usuario está seleccionando texto (arrastrando el cursor), no abrimos el popover
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      return
    }

    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  /** Cerramos el popover */
  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? `popover-${articulo.codigoArticulo}` : undefined

  return (
    <React.Fragment>
      <Link
        component="span"
        variant="inherit"
        onClick={handleLinkClick}
        sx={[
          {
            fontWeight: open ? 600 : 'inherit',
            color: 'text.primary',
            cursor: 'pointer',
            textDecoration: 'none',
            verticalAlign: 'baseline',
            fontFamily: 'inherit',
            display: 'inline',
            '&:hover': { textDecoration: 'underline' },
          },
          ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
        ]}
      >
        {articulo.nombreArticulo}
      </Link>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        disableRestoreFocus
        disableAutoFocus
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{ mt: 1 }}
        slotProps={{
          paper: {
            elevation: 6,
            sx: {
              borderRadius: 2,
              minWidth: { xs: 250, sm: 280 },
              maxWidth: { xs: 'calc(100vw - 32px)', sm: 320 },
              overflow: 'visible',
              mt: 1,
              border: '1px solid',
              borderColor: customColors.border700,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 20,
                width: 10,
                height: 10,
                bgcolor: customColors.bg500, // Coincide con el color de la cabecera
                borderTop: '1px solid',
                borderLeft: '1px solid',
                borderColor: customColors.border700,
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {/* Sección de Cabecera: Código */}
          <Box
            sx={{
              px: 2,
              pt: 1.5,
              pb: 1,
              bgcolor: customColors.bg500,
              borderBottom: '1px solid',
              borderColor: customColors.border500,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="overline" color="text.secondary" fontWeight="700" sx={{ lineHeight: 1 }}>
              CÓDIGO ARTÍCULO
            </Typography>

            <Chip
              label={articulo.codigoArticulo}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                userSelect: 'all', // Permite seleccionar todo el código con un clic
              }}
            />
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              component="div"
              fontWeight="700"
              color="text.primary"
              sx={{ mb: 1, userSelect: 'all' }} // userSelect: 'all' selecciona todo el nombre con un solo clic
            >
              {articulo.nombreArticulo}
            </Typography>

            {articulo.descripcionArticulo ? (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {articulo.descripcionArticulo}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                Este artículo no cuenta con una descripción detallada.
              </Typography>
            )}
          </Box>
        </Box>
      </Popover>
    </React.Fragment>
  )
}

/**
 * Detalle articulo en forma de popover
 * @author isi-template
 */
export const ArticuloDetallePopover = memo(ArticuloPopoverBase, (prevProps, nextProps) => {
  const isArticuloEqual =
    prevProps.articulo.codigoArticulo === nextProps.articulo.codigoArticulo &&
    prevProps.articulo.nombreArticulo === nextProps.articulo.nombreArticulo &&
    prevProps.articulo.descripcionArticulo === nextProps.articulo.descripcionArticulo

  if (!isArticuloEqual) return false

  // Comparamos el objeto sx. Usamos stringify para soportar objetos en línea (inline)
  // de manera segura, permitiendo que el color actualice sin romper la optimización del memo.
  return JSON.stringify(prevProps.sx) === JSON.stringify(nextProps.sx)
})
