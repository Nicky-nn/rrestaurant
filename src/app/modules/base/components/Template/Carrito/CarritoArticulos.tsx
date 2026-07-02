import { DeleteForeverOutlined } from '@mui/icons-material'
import {
  Box,
  Grid,
  IconButton,
  ListItemButton,
  Palette,
  Stack,
  Table,
  TableCell,
  TableCellProps,
  TableRow,
  Theme,
  Typography,
} from '@mui/material'
import React, { FunctionComponent, memo } from 'react'

import { CarritoVacio } from '../../../../../base/components/Container/CarritoVacio.tsx'
import {
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead,
  StyledTableRow,
} from '../../../../../base/components/MuiTable/StyledTable.tsx'
import { ArticuloDetallePopover } from '../../../../../base/components/PopoverMonto/ArticuloDetallePopover.tsx'
import MontoMonedaTexto from '../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { PopoverTexto } from '../../../../../base/components/PopoverMonto/PopoverTexto.tsx'
import { ArticuloOperacionInputProps } from '../../../../../interfaces/articuloOperacion.ts'
import { apiGestionArticulo } from '../../../../../interfaces/gestionArticulo.ts'
import { MonedaProps } from '../../../../../interfaces/monedaPrecio.ts'
import { alphaByTheme } from '../../../../../utils/colorUtils.ts'

// --- Interfaces Documentadas ---

// Define todos los lugares donde podrías querer inyectar una columna
type UbicacionColumnaExtra =
  | 'inicio' // Justo después del NroItem
  | 'despues-cantidad' // Entre Cantidad y Unidad de Medida/Artículo
  | 'despues-articulo' // Entre Artículo y Almacén/Lote
  | 'fin' // Justo antes de Opciones

/**
 * Configuración para crear columnas extra a demanda.
 */
interface CarritoArticulosColumn extends Omit<TableCellProps, 'id' | 'children'> {
  /** Identificador único de la columna (requerido) */
  id: string
  /** Texto o componente a mostrar en la cabecera (TableHead) */
  label: React.ReactNode
  /** Si es true, oculta completamente la columna */
  ocultar?: boolean
  /** Propiedades específicas y opcionales para la celda de la cabecera (si es diferente del body) */
  headCellProps?: TableCellProps
  /** Posición donde se inyectará la columna. Default: 'fin' */
  ubicacion?: UbicacionColumnaExtra
  /** Función que renderiza el contenido de la celda, con acceso al contexto del item */
  renderCell: (item: ArticuloOperacionInputProps, index: number) => React.ReactNode
}

/**
 * Propiedades de configuración para las columnas individuales del carrito.
 */
interface BaseColProps {
  /** Etiqueta personalizada para la cabecera de la columna */
  label?: string
  /** Si es true, oculta completamente la columna */
  ocultar?: boolean
  /** Ancho específico de la columna (ej. 120, '10%', 'auto') */
  width?: number | string
  /** Ancho mínimo de la columna, útil para evitar que se comprima demasiado */
  minWidth?: number | string
}

// Extraemos las claves de la paleta (primary, secondary, error, etc.)
type CarritoPaletteColors = {
  [K in keyof Palette]: Palette[K] extends { main: string } ? K : never
}[keyof Palette]

/**
 * Props principales del componente CarritoArticulos.
 * Componente reutilizable para la gestión de artículos en operaciones (ventas, compras, etc.).
 */
interface CarritoProps {
  /** Identificador único opcional para el contenedor del componente */
  id?: string
  /** Título a mostrar en la parte superior del componente */
  titulo?: string
  /** Altura máxima del contenedor de la tabla (ej. '60vh', 400). Aplica scroll interno si se supera. */
  maxHeight?: string | number
  /** Moneda en la que se está realizando la operación actual */
  moneda: MonedaProps | null
  /** Moneda base/primaria configurada en el sistema */
  monedaPrimaria: MonedaProps
  /** Valor del tipo de cambio aplicado a la operación */
  tipoCambio: number
  /** Array de artículos que se renderizarán en el carrito */
  articulos: ArticuloOperacionInputProps[]
  /** Índice del artículo que se encuentra seleccionado o activo (útil para resaltar filas) */
  indexActivo: number | null

