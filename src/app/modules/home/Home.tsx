import { Delete, Done, Newspaper } from '@mui/icons-material'
import {
  alpha,
  Avatar,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import SimpleContainer from '../../base/components/Container/SimpleContainer'
import FormSelect from '../../base/components/Form/FormSelect.tsx'
import MyDatePickerField from '../../base/components/MyInputs/MyDatePickerField'
import MyDateRangePickerField from '../../base/components/MyInputs/MyDateRangePickerField.tsx'
import NumberSpinnerField from '../../base/components/NumberSpinnerField/NumberSpinnerField'
import MontoMonedaTexto from '../../base/components/PopoverMonto/MontoMonedaTexto'
import Breadcrumb from '../../base/components/Template/Breadcrumb/Breadcrumb'
import SimpleCard from '../../base/components/Template/Cards/SimpleCard.tsx'
import { H2 } from '../../base/components/Template/Typography'
import useAuth from '../../base/hooks/useAuth'
import { homeRoutesMap } from './HomeRoutes'

/**
 * @description Dashboard inicial
 * @constructor
 */
const Home = () => {
  const { user } = useAuth()
  const [value, setValue] = useState<any>(0)
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  return (
    <SimpleContainer maxWidth={'xl'}>
      <Breadcrumb routeSegments={[homeRoutesMap.home]} />
      <H2>
        Página Principal para el usuario con correo {user.miEmpresa.email}{' '}
        {user.miEmpresa.emailFake}
      </H2>
      <hr />
      <Paper>
        <SimpleCard title={'Pagina principal'} childIcon={<Newspaper />}>
          <Grid container spacing={3}>
            <Grid size="grow">
              <Typography variant="body1" color={'primary'} gutterBottom>
                ¡Bienvenido a la plantilla ISI-TEMPLATE a continuacion se muestra el color
                primario
              </Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="body1" color={'secondary'} gutterBottom>
                ¡Bienvenido a la plantilla ISI-TEMPLATE, a continuacion se muestra el
                color secundario
              </Typography>
            </Grid>
            <Grid size={12}>
              <Stack direction={'row'} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button variant="contained" color="primary">
                  Botón Primario
                </Button>
                <Button variant="contained" color="secondary">
                  Botón secundario
                </Button>
                <Button variant="contained" color="success">
                  Botón success
                </Button>
                <Button variant="contained" color="error">
                  Botón error
                </Button>
                <Button variant="contained" color="info">
                  Botón info
                </Button>
                <Button variant="contained" color="warning">
                  Botón warning
                </Button>
                <Button variant="contained" color="yellow">
                  Botón yellow
                </Button>
                <Button variant="contained" color="green">
                  Botón green
                </Button>
                <Button variant="contained" color="blue">
                  Botón blue
                </Button>
                <Button variant="contained" color="cyan">
                  Botón cyan
                </Button>
                <Button variant="contained" color="purple">
                  Botón purple
                </Button>
                <Button variant="contained" color="teal">
                  Botón teal
                </Button>
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack direction={'row'} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip label="Chip Filled" />
                <Chip label="Chip Outlined" variant="outlined" />
                <Chip
                  label="Custom delete icon"
                  onClick={() => {}}
                  onDelete={() => {}}
                  deleteIcon={<Done />}
                />
                <Chip
                  label="Custom delete icon"
                  onClick={() => {}}
                  onDelete={() => {}}
                  deleteIcon={<Delete />}
                  variant="outlined"
                />
                <Chip avatar={<Avatar>M</Avatar>} label="Avatar" />
                <Chip label="primary" color="primary" />
                <Chip label="success" color="success" />
                <Chip
                  label="primary"
                  color="yellow"
                  sx={{
                    color: (theme) => alpha(theme.palette.yellow.contrastText, 0.8),
                  }}
                  variant="filled"
                />
                <Chip
                  label="success"
                  color="purple"
                  sx={{
                    color: (theme) => alpha(theme.palette.purple.contrastText, 0.8),
                  }}
                  variant="filled"
                />
                <Chip label="success" color="cyan" variant="outlined" />
              </Stack>
            </Grid>
            <Grid size={12}>
              <Stack direction={'row'} spacing={2}>
                <MyDatePickerField
                  label={'Single react date picker'}
                  value={new Date()}
                  onChange={(date) => {
                    console.log(date)
                  }}
                />
                <MyDateRangePickerField
                  label="Seleccionar Periodo"
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    // update es [start, end]
                    setStartDate(update[0])
                    setEndDate(update[1])
                  }}
                  isClearable={true} // Permite borrar todo el rango con una "x"
                  placeholderText="Inicio - Fin"
                />
              </Stack>
            </Grid>
            <Grid size={12}>
              <Grid container>
                <Grid size={12}>
                  <MontoMonedaTexto
                    id={'monto-moneda'}
                    monto={value}
                    editar={true}
                    error={false}
                    buttonProps={{
                      sx: { fontWeight: 100 },
                    }}
                    sigla={'BOB'}
                    onChange={(value) => {
                      console.log('Cambio', value)
                      setValue(value)
                    }}
                    unit={'BOB'}
                    min={1}
                    lista={true}
                  />
                </Grid>
                <Grid size={2}>
                  <NumberSpinnerField
                    required
                    name={'input'}
                    size={'small'}
                    disabled={true}
                    min={0}
                    value={value}
                    max={1000}
                    // unit={'BOB'}
                    decimalScale={1}
                    step={1}
                    onChange={(value) => {
                      setValue(value)
                    }}
                  />
                </Grid>
                <Grid size={3}>
                  <Stack direction={'row'}>
                    <TextField
                      required
                      label={'hola a todos'}
                      defaultValue={'hola a todos'}
                      size={'small'}
                    />
                    <FormSelect
                      name={'formSelect'}
                      error={false}
                      options={[
                        { key: '1', value: 'Valor1' },
                        { key: '2', value: 'Valor2' },
                        { key: '3', value: 'Valor3' },
                        { key: '4', value: 'Valor4' },
                      ]}
                      inputLabel={'Contendi'}
                      getOptionValue={(item: any) => item.key}
                      getOptionLabel={(item: any) => item.value}
                    />
                  </Stack>
                </Grid>
                <Grid size={2}></Grid>
                <Grid size={2}>
                  <NumberSpinnerField
                    required
                    size={'medium'}
                    min={1}
                    value={value}
                    max={1000}
                    decimalScale={3}
                    step={1}
                    onChange={(value) => {
                      setValue(value)
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </SimpleCard>
      </Paper>
    </SimpleContainer>
  )
}

export default Home
