import { Paid, ShoppingBasket, ShoppingCart } from '@mui/icons-material'
import { Avatar, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'
import { blue, green, purple, red } from '@mui/material/colors'
import { FunctionComponent, useMemo } from 'react'

import { numberWithCommasPlaces } from '../../../base/components/MyInputs/NumberInput'
import useOperaciones from '../../../base/hooks/useOperaciones'
import { VentaReportePorUsuarioProp } from '../../reporte/api/apiReporteUsuario'
import { HomePeriodosProp } from '../services/homePeriodo'

interface OwnProps {
  periodo: HomePeriodosProp | null
  ventaReportePorUsuario: VentaReportePorUsuarioProp[]
}

type Props = OwnProps

const HomeCardAmount: FunctionComponent<Props> = (props) => {
  const { periodo, ventaReportePorUsuario } = props
  const { articuloMoneda } = useOperaciones()
  const monedaPrimaria = articuloMoneda?.monedaPrimaria

  const validadas = useMemo(
    () => ventaReportePorUsuario.filter((r) => r.state === 'VALIDADA'),
    [ventaReportePorUsuario],
  )
  const anuladas = useMemo(
    () => ventaReportePorUsuario.filter((r) => r.state === 'ANULADA'),
    [ventaReportePorUsuario],
  )

  const totalFacturasValidadas = useMemo(
    () => validadas.reduce((acc, r) => acc + (r.numeroFacturas || 0), 0),
    [validadas],
  )
  const totalFacturasAnuladas = useMemo(
    () => anuladas.reduce((acc, r) => acc + (r.numeroFacturas || 0), 0),
    [anuladas],
  )
  const montoTotalValidado = useMemo(
    () => validadas.reduce((acc, r) => acc + (r.montoTotal || 0), 0),
    [validadas],
  )
  const montoTotalAnulado = useMemo(
    () => anuladas.reduce((acc, r) => acc + (r.montoTotal || 0), 0),
    [anuladas],
  )

  return (
    <Grid container size={12} spacing={1}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
        <Card variant={'elevation'} elevation={2}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: purple[500], width: 50, height: 50 }} aria-label="recipe">
                <ShoppingCart fontSize={'large'} />
              </Avatar>
            }
            title={
              <>
                <Typography fontSize={'larger'} display={'inline'}>
                  <strong>{numberWithCommasPlaces(totalFacturasValidadas, 1)}</strong>
                </Typography>
                <Typography fontSize={'smaller'} display={'inline'} sx={{ ml: 1 }}>
                  FACTURAS VALIDADAS
                </Typography>
              </>
            }
            subheader={periodo?.value || ''}
          />
          <CardContent sx={{ mt: -2.5, pb: '16px !important' }}>
            <Grid container spacing={2} sx={{ p: 0 }}>
              <Grid size={6}>
                <div className={'responsive-table'}>
                  <table className={'table-dense'}>
                    <tbody>
                      <tr>
                        <td>Validadas</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>{numberWithCommasPlaces(totalFacturasValidadas, 1)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Grid>
              <Grid size={6}>
                <div className={'responsive-table'}>
                  <table className={'table-dense'}>
                    <tbody>
                      <tr>
                        <td>Anuladas</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ color: red[500] }}>
                            {numberWithCommasPlaces(totalFacturasAnuladas, 1)}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
        <Card variant={'elevation'} elevation={2}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: green[500], width: 50, height: 50 }} aria-label="recipe">
                <ShoppingBasket fontSize={'large'} />
              </Avatar>
            }
            title={
              <>
                <Typography fontSize={'larger'} display={'inline'}>
                  <strong>{numberWithCommasPlaces(montoTotalValidado)}</strong>
                </Typography>
                <Typography fontSize={'smaller'} display={'inline'} sx={{ ml: 1 }}>
                  {monedaPrimaria?.sigla} VALIDADO
                </Typography>
              </>
            }
            subheader={periodo?.value || ''}
          />
          <CardContent sx={{ mt: -2.5, pb: '16px !important' }}>
            <Grid container spacing={2} sx={{ p: 0 }}>
              <Grid size={12}>
                <div className={'responsive-table'}>
                  <table className={'table-dense'}>
                    <tbody>
                      <tr>
                        <td>Monto validado</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong>{numberWithCommasPlaces(montoTotalValidado)}</strong>{' '}
                          {monedaPrimaria?.sigla}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}>
        <Card variant={'elevation'} elevation={2}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: blue[500], width: 50, height: 50 }} aria-label="recipe">
                <Paid fontSize={'large'} />
              </Avatar>
            }
            title={
              <>
                <Typography fontSize={'larger'} display={'inline'}>
                  <strong style={{ color: red[500] }}>{numberWithCommasPlaces(montoTotalAnulado)}</strong>
                </Typography>
                <Typography fontSize={'smaller'} display={'inline'} sx={{ ml: 1 }}>
                  {monedaPrimaria?.sigla} ANULADO
                </Typography>
              </>
            }
            subheader={periodo?.value || ''}
          />
          <CardContent sx={{ mt: -2.5, pb: '16px !important' }}>
            <Grid container spacing={2} sx={{ p: 0 }}>
              <Grid size={12}>
                <div className={'responsive-table'}>
                  <table className={'table-dense'}>
                    <tbody>
                      <tr>
                        <td>Monto anulado</td>
                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ color: red[500] }}>
                            {numberWithCommasPlaces(montoTotalAnulado)}
                          </strong>{' '}
                          {monedaPrimaria?.sigla}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default HomeCardAmount
