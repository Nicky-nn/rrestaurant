import { DeleteForever, ShoppingCart } from '@mui/icons-material'
import {
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
  Tooltip,
  Typography,
} from '@mui/material'
import { amber, grey } from '@mui/material/colors'
import React, { FC, FunctionComponent, memo } from 'react'

import { IconButtonTextAreaPopover } from '../../../../base/components/MyInputs/IconButtonTextAreaPopover.tsx'
import MontoMonedaTexto from '../../../../base/components/PopoverMonto/MontoMonedaTexto'
import { ArticuloOperacionInputProps } from '../../../../interfaces/articuloOperacion.ts'
import { apiGestionArticulo } from '../../../../interfaces/gestionArticulo.ts'
import { MonedaProps } from '../../../../interfaces/monedaPrecio.ts'

// Estilos para las celdas de la tabla
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: '7px 5px',
  },
  [`&.${tableCellClasses.body}`]: {
    padding: '0px',
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
  // Evento cuando se actualiza el articulo
  onUpdateArticulo?: (index: number, field: ArticuloOperacionInputProps) => void
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
  // Si se despliega la columna de almacen y lote
  mostrarAlmacenLote?: boolean
  // Si se muestra la columna de mostrar opciones, default true
  mostrarOpciones?: boolean
  // Si se muestra la columna Acciones, option delete
  mostrarOptionDelete?: boolean
  // Si se muestra la columna Acciones, option detalle extra
  mostrarOptionDetalleExtra?: boolean
}

type Props = OwnProps

// Definimos las props para la fila
interface RowProps {
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
  mostrarAlmacenLote?: boolean
  mostrarOpciones?: boolean
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
    mostrarOpciones = true,
    mostrarAlmacenLote = true,
    maxHeight = '100%',
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

  if (articulos.length === 0) {
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
  const ArticuloRow: FC<RowProps> = memo((props) => {
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
      mostrarAlmacenLote = true,
      mostrarOpciones = true,
      onChangeDetalleExtra,
    } = props

    const RowArticuloText: FC<{ itemArticulo: ArticuloOperacionInputProps }> = ({
      itemArticulo,
    }) => (
      <Box>
        <Typography
          color={'primary'}
          fontSize={12}
          display={'inline'}
          className="ca-codigo-articulo"
          sx={{
            fontWeight: 500,
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
          sx={{ ml: 0.5, fontStyle: 'italic', color: grey[700] }}
          display={'inline'}
        >
          {itemArticulo.detalleExtra || ''}
        </Typography>
        <Typography fontSize={10.5} sx={{ color: grey[600] }}>
          {itemArticulo.articuloUnidadMedida?.nombreUnidadMedida}
        </Typography>
      </Box>
    )

    return (
      <StyledTableRow>
        <StyledTableCell
          sx={{
            backgroundColor: indexActivo === index ? amber['A100'] : 'none',
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
        {mostrarAlmacenLote && (
          <StyledTableCell sx={{ p: 0, m: 0 }}>
            <Box>
              <Box sx={{ display: 'flex', width: 149, pl: 0.5, pr: 0.5 }}>
                <Typography
                  fontSize={'smaller'}
                  sx={{ fontWeight: 500, mr: 0.5 }}
                  color={'secondary'}
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
              <Box sx={{ display: 'flex', width: 149, pl: 0.5, gap: 0.5 }}>
                <Typography
                  fontSize={'smaller'}
                  sx={{ fontWeight: 500 }}
                  color={'secondary'}
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
            </Box>
          </StyledTableCell>
        )}
        <StyledTableCell align={'right'}>
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
                fontSize: '0.86rem',
              },
            }}
          />
        </StyledTableCell>
        <StyledTableCell align={'right'}>
          <MontoMonedaTexto
            id={`precio-${item.id}`}
            monto={item.precio}
            min={0}
            step={1}
            editar={Boolean(onChangePrecio)}
            lista={true}
            sigla={moneda?.sigla}
            onChange={(precio) => {
              if (precio && onChangePrecio) onChangePrecio({ index, item, precio })
            }}
            montoProps={{
              textAlign: 'right',
              sx: {
                fontWeight: 500,
              },
            }}
          />
        </StyledTableCell>
        <StyledTableCell align={'right'}>
          <MontoMonedaTexto
            id={`descuento-${item.id}`}
            monto={item.descuento}
            min={0}
            step={1}
            editar={Boolean(onChangeDescuento)}
            sigla={moneda?.sigla}
            lista
            onChange={(descuento) => {
              if (descuento && onChangeDescuento)
                onChangeDescuento({ index, item, descuento })
            }}
            montoProps={{
              textAlign: 'right',
              sx: {
                fontWeight: 500,
              },
            }}
          />
        </StyledTableCell>

        {mostrarOpciones && (
          <StyledTableCell>
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
              <StyledTableCell align="left" sx={{ minWidth: 245 }}>
                Articulo
              </StyledTableCell>
              {mostrarAlmacenLote && (
                <StyledTableCell width={150}>Almacen / Lote</StyledTableCell>
              )}
              <StyledTableCell align={'right'} width={100}>
                Cantidad
              </StyledTableCell>
              <StyledTableCell align="center" width={120}>
                Precio
              </StyledTableCell>
              <StyledTableCell align="center" width={90}>
                Desc.
              </StyledTableCell>
              {mostrarOpciones && <StyledTableCell width={60}>Opciones</StyledTableCell>}
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

export default CarritoArticulos
