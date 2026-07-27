import CloseIcon from '@mui/icons-material/Close';
import { Alert, Box, Drawer, IconButton, Snackbar, Typography } from '@mui/material';
import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import useAuth from '../../../base/hooks/useAuth';
import { ESTADO_MESA, MesaUI } from '../../restaurante/interfaces/mesa.interface';
import { ArticuloOperacion, RestPedido } from '../../restaurante/types';
import RrAcciones from '../../restaurante/view/registrar/RrAcciones';
import RrCarrito from '../../restaurante/view/registrar/RrCarrito';

interface EcommerceCartDrawerProps {
  open: boolean;
  onClose: () => void;
  pedido: RestPedido | null;
}

const EcommerceCartDrawer: FunctionComponent<EcommerceCartDrawerProps> = ({ open, onClose, pedido }) => {
  const { user } = useAuth();
  const [mesaSeleccionada, setMesaSeleccionada] = useState<MesaUI | null>(null);
  const [isPedidoDirty, setIsPedidoDirty] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; key: number }>({
    open: false,
    message: '',
    key: 0,
  });

  useEffect(() => {
    if (open && pedido) {
      setMesaSeleccionada({
        _id: pedido._id || '',
        value: pedido.mesa?.nombre || '',
        label: pedido.mesa?.nombre ? `Mesa ${pedido.mesa.nombre}` : 'Pedido',
        estado: ESTADO_MESA.OCUPADO,
        pedido,
      });
      setIsPedidoDirty(false);
    }
  }, [open, pedido]);

  const handleUpdateProduct = useCallback((index: number, updatedItem: ArticuloOperacion) => {
    setIsPedidoDirty(true);
    setMesaSeleccionada((prev) => {
      if (!prev || !prev.pedido || !prev.pedido.productos) return prev;
      const productos = [...prev.pedido.productos];
      productos[index] = updatedItem;
      return { ...prev, pedido: { ...prev.pedido, productos } };
    });
  }, []);

  const handleRemoveProduct = useCallback((index: number) => {
    setIsPedidoDirty(true);
    setMesaSeleccionada((prev) => {
      if (!prev || !prev.pedido || !prev.pedido.productos) return prev;
      const productos = [...prev.pedido.productos];
      productos.splice(index, 1);
      return { ...prev, pedido: { ...prev.pedido, productos } };
    });
  }, []);

  const handleClientChange = useCallback((cliente: any) => {
    setIsPedidoDirty(true);
    setMesaSeleccionada((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pedido: {
          ...(prev.pedido || { productos: [] }),
          cliente: {
            _id: cliente._id,
            codigoCliente: cliente.codigoCliente || '0',
            razonSocial: cliente.razonSocial || 'SN',
            numeroDocumento: cliente.numeroDocumento || cliente.nit,
            nit: cliente.nit || cliente.numeroDocumento,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
          },
        } as any,
      };
    });
  }, []);

  const handleNotaChange = useCallback((nota: string) => {
    setIsPedidoDirty(true);
    setMesaSeleccionada((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        pedido: {
          ...(prev.pedido || { productos: [] }),
          nota,
        } as any,
      };
    });
  }, []);

  const handleSuccess = useCallback((pedidoRetornado?: any) => {
    setSnackbar((s) => ({ open: true, message: 'Pedido actualizado exitosamente', key: s.key + 1 }));
    setIsPedidoDirty(false);
    if (pedidoRetornado) {
      setMesaSeleccionada((prev) =>
        prev
          ? {
              ...prev,
              _id: pedidoRetornado._id || prev._id,
              pedido: {
                ...pedidoRetornado,
                nota: pedidoRetornado.nota || prev?.pedido?.nota || '',
                productos: (pedidoRetornado.productos ?? []).map((serverProd: any) => {
                  const localProd =
                    (prev?.pedido?.productos ?? []).find(
                      (lp: any) =>
                        lp.nroItem != null &&
                        serverProd.nroItem != null &&
                        String(lp.nroItem) === String(serverProd.nroItem),
                    ) ??
                    (prev?.pedido?.productos ?? []).find(
                      (lp: any) =>
                        lp.codigoArticulo === serverProd.codigoArticulo &&
                        (lp.articuloId === serverProd.articuloId || !lp.articuloId || !serverProd.articuloId),
                    );

                  const notaProducto =
                    serverProd.nota ||
                    serverProd.detalleExtra ||
                    localProd?.nota ||
                    localProd?.detalleExtra ||
                    '';

                  return {
                    ...serverProd,
                    nota: notaProducto,
                    detalleExtra: serverProd.detalleExtra || notaProducto || undefined,
                  };
                }),
              },
            }
          : prev,
      );
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsPedidoDirty(false);
    onClose();
  }, [onClose]);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleCancel}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 450, md: 500 },
            display: 'flex',
            flexDirection: 'column',
            p: 1.5,
            bgcolor: 'background.default',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {pedido?.mesa?.nombre ? `Mesa ${pedido.mesa.nombre}` : 'Detalle de Orden'}
          </Typography>
          <IconButton onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <RrCarrito
            mesaSeleccionada={mesaSeleccionada}
            onUpdateProduct={handleUpdateProduct}
            onRemoveProduct={handleRemoveProduct}
            onClientChange={handleClientChange}
            onNotaChange={handleNotaChange}
            isReadOnly={true}
          />
        </Box>

        <Box sx={{ flexShrink: 0, mt: 1 }}>
          <RrAcciones
            mesaSeleccionada={mesaSeleccionada}
            isPedidoDirty={isPedidoDirty}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            onClear={handleCancel}
            isEcommerce={true}
          />
        </Box>
      </Drawer>

      <Snackbar
        key={`snackbar-${snackbar.key}`}
        open={snackbar.open}
        autoHideDuration={1200}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="standard" sx={{ minWidth: 250, boxShadow: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EcommerceCartDrawer;
