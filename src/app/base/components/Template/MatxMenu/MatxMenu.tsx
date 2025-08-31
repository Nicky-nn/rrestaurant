import { Box, Menu, styled, ThemeProvider } from '@mui/material'
import React, { FC, Fragment } from 'react'

import useSettings from '../../../hooks/useSettings'

const MenuButton = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  color: theme.palette.text.primary,
  '& div:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const MatxMenu: FC<any> = (props: any) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const children = React.Children.toArray(props.children)
  let { shouldCloseOnItemClick = true, horizontalPosition = 'left' } = props
  const { settings } = useSettings()

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Fragment>
      <MenuButton onClick={handleClick}>{props.menuButton}</MenuButton>
      <ThemeProvider theme={settings.themes[settings.activeTheme]}>
        <Menu
          elevation={8}
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: horizontalPosition,
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: horizontalPosition,
          }}
        >
          {children.map((child, index) => (
            <div onClick={shouldCloseOnItemClick ? handleClose : () => {}} key={index}>
              {child}
            </div>
          ))}
        </Menu>
      </ThemeProvider>
    </Fragment>
  )
}

export default MatxMenu
