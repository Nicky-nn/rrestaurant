import { ScreenSearchDesktop } from '@mui/icons-material'
import { ButtonGroup, FormControl, Grid, IconButton, Tooltip } from '@mui/material'
import React, { forwardRef, useEffect, useState } from 'react'
import { SelectInstance } from 'react-select'
import AsyncSelect from 'react-select/async'

import { apiArticuloInventarioListado } from '../../../../base/api/apiArticuloInventarioListado.ts'
import { MyInputLabel } from '../../../../base/components/MyInputs/MyInputLabel'
import { reactSelectStyle } from '../../../../base/components/MySelect/ReactSelect'
import { EntidadInputProps, PAGE_DEFAULT } from '../../../../interfaces'
import { ArticuloProps } from '../../../../interfaces/articulo.ts'
import { genApiQuery } from '../../../../utils/helper.ts'
import { notDanger } from '../../../../utils/notification'
import { swalException } from '../../../../utils/swal'
import ArticuloSeleccionListadoDialog from './ArticuloSeleccionListadoDialog.tsx'

interface OwnProps {
  /** Identificados unico */
  id: string
  /** Datos de entidad, codigoSucursal, codigoPuntoVenta */
  entidad: EntidadInputProps
  /** Lista de codigo articulos que se bloquean ["cod1", "cod2", "cod_n"] */
  bloquearCodigosArticulo: string[]
  /** Parametro para consulta a servidor verificarPrecio, servicio articuloInventarioV2Listado */
  verificarPrecio: boolean
  /** Parametro para consulta a servidor verificaInventario, servicio articuloInventarioV2Listado */
  verificarInventario?: boolean
  /** Cuando se agregan o cambian articulos */
  onArticuloChange: (articulo: ArticuloProps[]) => void
  /** Genera radioButton o CheckBox */
  seleccionMultiple?: boolean
  /** Parametros extra al query articuloInventarioV2Listado ["articuloVenta=true","verificarStock=true"]  */
  extraQuery?: string[] // consulta extra para la api
  /** Agregar label al inputText */
  label?: string
  /** Agrega Placeholder al inputText */
  placeholder?: string
}

type Props = OwnProps

/**
 * Componente de busqueda y seleccion de articulos
 * @author isi-template
 * @param props
 * @constructor
 */
const ArticuloSeleccion = forwardRef<SelectInstance<ArticuloProps>, Props>(
  (props, ref) => {
    const {
      id,
      onArticuloChange,
      verificarInventario,
      bloquearCodigosArticulo,
      verificarPrecio,
      label = 'Búsqueda de articulos',
      placeholder = 'ALT + A',
      seleccionMultiple = true,
      extraQuery = [],
      entidad,
    } = props
    const [articulo, setArticulo] = useState<ArticuloProps[]>([])
    const [openArticuloListado, setOpenArticuloListado] = useState<boolean>(false)

    /**
     * Busqueda del cliente en base de datos
     * @param value
     */
    const articuloBusqueda = async (value: string): Promise<ArticuloProps[]> => {
      try {
        if (value.length > 2) {
          const query = genApiQuery([], [...extraQuery])
          const pageInput = { ...PAGE_DEFAULT, limit: 20, query }
          const { docs } = await apiArticuloInventarioListado(entidad, pageInput, {
            verificarPrecio: verificarPrecio || false,
            verificarInventario: verificarInventario || false,
            queryExtra: value,
          })
          if (docs) return docs
        }
        return []
      } catch (e: any) {
        swalException(e)
        return []
      }
    }
    /***********************************************************************************/
    /***********************************************************************************/
    useEffect(() => {
      setArticulo([])
    }, [])

    /***********************************************************************************/
    /***********************************************************************************/
    /***********************************************************************************/
    return (
      <div>
        <Grid container spacing={0.5}>
          <Grid size={{ xs: 10, sm: 11, md: 11, lg: 11, xl: 11 }}>
            <FormControl fullWidth>
              {label !== '' && <MyInputLabel shrink>{label}</MyInputLabel>}
              <AsyncSelect<ArticuloProps>
                key={`select-${id}`}
                ref={ref}
                styles={reactSelectStyle(false)}
                menuPosition={'fixed'}
                placeholder={placeholder}
                loadOptions={articuloBusqueda}
                isClearable={true}
                value={articulo}
                getOptionValue={(item) => item.codigoArticulo}
                getOptionLabel={(item) =>
                  `${item.codigoArticulo} - ${item.nombreArticulo}___
                  ${item.articuloPrecioBase?.monedaPrimaria?.precio || ''}
                  ${item.articuloPrecioBase?.monedaPrimaria?.moneda.sigla || ''}___
                  ${(item.verificarStock && item.inventario[0]?.totalStock) || ''}${item.inventario[0]?.unidadMedida.nombreUnidadMedida || ''}`
                }
                onChange={(resp) => {
                  if (resp) {
                    if (!bloquearCodigosArticulo.includes(resp.codigoArticulo)) {
                      setArticulo([resp])
                      onArticuloChange([resp])
                    } else {
                      notDanger(`El articulo ${resp.codigoArticulo} ya se ha adicionado`)
                    }
                  } else {
                    setArticulo([])
                    onArticuloChange([])
                  }
                }}
                noOptionsMessage={() =>
                  'Ingrese referencia -> Codigo articulo, nombre articulo'
                }
                loadingMessage={() => 'Buscando...'}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 2, sm: 1, md: 1, lg: 1, xl: 1 }}>
            <ButtonGroup variant="text" aria-label="Opciones de busqueda">
              <IconButton
                aria-label="busqueda-articulo"
                sx={{ p: 0.6 }}
                aria-hidden={false}
                onClick={() => setOpenArticuloListado(true)}
              >
                <Tooltip title={'Explorar Articulos'}>
                  <ScreenSearchDesktop fontSize="large" />
                </Tooltip>
              </IconButton>
            </ButtonGroup>
          </Grid>
        </Grid>
        <ArticuloSeleccionListadoDialog
          id={`seleccion-articulos-${id}`}
          entidad={entidad}
          bloquearCodigosArticulo={bloquearCodigosArticulo}
          verificarPrecio={verificarPrecio}
          verificarInventario={verificarInventario}
          disableEnforceFocus
          open={openArticuloListado}
          seleccionMultiple={seleccionMultiple}
          extraQuery={extraQuery}
          onClose={(resp) => {
            if (resp) {
              const errors: string[] = []
              for (const item of resp) {
                if (bloquearCodigosArticulo.includes(item.codigoArticulo)) {
                  errors.push(item.codigoArticulo)
                }
              }
              if (errors.length > 0) {
                notDanger(`Los articulos ${errors.join(', ')} ya se han adicionado`)
              } else {
                setArticulo(resp)
                onArticuloChange(resp)
              }
            }
            setOpenArticuloListado(false)
          }}
        />
      </div>
    )
  },
)

export default ArticuloSeleccion
