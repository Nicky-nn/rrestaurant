import { DarkMode, LightMode } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'

import { aplicarEstilosUxModo, getModoEfectivo } from '../../../../hooks/useUxModo'

export default function UxModoMenu({
  value,
  onChange,
}: {
  value: 'LIGHT' | 'DARK' | 'SYSTEM' | null
  onChange: (modo: 'LIGHT' | 'DARK' | 'SYSTEM') => void
}) {
  const [modoActual, setModoActual] = useState<'LIGHT' | 'DARK' | 'SYSTEM' | null>(
    value ?? 'SYSTEM',
  )

  // Actualizar cuando el valor del padre cambia
  useEffect(() => {
    setModoActual(value ?? 'SYSTEM')
  }, [value])

  const handleToggle = () => {
    // Toggle entre LIGHT y DARK
    const modoEfectivo = getModoEfectivo(modoActual)
    const nuevoModo = modoEfectivo === 'LIGHT' ? 'DARK' : 'LIGHT'

    // Aplicar estilos INMEDIATAMENTE antes de la llamada API
    aplicarEstilosUxModo(nuevoModo)
    setModoActual(nuevoModo)

    // Notificar al padre (esto hará la llamada API)
    onChange(nuevoModo)
  }

  const modoEfectivo = getModoEfectivo(modoActual)
  const tooltipText =
    modoActual === 'SYSTEM'
      ? `Sistema (${modoEfectivo === 'DARK' ? 'Oscuro' : 'Claro'})`
      : modoEfectivo === 'DARK'
        ? 'Modo Oscuro'
        : 'Modo Claro'

  return (
    <Tooltip title={tooltipText}>
      <IconButton onClick={handleToggle} aria-label="cambio modo oscuro/claro">
        {modoEfectivo === 'DARK' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  )
}
