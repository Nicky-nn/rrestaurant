// noinspection DuplicatedCode

import { yupResolver } from '@hookform/resolvers/yup'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Box,
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
import ReCAPTCHA, { ReCAPTCHAProps } from 'react-google-recaptcha'
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
 * @description Interfaz principal para el inicio de sesión del usuario version antigua, con mui v6.x utilizar el nuevo login
 * @constructor
 */
const JwtLoginOld = () => {
  const navigate = useNavigate()
  const reCaptchaRef = useRef<ReCAPTCHAProps | any>()

  const [loading, setLoading] = useState(false)
  const { login }: any = useAuth()
  const [message, setMessage] = useState('')

  const [showPassword, setShowPassword] = useState<boolean>(false)

  const shops = storageComercioListado()

  const form = useForm<LoginProps>({
    defaultValues: {
      shop: null,
      email: '',
      password: '',
      remember: true,
    },
    resolver: yupResolver<any>(validationSchema),
  })

  /**
   * @description Login de usuario y validación de permisos
   * @param values
   */
  const onSubmit: SubmitHandler<LoginProps> = async (values) => {
    try {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 2500)

      // Verificamos el token captcha
      const newToken = await reCaptchaRef.current.executeAsync()

      if (newToken) {
        // setLoading(true)
        const { shop, email, password, remember } = values
        await login(shop?.value, email, password)
        if (remember) {
          storageComercioActualizar(shop!.value)
          // localStorage.setItem('shop', shop)
        } else {
          storageComercioEliminar(shop!.value)
          // localStorage.removeItem('shop')
        }
        navigate('/')
      } else {
        throw new Error('Error validación Captcha, Refresque la pagina CTRL + F5')
      }
    } catch (e: any) {
      setMessage(e.message)
      setLoading(false)
      setTimeout(() => reCaptchaRef.current.reset(), 500)
    }
  }

  useEffect(() => {
    if (!isEmptyValue(localStorage.getItem('shop'))) {
      const st = storageComercioListado()
      form.setValue('shop', st.length > 0 ? st[0] : null)
    }
  }, [])

  // Ejecutamos el captcha validador
  useEffect(() => {
    if (reCaptchaRef) {
      reCaptchaRef.current.reset()
    }
    setLoading(false)
  }, [])

  // @ts-ignore
  return (
    <JWTRoot>
      <Card className="card">
        <Grid container rowSpacing={1}>
          <Grid item sm={12} xs={12}>
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

          <Grid item sm={12} xs={12}>
            <ContentBox>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <ReCAPTCHA
                  size={'invisible'}
                  sitekey={import.meta.env.ISI_CAPTCHA_KEY}
                  ref={reCaptchaRef}
                  onErrored={() =>
                    setMessage(
                      `Ocurrió un error en cargar el Captcha, contáctese con el administrador`,
                    )
                  }
                />
                <Grid container spacing={1} rowSpacing={3} sx={{ mt: 0 }}>
                  <Grid item xs={12}>
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
                  <Grid item xs={12}>
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
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                      name={'email'}
                    />
                  </Grid>
                  <Grid item xs={12}>
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
                  <Grid item xs={12}>
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
                  <Grid item xs={12}>
                    <LoadingButton
                      type="submit"
                      color="primary"
                      loading={loading}
                      variant="contained"
                      size={'large'}
                      fullWidth
                      sx={{ my: 2 }}
                    >
                      Iniciar Sesión
                    </LoadingButton>
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

export default JwtLoginOld
