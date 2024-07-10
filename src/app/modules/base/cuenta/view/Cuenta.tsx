import { Cached, HomeWork, Key, Person, PictureAsPdf, Token } from '@mui/icons-material'
import {
  Box,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import React, { FunctionComponent, useState } from 'react'

import SimpleContainer from '../../../../base/components/Container/SimpleContainer'
import Breadcrumb from '../../../../base/components/Template/Breadcrumb/Breadcrumb'
import SimpleCard from '../../../../base/components/Template/Cards/SimpleCard'
import CuentaPassword from './Perfil/CuentaPassword'
import CuentaPerfil from './Perfil/CuentaPerfil'
import CuentaRecargarCache from './Perfil/CuentaRecargarCache'
import CuentaSincronizacion from './Perfil/CuentaSincronizacion'
import CuentaSucursal from './Perfil/CuentaSucursal'
import CuentaTipoRepresentacionGrafica from './Perfil/CuentaTipoRepresentacionGrafica'

interface OwnProps {}

type Props = OwnProps

const Cuenta: FunctionComponent<Props> = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index)
  }

  return (
    <>
      <SimpleContainer>
        <div className="breadcrumb">
          <Breadcrumb routeSegments={[{ name: 'Opciones de sistema' }]} />
        </div>
        <Grid container spacing={2} columnSpacing={5}>
          <Grid item sm={4} xs={12}>
            <SimpleCard>
              <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <List component="nav" aria-label="main mailbox folders">
                  <ListItemButton
                    selected={selectedIndex === 0}
                    onClick={(event) => handleListItemClick(event, 0)}
                  >
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText primary="Información Básica" />
                  </ListItemButton>

                  <ListItemButton
                    selected={selectedIndex === 1}
                    onClick={(event) => handleListItemClick(event, 1)}
                  >
                    <ListItemIcon>
                      <Key />
                    </ListItemIcon>
                    <ListItemText primary="Cambiar Contraseña" />
                  </ListItemButton>

                  <ListItemButton
                    selected={selectedIndex === 2}
                    onClick={(event) => handleListItemClick(event, 2)}
                  >
                    <ListItemIcon>
                      <HomeWork />
                    </ListItemIcon>
                    <ListItemText primary="PuntoVenta / Punto Venta" />
                  </ListItemButton>

                  <ListItemButton
                    selected={selectedIndex === 3}
                    onClick={(event) => handleListItemClick(event, 3)}
                  >
                    <ListItemIcon>
                      <Token />
                    </ListItemIcon>
                    <ListItemText primary="Sincronización" />
                  </ListItemButton>

                  <ListItemButton
                    selected={selectedIndex === 4}
                    onClick={(event) => handleListItemClick(event, 4)}
                  >
                    <ListItemIcon>
                      <Cached />
                    </ListItemIcon>
                    <ListItemText primary="Recargar Cache" />
                  </ListItemButton>

                  <ListItemButton
                    selected={selectedIndex === 5}
                    onClick={(event) => handleListItemClick(event, 5)}
                  >
                    <ListItemIcon>
                      <PictureAsPdf />
                    </ListItemIcon>
                    <ListItemText primary="Tipo Representación Gráfica" />
                  </ListItemButton>
                </List>
              </Box>
            </SimpleCard>
          </Grid>
          <Grid item sm={7} xs={12}>
            {selectedIndex === 0 && <CuentaPerfil />}
            {selectedIndex === 1 && <CuentaPassword />}
            {selectedIndex === 2 && <CuentaSucursal />}
            {selectedIndex === 3 && <CuentaSincronizacion />}
            {selectedIndex === 4 && <CuentaRecargarCache />}
            {selectedIndex === 5 && <CuentaTipoRepresentacionGrafica />}
          </Grid>
        </Grid>
        <Box py="12px" />
      </SimpleContainer>
    </>
  )
}

export default Cuenta
