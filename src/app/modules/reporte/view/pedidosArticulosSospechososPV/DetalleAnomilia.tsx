import {
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Box,
    Paper,
    TableContainer,
    Chip,
} from '@mui/material';
import { numberWithCommas } from '../../../../base/components/MyInputs/NumberInput';
import { useTheme } from '@mui/material/styles';

type HistorialPedidoProps = {
    articuloId: string;
    historial?: {
        nro: number;
        articuloOperacion: {
            articuloId: string;
            nombreArticulo: string;
            codigoArticulo: string;
            state?: string;
            articuloPrecio?: {
                cantidad?: number;
                monedaPrecio?: {
                    precio?: number;
                    precioBase?: number;
                };
            };
        }[];
    }[];
    productos?: {
        articuloId: string;
        nombreArticulo: string;
        codigoArticulo: string;
        articuloPrecio?: {
            cantidad?: number;
            monedaPrecio?: {
                precio?: number;
                precioBase?: number;
            };
        };
        state?: string;
    }[];
    fecha: string;
    autor?: string;
};

const EstadoChip = ({ estado }: { estado?: string }) => {
    const theme = useTheme();

    const estadoColor: Record<string, string> = {
        NUEVO: theme.palette.success.main,
        ELIMINADO: theme.palette.error.main,
        ELABORADO: theme.palette.warning.main,
    };

    const estadoNormalized = (estado ?? '').toUpperCase();
    const backgroundColor = estadoColor[estadoNormalized] ?? theme.palette.grey[500];

    return (
        <Chip
            label={estado ?? '-'}
            size="small"
            sx={{
                backgroundColor,
                color: '#fff',
                fontWeight: 'bold',
            }}
        />
    );
};

export const DetalleAnomalia = ({
    articuloId,
    historial = [],
    productos = [],
    fecha,
}: HistorialPedidoProps) => {
    type Fila = {
        nombreArticulo: string;
        cantidadInicial: number;
        cantidadFinal: number;
        precioInicial: number;
        precioFinal: number;
        estadoInicial: string;
        estadoFinal: string;
        fecha: string;
    };

    if (!historial.length) {
        return (
            <Box mt={2}>
                <Typography variant="h6" color="textSecondary">
                    Sin historial disponible
                </Typography>
            </Box>
        );
    }


    // Filtrar historial para operaciones solo del articuloId indicado
    const historialFiltrado = historial.map(registro => ({
        ...registro,
        articuloOperacion: (registro.articuloOperacion || []).filter(op => op.articuloId === articuloId),
    })).filter(registro => registro.articuloOperacion.length > 0);

    // Mapeo productos por código para buscar precio y estado final
    const productosPorCodigo = new Map(productos.map(p => [p.codigoArticulo, p]));

    // Agrupar operaciones por codigoArticulo, solo de articuloId filtrado
    const operacionesPorArticulo = new Map<
        string,
        { nombreArticulo: string; ops: typeof historial[0]['articuloOperacion'] }
    >();

    historialFiltrado.forEach((registro) => {
        registro.articuloOperacion.forEach((op) => {
            const key = op.codigoArticulo;
            if (!operacionesPorArticulo.has(key)) {
                operacionesPorArticulo.set(key, {
                    nombreArticulo: op.nombreArticulo,
                    ops: [],
                });
            }
            operacionesPorArticulo.get(key)!.ops.push(op);
        });
    });

    const filas: Fila[] = [];

    operacionesPorArticulo.forEach(({ nombreArticulo, ops }, key) => {
        if (ops.length === 0) return;

        const primera = ops[0];
        const ultima = ops[ops.length - 1];
        const productoActual = productosPorCodigo.get(key);

        const cantidadInicial = primera.articuloPrecio?.cantidad ?? 0;
        const precioInicial = primera.articuloPrecio?.monedaPrecio?.precioBase ?? 0;
        const estadoInicial = primera.state ?? '-';

        const cantidadFinal = productoActual?.articuloPrecio?.cantidad ?? 0;
        const precioFinal = productoActual?.articuloPrecio?.monedaPrecio?.precio ?? 0;
        const estadoFinal = ultima.state ?? productoActual?.state ?? '-';

        filas.push({
            nombreArticulo: nombreArticulo ?? key,
            cantidadInicial,
            cantidadFinal,
            precioInicial,
            precioFinal,
            estadoInicial,
            estadoFinal,
            fecha,
        });
    });

    if (!filas.length) {
        return (
            <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                    No se encontraron operaciones para el artículo solicitado.
                </Typography>
            </Box>
        );
    }

    return (
        // <Box>
        <TableContainer component={Paper} >
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ minWidth: 600, maxWidth: 800 }}>Artículo</TableCell>
                        <TableCell align="right" sx={{ minWidth: 60, maxWidth: 80 }}>
                            Cant. Inicial
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: 90, maxWidth: 110 }}>
                            Precio Inicial
                        </TableCell>
                        <TableCell sx={{ minWidth: 110 }}>Estado Inicial</TableCell>
                        <TableCell align="right" sx={{ minWidth: 60, maxWidth: 80 }}>
                            Cant. Final
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: 90, maxWidth: 110 }}>
                            Precio Final
                        </TableCell>
                        <TableCell sx={{ minWidth: 110 }}>Estado Final</TableCell>
                        <TableCell sx={{ minWidth: 110 }}>Fecha</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filas.map((item, idx) => (
                        <TableRow key={idx}>
                            <TableCell
                                sx={{
                                    whiteSpace: 'normal',  // permite varias líneas
                                    wordBreak: 'break-word',
                                    minWidth: 600,
                                    maxWidth: 800,
                                }}
                            >
                                {item.nombreArticulo}
                            </TableCell>
                            <TableCell align="right">{item.cantidadInicial}</TableCell>
                            <TableCell align="right">{numberWithCommas(item.precioInicial, '-')}</TableCell>
                            <TableCell>
                                <EstadoChip estado={item.estadoInicial} />
                            </TableCell>
                            <TableCell align="right">{item.cantidadFinal}</TableCell>
                            <TableCell align="right">{numberWithCommas(item.precioFinal, '-')}</TableCell>
                            <TableCell>
                                <EstadoChip estado={item.estadoFinal} />
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.fecha}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        // {/* </Box> */}
    );
};
