// noinspection JSXNamespaceValidation,DuplicatedCode

import { yupResolver } from '@hookform/resolvers/yup'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  styled,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import CreatableSelect from 'react-select/creatable'
import { object, string } from 'yup'

import { MyInputLabel } from '../../../../base/components/MyInputs/MyInputLabel'
import { reactSelectStyle } from '../../../../base/components/MySelect/ReactSelect'
import { Paragraph } from '../../../../base/components/Template/Typography'
import useAuth from '../../../../base/hooks/useAuth'
import { isEmptyValue } from '../../../../utils/helper'
import {
  storageComercioActualizar,
  storageComercioEliminar,
  storageComercioListado,
  StorageShopProps,
} from '../../../../utils/storage'

const fondo = import.meta.env.ISI_FONDO
const logo = import.meta.env.ISI_LOGO_FULL

const FlexBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}))

const JustifyBox = styled(FlexBox)(() => ({
  justifyContent: 'center',
  padding: '15px 15px 0 15px',
}))

const ContentBox = styled(Box)(() => ({
  height: '100%',
  padding: '20px',
  position: 'relative',
  background: 'rgba(0, 0, 0, 0.01)',
}))

const IMG = styled('img')(() => ({
  width: '90%',
}))

const JWTRoot = styled(JustifyBox)(() => ({
  backgroundImage: `url("${fondo}")`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  minHeight: '100vh',
  '& .card': {
    maxWidth: 350,
    borderRadius: 12,
    margin: '1rem',
  },
}))

const validationSchema = object({
  shop: object({
    value: string().required('Url de comercio es requerido'),
  }).required('Url de comercio es requerido'),
  email: string().email('Debe registrar un email válido').required('Correo es requerido'),
  password: string()
    .min(5, 'Password debe contener al menos 5 caracteres')
    .required('Password es requerido'),
})

interface LoginProps {
  shop: StorageShopProps | null
  email: string
  password: string
  remember: true
}

/**
 * @description Interfaz principal para el inicio de sesión del usuario, compatible con mui v7.x
 * @author isi-template
 * @constructor
 */
