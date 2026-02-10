import { Box, styled } from '@mui/material'

/**
 * Estilos que reenplazan a responsives tables
 * <StyledResponsiveTableContainer>
 *   <table className={'table-dense'}>
 *     <tbody><tbody>
 *   </table>
 * </StyledResponsiveTableContainer>
 * no se requiere instanciar llamar a la clase .responsive-table
 * @param props
 * @returns
 * @author isi-template
 */
export const StyledResponsiveTableContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  '& table': {
    border: `1px solid ${
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(204, 204, 204, 0.7)'
    }`,
    borderCollapse: 'collapse',
    margin: '0',
    padding: '0',
    width: '100%',
    tableLayout: 'fixed',
  },
  '& table caption': {
    fontSize: '1.5em',
    margin: '0.5em 0 0.75em',
  },
  '& table th, & table td': {
    padding: '0.625em',
    verticalAlign: 'baseline',
    textAlign: 'left',
  },
  '& table th': {
    letterSpacing: '0.1em',
    textAlign: 'left',
  },
  '& table.table-dense td, & table.table-dense th': {
    padding: '0.3em 0.6em',
    fontSize: '0.9em',
  },
  '& table tr': {
    border: `1px solid ${
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(204, 204, 204, 0.7)'
    }`,
    padding: '0.35em',
  },
  [theme.breakpoints.down('sm')]: {
    // 600px por defecto en MUI
    '& table': {
      border: 0,
    },
    '& table caption': {
      fontSize: '1.2em',
    },
    '& table thead': {
      border: 'none',
      clip: 'rect(0 0 0 0)',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      width: '1px',
    },
    '& table tr': {
      borderBottom: `2px solid ${
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(204, 204, 204, 0.7)'
      }`,
      display: 'block',
      marginBottom: '0.525em',
    },
    '& table td': {
      borderBottom: `1px solid ${
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(204, 204, 204, 0.7)'
      }`,
      display: 'block',
      textAlign: 'right',
      width: '100% !important',

      '&::before': {
        content: 'attr(data-label)',
        float: 'left',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },

      '&:last-child': {
        borderBottom: 0,
      },
    },
  },
}))