  // --- Eventos ---
  /** Evento disparado al modificar el tipo de cambio manualmente */
  onChangeTipoCambio?: (tipoCambio: number) => void
  /** Evento disparado al modificar la cantidad. Si se omite, la columna es de solo lectura. */
  onChangeCantidad?: (resp: { index: number; item: ArticuloOperacionInputProps; cantidad: number }) => void
  /** Evento disparado al modificar el precio. Si se omite, la columna es de solo lectura. */
  onChangePrecio?: (resp: { index: number; item: ArticuloOperacionInputProps; precio: number }) => void
  /** Evento disparado al modificar el descuento. Si se omite, la columna es de solo lectura. */
  onChangeDescuento?: (resp: { index: number; item: ArticuloOperacionInputProps; descuento: number }) => void
  /** Evento disparado al agregar o editar el detalle extra del artículo */
  onChangeDetalleExtra?: (resp: {
    index: number
    item: ArticuloOperacionInputProps
    detalleExtra: string
  }) => void
  /** Evento disparado al hacer clic sobre el nombre/código del artículo */
  onClickArticulo?: (resp: { index: number; item: ArticuloOperacionInputProps }) => void
  /** Evento disparado al hacer clic en el botón de eliminar fila */
  onDeleteArticulo?: (resp: { index: number; item: ArticuloOperacionInputProps }) => void

  // --- Configuraciones de Columnas ---
  /** Opciones de la columna de Acciones (Eliminar, Detalles) */
  opcionesProps?: BaseColProps & {
    mostrarNroItem?: boolean
    /** Inyecta componentes (ej. IconButtons) adicionales en la celda de acciones */
    renderExtraActions?: (item: ArticuloOperacionInputProps, index: number) => React.ReactNode
  }
  /** Opciones de la columna de Información del Artículo */
  articuloProps?: BaseColProps & { ocultarUnidadMedidaText?: boolean }
  /** Opciones de la columna de Precio */
  precioProps?: BaseColProps & { nroDecimales?: number }
  /** Opciones de la columna de Descuento */
  descProps?: BaseColProps & { nroDecimales?: number }
  /** Opciones de la columna de Cantidad */
  cantidadProps?: BaseColProps & { nroDecimales?: number; min?: number; max?: number }
  /** Opciones de la columna de Almacén y Lote */
  almacenLoteProps?: BaseColProps & { ocultarTextoAlmacen?: boolean; ocultarTextoLote?: boolean }
  /** Opciones de la columna de Unidad de Medida (aislada) */
  unidadMedidaProps?: BaseColProps
  /** Color del head, Ej. primary, red[500] #fffff.  default primary,  */
  bgColor?: CarritoPaletteColors | string
  /** Aplica hover en las filas. Default true */
  hover?: boolean
  /** Intercalar color en cada fila. Default true */
  striped?: boolean
  /** Columnas extra inyectadas a demanda */
  columnasExtra?: CarritoArticulosColumn[]
}