const JwtLogin = () => {
  const navigate = useNavigate()
  const ref = useRef<TurnstileInstance | null>(null)

  const [loading, setLoading] = useState(false)
  const { login }: any = useAuth()
  const [message, setMessage] = useState('')
  const [blockButton, setBlockButton] = useState(true)

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const shops = storageComercioListado()

  const form = useForm<LoginProps>({
    defaultValues: {
      shop: null,
      email: 'nico@gmail.com',
      password: '129258',
      remember: true,
    },
    resolver: yupResolver(validationSchema as any),
  })

  /**
   * @description Login de usuario y validación de permisos
   * @param values
   */
  const onSubmit: SubmitHandler<LoginProps> = async (values) => {
    try {
      setLoading(true)
      setBlockButton(true)

      const { shop, email, password, remember } = values
      await login(shop?.value, email, password)
      if (remember) {
        storageComercioActualizar(shop!.value)
      } else {
        storageComercioEliminar(shop!.value)
      }
      navigate('/')
    } catch (e: any) {
      setMessage(e.message)
      setLoading(false)
      ref.current?.reset()
    }
  }

  useEffect(() => {
    if (!isEmptyValue(localStorage.getItem('shop'))) {
      const st = storageComercioListado()
      form.setValue('shop', st.length > 0 ? st[0] : null)
    }
  }, [])

  // @ts-ignore
  return (
    <JWTRoot>
      <Card className="card">
        <Grid container rowSpacing={1}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <JustifyBox p={4} height="100%">
              <IMG src={logo} alt="Gestión de ventas y servicios" />
            </JustifyBox>

            <Typography
              variant={'subtitle2'}
              style={{ textAlign: 'center', marginTop: -5 }}
              color={'primary'}
            >
              {import.meta.env.ISI_TITLE || ''}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 12 }} sx={{ mt: 1 }}>
            <ContentBox>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Grid container spacing={1} rowSpacing={2.5} sx={{ mt: 0 }}>
                  <Grid size={12}>
                    <Controller
                      control={form.control}
                      name={'shop'}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          error={Boolean(form.formState.errors.shop)}
                          sx={{ mb: 0.2 }}
                        >
                          <MyInputLabel shrink>URL Comercio</MyInputLabel>
                          <CreatableSelect<StorageShopProps>
                            {...field}
                            styles={reactSelectStyle(Boolean(form.formState.errors.shop))}
                            menuPosition={'fixed'}
                            name={'shop'}
                            placeholder={'Sel. o ingrese URL de comercio'}
                            value={field.value}
                            onChange={(newValue) => form.setValue('shop', newValue)}
                            options={shops}
                            isClearable
                          />
                          <FormHelperText>
                            {form.formState.errors.shop?.message || ''}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Controller
                      control={form.control}
                      render={({ field }) => (
                        <TextField
                          label="Correo Electrónico"
                          size={'small'}
                          sx={{ width: '100%', mb: 0.2 }}
                          id="email"
                          name="email"
                          value={field.value}
                          onChange={field.onChange}
                          error={Boolean(form.formState.errors.email)}
                          helperText={form.formState.errors.email?.message}
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                        />
                      )}
                      name={'email'}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Controller
                      render={({ field }) => (
                        <FormControl
                          size={'small'}
                          variant="outlined"
                          onChange={field.onChange}
                          fullWidth={true}
                          error={Boolean(form.formState.errors.password)}
                        >
                          <InputLabel htmlFor="password" shrink>
                            Contraseña
                          </InputLabel>
                          <OutlinedInput
                            notched
                            id="password"
                            label="Contraseña"
                            name={'password'}
                            type={showPassword ? 'text' : 'password'}
                            value={field.value}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => setShowPassword((show) => !show)}
                                  onMouseDown={(event) => event.preventDefault()}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            }
                          />
                          <FormHelperText>
                            {form.formState.errors.password?.message}
                          </FormHelperText>
                        </FormControl>
                      )}
                      name={'password'}
                      control={form.control}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Turnstile
                      ref={ref}
                      style={{ marginTop: '-10px' }}
                      siteKey={import.meta.env.ISI_CAPTCHA_KEY}
                      options={{
                        action: 'submit-form',
                        theme: 'light',
                        size: 'flexible',
                        language: 'es',
                      }}
                      onSuccess={() => {
                        setBlockButton(false)
                        setMessage('')
                      }}
                      onError={(e) => {
                        setMessage(`Error captcha, presione CTRL + F5, código: ${e}`)
                        setBlockButton(true)
                      }}
                      onExpire={() => {
                        setMessage('Captcha Expirado, presione CTRL + F5')
                        setBlockButton(true)
                        ref.current?.reset()
                      }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <FlexBox justifyContent="space-between">
                      <FlexBox gap={0}>
                        <Controller
                          control={form.control}
                          render={({ field }) => (
                            <>
                              <Checkbox
                                size="small"
                                name="remember"
                                onChange={field.onChange}
                                checked={field.value}
                                sx={{ padding: 0 }}
                              />
                              <Paragraph>Recordarme</Paragraph>
                            </>
                          )}
                          name={'remember'}
                        />
                      </FlexBox>
                      {/*
                        <NavLink
                        to="/session/forgot-password"
                        style={{ color: theme.palette.primary.main }}
                      >
                        ¿Olvidaste tu contraseña?
                      </NavLink>
                         */}
                    </FlexBox>
                  </Grid>
                  <Grid size={12}>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={blockButton}
                      loading={loading}
                      variant="contained"
                      size={'large'}
                      fullWidth
                      sx={{ my: 2 }}
                    >
                      Iniciar Sesión
                    </Button>
                  </Grid>
                </Grid>
                {message && <Paragraph sx={{ color: 'red' }}>{message}</Paragraph>}
              </form>
            </ContentBox>
          </Grid>
        </Grid>
      </Card>
    </JWTRoot>
  )
}

export default JwtLogin
