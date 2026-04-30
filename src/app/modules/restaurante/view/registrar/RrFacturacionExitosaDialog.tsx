import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CheckIcon from '@mui/icons-material/Check'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'

import useAuth from '../../../../base/hooks/useAuth'
interface RrFacturacionExitosaDialogProps {
  open: boolean
  onClose: () => void
  initialTelefono?: string
  initialEmail?: string
  onSendWhatsapp?: (telefono: string) => void
  onSendEmail?: (email: string) => void
  isClienteReal?: boolean
}

const RrFacturacionExitosaDialog: React.FC<RrFacturacionExitosaDialogProps> = ({
  open,
  onClose,
  initialTelefono = '',
  initialEmail = '',
  onSendWhatsapp,
  onSendEmail,
  isClienteReal = false,
}) => {
  const theme = useTheme()
  const { lw } = useAuth()
  const [telefono, setTelefono] = useState(initialTelefono)
  const [email, setEmail] = useState(initialEmail)

  // Update internal state when initial values change (e.g., when dialog opens)
  React.useEffect(() => {
    setTelefono(initialTelefono)
    setEmail(initialEmail)
  }, [initialTelefono, initialEmail, open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, pt: 4 }}>
        {/* Check Icon */}
        <Box
          sx={(theme) => ({
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          })}
        >
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `3px solid ${theme.palette.success.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <CheckIcon
              sx={(theme) => ({
                color: theme.palette.success.main,
                fontSize: 24,
              })}
            />
          </Box>
        </Box>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={(theme) => ({
            mb: 1,
            color: theme.palette.primary.main,
          })}
        >
          Facturación Exitosa
        </Typography>

        <Typography
          variant="body1"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            mb: 4,
          })}
        >
          ¡Orden facturada con éxito!
        </Typography>

        {lw && isClienteReal && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography
              variant="caption"
              sx={(theme) => ({
                fontWeight: 700,
                color: theme.palette.text.secondary,
                mb: 1,
                display: 'block',
                letterSpacing: '0.5px',
              })}
            >
              WHATSAPP DEL CLIENTE
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="+591 71234567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                InputProps={{
                  sx: (theme) => ({
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.text.primary,
                    },
                  }),
                }}
              />

              <IconButton
                onClick={() => onSendWhatsapp && onSendWhatsapp(telefono)}
                sx={(theme) => ({
                  bgcolor:
                    theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light,
                  color: theme.palette.success.main,
                  borderRadius: 3,
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    bgcolor: theme.palette.success.main,
                    color: theme.palette.success.contrastText,
                  },
                })}
              >
                <ChatBubbleOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* <Box sx={{ width: '100%', mb: 4 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#6b7280',
              mb: 1,
              display: 'block',
              letterSpacing: '0.5px',
            }}
          >
            CORREO ELECTRÓNICO
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="cliente@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                sx: {
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  }
                },
              }}
            />
            <IconButton
              onClick={() => onSendEmail && onSendEmail(email)}
              sx={{
                bgcolor: '#f5f3ff',
                color: '#8b5cf6',
                borderRadius: 3,
                p: 1.5,
                border: '1px solid transparent',
                '&:hover': {
                  bgcolor: '#ede9fe',
                },
              }}
            >
              <MailOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box> */}

        <Button
          onClick={onClose}
          sx={{
            color: '#9ca3af',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            '&:hover': {
              bgcolor: 'transparent',
              color: '#6b7280',
            },
          }}
        >
          Cerrar Ventana
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default RrFacturacionExitosaDialog
