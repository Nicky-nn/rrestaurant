import { DeleteForever, ShoppingCart } from '@mui/icons-material'
import {
  Box,
  ButtonGroup,
  Grid,
  IconButton,
  ListItemButton,
  Paper,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@mui/material'
import React, { FunctionComponent, memo } from 'react'

import { IconButtonTextAreaPopover } from '../../../../../base/components/MyInputs/IconButtonTextAreaPopover.tsx'
import MontoMonedaTexto from '../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { ArticuloOperacionInputProps } from '../../../../../interfaces/articuloOperacion.ts'
import { apiGestionArticulo } from '../../../../../interfaces/gestionArticulo.ts'
import { MonedaProps } from '../../../../../interfaces/monedaPrecio.ts'
import { alphaByTheme } from '../../../../../utils/colorUtils.ts'

// --- Interfaces Documentadas ---

/**
 * Propiedades de configuración para las columnas individuales del carrito.
 */
interface BaseColProps {
  /** Etiqueta personalizada para la cabecera de la columna */
  label?: string
  /** Si es true, oculta completamente la columna */
  ocultar?: boolean
}

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
  opcionesProps?: BaseColProps & { mostrarNroItem?: boolean }
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
}

// --- Estilos Estáticos ---
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: alphaByTheme(theme.palette.primary.main, theme, 0.6, 0.85),
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    padding: '8px 6px',
  },
  [`&.${tableCellClasses.body}`]: {
    padding: '4px 2px',
    fontSize: '0.875rem',
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: theme.transitions.create('background-color'),
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: alphaByTheme(theme.palette.primary.main, theme, 0.09),
  },
}))

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
    } = props

    const isActive = indexActivo === index
    // Cuando se encuentra activo
    const rowBg = (theme: Theme) =>
      isActive ? alphaByTheme(theme.palette.primary.main, theme, 0.2) : 'inherit'

    return (
      <StyledTableRow sx={{ backgroundColor: rowBg }}>
        {opcionesProps?.mostrarNroItem && (
          <StyledTableCell align="center" width={40}>
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
          </StyledTableCell>
        )}

        {!cantidadProps?.ocultar && (
          <StyledTableCell align="right" width={110}>
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
          </StyledTableCell>
        )}

        {!unidadMedidaProps.ocultar && (
          <StyledTableCell align="left" width={100}>
            <Typography variant="caption" noWrap>
              {item.articuloUnidadMedida?.nombreUnidadMedida}
            </Typography>
          </StyledTableCell>
        )}

        {/* FIX: Alineación estricta a la izquierda para la columna del Artículo */}
        <StyledTableCell align="left" sx={{ minWidth: 220 }}>
          <Stack
            direction="column"
            component={onClickArticulo ? ListItemButton : Box}
            onClick={onClickArticulo ? () => onClickArticulo({ index, item }) : undefined}
            // Aseguramos que el contenido del Stack empiece desde la izquierda
            sx={{ p: 0.5, borderRadius: 1, alignItems: 'flex-start', textAlign: 'left' }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600, mr: 0.75 }}>
                {item.codigoArticulo}
              </Box>
              {item.nombreArticulo}
            </Typography>

            {item.detalleExtra && (
              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 0.25 }}>
                {item.detalleExtra}
              </Typography>
            )}

            {!articuloProps?.ocultarUnidadMedidaText && item.articuloUnidadMedida && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {item.articuloUnidadMedida.nombreUnidadMedida}
              </Typography>
            )}
          </Stack>
        </StyledTableCell>

        {!almacenLoteProps?.ocultar && (
          <StyledTableCell align="left" width={160}>
            <Stack spacing={0.25} alignItems="flex-start">
              {!almacenLoteProps?.ocultarTextoAlmacen && (
                <Typography variant="caption" display="flex" gap={0.5} noWrap>
                  <Box component="span" sx={{ fontWeight: 700, color: 'success.main' }}>
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
          </StyledTableCell>
        )}

        {!precioProps?.ocultar && (
          <StyledTableCell align="right" width={110}>
            <MontoMonedaTexto
              monto={item.precio}
              sigla={moneda?.sigla}
              editar={!!onChangePrecio}
              lista
              onChange={(v) => onChangePrecio?.({ index, item, precio: v ?? 0 })}
              montoProps={{ textAlign: 'right', sx: { fontWeight: 700, color: 'text.primary' } }}
              decimales={precioProps?.nroDecimales ?? 2}
            />
          </StyledTableCell>
        )}

        {!descProps?.ocultar && (
          <StyledTableCell align="right" width={90}>
            <MontoMonedaTexto
              monto={item.descuento}
              sigla={moneda?.sigla}
              editar={!!onChangeDescuento}
              lista
              onChange={(v) => onChangeDescuento?.({ index, item, descuento: v ?? 0 })}
              montoProps={{ textAlign: 'right' }}
              decimales={descProps?.nroDecimales ?? 2}
            />
          </StyledTableCell>
        )}

        {!opcionesProps?.ocultar && (
          <StyledTableCell align="center" width={80}>
            <ButtonGroup size="small" variant="text">
              {onDeleteArticulo && (
                <IconButton color="error" onClick={() => onDeleteArticulo({ index, item })} size="small">
                  <DeleteForever fontSize="small" />
                </IconButton>
              )}
              {onChangeDetalleExtra && (
                <IconButtonTextAreaPopover
                  id={`det-extra-${item.id}`}
                  initialValue={item.detalleExtra || ''}
                  onApply={(v) => onChangeDetalleExtra({ index, item, detalleExtra: v })}
                />
              )}
            </ButtonGroup>
          </StyledTableCell>
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
  } = props

  if (articulos.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', backgroundColor: 'action.hover' }}>
        <ShoppingCart sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary">
          {titulo || 'Carrito Vacío'}
        </Typography>
        <Typography variant="body2" color="warning.main">
          Se requiere al menos un artículo para procesar.
        </Typography>
      </Paper>
    )
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

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {opcionesProps?.mostrarNroItem && <StyledTableCell align="center">#</StyledTableCell>}
              {!cantidadProps?.ocultar && (
                <StyledTableCell align="right">{cantidadProps?.label || 'Cant.'}</StyledTableCell>
              )}
              {!unidadMedidaProps.ocultar && (
                <StyledTableCell align="left">{unidadMedidaProps?.label || 'U.M.'}</StyledTableCell>
              )}

              {!articuloProps?.ocultar && (
                <StyledTableCell align="left">{articuloProps?.label || 'Artículo'}</StyledTableCell>
              )}

              {!almacenLoteProps?.ocultar && (
                <StyledTableCell align="left">{almacenLoteProps?.label || 'Almacén / Lote'}</StyledTableCell>
              )}
              {!precioProps?.ocultar && (
                <StyledTableCell align="right">{precioProps?.label || 'Precio'}</StyledTableCell>
              )}
              {!descProps?.ocultar && (
                <StyledTableCell align="right">{descProps?.label || 'Desc.'}</StyledTableCell>
              )}
              {!opcionesProps?.ocultar && <StyledTableCell align="center">Acciones</StyledTableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {articulos.map((item, index) => (
              <ArticuloRow key={item.id || index} item={item} index={index} props={props} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default memo(CarritoArticulos)
