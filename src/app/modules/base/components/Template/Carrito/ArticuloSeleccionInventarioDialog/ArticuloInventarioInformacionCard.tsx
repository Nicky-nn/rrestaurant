import { AllInclusive } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  styled,
  Table,
  TableCell,
  tableCellClasses,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { FunctionComponent, memo, useState } from "react";
import { Control, useWatch } from "react-hook-form";

import { SimpleBox } from "../../../../../../base/components/Container/SimpleBox.tsx";
import { MyDialogTitle } from "../../../../../../base/components/Dialog/MyDialogTitle.tsx";
import {
  StyledTableBody,
  StyledTableContainer,
} from "../../../../../../base/components/MuiTable/StyledTable.tsx";
import MontoMonedaTexto from "../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx";
import { ArticuloProps } from "../../../../../../interfaces/articulo.ts";
import { ArticuloOperacionInputProps } from "../../../../../../interfaces/articuloOperacion.ts";
import { ArticuloInventarioOperacionProps } from "../../../../../../interfaces/InventarioOperacion.ts";
import { MonedaProps } from "../../../../../../interfaces/monedaPrecio.ts";
import { getColor } from "../../../../../../utils/getColor.ts";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    fontSize: "0.6rem",
    padding: "0px !important",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: "0.85rem",
    padding: "5px",
  },
}));

// =========================================================================
// ENVOLTORIO AISLADO PARA EL PRECIO
// Evita que toda la tarjeta (y la pesada tabla de inventario)
// se re-renderice cada vez que el usuario teclea en el input de precio.
// =========================================================================
interface PrecioObservadorProps {
  control: Control<ArticuloOperacionInputProps>;
  moneda: MonedaProps;
}

const PrecioObservador: FunctionComponent<PrecioObservadorProps> = ({
  control,
  moneda,
}) => {
  const [precioWatch] = useWatch({ control, name: ["precio"] });

  return (
    <MontoMonedaTexto
      monto={precioWatch || 0}
      sigla={moneda.sigla}
      montoProps={{ fontWeight: 500 }}
      boxProps={{
        fontSize: "1.3rem",
        color: (theme) => getColor(theme, "primary").textColor,
      }}
    />
  );
};

// =========================================================================
// TARJETA PRINCIPAL DE INFORMACIÓN
// =========================================================================
interface OwnProps {
  control: Control<ArticuloOperacionInputProps>;
  articulo: ArticuloProps;
  moneda: MonedaProps;
  inventario: ArticuloInventarioOperacionProps | null;
}

