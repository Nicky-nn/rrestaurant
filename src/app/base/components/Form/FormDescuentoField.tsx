import { Percent } from '@mui/icons-material'
import { IconButton, Tooltip, Typography } from '@mui/material'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UseFormSetValue,
  useFormState,
  useWatch,
} from 'react-hook-form'

import { handleSelect } from '../../../utils/helper.ts'
// Importamos tu componente optimizado
import NumberSpinnerField from '../NumberSpinnerField/NumberSpinnerField.tsx'

interface FormDescuentoFieldProps<T extends FieldValues> {
  control: Control<T>
  setValue: UseFormSetValue<T>
  namePorcentaje: Path<T>
  nameMonto: Path<T>
  subtotal: number
  monedaSigla?: string
  label?: string
  disabled?: boolean
  nroDecimales?: number
}

const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

// Función auxiliar para leer rutas de errores, incluso si están anidados (ej: "lotes.0.descuento")
const getErrorByPath = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

/**
 * Usado generalmente para generar descuentos por % y por monto
 * @param control
 * @param setValue
 * @param namePorcentaje
 * @param nameMonto
 * @param subtotal
 * @param monedaSigla
 * @param label
 * @param disabled
 * @param nroDecimales
 * @author isi-template
 * @constructor
 */
export const FormDescuentoField = <T extends FieldValues>({
  control,
  setValue,
  namePorcentaje,
  nameMonto,
  subtotal,
  monedaSigla = '',
  label,
  disabled = false,
  nroDecimales = 2,
}: FormDescuentoFieldProps<T>): ReactElement => {
  const [modo, setModo] = useState<'PORCENTAJE' | 'MONTO'>('PORCENTAJE')

  // ===== ESTADO DE VALORES =====
  const descPorcentaje = useWatch({ control, name: namePorcentaje })
  const descMonto = useWatch({ control, name: nameMonto })

  // ===== ESTADO DE ERRORES (NUEVO) =====
  // Extraemos los errores de validación (Yup) desde el control
  const { errors } = useFormState({ control })

  const descPorcentajeRef = useRef(descPorcentaje)
  const descMontoRef = useRef(descMonto)

  useEffect(() => {
    descPorcentajeRef.current = descPorcentaje
    descMontoRef.current = descMonto
  }, [descPorcentaje, descMonto])

  // Recálculo automático si el subtotal cambia
  useEffect(() => {
    if (subtotal <= 0) return

    if (modo === 'PORCENTAJE') {
      const p = Number(descPorcentajeRef.current) || 0
      const nuevoMonto = round2(subtotal * (p / 100))
      setValue(nameMonto, nuevoMonto as PathValue<T, Path<T>>, { shouldValidate: true })
    } else {
      const m = Number(descMontoRef.current) || 0
      const nuevoPorcentaje = round2((m / subtotal) * 100)
      setValue(namePorcentaje, nuevoPorcentaje as PathValue<T, Path<T>>, { shouldValidate: true })
    }
  }, [subtotal, modo, setValue, nameMonto, namePorcentaje])

  // ===== HANDLERS SIMPLIFICADOS =====
  const handleChangePorcentaje = (val: number | null) => {
    if (val === null) {
      setValue(namePorcentaje, null as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
      setValue(nameMonto, null as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
      return
    }

    let p = val
    if (p > 100) p = 100

    const m = subtotal > 0 ? round2(subtotal * (p / 100)) : 0

    setValue(namePorcentaje, val as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
    setValue(nameMonto, m as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
  }

  const handleChangeMonto = (val: number | null) => {
    if (val === null) {
      setValue(nameMonto, null as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
      setValue(namePorcentaje, null as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
      return
    }

    let m = val
    if (subtotal > 0 && m > subtotal) m = subtotal

    const p = subtotal > 0 ? round2((m / subtotal) * 100) : 0

    setValue(nameMonto, val as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
    setValue(namePorcentaje, p as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true })
  }

  const toggleModo = () => setModo((prev) => (prev === 'PORCENTAJE' ? 'MONTO' : 'PORCENTAJE'))

  const isPorcentaje = modo === 'PORCENTAJE'
  const valorVisual = isPorcentaje ? descPorcentaje : descMonto

  // ===== GESTIÓN DE ERROR DINÁMICA =====
  // Obtenemos el error correspondiente al modo actual (Porcentaje o Monto)
  const errorObj = getErrorByPath(errors, (isPorcentaje ? namePorcentaje : nameMonto) as string)
  const errorMessage = errorObj?.message as string | undefined

  return (
    <NumberSpinnerField
      label={label ?? (isPorcentaje ? 'Descuento (%)' : `Descuento (${monedaSigla})`)}
      value={valorVisual ?? null}
      onClick={handleSelect}
      onChange={isPorcentaje ? handleChangePorcentaje : handleChangeMonto}
      disabled={disabled}
      min={0}
      max={isPorcentaje ? 100 : subtotal}
      decimalScale={nroDecimales}
      hideActionButtons={false}
      error={!!errorObj}
      helperText={errorMessage}
      customEndAdornment={
        <Tooltip title={`Cambiar a ${isPorcentaje ? 'Monto fijo' : 'Porcentaje'}`} disableInteractive>
          <IconButton
            onClick={toggleModo}
            size="small"
            color={isPorcentaje ? 'default' : 'primary'}
            sx={{ backgroundColor: 'action.hover', borderRadius: 1, p: 0.5 }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {isPorcentaje ? (
              <Percent fontSize="small" />
            ) : (
              <Typography variant="body2" fontWeight="bold" sx={{ px: 0.5 }}>
                {monedaSigla}
              </Typography>
            )}
          </IconButton>
        </Tooltip>
      }
    />
  )
}
