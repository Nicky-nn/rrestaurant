import { Box, styled, Theme } from '@mui/material'
import { JSX } from 'react'

import useSettings from '../../../hooks/useSettings'
import { Span } from '../Typography'

const BrandRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 18px 20px 29px',
})) as typeof Box

interface StyledSpanProps {
  theme?: Theme
  mode: any
  child: JSX.Element | JSX.Element[]
}
const StyledSpan: any = styled(Span)(({ theme, mode }: StyledSpanProps) => ({
  fontSize: 18,
  marginLeft: '.5rem',
  display: mode === 'compact' ? 'none' : 'block',
  marginTop: mode === 'compact' ? '0' : '10px',
}))

const logoMini = import.meta.env.ISI_LOGO_MINI || '/assets/images/logo_mini.png'
const nombreComercial = import.meta.env.ISI_NOMBRE_COMERCIAL || 'ISI.INVOICE'

const Brand = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const { settings } = useSettings()
  const leftSidebar = settings.layout1Settings.leftSidebar
  const { mode } = leftSidebar

  return (
    <BrandRoot>
      <Box display="flex" alignItems="center">
        <img src={logoMini} style={{ height: 30 }} alt="" />
        <StyledSpan mode={mode} className="sidenavHoverShow">
          {nombreComercial}
        </StyledSpan>
      </Box>
      <Box
        className="sidenavHoverShow"
        sx={{ display: mode === 'compact' ? 'none' : 'block' }}
      >
        {children || null}
      </Box>
    </BrandRoot>
  )
}

export default Brand
