import { ArticuloUnidadMedidaProps } from "./articuloUnidadMedida.ts";
import { ImagenCloudProps } from "./imagen.ts";
import { InventarioProps } from "./inventario.ts";
import { MonedaPrecioApiInputProps, MonedaPrecioProps, MonedaProps } from "./monedaPrecio.ts";
import { ProveedorOperacionProps } from "./proveedorOperacion.ts";
import { TipoArticuloOperacionProps } from "./tipoArticulo.ts";

/**
 * Que vamos a evaluar para el calculo de costo y precio
 */
export const apiTipoArtPrecioOperacion = {
  costo: "costo",
  precio: "precio",
} as const;

export type TipoArtPrecioOperacion =
  (typeof apiTipoArtPrecioOperacion)[keyof typeof apiTipoArtPrecioOperacion];
/**
 * Forma de realizacion de descuentos
 * prioridad fechaInicial, fechaFinal, cantidad y finalmente porcentaje
 * @author isi-template
 */
export interface ArticuloDescuentoProps {
  fechaInicial: Date | null; // Fecha Inicial de vigencia
  fechaFinal: Date | null; // Fecha Final de vigencia o null para indefinido
  porcentaje: number; // Porcentaje de descuento aplica si cantidad es array[]
  cantidad: {
    nro: number;
    porcentaje: number;
  }[]; // Cantidad de productos para aplicar el descuento
}
/**
 * @author isi-template
 */
export interface PrecioInputProps {
  precioBase: number | null; // Precio base multiplicador por el factor de ajuste
  precio: number | null;
  delivery?: number | null; // nuevo agregado delivery
  precioComparacion?: number | null;
  manual: boolean; // Si es false, no multiplica factorAjuste * precioBase
}

/**
 * Generación de totales por linea o general
 */
export interface PrecioCostoTotalesProps {
  /** * Total bruto de la línea sin alterar.
   * Fórmula: = valor * cantidad
   */
  subtotalBruto: number;
  /** * Subtotal visual para la línea del carrito (ignora prorrateos globales y gastos).
   * Contempla el descuento directo y asegura que el impuesto esté incluido.
   * Fórmula (Si incluye impuesto): = subtotalBruto - totalDescuento
   * Fórmula (Si NO incluye impuesto): = (subtotalBruto - totalDescuento) * (1 + tasaIva)
   */
  subtotalLineaVisual: number;
  /** * Monto en dinero solo del descuento directo de esta línea.
   * Fórmula: = descuento * cantidad
   */
  totalDescuento: number;
  /** * Monto en dinero solo del descuento adicional prorrateado.
   * Fórmula: = descuentoAdicional * cantidad
   */
  totalDescuentoAdicional: number;
  /** * Monto en dinero sumando TODOS los descuentos (Directo + Adicional).
   * Fórmula: = descuentoTotal * cantidad
   */
  totalDescuentoGeneral: number;
  /** * Porcentaje efectivo del descuento directo sobre el total bruto.
   * Fórmula: = (totalDescuento / subtotalBruto) * 100
   */
  totalDescuentoP: number;
  /** * Porcentaje efectivo del descuento adicional sobre el total bruto.
   * Fórmula: = (totalDescuentoAdicional / subtotalBruto) * 100
   */
  totalDescuentoAdicionalP: number;
  /** * Porcentaje efectivo de todos los descuentos sobre el total bruto.
   * Fórmula: = (totalDescuentoGeneral / subtotalBruto) * 100
   */
  totalDescuentoGeneralP: number;
  /** * Valor total del inventario base o Ingreso total ventas (sin impuestos).
   * Fórmula: = valorNeto * cantidad
   */
  subtotalNeto: number;
  /** * Total de impuestos de la línea.
   * Fórmula: = impuestoUnitario * cantidad
   */
  totalImpuestos: number;
  /** * Total de gastos adicionales de la línea.
   * Fórmula: = gastoAdicional * cantidad
   */
  totalGasto: number;
  /** * Total Valor Entrada Stock o Total a Pagar por el Cliente.
   * Fórmula: = valorFinal * cantidad
   */
  totalFinal: number;
}

