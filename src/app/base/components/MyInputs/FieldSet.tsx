import { Box, BoxProps, SxProps, Typography, useTheme } from '@mui/material'
import React from 'react'

/**
 * Props para el componente FieldSet.
 */
interface FieldSetProps extends Omit<BoxProps, 'title'> {
  /**
   * El contenido del título (leyenda) para el grupo.
   */
  titulo?: React.ReactNode

  /**
   * El contenido dentro del FieldSet.
   */
  children: React.ReactNode

  /**
   * Si es `true`, deshabilita todos los elementos de formulario hijos.
   */
  disabled?: boolean

  /**
   * Si es `true`, renderiza el fieldset sin
   * ningún estilo de borde o padding (modo "invisible").
   * El `sx` prop seguirá aplicándose.
   */
  invisible?: boolean
}

/**
 * Un componente FieldSet reutilizable que imita la apariencia
 * "outlined" de MUI y usa un <fieldset> semántico.
 * @author isi-template
 */
export const FieldSet: React.FC<FieldSetProps> = ({
  titulo,
  children,
  disabled = false,
  invisible = false, // Valor por defecto es false
  sx,
  ...rest
}) => {
  const theme = useTheme()

  // Estilos base del <fieldset> (reseteo)
  const baseSx: SxProps = {
    margin: 0, // Resetea el margen por defecto de fieldset
    border: 'none',
    padding: 0,
  }

  // Estilos visuales "outlined"
  // Solo se aplican si invisible=false
  const outlinedSx: SxProps = invisible
    ? {}
    : {
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        paddingTop: theme.spacing(2.5),
        position: 'relative', // Necesario para la leyenda
      }

  // Solo se aplican si invisible=false
  const legendSx: SxProps = invisible
    ? {}
    : {
        position: 'absolute',
        top: 0,
        left: theme.spacing(1.5),
        transform: 'translateY(-50%)',

        // El "truco" para el recorte del borde:
        background: theme.palette.background.default,

        padding: `0 ${theme.spacing(0.5)}`, // Espaciado horizontal

        // Colores
        color: disabled ? theme.palette.text.disabled : theme.palette.text.secondary,
        fontWeight: 500,
      }

  return (
    <Box
      component="fieldset"
      disabled={disabled}
      sx={{
        ...baseSx, // 1. Aplicar reseteo base
        ...outlinedSx, // 2. Aplicar estilos "outlined" (si no es invisible)
        ...sx, // 3. Aplicar el 'sx' del usuario al final
      }}
      {...rest}
    >
      {titulo && (
        <Typography
          component="legend"
          variant="body2"
          sx={legendSx} // Aplicar estilos de leyenda (si no es invisible)
        >
          {titulo}
        </Typography>
      )}
      {children}
    </Box>
  )
}

export default FieldSet
