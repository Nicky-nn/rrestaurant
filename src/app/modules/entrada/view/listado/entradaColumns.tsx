import { MRT_ColumnDef } from "material-react-table";
import React from "react";

import MontoMonedaTexto from "../../../../base/components/PopoverMonto/MontoMonedaTexto";
import { EntradaProps } from "../../interfaces";

/**
 * Columnas de la tabla de entradas
 */
export const entradaColumns: MRT_ColumnDef<EntradaProps>[] = [
  {
    accessorKey: "numeroEntrada",
    header: "#",
    size: 50,
    enableColumnFilter: false,
  },
  {
    accessorKey: "codigo",
    header: "Código",
    size: 120,
  },
  {
    accessorKey: "descripcionMovimiento",
    header: "Movimiento",
  },
  {
    accessorKey: "fechaDocumento",
    header: "Fecha Registro",
    enableColumnFilter: false,
    size: 140,
  },
  {
    accessorKey: "otrosCostos",
    header: "Otros Costos",
    enableColumnFilter: false,
    muiTableBodyCellProps: {
      align: "right",
    },
    size: 100,
    Cell: ({ row }) => (
      <MontoMonedaTexto
        monto={row.original.otrosCostos || 0}
        sigla={row.original.moneda.sigla}
      />
    ),
  },
  {
    accessorKey: "descuentoAdicional",
    header: "Desc. Adicional",
    muiTableBodyCellProps: {
      align: "right",
    },
    size: 100,
    enableColumnFilter: false,
    Cell: ({ row }) => (
      <MontoMonedaTexto
        monto={row.original.descuentoAdicional || 0}
        sigla={row.original.moneda.sigla}
      />
    ),
  },
  {
    accessorKey: "montoTotal",
    header: "Monto Total",
    muiTableBodyCellProps: {
      align: "right",
      sx: (theme) => ({
        bgcolor: theme.palette.green.softBgColor,
        borderColor: theme.palette.green.borderColor,
      })
    },
    size: 150,
    enableColumnFilter: false,
    Cell: ({ cell, row }) => (
      <MontoMonedaTexto
        monto={cell.getValue<number>() || 0}
        sigla={row.original.moneda.sigla}
      />
    ),
  },
  {
    accessorKey: "tipoDocumento",
    header: "Tipo Documento",
    enableColumnFilter: false,
    size: 130,
  },
];
