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
import { Anomalia } from './AnomaliasListado';

type HistorialPedidoProps = {
    anomalia: Anomalia;
};

const EstadoChip = ({ estado }: { estado?: string }) => {
    const theme = useTheme();

    const estadoColor: Record<string, string> = {
        MODIFICACION_ARTICULOS: theme.palette.warning.main,
        CANCELACION: theme.palette.error.main,
        ANULACION: theme.palette.error.main,
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
    anomalia
}: HistorialPedidoProps) => {

    if (!anomalia) {
        return (
            <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                    No se encontraron detalles para este artículo.
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
        <TableContainer component={Paper} elevation={0} variant="outlined" >
            <Table size="small">
                <TableHead sx={{ backgroundColor: 'primary.main' }}>
                    <TableRow>
                        <TableCell sx={{ minWidth: 200, maxWidth: 400 }}>Artículo</TableCell>
                        <TableCell align="right" sx={{ minWidth: 80 }}>
                            Cantidad
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: 100 }}>
                            Precio
                        </TableCell>
                        <TableCell sx={{ minWidth: 110 }}>Estado</TableCell>
                        <TableCell sx={{ minWidth: 200 }}>Descripción de Anomalía</TableCell>
                        <TableCell sx={{ minWidth: 140 }}>Fecha</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell
                            sx={{
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                minWidth: 200,
                                maxWidth: 400,
                            }}
                        >
                            {anomalia.nombre}
                        </TableCell>
                        <TableCell align="right">{anomalia.cantidad}</TableCell>
                        <TableCell align="right">{numberWithCommas(anomalia.precio, '-')}</TableCell>
                        <TableCell>
                            <EstadoChip estado={anomalia.estadoArticulo} />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word', color: 'error.main' }}>
                            {anomalia.descripcion}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{anomalia.fecha}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
        </Box>
    );
};
