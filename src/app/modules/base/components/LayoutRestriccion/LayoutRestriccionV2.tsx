/* eslint-disable @typescript-eslint/no-unused-vars */
import { Computer, KeyboardArrowDown } from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Link,
  Menu,
  MenuItem,
  MenuProps,
  Paper,
  Popover,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import React, { FC, useEffect, useState } from 'react'

import { apiCuentaMonedaActualizar } from '../../../../base/api/apiCuentaMonedaActualizar'
import { themeShadows } from '../../../../base/components/Template/MatxTheme/themeColors'
import useAuth from '../../../../base/hooks/useAuth'
import useCajas from '../../../../base/hooks/useCajas.tsx'
import useOperaciones from '../../../../base/hooks/useOperaciones.ts'
import { MonedaParamsProps } from '../../../../base/interfaces/base'
import { MonedaProps } from '../../../../interfaces/monedaPrecio'
import { topBarHeightRestriccion } from '../../../../utils/constant'
import { notSuccess } from '../../../../utils/notification'
import { swalClose, swalException, swalLoading } from '../../../../utils/swal'
import CuentaRestriccionDialog from '../../cuenta/view/CuentaRestriccionDialog'

const RestriccionTopBarRoot = styled('div')(({ theme }) => ({
  top: 0,
  zIndex: 96,
  transition: 'all 0.3s ease',
  boxShadow: themeShadows[8],
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

const StyledMenu = styled((props: MenuProps) => (
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
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}))

/**
 * Barra superior con datos del usuario, restriccion y empresa
 * @constructor
 */
const LayoutRestriccionV2: FC<any> = () => {
  const theme = useTheme()
  const { user, refreshUser }: any = useAuth()

  const [open, setOpen] = useState(false)
  const { articuloMoneda } = useOperaciones()
  const confirm = useConfirm()

  const { cajaActiva, aperturaCajaActivo } = useCajas()
  // MONEDA
  const [monedaListado, setMonedaListado] = useState<MonedaProps[]>([])
  const [anchorMoneda, setAnchorMoneda] = React.useState<null | HTMLElement>(null)
  const openMoneda = Boolean(anchorMoneda)

  const handleChangeMoneda = async (moneda: MonedaParamsProps) => {
    setAnchorMoneda(null)
    confirm({
      title: 'Confirmar cambio de moneda',
      content: (
        <>
          Cambio a moneda{' '}
          <strong>
            {moneda.descripcion} ({moneda.sigla})
          </strong>
        </>
      ),
      allowClose: true,
    })
      .then(async () => {
        swalLoading()
        const resp = await apiCuentaMonedaActualizar({
          codigoMoneda: moneda.codigo,
        }).catch((e) => {
          swalException(e)
        })
        if (resp) {
          swalClose()
          refreshUser()
          // window.location.reload()
          notSuccess('Moneda cambiada correctamente, actualizando página')
        }
      })
      .catch(() => {})
  }

  // MONEDA
  // RAZON SOCIAL
  const [anchorRazonSocial, setAnchorRazonSocial] = useState<HTMLButtonElement | null>(null)
  const openRazonSocial = Boolean(anchorRazonSocial)
  const idRazonSocial = openRazonSocial ? 'simple-popover-razon-social' : undefined
  // RAZON SOCIAL

  const handleChangeSucursal = () => {
    setOpen(true)
  }

  // Componente para mostrar el estado de la caja con colores
  const EstadoChip = ({ estado, codigo }: { estado?: string; codigo?: string }) => {
    const theme = useTheme()

    const colores: Record<string, string> = {
      ELABORADO: theme.palette.success.main,
      ARQUEO: theme.palette.warning.main,
      FINALIZADO: theme.palette.error.main,
    }

    const textos: Record<string, string> = {
      ELABORADO: 'CAJA ACTIVA',
      ARQUEO: 'EN ARQUEO',
      FINALIZADO: 'CAJA CERRADA',
      '': 'SIN CAJA',
    }

    const estadoKey = (estado ?? '').toUpperCase()
    const color = colores[estadoKey] ?? theme.palette.grey[500]
    const labelBase = textos[estadoKey] ?? estado ?? '-'

    // Añadimos el código de la caja si existe
    const label = codigo ? `${labelBase} - ${codigo}` : labelBase

    return (
      <Button
        variant="contained"
        size="small"
        sx={{
          backgroundColor: color,
          color: '#fff',
          fontStyle: 'bold',
        }}
        component={Link}
        // href={cajasRoutesMap.gestion.path}
      >
        <Typography variant={'body1'} noWrap>
          {label}
        </Typography>
      </Button>
    )
  }

  useEffect(() => {
    if (articuloMoneda) {
      const m = []
      m.push(articuloMoneda.monedaPrimaria)
      if (articuloMoneda.monedaAdicional1) m.push(articuloMoneda.monedaAdicional1)
      if (articuloMoneda.monedaAdicional2) m.push(articuloMoneda.monedaAdicional2)
      if (articuloMoneda.monedaAdicional3) m.push(articuloMoneda.monedaAdicional3)
      setMonedaListado(m)
    }
  }, [articuloMoneda])

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
                    <Button
                      id={'menu-razon-social'}
                      size={'small'}
                      variant="outlined"
                      color={user.miEmpresa.codigoAmbiente === 1 ? 'success' : 'warning'}
                      sx={{
                        [theme.breakpoints.down('md')]: {
                          maxWidth: 200,
                        },
                        [theme.breakpoints.up('md')]: {
                          maxWidth: '100%',
                        },
                      }}
                      onClick={(event) => setAnchorRazonSocial(event.currentTarget)}
                      aria-describedby={idRazonSocial}
                    >
                      <Typography variant={'body1'} noWrap>
                        {user.razonSocial}
                      </Typography>
                    </Button>
                    <Popover
                      id={idRazonSocial}
                      open={openRazonSocial}
                      anchorEl={anchorRazonSocial}
                      onClose={() => setAnchorRazonSocial(null)}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <Box sx={{ pl: 2, pr: 2, pt: 2, pb: 1, maxWidth: '100%' }}>
                        <Typography gutterBottom>{user.miEmpresa.razonSocial}</Typography>
                      </Box>
                    </Popover>
                  </TableCell>

                  <TableCell align="right" sx={{ width: 270 }}>
                    <Tooltip title={user.sucursal.direccion} placement={'top'}>
                      <Button
                        size={'small'}
                        variant="contained"
                        color={user.miEmpresa.codigoAmbiente === 1 ? 'success' : 'warning'}
                        startIcon={<Computer />}
                        onClick={handleChangeSucursal}
                      >
                        <Typography variant={'caption'} display={'inline'} sx={{ mr: 1 }}>
                          Suc
                        </Typography>
                        <Typography variant={'subtitle2'} display={'inline'} sx={{ mr: 2, mt: -0.2 }}>
                          {user.sucursal.codigo}
                        </Typography>
                        <Typography variant={'caption'} display={'inline'} sx={{ mr: 1 }}>
                          Punto Venta
                        </Typography>
                        <Typography variant={'subtitle2'} display={'inline'} sx={{ mt: -0.2 }}>
                          {user.puntoVenta.codigo}
                        </Typography>
                      </Button>
                    </Tooltip>
                  </TableCell>

                  <TableCell align="right" sx={{ width: 180 }}>
                    <Tooltip title={'Moneda general'} placement={'top'}>
                      <Button
                        id="menu-moneda"
                        size={'small'}
                        variant="outlined"
                        color={user.miEmpresa.codigoAmbiente === 1 ? 'success' : 'warning'}
                        sx={{ mr: 1 }}
                        disableElevation
                        onClick={(event) => setAnchorMoneda(event.currentTarget)}
                        endIcon={<KeyboardArrowDown />}
                      >
                        <Typography variant={'body1'} display={'inline'}>
                          Moneda
                        </Typography>
                        <Typography variant={'subtitle2'} sx={{ ml: 1 }}>
                          {user.moneda.sigla}
                        </Typography>
                      </Button>
                    </Tooltip>
                    <StyledMenu
                      id="menu-item-monedas"
                      MenuListProps={{
                        'aria-labelledby': 'demo-customized-button',
                      }}
                      anchorEl={anchorMoneda}
                      open={openMoneda}
                      onClose={() => setAnchorMoneda(null)}
                    >
                      {monedaListado.map((moneda, index) => (
                        <MenuItem
                          key={index}
                          disableRipple
                          onClick={async () => {
                            if (user.moneda.codigo !== moneda.codigo) {
                              await handleChangeMoneda(moneda)
                            }
                          }}
                        >
                          <Typography variant={'body1'}>{moneda.descripcion}</Typography>
                          <Typography variant={'subtitle2'} display={'inline'} sx={{ ml: 1 }}>
                            ({moneda.sigla})
                          </Typography>
                        </MenuItem>
                      ))}
                    </StyledMenu>
                  </TableCell>
                  {cajaActiva && aperturaCajaActivo && (
                    <TableCell align="right" sx={{ width: 220 }}>
                      {/* <EstadoChip estado={aperturaCajaActivo.state} codigo={aperturaCajaActivo.cajaCodigo} /> */}
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </RestriccionTopBarContainer>
      </RestriccionTopBarRoot>
      <CuentaRestriccionDialog
        id={'CuentaRestriccionV2'}
        keepMounted={false}
        open={open}
        onClose={() => {
          setOpen(false)
        }}
      />
    </>
  )
}

export default React.memo(LayoutRestriccionV2)