/**
 * Estructura unificada para la distribución de montos financieros.
 * Permite manejar tanto la entrada de inventario (COSTO) como la salida (PRECIO).
 */
export interface PrecioCostoOperacionProps {
  /** * Contexto de la operación:
   * - 'COSTO': Operación de entrada (Compras, Producción).
   * - 'PRECIO': Operación de salida (Ventas, Cotizaciones).
   */
  tipoOperacion: TipoArtPrecioOperacion;

  // --- 1. VALORES DE REFERENCIA (INPUTS) ---
  /** * El valor nominal actual de la operación.
   * - COSTO: Precio unitario en la Factura del Proveedor.
   * - PRECIO: Precio de Lista / Catálogo actual.
   * Fórmula: Valor ingresado por usuario o sistema.
   */
  valor: number;
  /** * Precio unitario visual con el impuesto incluido.
   * Ideal para la columna "Precio Unitario" en el carrito.
   * Fórmula (Si incluye impuesto): = valor
   * Fórmula (Si NO incluye impuesto): = valor * (1 + tasaIva)
   */
  valorConImpuesto: number;
  /**
   * El valor de referencia histórico o estándar.
   * - COSTO: Costo Promedio/Estándar anterior (Kardex).
   * - PRECIO: Generalmente 0 (o Precio de Lista anterior para comparar subidas).
   * Fórmula: Valor extraído del historial o base de datos.
   */
  valorAnterior: number;

  // --- 2. AJUSTES DIRECTOS ---
  /** * Descuento directo unitario (Monto).
   * Fórmula (si es unitario): = descuentoInput
   * Fórmula (si es global): = descuentoInput / cantidad
   */
  descuento: number;
  /** * Descuento adicional prorrateado (Monto).
   * Fórmula: Monto asignado externamente y prorrateado a esta unidad.
   */
  descuentoAdicional: number;
  /** * Suma del descuento directo + adicional unitario.
   * Fórmula: = descuento + descuentoAdicional
   */
  descuentoTotal: number;
  // --- 3. DESCUENTOS EN PORCENTAJE (Unitarios) ---
  /** * Porcentaje de descuento directo.
   * Fórmula: = (descuento / valor) * 100
   */
  descuentoP: number;
  /** * Porcentaje de descuento adicional prorrateado.
   * Fórmula: = (descuentoAdicional / valor) * 100
   */
  descuentoAdicionalP: number;
  /** * Porcentaje de la suma de todos los descuentos (Directo + Adicional).
   * Fórmula: = (descuentoTotal / valor) * 100
   */
  descuentoTotalP: number;

  // --- 3. VALORES CONTABLES (NETOS E IMPUESTOS) ---
  /** * Valor financiero real "limpio" de la mercancía.
   * - COSTO: Base Imponible (Costo sin IVA ni gastos).
   * - PRECIO: Revenue / Ingreso Neto Real (Precio de Venta sin IVA).
   * Fórmula (Si incluye impuesto): = (valor - descuentoTotal) / (1 + tasaIva)
   * Fórmula (Si NO incluye impuesto): = (valor - descuentoTotal)
   */
  valorNeto: number;
  /** * Monto del impuesto unitario.
   * - COSTO: Crédito Fiscal (Impuesto recuperable).
   * - PRECIO: Débito Fiscal (Impuesto a pagar al fisco).
   * Fórmula (Si incluye impuesto): = (valor - descuentoTotal) - valorNeto
   * Fórmula (Si NO incluye impuesto): = (valor - descuentoTotal) * tasaIva
   */
  impuestoUnitario: number;

  // --- 4. EXTRAS DE COSTEO (Solo contexto COSTO) ---
  /** * Gastos vinculados (Fletes, Seguros, Aduanas).
   * - COSTO: Se suma al valor del inventario.
   * - PRECIO: 0 (Salvo casos especiales de envío).
   * Fórmula: Gasto asignado externamente y prorrateado a esta unidad.
   */
  gastoAdicional: number;
  /** * Desviación financiera.
   * - COSTO: Diferencia entre (valorFinal - valorAnterior).
   * - PRECIO: 0.
   * Fórmula: = valorFinal - valorAnterior
   */
  variacion: number;

