import { DeleteForever, ShoppingCart } from '@mui/icons-material'
import {
  alpha,
  Box,
  ButtonGroup,
  Divider,
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
  Tooltip,
  Typography,
} from '@mui/material'
import React, { FC, FunctionComponent, memo } from 'react'

import { IconButtonTextAreaPopover } from '../../../../../base/components/MyInputs/IconButtonTextAreaPopover.tsx'
import MontoMonedaTexto from '../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { ArticuloOperacionInputProps } from '../../../../../interfaces/articuloOperacion.ts'
import { apiGestionArticulo } from '../../../../../interfaces/gestionArticulo.ts'
import { MonedaProps } from '../../../../../interfaces/monedaPrecio.ts'

// Estilos para las celdas de la tabla
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: '7px 5px',
  },
  [`&.${tableCellClasses.body}`]: {
    padding: '2px 0px 2px 0px',
  },
}))

// Estilo para las filas
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}))

// Estilo para el boton de la celda que contiene la accion para la modificación
const StyleListItemButton = styled(ListItemButton)(({ theme }) => ({
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  paddingTop: theme.spacing(0.6),
  paddingBottom: theme.spacing(0.6),
}))

interface OwnProps {
  id?: string
  // Titulo de la tarjeta
  titulo?: string
  // Máximo alto de la tabla
  maxHeight?: string | number
  // Moneda de operación
  moneda: MonedaProps | null
  // Moneda Primaria de sistema
  monedaPrimaria: MonedaProps
  // Tipo de cambio según la moneda de operación
  tipoCambio: number
  // Articulos para el renderizado
  articulos: ArticuloOperacionInputProps[]
  // Indice del articulo activo en el carrito
  indexActivo: number | null
  // Evento cuando se cambia el tipo de cambio
  onChangeTipoCambio?: (tipoCambio: number) => void
  // Evento cambio de cantidad, si se envía el componente se convierte en modificable
  onChangeCantidad?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    cantidad: number
  }) => void
  // Evento cambio de precio
  onChangePrecio?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    precio: number
  }) => void
  // Evento cambio de descuento
  onChangeDescuento?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    descuento: number
  }) => void
  // Evento cambio de detalle extra
  onChangeDetalleExtra?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    detalleExtra: string
  }) => void
  // Evento cuando se realiza click en el articulo
  onClickArticulo?: (resp?: { index: number; item: ArticuloOperacionInputProps }) => void
  // Evento cuando se elmina el articulo
  onDeleteArticulo?: (resp?: { index: number; item: ArticuloOperacionInputProps }) => void
  // Propiedades de columna opciones
  opcionesProps?: {
    // Nombre de columna
    label?: string
    // Si se muestra la columna de mostrar opciones, default false
    ocultar?: boolean
    // Si se muestra la columna Acciones, option delete
    mostrarOptionDelete?: boolean
    // Si se muestra la columna Acciones, option detalle extra
    mostrarOptionDetalleExtra?: boolean
  }
  // Propiedades de columna Articulo
  articuloProps?: {
    label?: string // Nombre de la columna
    // Muestra pequeña descripcion debajo del nombre del articulo default false
    ocultarUnidadMedidaText?: boolean
    // default false
    ocultar?: boolean
  }
  // Propiedades columna precio
  precioProps?: {
    label?: string // Nombre de la columna
    // mostrar Precio default false
    ocultar?: boolean
  }
  // Propiedades de la columna descuento
  descProps?: {
    label?: string // Nombre de la columna
    // Muestra la columna del descuento default true
    ocultar?: boolean
  }
  // Propiedades de la columna descuento
  cantidadProps?: {
    label?: string // Nombre de la columna
    // Muestra la columna de cantidad default false
    ocultar?: boolean
  }
  // Propiedades de la columna AlmacenLote
  almacenLoteProps?: {
    label?: string // Nombre de la columna
    ocultarTextoAlmacen?: boolean
    ocultarTextoLote?: boolean
    // default false
    ocultar?: boolean
  }
  unidadMedidaProps?: {
    label?: string
    // default false
    ocultar?: boolean
  }
}

type Props = OwnProps

// Definimos las props para la fila
export interface RowCarritoArticulosProps {
  index: number
  item: ArticuloOperacionInputProps
  moneda: MonedaProps | null
  monedaPrimaria: MonedaProps
  tipoCambio: number
  indexActivo: number | null
  onChangeCantidad?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    cantidad: number
  }) => void
  onChangePrecio?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    precio: number
  }) => void
  onChangeDescuento?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    descuento: number
  }) => void
  onChangeDetalleExtra?: (resp?: {
    index: number
    item: ArticuloOperacionInputProps
    detalleExtra: string
  }) => void
  onClickArticulo?: (resp?: { index: number; item: ArticuloOperacionInputProps }) => void
  onDeleteArticulo?: (resp?: { index: number; item: ArticuloOperacionInputProps }) => void
}
/**
 * Carrito de Articulos configurable segun necesidad, solo aplicable a sistemas basados en inventarios.
 * @author isi-template
 * @param props
 * @constructor
 */
