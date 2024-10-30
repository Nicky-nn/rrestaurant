import {
  Computer,
  Home,
  MonetizationOn,
  RadioButtonChecked,
  RepeatOne,
} from '@mui/icons-material'
import {
  Chip,
  IconButton,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material'
import React, { FC, useState } from 'react'

import { MyChip } from '../../../../base/components/MyChip/MyChip'
import { themeShadows } from '../../../../base/components/Template/MatxTheme/themeColors'
import useAuth from '../../../../base/hooks/useAuth'
import { topBarHeightRestriccion } from '../../../../utils/constant'
import CuentaRestriccionDialog from '../../cuenta/view/CuentaRestriccionDialog'

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
}))

const RestriccionTopBarRoot = styled('div')(({ theme }) => ({
  top: 0,
  zIndex: 96,
  transition: 'all 0.3s ease',
  boxShadow: themeShadows[5],
  height: topBarHeightRestriccion,
  background: theme.palette.background.default,
}))

const RestriccionTopBarContainer = styled(Paper)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  background: theme.palette.background.default,
  borderRadius: 0,
  justifyContent: 'space-between',
}))

/**
 * Segunda barra superior que muestra la información de restricción del usuario
 * @constructor
 */
const LayoutRestriccion: FC<any> = () => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const { user }: any = useAuth()

  const handleChangeSucursal = () => {
    setOpen(true)
  }

  return (
    <>
      <RestriccionTopBarRoot>
        <RestriccionTopBarContainer>
          <TableContainer
            component={'div'}
            style={{
              padding: '0 20px',
              borderRadius: 0,
              height: '100%',
              background: 'none',
            }}
          >
            <Table sx={{ minWidth: 800, height: '100%' }} size="small">
              <TableHead></TableHead>
              <TableBody>
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': {
                      border: 0,
                      padding: 0,
                    },
                  }}
                >
                  <TableCell sx={{ minWidth: 200, maxWidth: 400, padding: 0 }}>
                    <MyChip color={'info'} title={'Razón social'}>
                      {user.razonSocial}
                    </MyChip>
                  </TableCell>

                  <TableCell align="left" sx={{ width: 270 }}>
                    <Tooltip title={user.sucursal.direccion}>
                      <Chip
                        icon={<Home />}
                        color={'success'}
                        label={
                          <>
                            <strong>Sucursal {user.sucursal.codigo}</strong>
                          </>
                        }
                        variant="outlined"
                        size={'small'}
                      />
                    </Tooltip>
                    &nbsp;
                    <Tooltip title={user.puntoVenta.nombre}>
                      <Chip
                        icon={<Computer />}
                        color={'success'}
                        size={'small'}
                        label={
                          <>
                            <strong>Punto Venta {user.puntoVenta.codigo}</strong>
                          </>
                        }
                        variant="outlined"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left" sx={{ width: 180 }}>
                    <Tooltip title={'Moneda general'}>
                      <Chip
                        icon={<MonetizationOn />}
                        label={
                          <>
                            Moneda <strong>{user.monedaTienda.sigla}</strong>
                          </>
                        }
                        variant="outlined"
                        size={'small'}
                      />
                    </Tooltip>
                  </TableCell>

                  <TableCell align="left" sx={{ width: 60 }}>
                    <Tooltip title={'Cambiar Sucursal / PuntoVenta'} leaveDelay={50}>
                      <IconButton
                        color={'success'}
                        onClick={handleChangeSucursal}
                        aria-label="Cambiar Sucursal / Punto Venta"
                        style={{ padding: 0, margin: 0 }}
                        size={'small'}
                      >
                        <RepeatOne fontSize={'large'} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="left" sx={{ width: 60 }}>
                    <Tooltip
                      title={`Ambiente ${user.miEmpresa.codigoAmbiente === 1 ? 'PRODUCCIÓN' : 'PILOTO'}`}
                      leaveDelay={50}
                    >
                      <IconButton
                        color={
                          user.miEmpresa.codigoAmbiente === 1 ? 'success' : 'warning'
                        }
                        style={{ padding: 0, margin: 0 }}
                        size={'small'}
                      >
                        <RadioButtonChecked fontSize={'large'} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </RestriccionTopBarContainer>
      </RestriccionTopBarRoot>
      <CuentaRestriccionDialog
        id={'CuentaRestriccion'}
        keepMounted={false}
        open={open}
        onClose={() => {
          setOpen(false)
        }}
      />
    </>
  )
}

export default React.memo(LayoutRestriccion)
