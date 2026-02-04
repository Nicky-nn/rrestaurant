import { InputLabel, InputLabelProps, styled } from '@mui/material'

interface Props extends InputLabelProps {}

/**
 * @description redifiniendo estilo para el componente InputLabel
 * @author isi-template
 */
export const MyInputLabel = styled((props: Props) => {
  const { ...other } = props
  return <InputLabel color={'primary'} shrink={true} {...other} />
})(({ theme }) => ({
  transform: 'translate(14px, -9px) scale(0.75)',
  pointerEvents: 'none',
  zIndex: 1,
  maxWidth: 'calc(100% - 24px)',

  // Ajuste para el gradiente
  paddingLeft: 4,
  paddingRight: 4,
  marginLeft: -4, // Compensamos el padding para que no se mueva visualmente

  // LA MAGIA DEL GRADIENTE (Tu lógica):
  // Usamos background.paper porque el Select suele estar sobre tarjetas/modales.
  // Si usas background.default, cámbialo aquí.
  background: `linear-gradient(180deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0) 40%, 
    ${theme.palette.background.paper} 40%, 
    ${theme.palette.background.paper} 60%, 
    rgba(255,255,255,0) 60%, 
    rgba(255,255,255,0) 100%
  )`,

  // Esto asegura que en modo Dark/Light el texto sea legible y corte la línea
  '&.Mui-focused': {
    // Mantener el gradiente incluso cuando está enfocado
    background: `linear-gradient(180deg, 
      rgba(255,255,255,0) 0%, 
      rgba(255,255,255,0) 40%, 
      ${theme.palette.background.paper} 40%, 
      ${theme.palette.background.paper} 60%, 
      rgba(255,255,255,0) 60%, 
      rgba(255,255,255,0) 100%
    )`,
  },
}))
