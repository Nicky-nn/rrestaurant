import { Table } from "@mui/material";
import { FunctionComponent } from "react";
import { EntradaProps } from "../../interfaces";
import { ArticuloDetallePopover } from "../../../../base/components/PopoverMonto/ArticuloDetallePopover.tsx";
import {
  StyledTableBody,
  StyledTableCell,
  StyledTableContainer,
  StyledTableHead,
  StyledTableRow,
} from "../../../../base/components/MuiTable/StyledTable.tsx";
import MontoMonedaTexto from "../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx";

interface OwnProps {
  row: EntradaProps;
}

type Props = OwnProps;

/**
 * Detalle de recepcion de entradas
 * @param props
 * @constructor
 */
const EntradaRecepcionDetalle: FunctionComponent<Props> = (props) => {
  const { row } = props;

  return (
    <StyledTableContainer bgColor={"primary"}>
      <Table size={"small"}>
        <StyledTableHead bgColor={"primary"}>
          <StyledTableRow>
            <StyledTableCell>ARTICULO</StyledTableCell>
            <StyledTableCell align={"right"}>CANTIDAD</StyledTableCell>
            <StyledTableCell align={"right"}>COSTO</StyledTableCell>
            <StyledTableCell>ALMACEN</StyledTableCell>
            <StyledTableCell>LOTE</StyledTableCell>
          </StyledTableRow>
        </StyledTableHead>
        <StyledTableBody striped={true} hover={true} bgColor={"primary"}>
          {row.detalle.map((item) => (
            <StyledTableRow key={item.nroItem.toString()}>
              <StyledTableCell>
                <ArticuloDetallePopover articulo={item} />
              </StyledTableCell>
              <StyledTableCell align={"right"}>
                {
                  <MontoMonedaTexto
                    monto={item.articuloPrecio.cantidad}
                    sigla={
                      item.articuloPrecio.articuloUnidadMedida
                        .nombreUnidadMedida
                    }
                  />
                }
              </StyledTableCell>
              <StyledTableCell>
                <MontoMonedaTexto
                  monto={item.articuloPrecio.valor}
                  sigla={item.articuloPrecio.moneda?.sigla ?? ""}
                />
              </StyledTableCell>
              <StyledTableCell>{item.almacen?.nombre}</StyledTableCell>
              <StyledTableCell>{item.lote?.codigoLote}</StyledTableCell>
            </StyledTableRow>
          ))}
        </StyledTableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default EntradaRecepcionDetalle;
