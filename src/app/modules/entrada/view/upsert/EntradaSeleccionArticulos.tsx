import { FormHelperText, Grid } from "@mui/material";
import React, { FunctionComponent } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { articuloToArticuloOperacionInputService } from "../../../../base/services/articuloToArticuloOperacionInputService.ts";
import ArticuloSeleccion from "../../../base/components/Template/ArticuloSeleccion/ArticuloSeleccion.tsx";
import SeleccionArticuloInventarioDialog from "../../../base/components/Template/Carrito/ArticuloSeleccionInventarioDialog/SeleccionArticuloInventarioDialog.tsx";
import CarritoArticulos from "../../../base/components/Template/Carrito/CarritoArticulos.tsx";
import { useEntradaOperaciones } from "../../hooks/useEntradaOperaciones.tsx";
import { EntradaPorCajaInputProp } from "../../interfaces";
import { useSeleccionArticuloInventario } from "../../../base/components/Template/Carrito/ArticuloSeleccionInventarioDialog/useSeleccionArticuloInventario.tsx";

interface OwnProps {}

type Props = OwnProps;

/**
 * @description Selección de articulos para entradas rápidas
 * @constructor
 */
const EntradaSeleccionArticulos: FunctionComponent<Props> = () => {
  const { entidad, monedaPrimaria } = useEntradaOperaciones();
  const form = useFormContext<EntradaPorCajaInputProp>();
  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  const seleccion = useSeleccionArticuloInventario("seleccion-articulo-dialog");

  const [monedaWatch, tipoCambioWatch] = useWatch({
    control,
    name: ["moneda", "tipoCambio"],
  });

  const detalleWatch = useWatch({
    control,
    name: "detalle",
  });

  const { remove, update, prepend } = useFieldArray({
    control,
    name: "detalle",
  });

  /** Si no existe moneda, no renderizamos */
  if (!monedaWatch) {
    return null;
  }

  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={3} sx={{ mb: -3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ArticuloSeleccion
            id={"entrada-rapida-articulo-busqueda"}
            entidad={entidad}
            bloquearCodigosArticulo={detalleWatch.map((d) => d.codigoArticulo)}
            verificarPrecio={true}
            verificarInventario={true}
            tipoMonto={"costo"}
            onArticuloChange={(art) => {
              const artOperacion = art.map((a) =>
                articuloToArticuloOperacionInputService(a, monedaWatch, {
                  tipoMonto: "costo",
                  autoLote: true,
                }),
              );
              prepend([...artOperacion]);
            }}
            extraQuery={["verificarStock=true"]}
            dialogProps={{
              titulo: "Seleccion articulos de entrada",
            }}
          />
        </Grid>
        <Grid size={12}>
          <CarritoArticulos
            indexActivo={seleccion.index}
            moneda={monedaWatch}
            monedaPrimaria={monedaPrimaria}
            tipoCambio={tipoCambioWatch}
            articulos={detalleWatch}
            descProps={{
              ocultar: true,
            }}
            precioProps={{
              label: "Costo Unit.",
            }}
            onChangeCantidad={(item) => {
              if (item) {
                update(item.index, {
                  ...item.item,
                  cantidad: item.cantidad,
                });
              }
            }}
            onChangePrecio={(item) => {
              if (item) {
                update(item.index, {
                  ...item.item,
                  precio: item.precio,
                });
              }
            }}
            onChangeDetalleExtra={(item) => {
              if (item) {
                update(item.index, {
                  ...item.item,
                  detalleExtra: item.detalleExtra,
                });
              }
            }}
            onClickArticulo={(item) => {
              if (item) {
                seleccion.openSeleccion(item.item.articuloId, item.index);
              }
            }}
            onChangeTipoCambio={(resp) => {
              if (resp) {
                setValue("tipoCambio", resp);
              }
            }}
            onDeleteArticulo={(resp) => {
              if (resp) {
                remove(resp.index);
              }
            }}
          />

          {Boolean(errors.detalle) && (
            <FormHelperText error>{errors.detalle?.message}</FormHelperText>
          )}
        </Grid>
      </Grid>

      <SeleccionArticuloInventarioDialog
        id={seleccion.id}
        articuloId={seleccion.articuloId}
        almacenProps={{
          fuente: "tbl",
        }}
        moneda={monedaWatch}
        articuloIndex={seleccion.index}
        item={detalleWatch[seleccion.index]}
        precioProps={{
          tipoMonto: "costo",
        }}
        entidad={entidad}
        onClose={(data) => {
          if (data) {
            update(data.index, data.item);
          }
          seleccion.closeSeleccion();
        }}
        onClear={() => {
          seleccion.closeSeleccion();
        }}
        open={seleccion.open}
        reglas={{
          validaLote: true,
        }}
        loteProps={{
          disabled: false,
        }}
        descuentoProps={{
          ocultar: true,
        }}
      />
    </>
  );
};

export default EntradaSeleccionArticulos;
