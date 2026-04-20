import { Divider, Grid } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import { SimpleBox } from '../../base/components/Container/SimpleBox'
import SimpleContainer from '../../base/components/Container/SimpleContainer'
import FormSelect from '../../base/components/Form/FormSelect'
import Breadcrumb from '../../base/components/Template/Breadcrumb/Breadcrumb'
import SimpleCard from '../../base/components/Template/Cards/SimpleCard'
import useAuth from '../../base/hooks/useAuth'
import { getEntidadInput } from '../../utils/getEntidadInput'
import { apiReporteUsuario } from '../reporte/api/apiReporteUsuario'
import VapvGraficoListado from '../reporte/view/ventasArticuloPuntoVenta/VapvGraficoListado'
import HomeCardAmount from './components/HomeCardAmount'
import HomeHistoryAmount from './components/HomeHistyAmount'
import { homeRoutesMap } from './HomeRoutes'
import { homePeriodos, HomePeriodosProp } from './services/homePeriodo'

/**
 * @description Dashboard inicial
 * @constructor
 */
const Home = () => {
  const [periodo, setPeriodo] = useState<HomePeriodosProp | null>(null)
  const periodos = homePeriodos
  const { user } = useAuth()
  const entidad = useMemo(() => getEntidadInput(user), [user])

  const { data, isLoading } = useQuery({
    queryKey: ['reportePorUsuario', periodo, user.usuario, entidad],
    queryFn: async () => {
      if (!periodo) return null
      return apiReporteUsuario({
        entidad: [entidad],
        fechaInicial: periodo.fechaInicial,
        fechaFinal: periodo.fechaFinal,
      })
    },
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    setPeriodo(periodos[0])
  }, [])

  return (
    <SimpleContainer maxWidth={'xl'}>
      <Breadcrumb routeSegments={[homeRoutesMap.home]} />
      <SimpleCard>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Divider textAlign={'left'}>SELECCIONE EL PERIODO</Divider>
          </Grid>
          <Grid size={12}>
            <FormSelect<HomePeriodosProp>
              options={periodos}
              value={periodo}
              getOptionLabel={(option) => option.value}
              getOptionValue={(option) => option.key}
              onChange={(option) => setPeriodo(option)}
            />
          </Grid>
          <Grid size={12} sx={{ mt: 2 }}>
            <Divider textAlign={'left'}>RESUMEN DE VENTAS, USUARIO {user.usuario.toUpperCase()}</Divider>
          </Grid>
          <Grid size={12}>
            <HomeCardAmount
              periodo={periodo}
              ventaReportePorUsuario={(data?.restFacturaReporteVentasUsuario || []).filter(
                (r) => r.usuario === user.usuario,
              )}
            />
          </Grid>
          <Grid size={{ xl: 8, lg: 8, md: 7, sm: 12 }} container sx={{ mt: 2 }} columnSpacing={2}>
            <Grid size={12}>
              <Divider textAlign={'left'}>
                HISTORIAL VENTAS POR ESTADO, USUARIO {user.usuario.toUpperCase()}
              </Divider>
            </Grid>
            <Grid size={12}>
              <HomeHistoryAmount
                periodo={periodo}
                ventaPeriodo={(data?.restFacturaReporteVentasUsuario || []).filter(
                  (r) => r.usuario === user.usuario,
                )}
              />
            </Grid>
          </Grid>
          <Grid size={{ xl: 4, lg: 4, md: 5, sm: 12 }} container sx={{ mt: 2, alignContent: 'flex-start' }}>
            <Grid size={12}>
              <Divider textAlign={'left'}>
                TOP 10 ARTICULOS CON MEJORES GANANCIAS P.V. {user.puntoVenta.codigo}
              </Divider>
            </Grid>
            <Grid size={12}>
              {/*<TopVentasArticulo periodo={periodo} />*/}
              {periodo && (
                <SimpleBox>
                  <VapvGraficoListado
                    fechaInicial={periodo.fechaInicial}
                    fechaFinal={periodo.fechaFinal}
                    codigoSucursal={entidad.codigoSucursal}
                    codigoPuntoVenta={[entidad.codigoPuntoVenta]}
                    mostrarTodos={false}
                    height={380}
                  />
                </SimpleBox>
              )}
            </Grid>
          </Grid>
        </Grid>
      </SimpleCard>
    </SimpleContainer>
  )
}

export default Home
