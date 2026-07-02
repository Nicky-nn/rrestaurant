// noinspection GraphQLUnresolvedReference

import { gql } from "graphql-request";

import { almacenFragment } from "./almacenFragment.ts";
import { articuloDescuentoFragment } from "./articuloDescuentoFragment.ts";
import { articuloPrecioFragment } from "./articuloPrecioFragment.ts";
import { articuloUnidadMedidaFragment } from "./articuloUnidadMedidaFragment.ts";
import { grupoArticuloFragment } from "./grupoArticuloFragment.ts";
import { grupoUnidadMedidaFragment } from "./grupoUnidadMedidaFragment.ts";
import { imagenCloudFragment } from "./imagenCloudFragment.ts";
import { impresoraFragment } from "./impresoraFragment.ts";
import {
  inventarioDetalleFragment,
  inventarioLoteFragment,
} from "./inventarioFragment.ts";
import { loteFragment } from "./loteFragment.ts";
import { monedaPrecioFragment } from "./monedaPrecioFragment.ts";
import { monedaFragment } from "./monedaPrecioOperacionFragment.ts";
import { proveedorFragment } from "./proveedorFragment.ts";
import { puntoVentaFrament } from "./puntoVentaFragment.ts";
import {
  facturaSucursalFragment,
  sucursalFragment,
} from "./sucursalFragment.ts";
import { tipoArticuloFragment } from "./tipoArticuloFragment.ts";

/**
 * Fragmento de campos de articulo
 * @author isi-template
 */
export const articuloFragment = gql`
  ${tipoArticuloFragment}
  ${grupoArticuloFragment}
  ${proveedorFragment}
  ${imagenCloudFragment}
  ${articuloUnidadMedidaFragment}
  ${grupoUnidadMedidaFragment}
  ${articuloDescuentoFragment}
  ${monedaPrecioFragment}
  ${monedaFragment}
  ${impresoraFragment}
  ${facturaSucursalFragment}
  ${inventarioDetalleFragment}
  ${almacenFragment}
  ${inventarioLoteFragment}
  ${loteFragment}
  ${articuloPrecioFragment}
  ${sucursalFragment}
  ${puntoVentaFrament}
  fragment ArticuloFields on Articulo {
    _id
    codigoArticulo
    articuloPrecioId
    nombreArticulo
    descripcionArticulo
    claseArticulo
    sinProductoServicio {
      codigoActividad
      codigoProducto
      descripcionProducto
    }
    actividadEconomica {
      codigoCaeb
      descripcion
      tipoActividad
    }
    tipoArticulo {
      ...tipoArticuloFields
    }
    gestionArticulo
    grupoArticulo {
      ...grupoArticuloFields
    }
    proveedor {
      ...proveedorFields
    }
    imagen {
      ...imagenCloudFields
    }
    codigoGrupoUnidadMedida
    grupoUnidadMedida {
      ...grupoUnidadMedidaFields
    }
    articuloPrecioBase {
      ...articuloPrecioFields
    }
    articuloPrecio {
      ...articuloPrecioFields
    }
    verificarStock
    articuloVenta
    articuloCompra
    articuloProduccion
    activo
    impresoras {
      ...impresoraFields
    }
    inventario {
      _id
      codigoArticulo
      nombreArticulo
      tipoArticulo
      sucursal {
        ...facturaSucursalFields
      }
      unidadMedida {
        ...articuloUnidadMedidaFields
      }
      detalle {
        ...inventarioDetalleFields
      }
      totalStock
      totalComprometido
      totalDisponible
      totalSolicitado
      unidadMedidaCompras {
        ...articuloUnidadMedidaFields
      }
      unidadMedidaInventario {
        ...articuloUnidadMedidaFields
      }
      unidadMedidaVentas {
        ...articuloUnidadMedidaFields
      }
    }
    tieneModificadores
    esReceta
    state
    usucre
    usumod
    createdAt
    updatedAt
  }
`;

/**
 * Fragmento de campos de articulo de tipo resumen
 * require: imagenCloudFragment, tipoArticuloFragment
 * @author isi-template
 */
export const articuloResumenFragment = gql`
  fragment articuloResumenFields on ArticuloResumen {
    _id
    activo
    claseArticulo
    codigoArticulo
    descripcionArticulo
    gestionArticulo
    imagen {
      ...imagenCloudFields
    }
    nombreArticulo
    tipoArticulo {
      ...tipoArticuloFields
    }
    verificarStock
  }
`;

/**
 * Fragmento de campos de articulo de tipo resumen
 * require: imagenCloudFragment, tipoArticuloFragment
 * @author isi-template
 */
export const articuloBasicoFragment = gql`
  fragment articuloBasicoFields on Articulo {
    _id
    activo
    claseArticulo
    codigoArticulo
    descripcionArticulo
    gestionArticulo
    imagen {
      ...imagenCloudFields
    }
    nombreArticulo
    tipoArticulo {
      ...tipoArticuloFields
    }
    verificarStock
  }
`;
