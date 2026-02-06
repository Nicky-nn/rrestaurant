import { alpha, Menu, MenuProps, Paper, styled } from '@mui/material'

import { topBarHeightRestriccion } from '../../../../utils/constant'

export const RestriccionTopBarRoot = styled('div')(({ theme }) => ({
  top: 0,
  zIndex: 96,
  transition: 'all 0.3s ease',
  // boxShadow: themeShadows[8],
  height: topBarHeightRestriccion,
  background: theme.palette.background.paper,
}))

export const RestriccionTopBarContainer = styled(Paper)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  background: theme.palette.background.paper,
  borderRadius: 0,
  justifyContent: 'space-between',
  boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.1)',
}))

export const RestriccionStyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow: theme.shadows[2],
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}))