const ArticuloInventarioInformacionCard: FunctionComponent<OwnProps> = memo(
  ({ articulo, control, moneda, inventario }) => {
    const [openViewer, setOpenViewer] = useState(false);
    const renderInventario = () => {
      if (!inventario) {
        return (
          <SimpleBox sx={{ p: 0, m: 0, mt: 1 }}>
            <Alert severity="warning">
              <AlertTitle>SIN INVENTARIO</AlertTitle>
              Aún no cuenta con inventario para la sucursal y almacén
              solicitado.
            </Alert>
          </SimpleBox>
        );
      }

      return (
        <StyledTableContainer sx={{ padding: "0", width: "100%", m: 0, mt: 1 }}>
          <Table size="small" sx={{ border: "none" }}>
            <StyledTableBody>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>
                  Código
                </StyledTableCell>
                <StyledTableCell>
                  {articulo?.codigoArticulo || "--"}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>
                  Sucursal
                </StyledTableCell>
                <StyledTableCell>{inventario.sucursal.codigo}</StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>
                  Almacen
                </StyledTableCell>
                <StyledTableCell>
                  {inventario.almacen?.nombre || "--"}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>Lote</StyledTableCell>
                <StyledTableCell>
                  {inventario.lote?.descripcion || "--"}
                </StyledTableCell>
              </TableRow>

              {/* ===== STOCK ===== */}
              <TableRow>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "blue").bgColor,
                    color: (theme) => getColor(theme, "blue").textColor,
                    fontWeight: 500,
                  }}
                >
                  Stock
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "blue").bgColor,
                    color: (theme) => getColor(theme, "blue").textColor,
                    textAlign: "right",
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.stock}
                      sigla={
                        inventario.articuloPrecio.articuloUnidadMedida
                          .nombreUnidadMedida
                      }
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: "1rem", display: "block" }} />
                  )}
                </StyledTableCell>
              </TableRow>

              {/* ===== SOLICITADO ===== */}
              <TableRow>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "purple").bgColor,
                    color: (theme) => getColor(theme, "purple").textColor,
                    fontWeight: 500,
                  }}
                >
                  Solicitado
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "purple").bgColor,
                    color: (theme) => getColor(theme, "purple").textColor,
                    textAlign: "right",
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.solicitado}
                      sigla={
                        inventario.articuloPrecio.articuloUnidadMedida
                          .nombreUnidadMedida
                      }
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: "1rem", display: "block" }} />
                  )}
                </StyledTableCell>
              </TableRow>

              {/* ===== COMPROMETIDO ===== */}
              <TableRow>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "orange").bgColor,
                    color: (theme) => getColor(theme, "orange").textColor,
                    fontWeight: 500,
                  }}
                >
                  Comprometido
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "orange").bgColor,
                    color: (theme) => getColor(theme, "orange").textColor,
                    textAlign: "right",
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.comprometido}
                      sigla={
                        inventario.articuloPrecio.articuloUnidadMedida
                          .nombreUnidadMedida
                      }
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: "1rem", display: "block" }} />
                  )}
                </StyledTableCell>
              </TableRow>

              {/* ===== DISPONIBLE ===== */}
              <TableRow>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "green").bgColor,
                    color: (theme) => getColor(theme, "green").textColor,
                    fontWeight: 500,
                  }}
                >
                  Disponible
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    bgcolor: (theme) => getColor(theme, "green").bgColor,
                    color: (theme) => getColor(theme, "green").textColor,
                    textAlign: "right",
                    fontWeight: 500,
                  }}
                >
                  {articulo.verificarStock ? (
                    <MontoMonedaTexto
                      monto={inventario.disponible}
                      sigla={
                        inventario.articuloPrecio.articuloUnidadMedida
                          .nombreUnidadMedida
                      }
                    />
                  ) : (
                    <AllInclusive sx={{ fontSize: "1rem", display: "block" }} />
                  )}
                </StyledTableCell>
              </TableRow>

              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>
                  Equivalencia
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: "right" }}>
                  <MontoMonedaTexto
                    monto={inventario.articuloPrecio.cantidadBase}
                    sigla={
                      articulo.articuloPrecioBase.articuloUnidadMedida
                        .nombreUnidadMedida
                    }
                  />
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>
                  Ver. Stock
                </StyledTableCell>
                <StyledTableCell>
                  {articulo.verificarStock ? "Sí" : "No"}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell sx={{ fontWeight: 500 }}>
                  Gestionado
                </StyledTableCell>
                <StyledTableCell>
                  {articulo.gestionArticulo || "--"}
                </StyledTableCell>
              </TableRow>
            </StyledTableBody>
          </Table>
        </StyledTableContainer>
      );
    };

    return (
      <Box>
        <CardHeader
          sx={{ p: 1 }}
          avatar={
            <CardActionArea
              sx={{
                borderRadius: "50%",
                // border: (theme) => `1px solid ${theme.palette.grey[300]}`,
                p: 0.1,
              }}
              onClick={(e) => {
                if (articulo.imagen) {
                  e.currentTarget.blur();
                  setOpenViewer(true);
                }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "green.main",
                  width: 70,
                  height: 70,
                  fontSize: "2.5rem",
                  fontWeight: 400,
                }}
                alt={articulo.nombreArticulo.charAt(0).toUpperCase()}
                src={articulo.imagen?.variants.thumbnail}
              >
                {articulo.nombreArticulo.charAt(0).toUpperCase()}
              </Avatar>
            </CardActionArea>
          }
          title={
            <Tooltip
              title={`${articulo.nombreArticulo} (${articulo.codigoArticulo})`}
              placement="top"
            >
              <Typography
                variant="subtitle1"
                fontSize={"large"}
                sx={{
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "1",
                  WebkitBoxOrient: "vertical",
                  mb: -0.2,
                }}
              >
                {articulo.nombreArticulo}
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
        <CardContent sx={{ mt: -1, padding: 1, pb: "10px !important" }}>
          {renderInventario()}
        </CardContent>

        {articulo.imagen && (
          <Dialog
            open={openViewer}
            onClose={() => setOpenViewer(false)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              backdrop: {
                sx: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
              },
            }}
          >
            <MyDialogTitle
              onClose={() => setOpenViewer(false)}
              sx={{
                m: 0,
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography fontWeight="bold">
                {articulo.nombreArticulo} ({articulo.codigoArticulo})
              </Typography>
            </MyDialogTitle>

            <DialogContent
              dividers
              sx={{
                p: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
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
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </Box>
    );
  },
);

export default ArticuloInventarioInformacionCard;
