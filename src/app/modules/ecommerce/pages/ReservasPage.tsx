import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import TodayIcon from "@mui/icons-material/Today";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { gql } from "graphql-request";
import React, { FC, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { SimpleContainerBox } from "../../../base/components/Container/SimpleBox";
import Breadcrumb from "../../../base/components/Template/Breadcrumb/Breadcrumb";
import useAuth from "../../../base/hooks/useAuth";
import { getInboxClient } from "../api/inboxClient";
import { ecommerceRoutesMap } from "../ecommerceRoutes";

// ─── GRAPHQL QUERIES & MUTATIONS ─────────────────────────────────────────────

const LIST_SCHEDULED_ORDERS = gql`
  query ListScheduledOrders($shop: String!, $codigoSucursal: Int!) {
    listOrders(
      filter: {
        shop: $shop,
        codigoSucursal: $codigoSucursal,
        estadoInbox: PROGRAMADO
      },
      page: 1,
      limit: 100
    ) {
      totalCount
      orders
    }
  }
`;

const GET_RESERVA_CONFIG = gql`
  query GetReservaConfig($shop: String!, $codigoSucursal: Int!) {
    getReservaConfig(shop: $shop, codigoSucursal: $codigoSucursal) {
      id
      shop
      codigoSucursal
      activo
      diasDisponibles
      horaInicio
      horaFin
      anticipacionMinHoras
      anticipacionMaxDias
      capacidadMaximaPersonas
      maxReservasPorHorario
      maxReservasPorDia
      updatedAt
    }
  }
`;

const UPSERT_RESERVA_CONFIG = gql`
  mutation UpsertReservaConfig($shop: String!, $codigoSucursal: Int!, $config: ReservaConfigInput!) {
    upsertReservaConfig(shop: $shop, codigoSucursal: $codigoSucursal, config: $config) {
      id
      shop
      codigoSucursal
      activo
      diasDisponibles
      horaInicio
      horaFin
      anticipacionMinHoras
      anticipacionMaxDias
      capacidadMaximaPersonas
      maxReservasPorHorario
      maxReservasPorDia
      updatedAt
    }
  }
`;

const CONFIRM_SCHEDULED_ORDER = gql`
  mutation ConfirmScheduledOrder($orderId: String!) {
    confirmScheduledOrder(orderId: $orderId) {
      success
      message
      orderId
      nroPedido
      order
    }
  }
`;

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const DIAS_SEMANA = [
  { id: 1, label: "Lunes", short: "Lun" },
  { id: 2, label: "Martes", short: "Mar" },
  { id: 3, label: "Miércoles", short: "Mié" },
  { id: 4, label: "Jueves", short: "Jue" },
  { id: 5, label: "Viernes", short: "Vie" },
  { id: 6, label: "Sábado", short: "Sáb" },
  { id: 7, label: "Domingo", short: "Dom" },
];

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface ReservaConfigData {
  activo: boolean;
  diasDisponibles: number[];
  horaInicio: string;
  horaFin: string;
  anticipacionMinHoras: number;
  anticipacionMaxDias: number;
  capacidadMaximaPersonas?: number;
  maxReservasPorHorario?: number;
  maxReservasPorDia?: number;
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export const ReservasPage: FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const shop = typeof user?.miEmpresa === "string" ? user.miEmpresa : user?.miEmpresa?.tienda || "sandbox";
  const codigoSucursal = user?.sucursal?.codigo ?? 0;

  const [currentTab, setCurrentTab] = useState<number>(0);

  // Estados Tab Pedidos Programados
  const [scheduledOrders, setScheduledOrders] = useState<any[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [metodoFilter, setMetodoFilter] = useState<string>("TODOS");

  // Estados Tab Configuración
  const [config, setConfig] = useState<ReservaConfigData>({
    activo: false,
    diasDisponibles: [1, 2, 3, 4, 5, 6, 7],
    horaInicio: "10:00",
    horaFin: "22:00",
    anticipacionMinHoras: 1,
    anticipacionMaxDias: 30,
    capacidadMaximaPersonas: 10,
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [previewSelectedDate, setPreviewSelectedDate] = useState<number>(0);
  const [previewSelectedTime, setPreviewSelectedTime] = useState<number>(0);

  // ─── DATA FETCHING: PEDIDOS PROGRAMADOS ─────────────────────────────────────

  const fetchScheduledOrders = async () => {
    if (!shop) return;
    try {
      setIsLoadingScheduled(true);
      const client = getInboxClient();
      const res: any = await client.request(LIST_SCHEDULED_ORDERS, { shop, codigoSucursal });
      setScheduledOrders(res?.listOrders?.orders || []);
    } catch (err) {
      console.error("Error fetching scheduled orders:", err);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  // ─── DATA FETCHING: CONFIGURACIÓN ──────────────────────────────────────────

  const fetchConfig = async () => {
    if (!shop) return;
    try {
      setIsLoadingConfig(true);
      const client = getInboxClient();
      const res: any = await client.request(GET_RESERVA_CONFIG, { shop, codigoSucursal });
      if (res?.getReservaConfig) {
        setConfig({
          activo: Boolean(res.getReservaConfig.activo),
          diasDisponibles: res.getReservaConfig.diasDisponibles || [1, 2, 3, 4, 5, 6, 7],
          horaInicio: res.getReservaConfig.horaInicio || "10:00",
          horaFin: res.getReservaConfig.horaFin || "22:00",
          anticipacionMinHoras: res.getReservaConfig.anticipacionMinHoras ?? 1,
          anticipacionMaxDias: res.getReservaConfig.anticipacionMaxDias ?? 30,
          capacidadMaximaPersonas: res.getReservaConfig.capacidadMaximaPersonas || undefined,
          maxReservasPorHorario: res.getReservaConfig.maxReservasPorHorario || undefined,
          maxReservasPorDia: res.getReservaConfig.maxReservasPorDia || undefined,
        });
      }
    } catch (err) {
      console.error("Error al cargar configuración:", err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchScheduledOrders();
    fetchConfig();
  }, [shop, codigoSucursal]);

  // ─── ACCIÓN: ENVIAR A COCINA ────────────────────────────────────────────────

  const handleConfirmScheduled = async (orderId: string, nroPedido?: string) => {
    const result = await Swal.fire({
      title: "¿Enviar a cocina ahora?",
      text: `El pedido #${nroPedido || orderId} se enviará a cocina y se registrará en comanda inmediatamente.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar a cocina",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#7c3aed",
    });

    if (result.isConfirmed) {
      try {
        const client = getInboxClient();
        const res: any = await client.request(CONFIRM_SCHEDULED_ORDER, { orderId });
        if (res?.confirmScheduledOrder?.success) {
          Swal.fire({
            icon: "success",
            title: "¡Pedido enviado a cocina!",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchScheduledOrders();
        } else {
          Swal.fire("Error", res?.confirmScheduledOrder?.message || "Error al enviar a cocina", "error");
        }
      } catch (err: any) {
        Swal.fire("Error", err?.message || "Error al conectar", "error");
      }
    }
  };

  // ─── ACCIONES: CONFIGURACIÓN ───────────────────────────────────────────────

  const handleToggleDay = (dayId: number) => {
    setConfig((prev) => {
      const exists = prev.diasDisponibles.includes(dayId);
      const nextDays = exists
        ? prev.diasDisponibles.filter((d) => d !== dayId)
        : [...prev.diasDisponibles, dayId].sort((a, b) => a - b);
      return { ...prev, diasDisponibles: nextDays };
    });
  };

  const handleSelectAllDays = () => {
    setConfig((prev) => ({ ...prev, diasDisponibles: [1, 2, 3, 4, 5, 6, 7] }));
  };

  const handleSelectWeekdays = () => {
    setConfig((prev) => ({ ...prev, diasDisponibles: [1, 2, 3, 4, 5] }));
  };

  const handleSelectWeekends = () => {
    setConfig((prev) => ({ ...prev, diasDisponibles: [6, 7] }));
  };

  const handleSaveConfig = async () => {
    try {
      setIsSavingConfig(true);
      const client = getInboxClient();
      await client.request(UPSERT_RESERVA_CONFIG, {
        shop,
        codigoSucursal,
        config: {
          activo: config.activo,
          diasDisponibles: config.diasDisponibles,
          horaInicio: config.horaInicio,
          horaFin: config.horaFin,
          anticipacionMinHoras: Number(config.anticipacionMinHoras),
          anticipacionMaxDias: Number(config.anticipacionMaxDias),
          capacidadMaximaPersonas: config.capacidadMaximaPersonas ? Number(config.capacidadMaximaPersonas) : null,
          maxReservasPorHorario: config.maxReservasPorHorario ? Number(config.maxReservasPorHorario) : null,
          maxReservasPorDia: config.maxReservasPorDia ? Number(config.maxReservasPorDia) : null,
        },
      });

      Swal.fire({
        icon: "success",
        title: "¡Configuración Guardada!",
        text: "Los días y horarios para pedidos programados se han actualizado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire("Error", err?.message || "No se pudo guardar la configuración", "error");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // ─── PREVIEW EN VIVO ───────────────────────────────────────────────────────

  const previewDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const max = Math.min(config.anticipacionMaxDias || 14, 30);
    for (let i = 0; i <= max; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayJs = d.getDay();
      const isoDay = dayJs === 0 ? 7 : dayJs;
      if (config.diasDisponibles.includes(isoDay)) {
        dates.push({
          label: i === 0 ? "Hoy" : i === 1 ? "Mañana" : DIAS_CORTOS[dayJs],
          dayNum: d.getDate(),
          month: d.getMonth() + 1,
        });
      }
      if (dates.length >= 5) break;
    }
    return dates;
  }, [config.diasDisponibles, config.anticipacionMaxDias]);

  const previewTimes = useMemo(() => {
    const [startH] = (config.horaInicio || "10:00").split(":").map(Number);
    const [endH] = (config.horaFin || "22:00").split(":").map(Number);
    const times: string[] = [];
    for (let h = startH; h <= Math.min(endH, startH + 3); h++) {
      times.push(String(h).padStart(2, "0") + ":00");
      if (h < endH) times.push(String(h).padStart(2, "0") + ":30");
    }
    return times.slice(0, 6);
  }, [config.horaInicio, config.horaFin]);

  // ─── FILTRADO Y ESTADÍSTICAS ───────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    return scheduledOrders.filter((ord: any) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (ord.nroPedido && ord.nroPedido.toLowerCase().includes(q)) ||
        (ord.id && ord.id.toLowerCase().includes(q)) ||
        (ord.razonSocial && ord.razonSocial.toLowerCase().includes(q)) ||
        (ord.nitCi && ord.nitCi.toLowerCase().includes(q)) ||
        (ord.direccionEntrega && ord.direccionEntrega.toLowerCase().includes(q))
      );

      const metodo = (ord.metodoEntrega || "").toUpperCase();
      const matchesMetodo =
        metodoFilter === "TODOS" ||
        (metodoFilter === "DELIVERY" && metodo === "DELIVERY") ||
        (metodoFilter === "LLEVAR" && (metodo === "LLEVAR" || metodo === "RECOGER")) ||
        (metodoFilter === "SALON" && (metodo === "SALON" || metodo === "MESA"));

      return matchesSearch && matchesMetodo;
    });
  }, [scheduledOrders, searchQuery, metodoFilter]);

  const stats = useMemo(() => {
    const total = scheduledOrders.length;
    const delivery = scheduledOrders.filter((o: any) => (o.metodoEntrega || "").toUpperCase() === "DELIVERY").length;
    const llevar = scheduledOrders.filter((o: any) => {
      const m = (o.metodoEntrega || "").toUpperCase();
      return m === "LLEVAR" || m === "RECOGER";
    }).length;
    const montoTotal = scheduledOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

    return { total, delivery, llevar, montoTotal };
  }, [scheduledOrders]);

  return (
    <SimpleContainerBox>
      <div className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Ecommerce", path: ecommerceRoutesMap.ecommerce.path },
            { name: "Pedidos Programados" },
          ]}
        />
      </div>

      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid>
            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon color="primary" sx={{ fontSize: 28 }} />
              Pedidos Programados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sucursal #{codigoSucursal} &bull; Tienda: <b>{shop}</b> &bull; Agenda de entregas y retiros futuros
            </Typography>
          </Grid>
          <Grid>
            <Tabs
              value={currentTab}
              onChange={(_, val) => setCurrentTab(val)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                p: 0.5,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Tab icon={<AccessTimeIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Listado de Pedidos Programados" />
              <Tab icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Configuración y Días" />
            </Tabs>
          </Grid>
        </Grid>
      </Box>

      {/* ─── TAB 0: LISTADO DE PEDIDOS PROGRAMADOS ─────────────────────────────── */}
      {currentTab === 0 && (
        <Stack spacing={3}>
          {/* STATS CARDS */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL PROGRAMADOS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#7c3aed" }}>
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    DELIVERY
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#0288d1" }}>
                    {stats.delivery}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PARA LLEVAR / RECOJO
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#ed6c02" }}>
                    {stats.llevar}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    MONTO TOTAL (BS.)
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.success.main }}>
                    Bs. {stats.montoTotal.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* BARRA DE FILTROS */}
          <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por # Pedido, Cliente, Dirección..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <Select
                  fullWidth
                  size="small"
                  value={metodoFilter}
                  onChange={(e) => setMetodoFilter(e.target.value)}
                >
                  <MenuItem value="TODOS">Todos los tipos</MenuItem>
                  <MenuItem value="DELIVERY">Solo Delivery</MenuItem>
                  <MenuItem value="LLEVAR">Solo Para Llevar</MenuItem>
                  <MenuItem value="SALON">Solo Salón / Mesa</MenuItem>
                </Select>
              </Grid>

              <Grid size={{ xs: 12, sm: 2, md: 4 }} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchScheduledOrders}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Actualizar
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* TABLA DE PEDIDOS PROGRAMADOS */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}># PEDIDO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>TIPO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>HORA PROGRAMADA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CLIENTE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ITEMS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingScheduled ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                        Cargando pedidos programados...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <TodayIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={700}>
                        No hay pedidos programados pendientes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cuando los clientes elijan 'Programar pedido' en el checkout, aparecerán listados aquí.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((ord: any) => {
                    const isDelivery = (ord.metodoEntrega || "").toUpperCase() === "DELIVERY";
                    const isLlevar = (ord.metodoEntrega || "").toUpperCase() === "LLEVAR" || (ord.metodoEntrega || "").toUpperCase() === "RECOGER";
                    const items = Array.isArray(ord.items) ? ord.items : [];
                    const itemsSummary = items
                      .map((it: any) => `${it.quantity || 1}x ${it.article?.nombreArticulo || it.nombre || "Item"}`)
                      .join(", ");

                    return (
                      <TableRow key={ord.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800} color="primary.main">
                            #{ord.nroPedido || ord.id.slice(-6).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={isDelivery ? <LocalShippingIcon sx={{ "&&": { fontSize: 14 } }} /> : <ShoppingBagIcon sx={{ "&&": { fontSize: 14 } }} />}
                            label={isDelivery ? "DELIVERY" : isLlevar ? "LLEVAR" : "SALÓN"}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              bgcolor: isDelivery ? alpha("#0288d1", 0.1) : isLlevar ? alpha("#ed6c02", 0.1) : alpha(theme.palette.text.secondary, 0.1),
                              color: isDelivery ? "#0288d1" : isLlevar ? "#ed6c02" : theme.palette.text.secondary,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" sx={{ color: "#7c3aed" }} />
                            <Typography variant="body2" fontWeight={700} sx={{ color: "#7c3aed" }}>
                              {ord.scheduledAt
                                ? `${new Date(ord.scheduledAt).toLocaleDateString([], { weekday: "short", day: "2-digit", month: "2-digit" })} ${new Date(ord.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                : "Programado"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {ord.razonSocial || "Cliente"}
                          </Typography>
                          {ord.nitCi && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              NIT/CI: {ord.nitCi}
                            </Typography>
                          )}
                          {ord.direccionEntrega && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ maxWidth: 220 }} noWrap title={ord.direccionEntrega}>
                              📍 {ord.direccionEntrega}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            Bs. {Number(ord.total || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography variant="body2" color="text.secondary" noWrap title={itemsSummary}>
                            {itemsSummary || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="PROGRAMADO"
                            size="small"
                            sx={{
                              bgcolor: alpha("#7c3aed", 0.15),
                              color: "#7c3aed",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Enviar a cocina inmediatamente">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleConfirmScheduled(ord.id, ord.nroPedido)}
                              sx={{
                                bgcolor: "#7c3aed",
                                "&:hover": { bgcolor: "#6d28d9" },
                                color: "#fff",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                borderRadius: "8px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ⚡ Enviar a cocina
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}

      {/* ─── TAB 1: CONFIGURACIÓN DE DISPONIBILIDAD CON PREVIEW EN VIVO ───────── */}
      {currentTab === 1 && (
        <Grid container spacing={3} alignItems="flex-start">
          {/* COLUMNA IZQUIERDA: CONTROLES DE CONFIGURACIÓN */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3.5 }}>
                {isLoadingConfig ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                      Cargando configuración de la sucursal...
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={4}>
                    {/* SWITCH ACTIVAR */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Habilitar Pedidos Programados
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Permite a los clientes elegir fecha y hora futura para su pedido desde el checkout del ecommerce.
                        </Typography>
                      </Box>
                      <Switch
                        checked={config.activo}
                        onChange={(e) => setConfig({ ...config, activo: e.target.checked })}
                        color="primary"
                      />
                    </Box>

                    {/* DÍAS DISPONIBLES */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        Días Habilitados para Pedidos Anticipados
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                        <Button size="small" variant="outlined" onClick={handleSelectAllDays} sx={{ fontSize: "0.75rem", borderRadius: 1.5, textTransform: "none" }}>
                          Todos los días
                        </Button>
                        <Button size="small" variant="outlined" onClick={handleSelectWeekdays} sx={{ fontSize: "0.75rem", borderRadius: 1.5, textTransform: "none" }}>
                          Lunes a Viernes
                        </Button>
                        <Button size="small" variant="outlined" onClick={handleSelectWeekends} sx={{ fontSize: "0.75rem", borderRadius: 1.5, textTransform: "none" }}>
                          Fines de semana
                        </Button>
                      </Stack>
                      <Grid container spacing={1}>
                        {DIAS_SEMANA.map((dia) => {
                          const isSelected = config.diasDisponibles.includes(dia.id);
                          return (
                            <Grid size={{ xs: 6, sm: 3, md: 1.7 }} key={dia.id}>
                              <Card
                                onClick={() => handleToggleDay(dia.id)}
                                sx={{
                                  p: 1.5,
                                  textAlign: "center",
                                  cursor: "pointer",
                                  borderRadius: 2,
                                  border: "2px solid",
                                  borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
                                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                                  transition: "all 0.2s",
                                }}
                              >
                                <Typography variant="body2" fontWeight={700} color={isSelected ? "primary.main" : "text.secondary"}>
                                  {dia.short}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {dia.label}
                                </Typography>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>

                    {/* RANGO DE HORARIOS */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                        Horario de Entrega / Retiro Programado
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Hora de Inicio"
                            type="time"
                            fullWidth
                            size="small"
                            value={config.horaInicio}
                            onChange={(e) => setConfig({ ...config, horaInicio: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Hora de Cierre"
                            type="time"
                            fullWidth
                            size="small"
                            value={config.horaFin}
                            onChange={(e) => setConfig({ ...config, horaFin: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* REGLAS DE ANTICIPACIÓN */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                        Reglas de Anticipación
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Anticipación Mínima (Horas)"
                            type="number"
                            fullWidth
                            size="small"
                            value={config.anticipacionMinHoras}
                            onChange={(e) => setConfig({ ...config, anticipacionMinHoras: Math.max(0, Number(e.target.value)) })}
                            helperText="Tiempo mínimo antes de la hora fijada (ej. 1 hora)"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Anticipación Máxima (Días)"
                            type="number"
                            fullWidth
                            size="small"
                            value={config.anticipacionMaxDias}
                            onChange={(e) => setConfig({ ...config, anticipacionMaxDias: Math.max(1, Number(e.target.value)) })}
                            helperText="Con cuántos días de antelación se puede agendar (ej. 14 o 30 días)"
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* CUPOS MÁXIMOS */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                        Cupos Máximos de Pedidos Programados (Capacidad)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Máx. Pedidos por Franja Horaria"
                            type="number"
                            fullWidth
                            size="small"
                            value={config.maxReservasPorHorario || ""}
                            onChange={(e) => setConfig({ ...config, maxReservasPorHorario: e.target.value ? Math.max(1, Number(e.target.value)) : undefined })}
                            helperText="Tope de pedidos por intervalo de 30 min (ej. 5 pedidos)"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Máx. Pedidos por Día Completo"
                            type="number"
                            fullWidth
                            size="small"
                            value={config.maxReservasPorDia || ""}
                            onChange={(e) => setConfig({ ...config, maxReservasPorDia: e.target.value ? Math.max(1, Number(e.target.value)) : undefined })}
                            helperText="Tope total diario de pedidos programados (opcional)"
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={isSavingConfig}
                        onClick={handleSaveConfig}
                        sx={{ borderRadius: 2, px: 4, py: 1, textTransform: "none", fontWeight: 700 }}
                      >
                        {isSavingConfig ? "Guardando..." : "Guardar Configuración"}
                      </Button>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* COLUMNA DERECHA: PREVIEW EN VIVO */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2, position: "sticky", top: 20 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  📱 Vista Previa en Vivo (Cliente)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Así se ve el selector de fecha y hora cuando tus clientes eligen 'Programar pedido' en el checkout:
                </Typography>

                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1.5px dashed ${alpha(theme.palette.primary.main, 0.3)}` }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    1. Fechas Disponibles
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1, mb: 2 }}>
                    {previewDates.map((item, idx) => {
                      const isSelected = previewSelectedDate === idx;
                      return (
                        <Box
                          key={idx}
                          onClick={() => setPreviewSelectedDate(idx)}
                          sx={{
                            minWidth: 64,
                            p: 1,
                            textAlign: "center",
                            borderRadius: 2,
                            cursor: "pointer",
                            bgcolor: isSelected ? theme.palette.primary.main : "background.paper",
                            color: isSelected ? "#fff" : "text.primary",
                            border: "1px solid",
                            borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
                          }}
                        >
                          <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={800}>
                            {item.dayNum}/{item.month}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    2. Horarios Habilitados
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {previewTimes.map((time, idx) => {
                      const isSelected = previewSelectedTime === idx;
                      return (
                        <Grid size={{ xs: 4 }} key={idx}>
                          <Box
                            onClick={() => setPreviewSelectedTime(idx)}
                            sx={{
                              p: 1,
                              textAlign: "center",
                              borderRadius: 1.5,
                              cursor: "pointer",
                              bgcolor: isSelected ? theme.palette.primary.main : "background.paper",
                              color: isSelected ? "#fff" : "text.primary",
                              border: "1px solid",
                              borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                          >
                            {time}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="caption" color="text.secondary" display="block">
                    ⏱️ Anticipación mín: <b>{config.anticipacionMinHoras}h</b> &bull; Máx: <b>{config.anticipacionMaxDias} días</b>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    🎟️ Tope por franja: <b>{config.maxReservasPorHorario ? `${config.maxReservasPorHorario} pedidos` : "Ilimitado"}</b>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    📊 Tope total diario: <b>{config.maxReservasPorDia ? `${config.maxReservasPorDia} pedidos` : "Sin tope"}</b>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </SimpleContainerBox>
  );
};

export default ReservasPage;
