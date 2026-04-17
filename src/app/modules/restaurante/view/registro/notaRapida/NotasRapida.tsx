import React, { FunctionComponent, useState } from 'react'
import { TextField } from '@mui/material'

interface NotasRapidasProps {
  tipoArticuloId?: string
  onNotaChange: (nota: string) => void
}

const NotasRapidas: FunctionComponent<NotasRapidasProps> = ({
  tipoArticuloId,
  onNotaChange,
}) => {
  const [nota, setNota] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNota(e.target.value)
    onNotaChange(e.target.value)
  }

  return (
    <TextField
      label="Nota Rápida"
      size="small"
      fullWidth
      value={nota}
      onChange={handleChange}
      placeholder="Ej: Sin sal, Extra queso..."
    />
  )
}

export default NotasRapidas
