import { Box, BoxProps } from '@mui/material'
import { ReactElement, ReactNode } from 'react'

interface OwnProps extends BoxProps {
  color: 'error' | 'warning' | 'success' | 'info'
  children: ReactNode | ReactNode[]
}

type Props = OwnProps

/**
 * @description Chip personalizado para spam con estilos
 * <Shop fontSize={'small'} sx={{ verticalAlign: 'bottom' }} />
 * @author isi-template
 * @param props
 * @constructor
 */
export const MyChip = (props: Props): ReactElement => {
  const { color, children, ...other } = props
  return (
    <>
      <Box
        component="span"
        sx={(theme) => ({
          backgroundColor:
            color === 'info'
              ? theme.palette.info.dark
              : color === 'warning'
                ? theme.palette.warning.dark
                : color === 'success'
                  ? theme.palette.success.dark
                  : theme.palette.error.dark,
          borderRadius: '0.25rem',
          color: '#fff',
          // maxWidth: '9ch',
          pt: '0.25rem',
          pb: '0.25rem',
          pl: '0.5rem',
          pr: '0.5rem',
        })}
        {...other}
      >
        {children}
      </Box>
    </>
  )
}
