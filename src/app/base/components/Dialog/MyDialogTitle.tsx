import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  DialogTitle,
  DialogTitleProps,
  IconButton,
  IconButtonProps,
  Stack,
  Typography,
} from '@mui/material'
import React, { ReactNode } from 'react'

interface MyDialogTitleProps extends DialogTitleProps {
  children: ReactNode | string
  subtitle?: ReactNode | string
  onClose?: () => void
  icon?: React.ElementType
  color?: IconButtonProps['color']
}

/**
 * DialogTitle personalizado, admite color del icono y subtitulo y evento onClose
 * @param props
 * @constructor
 */
export const MyDialogTitle = (props: MyDialogTitleProps) => {
  const { children, subtitle, onClose, icon: Icon, color = 'primary', ...other } = props

  // Renderizado condicional del Título
  const renderTitle =
    typeof children === 'string' ? (
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 500,
          color: 'text.primary',
          lineHeight: 1.2,
        }}
      >
        {children}
      </Typography>
    ) : (
      children
    )

  // Renderizado condicional del Subtítulo
  const renderSubtitle =
    subtitle &&
    (typeof subtitle === 'string' ? (
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 400,
          mt: 0.5,
          display: 'block',
        }}
      >
        {subtitle}
      </Typography>
    ) : (
      subtitle
    ))

  return (
    <DialogTitle
      sx={{
        pt: 2.5,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
      {...other}
    >
      <Stack
        direction="row"
        spacing={1.3}
        sx={{
          alignItems: subtitle ? 'center' : 'flex-start',
          width: '100%',
        }}
      >
        {Icon && (
          <Box
            sx={{
              display: 'flex',
              color: `${color}.main`,
              flexShrink: 0,
            }}
          >
            <Icon strokeWidth={2} sx={{ fontSize: subtitle ? 30 : 25, mt: -0.15 }} />
          </Box>
        )}

        <Box>
          {renderTitle}
          {renderSubtitle}
        </Box>
      </Stack>

      {onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            color: 'text.disabled',
            right: 15,
            top: 15,
            transition: 'all 0.2s',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </DialogTitle>
  )
}
