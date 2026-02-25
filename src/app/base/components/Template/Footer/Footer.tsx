import { AppBar, styled, Toolbar } from '@mui/material'
import { FC } from 'react'
import { useLocation } from 'react-router-dom'

import { topBarHeight } from '../../../../utils/constant'
import { Paragraph, Span } from '../Typography'

const AppFooter = styled(Toolbar)(() => ({
  display: 'flex',
  alignItems: 'center',
  minHeight: topBarHeight,
  '@media (max-width: 499px)': {
    display: 'table',
    width: '100%',
    minHeight: 'auto',
    padding: '1rem 0',
    '& .container': {
      flexDirection: 'column !important',
      '& a': {
        margin: '0 0 16px !important',
      },
    },
  },
}))

const FooterContent = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '0px 1rem',
  maxWidth: '1170px',
  margin: '0 auto',
}))

const nombreComercial = import.meta.env.ISI_NOMBRE_COMERCIAL || 'ISI.PAY'
const urlEmpresa = import.meta.env.ISI_URL || 'https://integrate.com.bo'

const Footer: FC<any> = () => {
  const location = useLocation()

  const shouldBeCompact = location.pathname.includes('/pedidos/registrar')

  if (shouldBeCompact) {
    return null // Si se cumple la condición, el Footer no se mostrará
  }

  return (
    <AppBar color="primary" position="static" sx={{ zIndex: 96 }}>
      <AppFooter>
        <FooterContent>
          <Span sx={{ m: 'auto' }}></Span>
          <Paragraph sx={{ m: 0 }}>
            <a href={urlEmpresa} target="_blank" rel="noreferrer">
              © {nombreComercial}{' '}
            </a>
            {new Date().getFullYear()} - v{import.meta.env.ISI_VERSION}
          </Paragraph>
        </FooterContent>
      </AppFooter>
    </AppBar>
  )
}

export default Footer
