import { AddCircleOutline, Search } from '@mui/icons-material'
import { Box, FormControl, IconButton, Stack, styled, Tooltip } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { apiLotePorArticuloInventarioAlmacenListado } from '../../../../../base/api/apiLotePorArticuloInventarioAlmacenListado.ts'
import { apiLotePorArticuloListado } from '../../../../../base/api/apiLotePorArticuloListado.ts'
import FormSelect from '../../../../../base/components/Form/FormSelect.tsx'
import { PreloadFieldSkeleton } from '../../../../../base/components/skeleton/PreloadFieldSkeleton.tsx'
import { MetodoSeleccionLote } from '../../../../../base/services/articuloToArticuloOperacionInputService.ts'
import { LoteProps } from '../../../../../interfaces/lote.ts'
import LoteSeleccionPorArticuloListadoDialog from './LoteSeleccionPorArticuloListadoDialog.tsx'
import LoteSeleccionRegistroDialog from './LoteSeleccionRegistroDialog.tsx'
import { LoteSeleccionComponentProps } from './LoteSeleccionTypes.ts'
import { procesarLotesDesdeAPI } from './loteSeleccionUtils.ts'

const IconButtonWrapper = styled(Box, {
  // Evitamos que 'disabled' se pase al DOM del Box
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  // Responsivo: 100% en móvil (xs), 40px en desktop (sm)
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 40,
  },
  //
  // // IMPORTANTE: Permitir eventos para el Tooltip aunque el hijo esté disabled
  pointerEvents: 'auto',

  '& .MuiIconButton-root': {
    width: '100%',
    height: '100%',
    borderRadius: theme.shape.borderRadius, // Cuadrado redondeado por defecto
    border: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create(['background-color', 'border-color']),

    // En desktop lo volvemos circular si prefieres ese estilo
    [theme.breakpoints.up('sm')]: {
      borderRadius: '50%',
    },

    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
      pointerEvents: 'none', // El botón no recibe clics, pero el Box padre sí recibe hover
    },
  },
}))

/**
 * Componente de selección inteligente de lote con soporte para diferentes métodos de ordenamiento
 *
 * Características:
 * - Soporte para FEFO (First Expired, First Out)
 * - Soporte para FIFO (First In, First Out)
 * - Modo MANUAL sin ordenamiento automático
 * - Autoselección según el metodo configurado
 * - Filtro de lotes vencidos
 * - Búsqueda avanzada y registro de nuevos lotes
 *
 * @param props
 * @author isi-template
 * @author isi-template
 * @constructor
 */