// --- Sub-componente de Fila (Memorizado) ---
const ArticuloRow = memo(
  ({ item, index, props }: { item: ArticuloOperacionInputProps; index: number; props: CarritoProps }) => {
    const {
      indexActivo,
      onChangeCantidad,
      onChangePrecio,
      onChangeDescuento,
      onClickArticulo,
      onDeleteArticulo,
      onChangeDetalleExtra,
      moneda,
      opcionesProps = { mostrarNroItem: false },
      articuloProps,
      cantidadProps,
      almacenLoteProps,
      precioProps,
      descProps,
      unidadMedidaProps = { ocultar: true },
      columnasExtra = [],
    } = props

    // --- HELPER DE INYECCIÓN (BODY) ---
    const renderColumnasDinamicas = (ubicacionTarget: UbicacionColumnaExtra) => {
      return columnasExtra
        .filter((col) => !col.ocultar && (col.ubicacion || 'fin') === ubicacionTarget)
        .map((col) => {
          const {
            id,
            renderCell,
            ubicacion: _ubicacion,
            label: _label,
            ocultar: _ocultar,
            headCellProps: _headCellProps,
            ...cellProps
          } = col

          return (
            <TableCell key={id} {...cellProps}>
              {renderCell(item, index)}
            </TableCell>
          )
        })
    }

    const isActive = indexActivo === index
    // Cuando se encuentra activo
    const rowBg = (theme: Theme) =>
      isActive ? alphaByTheme(theme.palette.primary.main, theme, 0.2, 0.4) : 'inherit'

    return (
      <StyledTableRow sx={{ backgroundColor: rowBg }}>
        {opcionesProps?.mostrarNroItem && (
          <TableCell align="center">
            {item.nroItem ? (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.nroItem}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontStyle: 'italic', opacity: 0.8 }}
                title="Número de ítem autogenerado"
              >
                {index + 1}
              </Typography>
            )}
          </TableCell>
        )}

        {/* INYECCIÓN: INICIO */}
        {renderColumnasDinamicas('inicio')}

        {!cantidadProps?.ocultar && (
          <TableCell align="right">
            <MontoMonedaTexto
              monto={item.cantidad}
              editar={!!onChangeCantidad}
              lista
              onChange={(v) => onChangeCantidad?.({ index, item, cantidad: v ?? 0 })}
              montoProps={{ textAlign: 'right', sx: { fontWeight: 600 } }}
              decimales={cantidadProps?.nroDecimales ?? 2}
              min={cantidadProps?.min ?? 0}
              max={cantidadProps?.max ?? 1000000}
            />
          </TableCell>
        )}

        {/* INYECCIÓN: DESPUÉS DE CANTIDAD */}
        {renderColumnasDinamicas('despues-cantidad')}

        {!unidadMedidaProps.ocultar && (
          <TableCell align="left">
            <Typography variant="caption" noWrap>
              {item.articuloUnidadMedida?.nombreUnidadMedida}
            </Typography>
          </TableCell>
        )}

        {/* FIX: Alineación estricta a la izquierda para la columna del Artículo */}
        <TableCell align="left">
          <Stack
            direction="column"
            component={onClickArticulo ? ListItemButton : Box}
            onClick={onClickArticulo ? () => onClickArticulo({ index, item }) : undefined}
            sx={{ p: 0.5, borderRadius: 1, alignItems: 'flex-start', textAlign: 'left' }}
          >
            {onClickArticulo && (
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, lineHeight: 1.3 }}
                title={`${item.codigoArticulo}`}
              >
                {item.nombreArticulo}
              </Typography>
            )}

            {!onClickArticulo && <ArticuloDetallePopover articulo={item} />}

            {item.detalleExtra && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }} display={'inline'}>
                {item.detalleExtra}
              </Typography>
            )}

            {!articuloProps?.ocultarUnidadMedidaText && item.articuloUnidadMedida && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 400, mt: 0.3, fontStyle: 'italic' }}
              >
                {item.articuloUnidadMedida.nombreUnidadMedida}
              </Typography>
            )}
          </Stack>
        </TableCell>

        {/* INYECCIÓN: DESPUÉS DE ARTÍCULO */}
        {renderColumnasDinamicas('despues-articulo')}

        {!almacenLoteProps?.ocultar && (
          <TableCell align="left">
            <Stack spacing={0.25} alignItems="flex-start">
              {!almacenLoteProps?.ocultarTextoAlmacen && (
                <Typography variant="caption" display="flex" gap={0.5} noWrap>
                  <Box component="span" sx={{ fontWeight: 700, color: 'green.main' }} title={'Almacén'}>
                    ALM:
                  </Box>
                  {item.almacen?.nombre ? (
                    item.almacen.nombre.toUpperCase()
                  ) : (
                    <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                      REQUERIDO
                    </Box>
                  )}
                </Typography>
              )}
              {!almacenLoteProps?.ocultarTextoLote && (
                <Typography variant="caption" display="flex" gap={0.5} noWrap>
                  <Box component="span" sx={{ fontWeight: 700, color: 'info.main' }}>
                    LOTE:
                  </Box>
                  {item.lote?.codigoLote ? (
                    item.lote.codigoLote.toUpperCase()
                  ) : item.gestionArticulo === apiGestionArticulo.LOTE ? (
                    <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
                      REQUERIDO
                    </Box>
                  ) : (
                    '--'
                  )}
                </Typography>
              )}
            </Stack>
          </TableCell>
        )}

        {!precioProps?.ocultar && (
          <TableCell align="right">
            <MontoMonedaTexto
              monto={item.precio}
              sigla={moneda?.sigla}
              editar={!!onChangePrecio}
              lista
              onChange={(v) => onChangePrecio?.({ index, item, precio: v ?? 0 })}
              montoProps={{ textAlign: 'right', sx: { fontWeight: 700, color: 'text.primary' } }}
              decimales={precioProps?.nroDecimales ?? 2}
            />
          </TableCell>
        )}

        {!descProps?.ocultar && (
          <TableCell align="right">
            <MontoMonedaTexto
              monto={item.descuento}
              sigla={moneda?.sigla}
              editar={!!onChangeDescuento}
              lista
              onChange={(v) => onChangeDescuento?.({ index, item, descuento: v ?? 0 })}
              montoProps={{ textAlign: 'right' }}
              decimales={descProps?.nroDecimales ?? 2}
            />
          </TableCell>
        )}

        {/* INYECCIÓN: FIN (Por defecto) */}
        {renderColumnasDinamicas('fin')}

        {!opcionesProps?.ocultar && (
          <TableCell align="center">
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              justifyContent="center"
              sx={{ whiteSpace: 'nowrap' }} // Mantiene la protección responsiva
            >
              {/* --- INYECCIÓN DE ACCIONES EXTRA --- */}
              {opcionesProps.renderExtraActions && opcionesProps.renderExtraActions(item, index)}

              {onChangeDetalleExtra && (
                <PopoverTexto
                  name={`det-extra-${item.id}`}
                  iconButtonProps={{
                    size: 'small',
                  }}
                  title={'Agregar detalle extra'}
                  value={item.detalleExtra ?? ''}
                  onChange={(v) => onChangeDetalleExtra({ index, item, detalleExtra: v.target.value })}
                />
              )}

              {onDeleteArticulo && (
                <IconButton
                  color="error"
                  title={'Quitar línea'}
                  onClick={() => onDeleteArticulo({ index, item })}
                  size="small"
                >
                  <DeleteForeverOutlined />
                </IconButton>
              )}
            </Stack>
          </TableCell>
        )}
      </StyledTableRow>
    )
  },
)

