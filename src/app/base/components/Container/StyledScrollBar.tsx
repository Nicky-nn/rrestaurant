import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

/**
 * Efecto ScrollBar que reemplaza a perfect-scrollbar
 * @author isi-template
 */
const StyledScrollBar = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  overflowX: 'auto',
  paddingRight: '4px',

  // ESTÁNDAR W3C (Firefox 64+ y futuros)
  scrollbarWidth: 'thin', // 'auto' o 'thin'
  // Color: [Color de la barra] [Color del fondo]
  scrollbarColor: `transparent transparent`,
  transition: 'scrollbar-color 0.3s ease-in-out',

  '&:hover': {
    scrollbarColor: `${theme.palette.grey[400]} transparent`,
  },

  // WEBKIT (Chrome, Safari, Edge, Opera, iOS)
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },

  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'transparent', // Invisible por defecto
    borderRadius: '20px',
    border: `2px solid transparent`, // Crea un margen interno
    backgroundClip: 'content-box', // Mantiene el color dentro del borde
    transition: 'background-color 0.4s ease-out',
  },

  // Efecto cuando el mouse entra al contenedor
  '&:hover::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    border: `2px solid ${theme.palette.background.default}`, // Aparece el borde para separar del fondo
  },

  // Efecto cuando el mouse toca directamente la barra
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: theme.palette.grey[600],
  },

  /**
   * REGLA PARA MÓVILES (Opcional)
   * En móviles el scroll suele ser táctil y la barra
   * se gestiona por el sistema operativo.
   */
  '@media (pointer: coarse)': {
    scrollbarWidth: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
  },
}))

export default StyledScrollBar
