import { InputLabel, InputLabelProps, styled } from '@mui/material'

interface Props extends InputLabelProps {}

/**
 * @description redifiniendo estilo para el componente InputLabel
 * @author isi-template
 */
export const MyInputLabel = styled((props: Props) => {
  const { ...other } = props
  return <InputLabel color={'secondary'} shrink={true} {...other} />
})(({ theme }) => ({
  '&.MuiInputLabel-shrink': {
    background: `linear-gradient(180deg, rgba(255,0,0,0) 25%, rgba(255,0,0,0) 25% 50%, ${theme.palette.background.default} 50% 75%, rgba(255,0,0,0) 75%)`,
    paddingLeft: 5,
    paddingRight: 5,
  },
}))
