import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  styled,
} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Span } from '../../../../base/components/Template/Typography'
import useAuth from '../../../../base/hooks/useAuth'

const FlexBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}))

const JustifyBox = styled(FlexBox)(() => ({
  justifyContent: 'center',
}))

const ContentBox = styled(JustifyBox)(() => ({
  height: '100%',
  padding: '32px',
  background: 'rgba(0, 0, 0, 0.01)',
}))

const IMG = styled('img')(() => ({
  width: '100%',
}))

const JWTRegister = styled(JustifyBox)(() => ({
  background: '#1A2038',
  minHeight: '100vh !important',
  '& .card': {
    maxWidth: 800,
    borderRadius: 12,
    margin: '1rem',
  },
}))

const JwtRegister = () => {
  const navigate = useNavigate()
  const [state, setState]: any = useState({})
  const { register }: any = useAuth()

  const handleChange: any = ({ target: { name, value } }: any) => {
    setState({
      ...state,
      [name]: value,
    })
  }

  const handleFormSubmit = (event: any) => {
    try {
      register(state.email, state.username, state.password)
      navigate('/')
    } catch (e) {
      console.log(e)
    }
  }

  let { username, email, password, agreement } = state

  return (
    <JWTRegister>
      <Card className="card">
        <Grid container>
          <Grid
            size={{
              lg: 5,
              md: 5,
              sm: 5,
              xs: 12,
            }}
          >
            <ContentBox>
              <IMG src="/assets/images/illustrations/posting_photo.svg" alt="" />
            </ContentBox>
          </Grid>
          <Grid
            size={{
              lg: 7,
              md: 7,
              sm: 7,
              xs: 12,
            }}
          >
            <Box p={4} height="100%">
              <form onSubmit={handleFormSubmit}>
                <FormControlLabel
                  sx={{ mb: '16px' }}
                  name="agreement"
                  onChange={(e: any) =>
                    handleChange({
                      target: {
                        name: 'agreement',
                        value: e.target.checked,
                      },
                    })
                  }
                  control={<Checkbox size="small" checked={agreement || false} />}
                  label="I have read and agree to the terms of service."
                />
                <FlexBox>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    Sign up
                  </Button>
                  <Span sx={{ mr: 1, ml: '20px' }}>or</Span>
                  <Button
                    sx={{ textTransform: 'capitalize' }}
                    onClick={() => navigate('/session/signin')}
                  >
                    Sign in
                  </Button>
                </FlexBox>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </JWTRegister>
  )
}

export default JwtRegister
