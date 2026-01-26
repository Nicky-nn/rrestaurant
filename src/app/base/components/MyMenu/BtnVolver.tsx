import { ArrowBackIosNewRounded } from '@mui/icons-material'
import { Button, ButtonProps } from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface Props {
  to?: string
  label?: string
  size?: ButtonProps['size'] // 'small' | 'medium' | 'large'
}

/**
 * Btn custom para ir atras
 * @param to
 * @param label
 * @param size
 * @constructor
 */
export const BtnVolver = ({ to, label = 'Volver', size = 'medium' }: Props) => {
  const navigate = useNavigate()

  const handleBack = () => {
    to ? navigate(to) : navigate(-1)
  }

  return (
    <Button
      size={size}
      variant="text" // 'text' es más minimalista, 'outlined' si quieres más presencia
      onClick={handleBack}
      startIcon={
        <ArrowBackIosNewRounded
          sx={{
            fontSize: size === 'small' ? '12px !important' : '16px !important',
            transition: 'transform 0.2s ease',
          }}
        />
      }
      sx={{
        textTransform: 'none',
        fontWeight: 700,
        color: 'text.secondary',
        borderRadius: 2, // Bordes redondeados consistentes con el estilo Nano
        // px: size === 'small' ? 1.5 : 2,
        '&:hover': {
          backgroundColor: (theme) => theme.palette.action.hover,
          color: 'text.primary',
          '& .MuiButton-startIcon': {
            transform: 'translateX(-1px)', // Micro-interacción de dirección
          },
        },
        // Ajuste fino para que el icono y el texto se sientan compactos
        '& .MuiButton-startIcon': {
          marginRight: size === 'small' ? '4px' : '6px',
        },
      }}
    >
      {label}
    </Button>
  )
}