  // --- 5. VALOR FINAL (OUTPUT) ---
  /** * El monto final efectivo.
   * - COSTO: Costo Landed (Neto + Gastos). Valor de entrada al Kardex.
   * - PRECIO: Precio Final (Neto + Impuesto). Monto que paga el Cliente.
   * Fórmula: = valorNeto + impuestoUnitario + gastoAdicional
   */
  valorFinal: number;

  // --- 6. TOTALES ACUMULADOS (Unitarios * Cantidad) ---
  totales: PrecioCostoTotalesProps;
}

/**
 * Valores default precio costo totales
 * @author isi-template
 * */
export const PRECIO_COSTO_TOTALES_DEFAULT: PrecioCostoTotalesProps = {
  subtotalBruto: 0,
  subtotalLineaVisual: 0,
  totalDescuento: 0,
  totalDescuentoP: 0,
  totalDescuentoAdicional: 0,
  totalDescuentoGeneral: 0,
  totalDescuentoAdicionalP: 0,
  totalDescuentoGeneralP: 0,
  subtotalNeto: 0,
  totalImpuestos: 0,
  totalGasto: 0,
  totalFinal: 0,
};

/**
 * Calculo de totales generales tanto para operaciones como sistema báse
 * @author isi-template
 */
export interface TotalesGeneralesProps {
  operacion: PrecioCostoTotalesProps;
  sistema: PrecioCostoTotalesProps;
}

/**
 * Valor default para la generacion de totales generales
 * @author isi-template
 */
export const TOTALES_GENERALES_DEFAULT: TotalesGeneralesProps = {
  operacion: PRECIO_COSTO_TOTALES_DEFAULT,
  sistema: PRECIO_COSTO_TOTALES_DEFAULT,
};

/**
 * Propiedades de los articulos precios para todas la operaciones excepto articulo y articuloPrecioInventario
 * @author isi-template
 */
export interface ArticuloPrecioOperacionProps {
  /** Datos unidad de medida */
  articuloUnidadMedida: ArticuloUnidadMedidaProps;
  /** Estructura de moneda que incluye el tipo de cambio segun moneda principal */
  moneda: MonedaProps;
  /** Tipo de cambio final, puede ser diferente al tipo de cambio de moneda */
  tipoCambio: number;
  /** Desglose de montos y totales para la linea de operacion */
  estructuraValor: PrecioCostoOperacionProps;
  // /** Si TipoOperacion===costo, desglose de los datos para costo */
  // costoOperacion: CostoOperacionProps
  /** Tipo operacion de transaccion, costo o precio */
  tipoOperacion: TipoArtPrecioOperacion;
  /** valor que se ingresa de front-end de operacion segun sea de tipoOperacion costo o precio */
  valor: number;
  /** costo báse heredado de tabla articuloPrecio, generalmente hace referencial al costo de operaciones, no se envia a front-end */
  costo: number;
  /** Cantidad neta heredada de cantidades */
  cantidad: number;
  /** Equivalencia de la unidad (12 unidades por Caja) */
  cantidadFactor: number;
  /** Historial del ultimo cambio de cantidad */
  cantidadAnterior: number;
  /** Descuento de linea */
  descuento: number;
  /** Descuento prorrateado */
  descuentoAdicional: number;
  /** Otros costos prorrateado */
  otrosCostos: number;
  /** Valor de impuesto */
  impuesto: number;
  /** Si incluye impuestos, true o false, Si precio real incluye impuestos */
  incluyeImpuesto: boolean;
  /** Si el descuento de linea aplica como descuento global o unitario, default: true */
  esDescuentoTotal: boolean;
  /** Factor de ajuste para modificaciones masivas de valor */
  factorAjuste: number;
  /**
   * Porcentaje de asignación financiera (0-100).
   * Uso exclusivo en Producción (DESPIECE / CONJUNTA) para prorratear el costo base.
   * En otras operaciones (Ventas/Compras) su valor es 0.
   */
  porcentajeCosto?: number;
}

