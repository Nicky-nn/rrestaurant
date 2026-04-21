import { AllInclusive, Close } from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { blue, lightBlue } from '@mui/material/colors'
import React, { FunctionComponent, memo, useState } from 'react'
import { Control, useWatch } from 'react-hook-form'

import { SimpleBox } from '../../../../../../base/components/Container/SimpleBox.tsx'
import MontoMonedaTexto from '../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { InventarioOperacionProps } from '../../../../../../interfaces/InventarioOperacion.ts'
import { MonedaProps } from '../../../../../../interfaces/monedaPrecio.ts'
import { alphaByTheme } from '../../../../../../utils/colorUtils.ts'

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: '0.6rem',
    padding: '0px !important',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.74rem',
    padding: '5px',
  },
}))

// =========================================================================
// ENVOLTORIO AISLADO PARA EL PRECIO
// Evita que toda la tarjeta (y la pesada tabla de inventario)
// se re-renderice cada vez que el usuario teclea en el input de precio.
// =========================================================================
interface PrecioObservadorProps {
  control: Control<ArticuloOperacionInputProps>
  moneda: MonedaProps
}

const PrecioObservador: FunctionComponent<PrecioObservadorProps> = ({ control, moneda }) => {
  const [precioWatch] = useWatch({ control, name: ['precio'] })

  return (
    <MontoMonedaTexto
      monto={precioWatch || 0}
      sigla={moneda.sigla}
      montoProps={{ fontWeight: 500, color: lightBlue[500] }}
      boxProps={{ fontSize: '1.1rem' }}
    />
  )
}

// =========================================================================
// TARJETA PRINCIPAL DE INFORMACIÓN
// =========================================================================
interface OwnProps {
  control: Control<ArticuloOperacionInputProps>
  articulo: ArticuloProps
  moneda: MonedaProps
  inventario: InventarioOperacionProps | null
}

const ArticuloInventarioInformacionCard: FunctionComponent<OwnProps> = memo(
  ({ articulo, control, moneda, inventario }) => {
    const [openViewer, setOpenViewer] = useState(false)
    const renderInventario = () => {
      if (!inventario) {
        return (
          <SimpleBox sx={{ p: 0, m: 0 }}>
            <Alert severity="warning">
              Aún no cuenta con inventario para la sucursal, almacén solicitado.
            </Alert>
          </SimpleBox>
        )
      }

      return (
        <TableContainer component={SimpleBox} sx={{ padding: '0', width: '100%', m: 0, mt: 1 }}>
          <Table size="small" sx={{ border: 'none' }}>
            <TableBody>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Tipo Art.</StyledTableCell>
                <StyledTableCell>{articulo.tipoArticulo?.descripcion}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Sucursal</StyledTableCell>
                <StyledTableCell>{inventario.sucursal.codigo}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Almacen</StyledTableCell>
                <StyledTableCell>{inventario.almacen.nombre}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Lote</StyledTableCell>
                <StyledTableCell>{inventario.lote?.descripcion || '--'}</StyledTableCell>
              </TableRow>

              {/* ===== STOCK ===== */}
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Stock</StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => alphaByTheme(theme.palette.blue.main, theme, 0.6),
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.stock}
                      sigla={inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida}
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                  )}
                </StyledTableCell>
              </TableRow>

              {/* ===== SOLICITADO ===== */}
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Solicitado</StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => alphaByTheme(theme.palette.orange.main, theme, 0.5),
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.solicitado}
                      sigla={inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida}
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                  )}
                </StyledTableCell>
              </TableRow>

              {/* ===== COMPROMETIDO ===== */}
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Comprometido</StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => alphaByTheme(theme.palette.yellow.main, theme, 0.7),
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.comprometido}
                      sigla={inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida}
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                  )}
                </StyledTableCell>
              </TableRow>

              {/* ===== DISPONIBLE ===== */}
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Disponible</StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => alphaByTheme(theme.palette.green.light, theme, 0.5),
                    textAlign: 'right',
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.disponible}
                      sigla={inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida}
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                  )}
                </StyledTableCell>
              </TableRow>

              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Equivalencia</StyledTableCell>
                <StyledTableCell sx={{ textAlign: 'right' }}>
                  <MontoMonedaTexto
                    monto={inventario.articuloPrecio.cantidadBase}
                    sigla={articulo.articuloPrecioBase.articuloUnidadMedida.nombreUnidadMedida}
                  />
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Ver. Stock</StyledTableCell>
                <StyledTableCell>{articulo.verificarStock ? 'Sí' : 'No'}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Gestionado</StyledTableCell>
                <StyledTableCell>{articulo.gestionArticulo || '--'}</StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )
    }

    return (
      <Box>
        <CardHeader
          sx={{ p: 1 }}
          avatar={
            <CardActionArea
              sx={{
                borderRadius: '50%',
                border: (theme) => `0.81px solid ${theme.palette.grey[300]}`,
                p: 0.1,
              }}
              onClick={(e) => {
                if (articulo.imagen) {
                  e.currentTarget.blur()
                  setOpenViewer(true)
                }
              }}
            >
              <Avatar
                sx={{ bgcolor: blue[500], width: 70, height: 70 }}
                alt={articulo.nombreArticulo.charAt(0).toUpperCase()}
                src={articulo.imagen?.variants.thumbnail}
              >
                {articulo.nombreArticulo.charAt(0).toUpperCase()}
              </Avatar>
            </CardActionArea>
          }
          title={
            <Tooltip title={articulo.nombreArticulo} placement="top" disableInteractive>
              <Typography
                variant="subtitle1"
                fontSize="small"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: '1',
                  WebkitBoxOrient: 'vertical',
                  mb: -0.2,
                }}
              >
                {articulo.codigoArticulo} - {articulo.nombreArticulo}
              </Typography>
            </Tooltip>
          }
          subheader={
            <Typography variant="subtitle1" color="text.secondary">
              {/* Llamamos a nuestro micro-componente aislado */}
              <PrecioObservador control={control} moneda={moneda} />
            </Typography>
          }
        />
        <CardContent sx={{ mt: -1, padding: 1, pb: '10px !important' }}>{renderInventario()}</CardContent>

        {articulo.imagen && (
          <Dialog
            open={openViewer}
            onClose={() => setOpenViewer(false)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              backdrop: {
                sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
              },
            }}
          >
            <DialogTitle
              sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography fontWeight="bold">
                {articulo.codigoArticulo} - {articulo.nombreArticulo}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={() => setOpenViewer(false)}
                sx={{ color: (theme) => theme.palette.grey[500] }}
              >
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent
              dividers
              sx={{
                p: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 300,
              }}
            >
              <img
                src={
                  articulo.imagen.variants.medium ||
                  articulo.imagen.variants.square ||
                  articulo.imagen.variants.thumbnail
                }
                alt={articulo.nombreArticulo}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </Box>
    )
  },
)

export default ArticuloInventarioInformacionCard
