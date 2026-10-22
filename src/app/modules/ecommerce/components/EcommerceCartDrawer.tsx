import CloseIcon from '@mui/icons-material/Close';
import { Alert, Box, Button, Drawer, IconButton, Snackbar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Swal from 'sweetalert2';
import { useConfirmScheduledOrder } from '../mutations/useConfirmScheduledOrder';
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
  const { mutate: confirmScheduled, isPending: isConfirming } = useConfirmScheduledOrder();

  const handleConfirmScheduledNow = async () => {
    if (!pedido?._id) return;
    const result = await Swal.fire({
      title: '¿Enviar a cocina ahora?',
      text: 'Este pedido fue programado para más tarde. Si lo envías ahora, entrará a comandas y cocina inmediatamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar a cocina',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed',
    });

    if (result.isConfirmed) {
      confirmScheduled(pedido._id, {
        onSuccess: (data: any) => {
          if (data?.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Pedido enviado a cocina!',
              text: 'El pedido fue registrado en Isicore y notificado a cocina.',
              timer: 2000,
              showConfirmButton: false,
            });
            onClose();
          } else {
            Swal.fire('Error', data?.message || 'No se pudo enviar a cocina', 'error');
          }
        },
        onError: (err: any) => {
          Swal.fire('Error', err?.message || 'Error al conectar con el servidor', 'error');
        },
      });
    }
  };

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

        {((pedido as any)?.state === 'PROGRAMADO' || (pedido as any)?.scheduledAt) && (
          <Box sx={{ mb: 1.5, p: 1.5, bgcolor: alpha('#7c3aed', 0.1), border: '1px solid #c4b5fd', borderRadius: '10px' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#6d28d9' }}>
              📅 Pedido Programado
            </Typography>
            <Typography variant="body2" sx={{ color: '#5b21b6', fontSize: '0.8rem', mt: 0.25 }}>
              Programado para: {new Date((pedido as any).scheduledAt || pedido?.createdAt || Date.now()).toLocaleString([], { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              disabled={isConfirming}
              onClick={handleConfirmScheduledNow}
              sx={{
                mt: 1.5,
                bgcolor: '#7c3aed',
                '&:hover': { bgcolor: '#6d28d9' },
                color: '#fff',
                fontWeight: 'bold',
                textTransform: 'none',
                py: 0.75,
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}
            >
              {isConfirming ? 'Enviando a cocina...' : '⚡ Enviar a Cocina ahora'}
            </Button>
          </Box>
        )}

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
