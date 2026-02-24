import Home from '@mui/icons-material/Home'
import NavigateNext from '@mui/icons-material/NavigateNext'
import { styled } from '@mui/material'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'

// STYLED COMPONENTS
const BreadcrumbRoot = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  marginBottom: '0.3rem',
})

const BreadcrumbName = styled('h4')(({ theme }) => ({
  margin: 0,
  fontSize: '16px',
  paddingBottom: '1px',
  verticalAlign: 'middle',
  textTransform: 'capitalize',
  [theme.breakpoints.down('xs')]: { display: 'none' },
}))

const SubName = styled('span')(({ theme }) => ({
  textTransform: 'capitalize',
  color: theme.palette.text.secondary,
}))

const Separator = styled('h4')(({ theme }) => ({
  margin: 0,
  marginLeft: 8,
  paddingBottom: '3px',
  color: theme.palette.text.primary,
  [theme.breakpoints.down('xs')]: { display: 'none' },
}))

const StyledIcon = styled(Home)({
  marginLeft: 8,
  marginBottom: '4px',
  verticalAlign: 'middle',
})

/**
 * @author isi-template
 * @param routeSegments
 * @constructor
 */
export default function Breadcrumb({ routeSegments }: any) {
  return (
    <BreadcrumbRoot>
      {routeSegments ? (
        <Fragment>
          <BreadcrumbName>{routeSegments[routeSegments.length - 1]['name']}</BreadcrumbName>
          <Separator>|</Separator>
        </Fragment>
      ) : null}

      <Breadcrumbs
        separator={<NavigateNext sx={{ color: 'text.hint' }} />}
        sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}
      >
        <NavLink to="/">
          <StyledIcon color="primary" />
        </NavLink>

        {routeSegments
          ? routeSegments.map((route: any, index: any) => {
              return index !== routeSegments.length - 1 ? (
                <NavLink key={index} to={route.path}>
                  <SubName>{route.name}</SubName>
                </NavLink>
              ) : (
                <SubName key={index}>{route.name}</SubName>
              )
            })
          : null}
      </Breadcrumbs>
    </BreadcrumbRoot>
  )
}