/**
 * @description datos de entrada para operaciones de precios de articulos independientes
 * @author isi-template
 */
export interface ArticuloPrecioOperacionInputProps {
  codigoArticuloUnidadMedida: string;
  /** Cantidad de venta o compra */
  cantidad: number; // Cantidad de items que ingresan a inventario
  /** Valor, Precio, costo o monto del item */
  precio: number;
  /** Descuento, que puede ser global o unitario, es dependiente del parametro esDescuentoTotal */
  descuento: number;
  /** Impuesto % que va entre  0% y 100% */
  impuesto: number;
  /** Si es true, el descuento se aplica global, si es false, el descuento se aplica por unidad, (default: true) */
  esDescuentoTotal: boolean;
  /** Si el documento fue generado con factura o sin factura */
  incluyeImpuesto: boolean;
  /**
   * Porcentaje de asignación financiera (0-100).
   * Uso exclusivo en Producción (DESPIECE / CONJUNTA) para prorratear el costo base.
   * En otras operaciones (Ventas/Compras) su valor es 0.
   */
  porcentajeCosto?: number;
}

/**
 * Propiedades de los articulos precios operacion para consume api
 * @author isi-template
 */
export interface ArticuloPrecioOperacionApiInputProps {
  codigoArticuloUnidadMedida: string;
  /** Cantidad de venta o compra */
  cantidad: number; // Cantidad de items que ingresan a inventario
  /** Valor, Precio, costo o monto del item */
  precio: number;
  /** Descuento, que puede ser global o unitario, es dependiente del parametro esDescuentoTotal */
  descuento: number;
  /** Impuesto % que va entre  0% y 100% */
  impuesto: number;
  /** Si es true, el descuento se aplica global, si es false, el descuento se aplica por unidad, (default: true) */
  esDescuentoTotal: boolean;
  /** Si el documento fue generado con factura o sin factura */
  incluyeImpuesto: boolean;
  /**
   * Porcentaje de asignación financiera (0-100).
   * Uso exclusivo en Producción (DESPIECE / CONJUNTA) para prorratear el costo base.
   * En otras operaciones (Ventas/Compras) su valor es 0.
   */
  porcentajeCosto?: number;
}

/**
 * @description Resumen de los precios de un articulo
 * Usado generalmente para desplegar información resumida segun el tipo unidad de medida
 * @deprecated
 * @author isi-template
 */
export interface ArticuloPrecioResumenProps {
  /** Articulo unidad de medida heredada por articulo, gen. dependencia de tipoUnidadMedida=venta, compra, inventario */
  articuloUnidadMedida: ArticuloUnidadMedidaProps;
  /** Resultado de la busqueda de monedaPrimaria, adicional1, adicional2, etc. */
  monedaPrecio: MonedaPrecioProps;
  /** Equivalencia de la unidad (12 unidades por Caja) */
  cantidadFactor: number; // Equivalencia relacionada a la unidad de medida base
  /** Descuento de linea */
  descuento: ArticuloDescuentoProps | null; // en caso de contar con un descuento especifico que aplica a todos los valores
  /** Imagen del articulo */
  imagen: ImagenCloudProps | null;
  umVenta: boolean; // si es para unidad de medida para ventas
  umInventario: boolean; // si es para unidad de medida para inventarios
  umCompra: boolean; // si es para unidad de medida para compras
}

/**
 * Datos del articulo / precio completo para la gestion de articulos
 * @author isi-template
 */