const LoteSeleccion: FunctionComponent<LoteSeleccionComponentProps> = (props) => {
  const {
    codigoArticulo,
    almacenId,
    inventarioId,
    onChange,
    error,
    value,
    habilitado = true,
    loteProps,
    lotesInventario, // Nueva prop para lotes ya procesados
  } = props

  const [openLoteListado, setOpenLoteListado] = useState<boolean>(false)
  const [openLoteRegistro, setOpenLoteRegistro] = useState<boolean>(false)

  // Extraer configuración con valores por defecto
  const {
    mostrarBusquedaAvanzada = true,
    mostrarRegistrarNuevo = true,
    fuente = 'inv',
    mostrarSoloConStock = false,
    metodoSeleccion = MetodoSeleccionLote.MANUAL,
    excluirVencidos = false,
    autoSeleccion = false,
    disabled = false,
    label = 'Lote',
  } = loteProps

  // ===== CARGA DE LOTES DESDE API =====
  const {
    data: lotesAPI = [],
    isLoading,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ['lotes-por-articulo-servidor', codigoArticulo, almacenId, inventarioId, fuente, habilitado],
    enabled: () => {
      // Si ya tenemos lotes del inventario, no consultar API
      if (lotesInventario && lotesInventario.length > 0) return false

      // Validaciones estándar
      if (!codigoArticulo || !habilitado) return false
      if (fuente === 'inv') {
        return !!(almacenId && inventarioId)
      }
      return true
    },
    queryFn: async () => {
      if (fuente === 'tbl') {
        return await apiLotePorArticuloListado(codigoArticulo)
      }

      if (fuente === 'inv') {
        if (!inventarioId || !almacenId) return []
        return await apiLotePorArticuloInventarioAlmacenListado(codigoArticulo, inventarioId, almacenId)
      }
      return []
    },
  })

  // ===== PROCESAMIENTO DE LOTES =====
  const lotesProcesados = useMemo(() => {
    // Usar lotes del inventario si están disponibles, sino usar los de la API
    const lotesBase = lotesInventario && lotesInventario.length > 0 ? lotesInventario : lotesAPI

    let resultado = [...lotesBase]

    // Filtrar por stock disponible (solo aplica con fuente 'inv')
    // Todavia no es funcional
    if (mostrarSoloConStock && fuente === 'inv') {
      // Si son lotes del inventario (InventarioDetalleLoteProps), tienen propiedad disponible
      resultado = resultado.filter((lote: any) => {
        // Si tiene la propiedad disponible, usarla
        if ('disponible' in lote) {
          return lote.disponible > 0
        }
        // Si es LoteProps directamente, no filtrar
        return true
      })
    }
    // Procesar según configuración (ordenamiento y exclusión de vencidos)
    return procesarLotesDesdeAPI(resultado, metodoSeleccion, excluirVencidos)
  }, [lotesInventario, lotesAPI, mostrarSoloConStock, fuente, metodoSeleccion, excluirVencidos])

  /************************************************************************************/
  /************************************************************************************/
  // ===== AUTOSELECCIÓN =====
  useEffect(() => {
    if (
      autoSeleccion &&
      isSuccess &&
      lotesProcesados.length > 0 &&
      !value &&
      metodoSeleccion !== MetodoSeleccionLote.MANUAL
    ) {
      // Seleccionar el primer lote según el ordenamiento
      const primerLote = lotesProcesados[0]
      if (primerLote) {
        onChange(primerLote)
      }
    }
  }, [autoSeleccion, isSuccess, lotesProcesados, value, onChange, metodoSeleccion])

  /*********************************************************************************/
  /*********************************************************************************/
  /*********************************************************************************/
  return (
    <>
      <PreloadFieldSkeleton label={'Lote...'} isLoading={isLoading}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        >
          <FormControl fullWidth error={!!error}>
            <FormSelect<LoteProps>
              inputLabel={label}
              placeholder={habilitado ? 'Seleccione lote...' : ''}
              options={lotesProcesados}
              value={value}
              onChange={onChange}
              getOptionValue={(item) => item._id}
              getOptionLabel={(item) => `${item.codigoLote} - Vence el ${item.fechaVencimiento || 'N/A'}`}
              error={!!error}
              formHelperText={error ?? ''}
              isSearchable={false}
              isClearable={true}
              isDisabled={!habilitado || disabled}
            />
          </FormControl>

          {(mostrarBusquedaAvanzada || mostrarRegistrarNuevo) && (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              sx={{ marginTop: { sm: '-2px !important' } }}
            >
              {mostrarBusquedaAvanzada && (
                <Tooltip title="Búsqueda avanzada" placement={'top'} disableInteractive>
                  <IconButtonWrapper disabled={!habilitado || disabled} sx={{ flex: { xs: 1, sm: 'none' } }}>
                    <IconButton
                      color="primary"
                      disabled={!habilitado || disabled}
                      onClick={() => {
                        setOpenLoteListado(true)
                      }}
                    >
                      <Search />
                    </IconButton>
                  </IconButtonWrapper>
                </Tooltip>
              )}

              {mostrarRegistrarNuevo && (
                <Tooltip title="Registrar nuevo lote" placement={'top'} disableInteractive>
                  <IconButtonWrapper disabled={!habilitado || disabled} sx={{ flex: { xs: 1, sm: 'none' } }}>
                    <IconButton
                      color="secondary"
                      disabled={!habilitado || disabled}
                      onClick={() => {
                        setOpenLoteRegistro(true)
                      }}
                    >
                      <AddCircleOutline />
                    </IconButton>
                  </IconButtonWrapper>
                </Tooltip>
              )}
            </Stack>
          )}
        </Stack>
      </PreloadFieldSkeleton>
      <LoteSeleccionPorArticuloListadoDialog
        codigoArticulo={codigoArticulo}
        almacenId={almacenId}
        inventarioId={inventarioId}
        fuente={fuente}
        metodoSeleccion={metodoSeleccion}
        excluirVencidos={excluirVencidos}
        validarFechaVencimiento={loteProps.validarFechaVencimiento}
        onClose={(resp) => {
          if (resp) {
            onChange(resp)
          }
          setOpenLoteListado(false)
        }}
        open={openLoteListado}
      />
      <LoteSeleccionRegistroDialog
        open={openLoteRegistro}
        onClose={() => {
          setOpenLoteRegistro(false)
        }}
        codigoArticulo={codigoArticulo}
        onSubmit={async (resp) => {
          if (resp) {
            onChange(resp)
            await refetch()
          }
          setOpenLoteRegistro(false)
        }}
      />
    </>
  )
}

export default LoteSeleccion