/**
 * Componente Principal
 * @param props
 * @constructor
 */
const CarritoArticulos: FunctionComponent<CarritoProps> = (props) => {
  const {
    articulos = [],
    titulo,
    moneda,
    monedaPrimaria,
    tipoCambio,
    onChangeTipoCambio,
    maxHeight = '60vh',
    opcionesProps,
    articuloProps,
    precioProps,
    descProps,
    cantidadProps,
    almacenLoteProps,
    unidadMedidaProps = { ocultar: true },
    bgColor = 'primary',
    striped = true,
    hover = false,
    columnasExtra = [],
  } = props

  // --- HELPER DE INYECCIÓN (HEAD) ---
  const renderHeadersDinamicos = (ubicacionTarget: UbicacionColumnaExtra) => {
    return columnasExtra
      .filter((col) => !col.ocultar && (col.ubicacion || 'fin') === ubicacionTarget)
      .map((col) => {
        const {
          id,
          label,
          headCellProps,
          ubicacion: _ubicacion,
          renderCell: _renderCell,
          ocultar: _ocultar,
          ...cellProps
        } = col

        return (
          <TableCell key={`head-${id}`} {...cellProps} {...headCellProps}>
            {label}
          </TableCell>
        )
      })
  }

  if (articulos.length === 0) {
    return <CarritoVacio />
  }

  const esMonedaDiferente = moneda?.sigla !== monedaPrimaria?.sigla

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
        <Grid size="grow">
          {titulo && (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {titulo}
            </Typography>
          )}
        </Grid>
        {esMonedaDiferente && (
          <Grid size="auto">
            <MontoMonedaTexto
              label={
                <Typography variant="caption" sx={{ mr: 1 }}>
                  T.C.
                </Typography>
              }
              monto={tipoCambio}
              sigla={monedaPrimaria.sigla}
              editar={!!onChangeTipoCambio}
              onChange={(v) => onChangeTipoCambio?.(v ?? 1)}
            />
          </Grid>
        )}
      </Grid>

      <StyledTableContainer sx={{ maxHeight, overflowY: 'auto' }} bgColor={bgColor}>
        <Table size="small" stickyHeader sx={{ minWidth: 750 }}>
          <StyledTableHead bgColor={bgColor}>
            <TableRow>
              {opcionesProps?.mostrarNroItem && (
                <TableCell align="center" width={40}>
                  #
                </TableCell>
              )}

              {/* HEAD INYECCIÓN: INICIO */}
              {renderHeadersDinamicos('inicio')}

              {!cantidadProps?.ocultar && (
                <TableCell
                  align="right"
                  width={cantidadProps?.width ?? 105}
                  sx={{ minWidth: cantidadProps?.minWidth }}
                >
                  {cantidadProps?.label || 'Cant.'}
                </TableCell>
              )}

              {/* HEAD INYECCIÓN: DESPUÉS DE CANTIDAD */}
              {renderHeadersDinamicos('despues-cantidad')}

              {!unidadMedidaProps.ocultar && (
                <TableCell
                  align="left"
                  width={unidadMedidaProps?.width ?? 100}
                  sx={{ minWidth: unidadMedidaProps?.minWidth }}
                >
                  {unidadMedidaProps?.label || 'U.M.'}
                </TableCell>
              )}

              {!articuloProps?.ocultar && (
                <TableCell
                  align="left"
                  width={articuloProps?.width}
                  sx={{ minWidth: articuloProps?.minWidth ?? 220 }}
                >
                  {articuloProps?.label || 'Artículo'}
                </TableCell>
              )}

              {/* HEAD INYECCIÓN: DESPUÉS DE ARTÍCULO */}
              {renderHeadersDinamicos('despues-articulo')}

              {!almacenLoteProps?.ocultar && (
                <TableCell
                  align="left"
                  width={almacenLoteProps?.width ?? 160}
                  sx={{ minWidth: almacenLoteProps?.minWidth }}
                >
                  {almacenLoteProps?.label || 'Almacén / Lote'}
                </TableCell>
              )}
              {!precioProps?.ocultar && (
                <TableCell
                  align="right"
                  width={precioProps?.width ?? 110}
                  sx={{ minWidth: precioProps?.minWidth }}
                >
                  {precioProps?.label || 'Precio'}
                </TableCell>
              )}
              {!descProps?.ocultar && (
                <TableCell
                  align="right"
                  width={descProps?.width ?? 90}
                  sx={{ minWidth: descProps?.minWidth }}
                >
                  {descProps?.label || 'Desc.'}
                </TableCell>
              )}

              {/* HEAD INYECCIÓN: FIN */}
              {renderHeadersDinamicos('fin')}
              {!opcionesProps?.ocultar && (
                <TableCell
                  align="center"
                  width={opcionesProps?.width ?? 80}
                  sx={{ minWidth: opcionesProps?.minWidth }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </StyledTableHead>
          <StyledTableBody bgColor={bgColor} striped={striped} hover={hover}>
            {articulos.map((item, index) => (
              <ArticuloRow key={item.id || index} item={item} index={index} props={props} />
            ))}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  )
}

export default memo(CarritoArticulos)