export interface ArticuloPrecioProps {
  articuloUnidadMedida: ArticuloUnidadMedidaProps;
  monedaPrimaria: MonedaPrecioProps;
  monedaAdicional1: MonedaPrecioProps | null;
  monedaAdicional2: MonedaPrecioProps | null;
  monedaAdicional3: MonedaPrecioProps | null;
  /** Equivalencia de la unidad (12 unidades por Caja) */
  cantidadBase: number; // Equivalencia relacionada a la unidad de medida base
  descuento: ArticuloDescuentoProps | null; // en caso de contar con un descuento especifico que aplica a todos los valores
  imagen: ImagenCloudProps | null;
  factorAjuste: number; // factor ajuste que afecta al precio, no asi al precio base, solo afecta si moneda precio manual es false
  umVenta: boolean; // si es para unidad de medida para ventas
  umInventario: boolean; // si es para unidad de medida para inventarios
  umCompra: boolean; // si es para unidad de medida para compras
}
/**
 * @author isi-template
 */
export interface ArticuloPrecioInputProps {
  articulo?: ArticuloPrecioBaseProp | null;
  articuloUnidadMedida: ArticuloUnidadMedidaProps;
  monedaPrimaria: PrecioInputProps;
  monedaAdicional1: PrecioInputProps | null;
  monedaAdicional2: PrecioInputProps | null;
  monedaAdicional3: PrecioInputProps | null;
  /** Equivalencia de la unidad (12 unidades por Caja) */
  cantidadBase: number;
  descuento?: ArticuloDescuentoProps | null; // en caso de contar con un descuento especifico que aplica a todos los valores
  factorAjuste: number; // factor ajuste que afecta al precio, no asi al precio base, solo afecta si moneda precio manual es false
  umVenta: boolean; // si es para unidad de medida para ventas
  umInventario: boolean; // si es para unidad de medida para inventarios
  umCompra: boolean; // si es para unidad de medida para compras
}
/**
 * @author isi-template
 */
export const ARTICULO_PRECIO_DEFAULT: ArticuloPrecioInputProps = {
  articulo: null,
  articuloUnidadMedida: null as any,
  monedaPrimaria: null as any,
  monedaAdicional1: null,
  monedaAdicional2: null,
  monedaAdicional3: null,
  cantidadBase: 1,
  descuento: null,
  factorAjuste: 1,
  umVenta: true,
  umInventario: true,
  umCompra: false,
};

/**
 * @description datos de entrada para operaciones de precios de articulos independientes
 * @author isi-template
 */
export interface ArticuloPrecioApiInputProps {
  codigoArticulo: string;
  codigoUnidadMedida: string;
  monedaPrimaria: MonedaPrecioApiInputProps;
  monedaAdicional1: MonedaPrecioApiInputProps | null;
  monedaAdicional2: MonedaPrecioApiInputProps | null;
  monedaAdicional3: MonedaPrecioApiInputProps | null;
  cantidadBase?: number | null;
  factorAjuste?: number | null;
  umVenta?: boolean | null; // si es para unidad de medida para ventas
  umInventario?: boolean | null; // si es para unidad de medida para inventarios
  umCompra?: boolean | null; // si es para unidad de medida para compras
  descuento?: any | null;
}

/**
 * @description datos de entrada para operaciones de precios de articulos independientes
 * @author isi-template
 */
export interface ArticuloPrecioBaseProp {
  _id: string;
  articuloPrecioId: string;
  codigoArticulo: string;
  nombreArticulo: string; // nombre propio o corto del articulo
  tipoArticulo: TipoArticuloOperacionProps | null; // Clasificador de tipos de articulos articulos
  proveedor: ProveedorOperacionProps[]; // Lista de proveedores del producto
  imagen: ImagenCloudProps | null;
  inventario: InventarioProps[]; // lista de almacenes donde se almacena el articulo, se filtra por sucursal por eso array
  activo: boolean; // si es true, el articulo esta activo para su uso
  state?: string;
  cantidadBase: number;
  articuloUnidadMedida: ArticuloUnidadMedidaProps;
  moneda: MonedaProps;
  precio: number;
  precioBase: number;
  manual: boolean;
  monedaA1: MonedaProps;
  precioA1: number;
  precioBaseA1: number;
  manualA1: boolean;
  monedaA2: MonedaProps;
  precioA2: number;
  precioBaseA2: number;
  manualA2: boolean;
  monedaA3: MonedaProps;
  precioA3: number;
  precioBaseA3: number;
  manualA3: boolean;
}
