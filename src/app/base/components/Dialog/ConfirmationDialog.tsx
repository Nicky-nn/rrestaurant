import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@mui/material'
import { green } from '@mui/material/colors'
import React, { FC, useState } from 'react'

type Props = DialogProps & {
  title: string
  description: string
  onCancel: (event: any) => void
  onConfirm: (event: any, setLoading: any) => void
}

/**
 * @author isi-template
 * @param title
 * @param description
 * @param onCancel
 * @param onConfirm
 * @param props
 * @constructor
 */
const ConfirmationDialog: FC<Props> = ({
  title,
  description,
  onCancel,
  onConfirm,
  ...props
}) => {
  const [loading, setLoading] = useState(false)

  return (
    <Dialog {...props}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          variant={'outlined'}
          size={'small'}
          color="error"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Box sx={{ m: 1, position: 'relative' }}>
          <Button
            variant="outlined"
            size={'small'}
            onClick={(e) => {
              setLoading(true)
              onConfirm(e, setLoading)
            }}
            disabled={loading}
          >
            Confirmar
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                color: green[500],
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