const CarritoArticulos: FunctionComponent<Props> = (props) => {
  const {
    articulos,
    titulo,
    moneda,
    monedaPrimaria,
    tipoCambio,
    onChangeTipoCambio,
    maxHeight = '100%',
    precioProps = {},
    descProps = {},
    almacenLoteProps = {},
    cantidadProps = {},
    unidadMedidaProps = {
      ocultar: true,
    },
    opcionesProps = {},
    articuloProps = {},
  } = props

  /***************************************************************************/
  /***************************************************************************/

  /***************************************************************************/
  /***************************************************************************/
  /***************************************************************************/
  const Title = titulo && (
    <Divider textAlign={'left'} sx={{ mt: 0, mb: 0 }}>
      <strong>{titulo}</strong>
    </Divider>
  )

  if (!articulos || articulos.length === 0) {
    return (
      <Box>
        {Title && Title}
        <Paper
          elevation={0}
          sx={{ textAlign: 'center', color: (theme) => theme.palette.grey[500] }}
        >
          <ShoppingCart sx={{ fontSize: 80 }} />
          <Typography variant={'body1'} color={'warning'} gutterBottom>
            Requiere al menos 1 articulo
          </Typography>
        </Paper>
      </Box>
    )
  }
  /*************************************************************************/
  /*************************************************************************/
  // Renderizado de las filas
  const ArticuloRow: FC<RowCarritoArticulosProps> = memo((props) => {
    const {
      item,
      index,
      moneda,
      indexActivo,
      onChangeCantidad,
      onChangePrecio,
      onChangeDescuento,
      onClickArticulo,
      onDeleteArticulo,
      onChangeDetalleExtra,
    } = props

    const RowArticuloText: FC<{ itemArticulo: ArticuloOperacionInputProps }> = ({
      itemArticulo,
    }) => (
      <Box>
        <Typography
          fontSize={12}
          display={'inline'}
          className="ca-codigo-articulo"
          sx={{
            fontWeight: 500,
            color: (theme) =>
              theme.palette.mode === 'dark' ? 'cyan.light' : 'primary.main',
          }}
        >
          {itemArticulo.codigoArticulo},&nbsp;&nbsp;
        </Typography>
        <Typography
          fontSize={12.5}
          display={'inline'}
          className={'ca-nombre-articulo'}
          sx={{
            fontWeight: 400,
          }}
        >
          {itemArticulo.nombreArticulo}
        </Typography>
        <Typography
          fontSize={12.2}
          sx={{ ml: 0.5, fontStyle: 'italic', color: 'text.primary' }}
          display={'inline'}
        >
          {itemArticulo.detalleExtra || ''}
        </Typography>

        {!articuloProps?.ocultarUnidadMedidaText && (
          <Typography
            fontSize={10.5}
            sx={{ color: 'text.secondary' }}
            title={`${itemArticulo.articuloUnidadMedida?.codigoUnidadMedida || ''} - ${itemArticulo.articuloUnidadMedida?.nombreUnidadMedida || ''}`}
          >
            {itemArticulo.articuloUnidadMedida?.nombreUnidadMedida}
          </Typography>
        )}
      </Box>
    )

    const bgColor = (theme: Theme) =>
      indexActivo === index ? alpha(theme.palette.orange.light, 0.3) : 'none'

    return (
      <StyledTableRow>
        {!cantidadProps?.ocultar && (
          <StyledTableCell
            align={'right'}
            sx={{
              backgroundColor: bgColor,
            }}
          >
            <MontoMonedaTexto
              id={`cantidad-${item.id}`}
              monto={item.cantidad}
              min={0.1}
              step={1}
              editar={Boolean(onChangeCantidad)}
              lista={true}
              onChange={(cantidad) => {
                if (cantidad && onChangeCantidad)
                  onChangeCantidad({ index, item, cantidad })
              }}
              montoProps={{
                textAlign: 'right',
                sx: {
                  fontWeight: 500,
                  fontSize: '0.90rem',
                },
              }}
            />
          </StyledTableCell>
        )}

        {!unidadMedidaProps?.ocultar && (
          <StyledTableCell
            sx={{
              backgroundColor: bgColor,
            }}
          >
            <Typography
              fontSize={11}
              sx={{ color: 'text.primary', ml: 0.5, maxWidth: 120 }}
              title={` Cod. ${item.articuloUnidadMedida?.codigoUnidadMedida} - ${item.articuloUnidadMedida?.nombreUnidadMedida}`}
              noWrap
            >
              {item.articuloUnidadMedida?.nombreUnidadMedida}
            </Typography>
          </StyledTableCell>
        )}

        <StyledTableCell
          sx={{
            backgroundColor: bgColor,
          }}
        >
          {onClickArticulo ? (
            <StyleListItemButton
              sx={{
                textAlign: 'left',
                '& .MuiTypography-root.ca-codigo-articulo': {
                  textDecorationLine: 'underline',
                  textUnderlineOffset: 2,
                },
              }}
              onClick={() => onClickArticulo({ index, item })}
            >
              <RowArticuloText itemArticulo={item} />
            </StyleListItemButton>
          ) : (
            <Box sx={{ p: 0.5 }}>
              <RowArticuloText itemArticulo={item} />
            </Box>
          )}
        </StyledTableCell>
        {!almacenLoteProps?.ocultar && (
          <StyledTableCell sx={{ p: 0, m: 0, backgroundColor: bgColor }}>
            <Box>
              {!almacenLoteProps?.ocultarTextoAlmacen && (
                <Box sx={{ display: 'flex', width: 149, pl: 0.5, pr: 0.5 }}>
                  <Typography
                    fontSize={'smaller'}
                    sx={{ fontWeight: 500, mr: 0.5 }}
                    color={'success.light'}
                    display={'inline'}
                    title={'Almacen'}
                  >
                    ALM.
                  </Typography>
                  {item.almacen ? (
                    <Tooltip
                      title={`${item.almacen.codigoAlmacen || ''} - ${item.almacen.nombre || ''}`}
                      disableInteractive
                      placement={'top'}
                      arrow
                    >
                      <Typography fontSize={'smaller'} noWrap>
                        {item.almacen.nombre.toUpperCase()}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Tooltip
                      title={`Almacen Requerido`}
                      disableInteractive
                      placement={'top'}
                      arrow
                    >
                      <Typography fontSize={'smaller'} noWrap color={'error'}>
                        <strong>REQUERIDO</strong>
                      </Typography>
                    </Tooltip>
                  )}
                </Box>
              )}
              {!almacenLoteProps?.ocultarTextoLote && (
                <Box sx={{ display: 'flex', width: 149, pl: 0.5, gap: 0.5 }}>
                  <Typography
                    fontSize={'smaller'}
                    sx={{ fontWeight: 500 }}
                    color={'success.light'}
                    title={'Lote'}
                  >
                    LOTE
                  </Typography>
                  {item.lote && (
                    <Tooltip
                      title={`${item.lote.codigoLote || ''} - ${item.lote.descripcion || ''}, Ven.: ${item.lote.fechaVencimiento || ''}`}
                      disableInteractive
                      placement={'top'}
                      arrow
                    >
                      <Typography fontSize={'smaller'} noWrap>
                        {item.lote.codigoLote.toUpperCase()}
                      </Typography>
                    </Tooltip>
                  )}
                  {!item.lote && (
                    <>
                      {item.gestionArticulo === apiGestionArticulo.LOTE ? (
                        <Tooltip
                          title={`Lote requerido`}
                          disableInteractive
                          placement={'top'}
                          arrow
                        >
                          <Typography fontSize={'smaller'} noWrap color={'error'}>
                            <strong>REQUERIDO</strong>
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title={`No requerido`}
                          disableInteractive
                          placement={'top'}
                          arrow
                        >
                          <Typography fontSize={'smaller'} noWrap>
                            --
                          </Typography>
                        </Tooltip>
                      )}
                    </>
                  )}
                </Box>
              )}
            </Box>
          </StyledTableCell>
        )}
        {!precioProps?.ocultar && (
          <StyledTableCell
            align={'right'}
            sx={{
              backgroundColor: bgColor,
            }}
          >
            <MontoMonedaTexto
              id={`precio-${item.id}`}
              monto={item.precio}
              min={0}
              step={1}
              editar={Boolean(onChangePrecio)}
              lista={true}
              sigla={moneda?.sigla}
              onChange={(precio) => {
                if (precio !== null && onChangePrecio)
                  onChangePrecio({ index, item, precio: precio ?? 0 })
              }}
              montoProps={{
                textAlign: 'right',
                sx: {
                  fontWeight: 500,
                },
              }}
            />
          </StyledTableCell>
        )}

        {!descProps?.ocultar && (
          <StyledTableCell
            align={'right'}
            sx={{
              backgroundColor: bgColor,
            }}
          >
            <MontoMonedaTexto
              id={`descuento-${item.id}`}
              monto={item.descuento}
              min={0}
              step={1}
              editar={Boolean(onChangeDescuento)}
              sigla={moneda?.sigla}
              lista
              onChange={(descuento) => {
                if (descuento !== null && onChangeDescuento)
                  onChangeDescuento({ index, item, descuento: descuento ?? 0 })
              }}
              montoProps={{
                textAlign: 'right',
                sx: {
                  fontWeight: 500,
                },
              }}
            />
          </StyledTableCell>
        )}

        {!opcionesProps?.ocultar && (
          <StyledTableCell
            sx={{
              backgroundColor: bgColor,
            }}
          >
            <ButtonGroup variant="text" aria-label="Op. articulo" sx={{ p: 0, m: 0 }}>
              {onDeleteArticulo && (
                <IconButton
                  title={'Quitar del carrito'}
                  aria-label="Quitar Articulo"
                  sx={{ p: 0.5 }}
                  onClick={() => onDeleteArticulo({ index, item })}
                >
                  <DeleteForever color={'error'} />
                </IconButton>
              )}
              {onChangeDetalleExtra && (
                <IconButtonTextAreaPopover
                  id={`det-extra-${item.id}`}
                  aria-label="Adicionar detalle extra"
                  aria-hidden={false}
                  iconButtonProps={{
                    color: 'primary',
                    'aria-label': 'Agregar Detalle Extra',
                    sx: { p: 0.5, mr: 0.7 },
                  }}
                  textFieldProps={{
                    label: 'Agregar Detalle Extra',
                  }}
                  initialValue={item.detalleExtra || ''}
                  onApply={(detalleExtra) => {
                    onChangeDetalleExtra({ index, item, detalleExtra })
                  }}
                />
              )}
            </ButtonGroup>
          </StyledTableCell>
        )}
      </StyledTableRow>
    )
  })

  return (
    <Box>
      <Grid container spacing={1}>
        {Title && moneda?.sigla === monedaPrimaria.sigla && (
          <Grid size={12}>{Title}</Grid>
        )}

        {moneda?.sigla !== monedaPrimaria?.sigla && (
          <>
            {Title && <Grid size={{ xs: 12, sm: 6, md: 7, lg: 8, xl: 10 }}>{Title}</Grid>}
            {!Title && <Grid size={{ xs: 12, sm: 6, md: 7, lg: 8, xl: 10 }}></Grid>}
            <Grid size={{ xs: 12, sm: 6, md: 5, lg: 4, xl: 2 }} sx={{ pr: 1 }}>
              <Stack direction={'row'} justifyContent={'right'} spacing={1}>
                <>
                  <MontoMonedaTexto
                    id={'carrito-tipo-cambio'}
                    label={
                      <Typography fontSize={'smaller'} sx={{ mr: 1 }} display={'inline'}>
                        T.C.
                      </Typography>
                    }
                    monto={tipoCambio}
                    sigla={monedaPrimaria.sigla}
                    min={0}
                    step={0.01}
                    editar={Boolean(onChangeTipoCambio)}
                    onChange={(value) => {
                      if (value && onChangeTipoCambio) onChangeTipoCambio(value)
                    }}
                  />
                </>
              </Stack>
            </Grid>
          </>
        )}
      </Grid>

      <TableContainer component={Paper} sx={{ maxHeight }}>
        <Table
          sx={{ minWidth: 740, width: '100%' }}
          size="small"
          stickyHeader
          aria-label={titulo || 'tabla carrito de compras'}
        >
          <TableHead>
            <StyledTableRow>
              {!cantidadProps?.ocultar && (
                <StyledTableCell align={'right'} width={100}>
                  {cantidadProps?.label ?? 'Cantidad'}
                </StyledTableCell>
              )}

              {!unidadMedidaProps?.ocultar && (
                <StyledTableCell align={'left'} width={120}>
                  {unidadMedidaProps?.label ?? 'Unidad Medida'}
                </StyledTableCell>
              )}
              {!articuloProps?.ocultar && (
                <StyledTableCell align="left" sx={{ minWidth: 245 }}>
                  {articuloProps?.label ?? 'Articulo'}
                </StyledTableCell>
              )}
              {!almacenLoteProps.ocultar && (
                <StyledTableCell width={150}>
                  {almacenLoteProps?.label ?? 'Almacen / Lote'}
                </StyledTableCell>
              )}
              {!precioProps.ocultar && (
                <StyledTableCell align="right" width={120}>
                  {precioProps?.label ?? 'Precio'}
                </StyledTableCell>
              )}
              {!descProps?.ocultar && (
                <StyledTableCell align="right" width={90}>
                  {descProps?.label ?? 'Desc.'}
                </StyledTableCell>
              )}

              {!opcionesProps?.ocultar && (
                <StyledTableCell width={60}>
                  {opcionesProps?.label ?? 'Opciones'}
                </StyledTableCell>
              )}
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {articulos.map((item, index) => (
              <ArticuloRow key={item.id} index={index} item={item} {...props} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default memo(CarritoArticulos)
