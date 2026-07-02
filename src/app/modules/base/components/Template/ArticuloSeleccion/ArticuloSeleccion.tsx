import {
  ContentCopyOutlined,
  ScreenSearchDesktopOutlined,
} from "@mui/icons-material";
import {
  ButtonGroup,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import React, { forwardRef, ReactNode, useCallback, useState } from "react";
import { SelectInstance, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";

import { apiArticuloInventarioListado } from "../../../../../base/api/apiArticuloInventarioListado.ts";
import { MyInputLabel } from "../../../../../base/components/MyInputs/MyInputLabel.tsx";
import { numberWithCommasPlaces } from "../../../../../base/components/MyInputs/NumberInput.tsx";
import { getSelectStyles } from "../../../../../base/components/MySelect/selectStyles.tsx";
import { useToast } from "../../../../../base/contexts/ToastContext.tsx";
import { TipoMontoProps } from "../../../../../base/interfaces/base.ts";
import { EntidadInputProps, PAGE_DEFAULT } from "../../../../../interfaces";
import { ArticuloProps } from "../../../../../interfaces/articulo.ts";
import { genApiQuery } from "../../../../../utils/helper.ts";
import { swalException } from "../../../../../utils/swal.ts";
import ArticuloSeleccionListadoDialog from "./ArticuloSeleccionListadoDialog.tsx";

interface OwnProps {
  /** Identificados unico */
  id: string;
  /** Datos de entidad, codigoSucursal, codigoPuntoVenta */
  entidad: EntidadInputProps;
  /** Lista de codigo articulos que se bloquean ["cod1", "cod2", "cod_n"] */
  bloquearCodigosArticulo: string[];
  /** Parametro para consulta a servidor verificarPrecio, servicio articuloInventarioV2Listado */
  verificarPrecio: boolean;
  /** Parametro para consulta a servidor verificaInventario, servicio articuloInventarioV2Listado */
  verificarInventario?: boolean;
  /** Cuando se agregan o cambian articulos */
  onArticuloChange: (articulo: ArticuloProps[]) => void;
  /** Genera radioButton o CheckBox */
  seleccionMultiple?: boolean;
  /** Parametros extra al query articuloInventarioV2Listado ["articuloVenta=true","verificarStock=true"]  */
  extraQuery?: string[]; // consulta extra para la api
  /** Agregar label al inputText */
  label?: string;
  /** Agrega Placeholder al inputText */
  placeholder?: string;
  /** Error */
  error?: boolean;
  /** Texto de ayuda */
  helperText?: string;
  /** Renderizado de columna precio -> precio, delivery, Costo  (default: precio)*/
  tipoMonto?: TipoMontoProps;
  /** Propiedades de la tabla selección */
  dialogProps?: {
    /** Titulo de tabla selección, default "Selección articulos" */
    titulo?: ReactNode | string;
    /** Sub-titulo de la tabla selección, default "" */
    subTitulo?: ReactNode | string;
  };
  /** 2026.4: Permitimos que pueda ingresar items duplicados, afecta al ultimo item seleccionado, default: false */
  permitirDuplicar?: boolean;
  /** 2026.4: Oculta el componente por completo */
  hidden?: boolean;
  /** 2026.4: Deshabilita la interacción y visualmente se ve gris */
  disabled?: boolean;
  /** 2026.4: Nro de decimales. Default 2 */
  nroDecimales?: number;
}

type Props = OwnProps;

/**
 * Componente de busqueda y seleccion de articulos
 * forwardRef esta activado por lo tanto es posible generar referencias al componente, ideal para usar hotkeys
 * @author isi-template
 * @param props
 * @constructor
 */
const ArticuloSeleccion = forwardRef<SelectInstance<ArticuloProps>, Props>(
  (props, ref) => {
    const {
      id,
      onArticuloChange,
      verificarInventario,
      bloquearCodigosArticulo,
      verificarPrecio,
      label = "Búsqueda de articulos",
      placeholder = "ALT + A",
      seleccionMultiple = true,
      extraQuery = [],
      entidad,
      error = false,
      helperText,
      tipoMonto = "precio",
      dialogProps,
      permitirDuplicar = false,
      hidden = false, // Valor por defecto
      disabled = false, // Valor por defecto
      nroDecimales = 2,
    } = props;
    const [articulo, setArticulo] = useState<ArticuloProps[]>([]);
    const [openArticuloListado, setOpenArticuloListado] =
      useState<boolean>(false);
    const theme = useTheme();
    const { toast } = useToast();

    /**
     * Busqueda del cliente en base de datos
     * @param value
     */
    const articuloBusqueda = useCallback(
      async (value: string): Promise<ArticuloProps[]> => {
        try {
          if (value.length > 2) {
            const query = genApiQuery([], [...extraQuery]);
            const pageInput = { ...PAGE_DEFAULT, limit: 20, query };
            const { docs } = await apiArticuloInventarioListado(
              entidad,
              pageInput,
              {
                verificarPrecio: verificarPrecio || false,
                verificarInventario: verificarInventario || false,
                queryExtra: value,
              },
            );
            if (docs) return docs;
          }
          return [];
        } catch (e: any) {
          swalException(e);
          return [];
        }
      },
      [entidad, extraQuery, verificarPrecio, verificarInventario],
    );

    /**
     * Parse montoValor dinamico
     * @param item
     */
    const genMontoValorColumna = useCallback(
      (item: ArticuloProps) => {
        let monto: number;
        if (tipoMonto === "costo") {
          monto = item.articuloPrecioBase?.monedaPrimaria?.precioBase ?? 0;
        } else if (tipoMonto === "delivery") {
          monto = item.articuloPrecioBase?.monedaPrimaria?.delivery ?? 0;
        } else {
          monto = item.articuloPrecioBase?.monedaPrimaria?.precio ?? 0;
        }

        const sigla =
          item.articuloPrecioBase?.monedaPrimaria?.moneda.sigla || "";
        const inv = item.inventario?.[0];
        const stock =
          item.verificarStock && inv
            ? `${numberWithCommasPlaces(inv.totalDisponible, nroDecimales)} `
            : "";
        const um = inv?.unidadMedida.nombreUnidadMedida.toLowerCase() || "";

        // Se usa un solo template string limpio sin saltos de línea gigantes
        return `${item.codigoArticulo} - ${item.nombreArticulo}___${numberWithCommasPlaces(monto, nroDecimales)} ${sigla} (${stock}${um})`;
      },
      [tipoMonto, nroDecimales],
    );

    /**
     * Manejador centralizado para cambios en el AsyncSelect
     */
    const handleSelectChange = useCallback(
      (resp: SingleValue<ArticuloProps>) => {
        if (resp) {
          if (!bloquearCodigosArticulo.includes(resp.codigoArticulo)) {
            setArticulo([resp]);
            onArticuloChange([resp]);
          } else {
            toast.warning(
              `El articulo ${resp.codigoArticulo} ya se ha adicionado`,
            );
          }
        } else {
          setArticulo([]);
          onArticuloChange([]);
        }
      },
      [bloquearCodigosArticulo, onArticuloChange, toast],
    );

    /**
     * Manejador de cierre del Dialogo de Selección
     */
    const handleDialogClose = useCallback(
      (resp: ArticuloProps[]) => {
        // Garantizamos el cierre inmediato
        setOpenArticuloListado(false);

        try {
          if (resp && resp.length > 0) {
            // 2. Protección extra por si bloquearCodigosArticulo llega como undefined desde el padre
            const codigosBloqueadosSeguro = bloquearCodigosArticulo || [];

            // Filtramos bloqueados vs válidos de forma funcional
            const bloqueados = resp.filter((item) =>
              codigosBloqueadosSeguro.includes(item.codigoArticulo),
            );

            if (bloqueados.length > 0) {
              const codigosErrores = bloqueados
                .map((b) => b.codigoArticulo)
                .join(", ");
              // Usando tu toast en lugar de notDanger para mantener la consistencia
              toast.warning(
                `Los articulos ${codigosErrores} ya se han adicionado`,
              );
            } else {
              setArticulo(resp);
              onArticuloChange(resp);
            }
          }
        } catch (error) {
          // 3. Si el componente padre explota al recibir los artículos,
          // lo capturamos aquí para que no congele la UI.
          console.error("Error al procesar la selección de artículos:", error);
          toast.error("Ocurrió un error inesperado al procesar los artículos.");
        }
      },
      [bloquearCodigosArticulo, onArticuloChange, toast],
    );

    /**
     * Manejador para duplicar el último artículo seleccionado
     */
    const handleDuplicarUltimo = useCallback(() => {
      if (articulo.length > 0) {
        const ultimoArticulo = articulo[articulo.length - 1];
        onArticuloChange([ultimoArticulo]);
        toast.success(`Artículo ${ultimoArticulo.codigoArticulo} duplicado`);
      } else {
        toast.info("No hay un artículo seleccionado para duplicar");
      }
    }, [articulo, onArticuloChange, toast]);

    // Opciones estáticas del Select para evitar nuevos objetos en memoria
    const getOptionValue = useCallback(
      (item: ArticuloProps) => item.codigoArticulo,
      [],
    );
    const noOptionsMessage = useCallback(
      () => "Ingrese referencia -> Codigo articulo, nombre articulo",
      [],
    );
    const loadingMessage = useCallback(() => "Buscando...", []);

    /***********************************************************************************/
    /***********************************************************************************/
    /***********************************************************************************/
    // Lógica para 'hidden'
    if (hidden) return null;

    return (
      <div>
        <Grid container spacing={0.5}>
          <Grid size={{ xs: 10, sm: 11, md: 11, lg: 11, xl: 11 }}>
            <FormControl fullWidth error={error}>
              {label !== "" && <MyInputLabel shrink>{label}</MyInputLabel>}
              <AsyncSelect<ArticuloProps>
                key={`select-${id}`}
                ref={ref}
                isDisabled={disabled}
                styles={getSelectStyles(theme, error)}
                menuPosition={"fixed"}
                placeholder={placeholder}
                loadOptions={articuloBusqueda}
                isClearable={!disabled}
                value={articulo}
                getOptionValue={getOptionValue}
                getOptionLabel={genMontoValorColumna}
                onChange={handleSelectChange}
                noOptionsMessage={noOptionsMessage}
                loadingMessage={loadingMessage}
              />
              {helperText && <FormHelperText>{helperText}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 2, sm: 1, md: 1, lg: 1, xl: 1 }}>
            <ButtonGroup variant="text" aria-label="Opciones de busqueda">
              {/* Botón de Duplicar: Solo si está permitido, no hay bloqueos y hay un artículo */}
              {permitirDuplicar &&
                bloquearCodigosArticulo.length === 0 &&
                articulo.length > 0 && (
                  <IconButton
                    aria-label="duplicar-articulo"
                    sx={{ p: 0.4 }}
                    onClick={handleDuplicarUltimo}
                    disabled={disabled}
                  >
                    <Tooltip
                      title={"Duplicar último artículo"}
                      disableInteractive
                    >
                      <ContentCopyOutlined fontSize="large" />
                    </Tooltip>
                  </IconButton>
                )}
              <IconButton
                aria-label="busqueda-articulo"
                sx={{ p: 0.6 }}
                aria-hidden={false}
                onClick={() => setOpenArticuloListado(true)}
                disabled={disabled}
              >
                <Tooltip title={"Explorar Articulos"} disableInteractive>
                  <ScreenSearchDesktopOutlined fontSize="large" />
                </Tooltip>
              </IconButton>
            </ButtonGroup>
          </Grid>
        </Grid>
        {!disabled && (
          <ArticuloSeleccionListadoDialog
            id={`seleccion-articulos-${id}`}
            entidad={entidad}
            bloquearCodigosArticulo={bloquearCodigosArticulo}
            verificarPrecio={verificarPrecio}
            verificarInventario={verificarInventario}
            disableEnforceFocus
            open={openArticuloListado}
            seleccionMultiple={seleccionMultiple}
            extraQuery={extraQuery}
            tipoMonto={tipoMonto}
            onClose={handleDialogClose}
            titulo={dialogProps?.titulo}
            subTitulo={dialogProps?.subTitulo}
          />
        )}
      </div>
    );
  },
);

export default ArticuloSeleccion;
