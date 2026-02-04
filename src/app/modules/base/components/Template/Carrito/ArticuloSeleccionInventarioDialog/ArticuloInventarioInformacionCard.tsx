import { AllInclusive } from '@mui/icons-material'
import {
  Alert,
  alpha,
  Avatar,
  CardActionArea,
  CardContent,
  CardHeader,
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
import { blue } from '@mui/material/colors'
import React, { FunctionComponent, memo } from 'react'
import { Control, useWatch } from 'react-hook-form'

import { SimpleBox } from '../../../../../../base/components/Container/SimpleBox.tsx'
import MontoMonedaTexto from '../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloOperacionInputProps } from '../../../../../../interfaces/articuloOperacion.ts'
import { InventarioOperacionProps } from '../../../../../../interfaces/InventarioOperacion.ts'
import { MonedaProps } from '../../../../../../interfaces/monedaPrecio.ts'

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: '0.6rem',
    padding: '0px !important',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.74rem',
    padding: '3px 5px',
  },
}))

interface OwnProps {
  control: Control<ArticuloOperacionInputProps>
  articulo: ArticuloProps
  moneda: MonedaProps
  inventario: InventarioOperacionProps | null
}

type Props = OwnProps

/**
 * Tarjeta de articulo con el inventario, describe las cantidades disponibles de stock según la unidad de medida
 * En case sea un articulo sin verificar stock, muestra el icono de infinito
 * @param props
 * @constructor
 */
const ArticuloInventarioInformacionCard: FunctionComponent<Props> = memo((props) => {
  const { articulo, control, moneda, inventario } = props

  const [precioWatch] = useWatch({ control, name: ['precio'] })

  /***********************************************************************************/
  /***********************************************************************************/
  /***********************************************************************************/

  const InventarioComponent = inventario ? (
    <>
      <TableContainer
        component={SimpleBox}
        sx={{ padding: '0', width: '100%', m: 0, mt: 0 }}
      >
        <Table size={'small'} sx={{ border: 'none' }}>
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
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 500 }}>Stock</StyledTableCell>
              <StyledTableCell
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.blue.main, 0.5),
                  // color: 'blue.contrastText',
                  textAlign: 'right',
                  fontWeight: 500,
                }}
              >
                {articulo.verificarStock && (
                  <MontoMonedaTexto
                    monto={inventario.stock}
                    sigla={
                      inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida
                    }
                  />
                )}
                {!articulo.verificarStock && (
                  <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                )}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 500 }}>Solicitado</StyledTableCell>
              <StyledTableCell
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.orange.main, 0.5),
                  textAlign: 'right',
                  fontWeight: 500,
                }}
              >
                {articulo.verificarStock && (
                  <MontoMonedaTexto
                    monto={inventario.solicitado}
                    sigla={
                      inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida
                    }
                  />
                )}
                {!articulo.verificarStock && (
                  <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                )}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 500 }}>Comprometido</StyledTableCell>
              <StyledTableCell
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.yellow.main, 0.9),
                  textAlign: 'right',
                  fontWeight: 500,
                }}
              >
                {articulo.verificarStock && (
                  <MontoMonedaTexto
                    monto={inventario.comprometido}
                    sigla={
                      inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida
                    }
                  />
                )}
                {!articulo.verificarStock && (
                  <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                )}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 500 }}>Disponible</StyledTableCell>
              <StyledTableCell
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.green.light, 0.9),
                  textAlign: 'right',
                  fontWeight: 500,
                }}
              >
                {articulo.verificarStock && (
                  <MontoMonedaTexto
                    monto={inventario.disponible}
                    sigla={
                      inventario.articuloPrecio.articuloUnidadMedida.nombreUnidadMedida
                    }
                  />
                )}
                {!articulo.verificarStock && (
                  <AllInclusive sx={{ fontSize: '1rem', display: 'block' }} />
                )}
              </StyledTableCell>
            </TableRow>
            <TableRow>
              <StyledTableCell sx={{ fontWeight: 500 }}>Equivalencia</StyledTableCell>
              <StyledTableCell sx={{ textAlign: 'right' }}>
                <MontoMonedaTexto
                  monto={inventario.articuloPrecio.cantidadBase}
                  sigla={
                    articulo.articuloPrecioBase.articuloUnidadMedida.nombreUnidadMedida
                  }
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
    </>
  ) : (
    <SimpleBox sx={{ p: 0, m: 0 }}>
      <Alert severity={'warning'}>
        Aun no cuenta con inventario para la sucursal, almacen solicitado.
      </Alert>
    </SimpleBox>
  )

  return (
    <SimpleBox>
      <CardHeader
        sx={{ p: 1 }}
        avatar={
          <CardActionArea
            sx={{
              borderRadius: '50%',
              border: (theme) => `0.81px solid ${theme.palette.grey[300]}`,
              p: 0.1,
            }}
            onClick={() => {
              console.log('click en la foto')
            }}
          >
            <Avatar
              sx={{ bgcolor: blue[500], width: 55, height: 55 }}
              alt="C"
              src={articulo.imagen?.variants.thumbnail}
              aria-label="recipe"
            >
              {articulo.nombreArticulo.charAt(0).toUpperCase()}
            </Avatar>
          </CardActionArea>
        }
        title={
          <Tooltip title={articulo.nombreArticulo} placement="top" disableInteractive>
            <Typography
              variant={'subtitle1'}
              fontSize={'small'}
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
          <Typography variant={'subtitle1'} color={'text.secondary'}>
            <MontoMonedaTexto
              monto={precioWatch || 0}
              sigla={moneda.sigla}
              montoProps={{ fontWeight: 500, color: blue[500] }}
            />
          </Typography>
        }
      />
      <CardContent sx={{ mt: -1, padding: 1, pb: '10px !important' }}>
        {InventarioComponent}
      </CardContent>
    </SimpleBox>
  )
})

export default ArticuloInventarioInformacionCard
