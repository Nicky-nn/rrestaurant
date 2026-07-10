import { useTheme } from '@mui/material'
import { useMemo, useState } from 'react'
import useAuth from '../../../base/hooks/useAuth.ts'
import useOperaciones from '../../../base/hooks/useOperaciones.ts'
import { getEntidadInput } from '../../../utils/getEntidadInput.ts'
import { useMonedaOperaciones } from '../../../base/hooks/useMonedaOperaciones.ts'

type ActionState = { mode: 'idle'; open: false; data: null }

const initialState: ActionState = { mode: 'idle', open: false, data: null }

/**
 * Operaciones de entrada
 */
export const useEntradaOperaciones = () => {
  const { user } = useAuth()
  const theme = useTheme()
  const [action, setAction] = useState<ActionState>(initialState)

  const entidad = useMemo(() => getEntidadInput(user), [user])
  const { articuloMoneda } = useOperaciones()
  const { moneda, monedaPrimaria } = useMonedaOperaciones(user, articuloMoneda)

  // Línea de acciones
  const onActionReset = () => setAction(initialState)

  return {
    user,
    entidad,
    moneda,
    monedaPrimaria,
    theme,
    sucursal: user.sucursal,
    pve: user.puntoVenta,
    action,
    onActionReset,
  }
}
