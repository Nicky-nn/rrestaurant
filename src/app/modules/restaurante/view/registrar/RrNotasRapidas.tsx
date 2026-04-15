import { Box, Chip, TextField, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import React, { useEffect, useMemo, useState } from 'react'

export interface RrNotasRapidasProps {
  notasPredefinidas: string[]
  selectedNotas: Set<string>
  onChange: (nuevasNotas: Set<string>) => void
  permitePersonalizada?: boolean
  titulo?: string
  storageId?: string
  open?: boolean
}

interface NotaStat {
  original: string
  upper: string
  count: number
}

// Función global que se llama SOLO cuando se confirma (ej. Clic en Agregar)
// Las estadísticas de uso solo sirven para ORDENAR los chips por frecuencia,
// NUNCA pre-seleccionan notas al abrir el modal.
export const guardarUsoNotasLocal = (notas: Set<string>, storageId?: string) => {
  if (notas.size === 0) return

  const lsKey =
    storageId && storageId !== 'undefined'
      ? `rr_notas_usage_stats_${storageId}`
      : 'rr_notas_usage_stats_global'
  let prevStats: NotaStat[] = []

  try {
    const stored = localStorage.getItem(lsKey)
    if (stored) {
      prevStats = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error parseando stat notas', e)
  }

  const nextStats = [...prevStats]

  Array.from(notas).forEach((notaStr) => {
    const upper = notaStr.toUpperCase().trim()
    const existingIndex = nextStats.findIndex((s) => s.upper === upper)
    if (existingIndex >= 0) {
      nextStats[existingIndex] = { ...nextStats[existingIndex], count: nextStats[existingIndex].count + 1 }
    } else {
      nextStats.push({ original: notaStr.trim(), upper, count: 1 })
    }
  })

  try {
    localStorage.setItem(lsKey, JSON.stringify(nextStats))
  } catch (e) {
    console.error('Error guardando stat notas', e)
  }
}

const RrNotasRapidas: React.FC<RrNotasRapidasProps> = ({
  notasPredefinidas,
  selectedNotas,
  onChange,
  permitePersonalizada = true,
  titulo = 'Notas Rápidas',
  storageId,
  open,
}) => {
  const [notaManual, setNotaManual] = useState('')
  const [stats, setStats] = useState<NotaStat[]>([])

  const lsKey =
    storageId && storageId !== 'undefined'
      ? `rr_notas_usage_stats_${storageId}`
      : 'rr_notas_usage_stats_global'

  // Cargar estadísticas de LocalStorage al montar o cambiar de key (y cada vez que se abre)
  useEffect(() => {
    if (open === false) return // Si está cerrado, no hay necesidad de hacer nada
    try {
      const stored = localStorage.getItem(lsKey)
      if (stored) {
        setStats(JSON.parse(stored))
      } else {
        setStats([]) // Resetear si entramos a una key nueva sin stats
      }
    } catch (e) {
      console.error('Error leyendo notas stats desde LS', e)
    }
  }, [lsKey, open])

  // Lista combinada y ordenada: Predefinidas + Seleccionadas + Top Custom (ordenadas por uso)
  const notasMostradas = useMemo(() => {
    const map = new Map<string, NotaStat>()

    // 1. Llenar con stats primero para tener el casing original guardado y sus counts
    stats.forEach((s) => map.set(s.upper, s))

    // 2. Llenar con predefinidas (si no existen, count 0)
    notasPredefinidas.forEach((n) => {
      const upper = n.toUpperCase().trim()
      if (!map.has(upper)) {
        map.set(upper, { original: n.trim(), upper, count: 0 })
      }
    })

    // 3. Llenar con seleccionadas actuales (por si acaso)
    Array.from(selectedNotas).forEach((n) => {
      const upper = n.toUpperCase().trim()
      if (!map.has(upper)) {
        map.set(upper, { original: n.trim(), upper, count: 0 })
      }
    })

    // 4. Convertir a Array y ordenar por 'count' descendente (los más utilizados primero)
    const result = Array.from(map.values())
    result.sort((a, b) => b.count - a.count || a.original.localeCompare(b.original))

    // 5. Filtrar para no saturar la pantalla con cientos de creadas en el pasado.
    // Mostramos si: Es predefinida, está seleccionada, o es una de las "Top 10" personalizadas más usadas
    let customCount = 0
    return result.filter((n) => {
      const isPredefinida = notasPredefinidas.some((p) => p.toUpperCase().trim() === n.upper)
      const isSelected = Array.from(selectedNotas).some((s) => s.toUpperCase().trim() === n.upper)

      if (isPredefinida || isSelected) return true

      // Si es un custom global no seleccionado, mostramos solo los 10 más populares que tengan > 0 usos
      if (customCount < 10 && n.count > 0) {
        customCount++
        return true
      }
      return false
    })
  }, [notasPredefinidas, stats, selectedNotas])

  const toggleNota = (nota: string) => {
    // Buscar si ya tenemos un registro para recuperar el original con MAYUSCULA/minuscula exacto (el primero q se guardó)
    const upperInput = nota.toUpperCase().trim()
    const matchedStat = stats.find((s) => s.upper === upperInput)
    // Si existe en LS/Stats, usa su nombre original; si no, usa como se escribió
    const finalNotaText = matchedStat ? matchedStat.original : nota.trim()

    const next = new Set(selectedNotas)
    if (next.has(finalNotaText)) {
      next.delete(finalNotaText)
    } else {
      next.add(finalNotaText)
    }
    onChange(next)
  }

  // Si no hay nada que mostrar y no queremos input manual, retornamos null
  if (notasMostradas.length === 0 && !permitePersonalizada) {
    return null
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      {titulo && (
        <Typography
          variant="overline"
          fontWeight={700}
          color="text.secondary"
          display="block"
          sx={{ mb: 1, letterSpacing: '0.1em', fontSize: '0.7rem' }}
        >
          {titulo}
        </Typography>
      )}

      {/* Contenedor unificado para chips predefinidos y manuales (alineados y ordenados por uso) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: permitePersonalizada ? 1.5 : 0 }}>
        {notasMostradas.map((notaStat) => {
          const originalText = notaStat.original
          // Chequeamos selección sin importar si predefinida fue cambiada levemente de case
          const selected = Array.from(selectedNotas).some((s) => s.toUpperCase().trim() === notaStat.upper)

          return (
            <Chip
              key={notaStat.upper}
              label={originalText}
              onClick={() => toggleNota(originalText)}
              variant="outlined"
              size="small"
              sx={{
                fontWeight: selected ? 600 : 400,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderColor: selected ? 'secondary.main' : 'divider',
                color: selected ? 'secondary.main' : 'text.primary',
                bgcolor: selected ? (theme) => alpha(theme.palette.secondary.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: selected ? (theme) => alpha(theme.palette.secondary.main, 0.15) : 'action.hover',
                },
              }}
            />
          )
        })}
      </Box>

      {/* Input de nota manual (debajo de los chips) */}
      {permitePersonalizada && (
        <TextField
          size="small"
          fullWidth
          placeholder="Agregar nota personalizada…"
          value={notaManual}
          onChange={(e) => setNotaManual(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && notaManual.trim()) {
              toggleNota(notaManual.trim())
              setNotaManual('')
            }
          }}
          slotProps={{
            input: {
              endAdornment: notaManual.trim() ? (
                <Chip label="↵ Enter" size="small" sx={{ fontSize: '0.65rem', height: 20, mr: -0.5 }} />
              ) : undefined,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '0.85rem',
            },
          }}
        />
      )}
    </Box>
  )
}

export default RrNotasRapidas
