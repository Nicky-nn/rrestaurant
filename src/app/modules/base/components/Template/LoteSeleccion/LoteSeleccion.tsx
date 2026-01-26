import { AddCircleOutline, Search } from '@mui/icons-material'
import { Box, FormControl, IconButton, Stack, styled, Tooltip } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { FunctionComponent, useEffect, useState } from 'react'

import { apiLotePorArticuloInventarioAlmacenListado } from '../../../../../base/api/apiLotePorArticuloInventarioAlmacenListado.ts'
import { apiLotePorArticuloListado } from '../../../../../base/api/apiLotePorArticuloListado.ts'
import FormSelect from '../../../../../base/components/Form/FormSelect.tsx'
import { reactSelectStyle } from '../../../../../base/components/MySelect/ReactSelect.tsx'
import { PreloadFieldSkeleton } from '../../../../../base/components/skeleton/PreloadFieldSkeleton.tsx'
import { LoteProps } from '../../../../../interfaces/lote.ts'
import LoteSeleccionPorArticuloListadoDialog from './LoteSeleccionPorArticuloListadoDialog.tsx'
import LoteSeleccionRegistroDialog from './LoteSeleccionRegistroDialog.tsx'

type LoteSeleccionTipoLista = 'articulo' | 'almacen'
export const apiLoteTipoLista: Record<LoteSeleccionTipoLista, LoteSeleccionTipoLista> = {
  articulo: 'articulo', // Lista solo en función al articulo, apto para registros, no depende de inventarios
  almacen: 'almacen', // Lista por articulo el lote debe existir en el almacen de inventario, apto para ventas
}

export interface LoteSeleccionProps {
  label?: string
  disabled?: boolean // Deshabilita el componente independiente si esta gestionado por Lotes, default false
  validarLote?: boolean // Valida Lote siempre y cuanto este gestionado por lotes, default false
  validarFechaVencimiento?: boolean // Valida fecha vencimiento, default false
  tipoLista: LoteSeleccionTipoLista // llama a objeto apiLoteSeleccionTipoLista
  mostrarBusquedaAvanzada?: boolean
  mostrarRegistrarNuevo?: boolean
  autoSeleccion?: boolean // Si value contiene datos, se prioriza, luego autoselección, default false
  tipoSeleccion?: 'FIFO' | 'LIFO'
}

interface OwnProps {
  habilitado?: boolean
  codigoArticulo: string
  almacenId?: string
  inventarioId?: string
  value: LoteProps | null
  onChange: (resp: LoteProps | null) => void
  error?: string
  loteProps: LoteSeleccionProps
}

type Props = OwnProps

const IconButtonWrapper = styled(Box, {
  // Evitamos que 'disabled' se pase al DOM del Box
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
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
 * Seleccion inteligente de lote
 * @param props
 * @author isi-template
 * @constructor
 */
const LoteSeleccion: FunctionComponent<Props> = (props) => {
  const {
    codigoArticulo,
    almacenId,
    inventarioId,
    onChange,
    error,
    value,
    habilitado = true,
    loteProps,
  } = props

  const [openLoteListado, setOpenLoteListado] = useState<boolean>(false)
  const [openLoteRegistro, setOpenLoteRegistro] = useState<boolean>(false)

  const {
    mostrarBusquedaAvanzada = true,
    mostrarRegistrarNuevo = true,
    tipoLista = apiLoteTipoLista.articulo,
    autoSeleccion = false,
    disabled = false,
  } = loteProps

  const {
    data: lotes = [],
    isLoading,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: [
      'lotes-por-articulo-servidor',
      codigoArticulo,
      almacenId,
      inventarioId,
      tipoLista,
      habilitado,
    ],
    enabled: () => {
      // Habilitamos el query en función a las siguiente condiciones
      if (!codigoArticulo || !habilitado) return false
      if (apiLoteTipoLista.almacen === tipoLista) {
        return !!(almacenId && inventarioId)
      }
      return true
    },
    queryFn: async () => {
      if (tipoLista == apiLoteTipoLista.articulo) {
        return await apiLotePorArticuloListado(codigoArticulo)
      }

      if (tipoLista === apiLoteTipoLista.almacen) {
        if (!inventarioId || !almacenId) return []
        return await apiLotePorArticuloInventarioAlmacenListado(
          codigoArticulo,
          inventarioId,
          almacenId,
        )
      }
      return []
    },
  })

  /************************************************************************************/
  /************************************************************************************/
  // Logica de auto seleccion
  useEffect(() => {
    if (autoSeleccion && isSuccess && lotes.length > 0 && !value) {
      // Priorizamos el primer elemento (Idealmente el primero según FEFO)
      const primerLote = lotes[0]
      // IMPORTANTE: Pasamos el objeto formateado según lo que espera el formulario
      if (primerLote) {
        onChange(primerLote)
      }
    }
  }, [autoSeleccion, isSuccess, lotes, value, onChange])

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
              inputLabel={loteProps?.label ?? 'Lote'}
              styles={reactSelectStyle(!!error)}
              placeholder={habilitado ? 'Seleccione lote...' : ''}
              options={lotes}
              value={value}
              onChange={onChange}
              getOptionValue={(item) => item._id}
              getOptionLabel={(item) =>
                `${item.codigoLote} - Vence el ${item.fechaVencimiento}`
              }
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
                <Tooltip title="Búsqueda Avanzada" placement={'top'} disableInteractive>
                  <IconButtonWrapper
                    disabled={!habilitado || disabled}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
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
                <Tooltip
                  title="Registrar Nuevo Lote"
                  placement={'top'}
                  disableInteractive
                >
                  <IconButtonWrapper
                    disabled={!habilitado || disabled}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
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
        tipoLista={tipoLista}
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
        }}
      />
    </>
  )
}

export default LoteSeleccion
