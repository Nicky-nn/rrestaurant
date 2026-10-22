import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import TodayIcon from "@mui/icons-material/Today";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const LIST_RESERVAS = gql`
  query ListReservas($shop: String!, $codigoSucursal: Int!, $status: ReservaStatus, $fecha: String) {
    listReservas(shop: $shop, codigoSucursal: $codigoSucursal, status: $status, fecha: $fecha) {
      reservas {
        id
        shop
        codigoSucursal
        userId
        clienteNombre
        clienteTelefono
        tipo
        fecha
        hora
        personas
        notas
        status
        notificacionEnviadaAt
        confirmadoAt
        createdAt
        updatedAt
      }
      totalCount
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

const CONFIRM_RESERVA = gql`
  mutation ConfirmReserva($reservaId: String!, $shop: String) {
    confirmReserva(reservaId: $reservaId, shop: $shop)
  }
`;

const CANCEL_RESERVA = gql`
  mutation CancelReserva($id: String!, $shop: String!) {
    cancelReserva(id: $id, shop: $shop)
  }
`;

const SEND_RESERVA_REMINDER = gql`
  mutation SendReservaReminder($id: String!, $shop: String!, $mensaje: String) {
    sendReservaReminder(id: $id, shop: $shop, mensaje: $mensaje)
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

interface ReservaItem {
  id: string;
  shop: string;
  codigoSucursal: number;
  userId?: string;
  clienteNombre: string;
  clienteTelefono: string;
  tipo: string;
  fecha: string;
  hora: string;
  personas?: number;
  notas?: string;
  status: "PENDIENTE" | "NOTIFICADO" | "CONFIRMADO" | "CANCELADO";
  notificacionEnviadaAt?: string;
  confirmadoAt?: string;
  createdAt: string;
  updatedAt: string;
}

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

  // Estados Tab Reservas
  const [reservas, setReservas] = useState<ReservaItem[]>([]);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("TODAS");
  const [fechaFilter, setFechaFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal Recordatorio
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedReservaForReminder, setSelectedReservaForReminder] = useState<ReservaItem | null>(null);
  const [customReminderMsg, setCustomReminderMsg] = useState("");
  const [isSendingReminder, setIsSendingReminder] = useState(false);

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

  // ─── DATA FETCHING ─────────────────────────────────────────────────────────

  const fetchReservas = async () => {
    if (!shop) return;
    try {
      setIsLoadingReservas(true);
      const client = getInboxClient();
      const variables: any = { shop, codigoSucursal };
      if (statusFilter !== "TODAS") {
        variables.status = statusFilter;
      }
      if (fechaFilter) {
        variables.fecha = fechaFilter;
      }
      const res: any = await client.request(LIST_RESERVAS, variables);
      setReservas(res?.listReservas?.reservas || []);
    } catch (err: any) {
      console.error("Error al cargar reservas:", err);
      // No alertar en 404 inicial
    } finally {
      setIsLoadingReservas(false);
    }
  };

  const fetchConfig = async () => {
    if (!shop) return;
    try {
      setIsLoadingConfig(true);
      const client = getInboxClient();
      const res: any = await client.request(GET_RESERVA_CONFIG, { shop, codigoSucursal });
      if (res?.getReservaConfig) {
        const c = res.getReservaConfig;
        setConfig({
          activo: Boolean(c.activo),
          diasDisponibles: Array.isArray(c.diasDisponibles) ? c.diasDisponibles : [1, 2, 3, 4, 5, 6, 7],
          horaInicio: c.horaInicio || "10:00",
          horaFin: c.horaFin || "22:00",
          anticipacionMinHoras: c.anticipacionMinHoras ?? 1,
          anticipacionMaxDias: c.anticipacionMaxDias ?? 30,
          capacidadMaximaPersonas: c.capacidadMaximaPersonas ?? 10,
          maxReservasPorHorario: c.maxReservasPorHorario ?? undefined,
          maxReservasPorDia: c.maxReservasPorDia ?? undefined,
        });
      }
    } catch (err: any) {
      console.error("Error al cargar configuración de reservas:", err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    fetchConfig();
  }, [shop, codigoSucursal, statusFilter, fechaFilter]);

  // ─── ACCIONES RESERVAS ─────────────────────────────────────────────────────

  const handleConfirmReserva = async (reserva: ReservaItem) => {
    const result = await Swal.fire({
      title: "¿Confirmar reserva?",
      text: `¿Deseas confirmar la reserva de ${reserva.clienteNombre} para el ${reserva.fecha} a las ${reserva.hora}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: theme.palette.success.main,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const client = getInboxClient();
        await client.request(CONFIRM_RESERVA, { reservaId: reserva.id, shop });
        Swal.fire({
          icon: "success",
          title: "¡Reserva Confirmada!",
          text: "El estado ha sido actualizado a CONFIRMADO.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchReservas();
      } catch (err: any) {
        Swal.fire("Error", err?.message || "No se pudo confirmar la reserva", "error");
      }
    }
  };

  const handleCancelReserva = async (reserva: ReservaItem) => {
    const result = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: `Se cancelará la reserva de ${reserva.clienteNombre}. Se notificará al cliente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Regresar",
    });

    if (result.isConfirmed) {
      try {
        const client = getInboxClient();
        await client.request(CANCEL_RESERVA, { id: reserva.id, shop });
        Swal.fire({
          icon: "success",
          title: "Reserva Cancelada",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchReservas();
      } catch (err: any) {
        Swal.fire("Error", err?.message || "No se pudo cancelar la reserva", "error");
      }
    }
  };

  const handleOpenReminderModal = (reserva: ReservaItem) => {
    setSelectedReservaForReminder(reserva);
    setCustomReminderMsg(
      `Hola ${reserva.clienteNombre}, te recordamos que tienes una reserva en nuestro restaurante para hoy ${reserva.fecha} a las ${reserva.hora} (${reserva.personas || 1} personas). ¿Confirmas tu asistencia?`
    );
    setReminderDialogOpen(true);
  };

  const handleSendReminder = async () => {
    if (!selectedReservaForReminder) return;
    try {
      setIsSendingReminder(true);
      const client = getInboxClient();
      await client.request(SEND_RESERVA_REMINDER, {
        id: selectedReservaForReminder.id,
        shop,
        mensaje: customReminderMsg,
      });
      setReminderDialogOpen(false);
      Swal.fire({
        icon: "success",
        title: "¡Recordatorio Encolado!",
        text: "El recordatorio se ha enviado por el canal de notificaciones y BullMQ.",
        timer: 2500,
        showConfirmButton: false,
      });
      fetchReservas();
    } catch (err: any) {
      Swal.fire("Error", err?.message || "No se pudo enviar el recordatorio", "error");
    } finally {
      setIsSendingReminder(false);
    }
  };

  // ─── ACCIONES CONFIGURACIÓN ────────────────────────────────────────────────

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
        text: "Los días y horarios de reserva se han actualizado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire("Error", err?.message || "No se pudo guardar la configuración", "error");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // ─── FILTRADO CLIENT-SIDE PARA BÚSQUEDA ──────────────────────────────────────

  const filteredReservas = useMemo(() => {
    return reservas.filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.clienteNombre.toLowerCase().includes(q) ||
        item.clienteTelefono.includes(q) ||
        (item.notas && item.notas.toLowerCase().includes(q))
      );
    });
  }, [reservas, searchQuery]);

  // Contadores para chips / stats
  const stats = useMemo(() => {
    return {
      total: reservas.length,
      pendientes: reservas.filter((r) => r.status === "PENDIENTE").length,
      notificados: reservas.filter((r) => r.status === "NOTIFICADO").length,
      confirmados: reservas.filter((r) => r.status === "CONFIRMADO").length,
      cancelados: reservas.filter((r) => r.status === "CANCELADO").length,
    };
  }, [reservas]);

  const renderStatusChip = (status: ReservaItem["status"]) => {
    switch (status) {
      case "PENDIENTE":
        return <Chip label="Pendiente" size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.dark, fontWeight: 700 }} />;
      case "NOTIFICADO":
        return <Chip label="Notificado (1h)" size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.dark, fontWeight: 700 }} />;
      case "CONFIRMADO":
        return <Chip label="Confirmado" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.15), color: theme.palette.success.dark, fontWeight: 700 }} />;
      case "CANCELADO":
        return <Chip label="Cancelado" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.15), color: theme.palette.error.dark, fontWeight: 700 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <SimpleContainerBox>
      <div className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Ecommerce", path: ecommerceRoutesMap.ecommerce.path },
            { name: "Reservas" },
          ]}
        />
      </div>

      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid>
            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary, display: "flex", alignItems: "center", gap: 1 }}>
              <RestaurantIcon color="primary" sx={{ fontSize: 28 }} />
              Gestión de Reservaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sucursal #{codigoSucursal} &bull; Tienda: <b>{shop}</b>
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
              <Tab icon={<EventSeatIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Listado de Reservas" />
              <Tab icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Configuración y Días" />
            </Tabs>
          </Grid>
        </Grid>
      </Box>

      {/* ─── TAB 0: LISTADO DE RESERVAS ────────────────────────────────────────── */}
      {currentTab === 0 && (
        <Stack spacing={3}>
          {/* STATS CARDS */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL RESERVAS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {stats.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PENDIENTES
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.warning.main }}>
                    {stats.pendientes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    RECORDADOS (1H)
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.info.main }}>
                    {stats.notificados}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    CONFIRMADOS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.success.main }}>
                    {stats.confirmados}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    CANCELADOS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.error.main }}>
                    {stats.cancelados}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* FILTERS & SEARCH */}
          <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por cliente o teléfono..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3, md: 2.5 }}>
                  <Select
                    fullWidth
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="TODAS">Todos los Estados</MenuItem>
                    <MenuItem value="PENDIENTE">Pendientes</MenuItem>
                    <MenuItem value="NOTIFICADO">Notificados</MenuItem>
                    <MenuItem value="CONFIRMADO">Confirmados</MenuItem>
                    <MenuItem value="CANCELADO">Cancelados</MenuItem>
                  </Select>
                </Grid>
                <Grid size={{ xs: 12, sm: 3, md: 2.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Fecha de Reserva"
                    InputLabelProps={{ shrink: true }}
                    value={fechaFilter}
                    onChange={(e) => setFechaFilter(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2, md: 4 }} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  {fechaFilter && (
                    <Button size="small" variant="text" onClick={() => setFechaFilter("")}>
                      Limpiar fecha
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={isLoadingReservas ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={fetchReservas}
                    disabled={isLoadingReservas}
                  >
                    Actualizar
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* TABLE OF RESERVAS */}
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha y Hora</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Personas</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Notas</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingReservas ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                        Cargando reservas...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredReservas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <EventSeatIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                        No hay reservas encontradas
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        {statusFilter !== "TODAS" || fechaFilter || searchQuery
                          ? "Intenta cambiar o limpiar los filtros."
                          : "Cuando los clientes hagan reservas desde la web, aparecerán aquí."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservas.map((item) => {
                    const cleanPhone = item.clienteTelefono.replace(/[^0-9]/g, "");
                    const waLink = cleanPhone.startsWith("591")
                      ? `https://wa.me/${cleanPhone}`
                      : `https://wa.me/591${cleanPhone}`;

                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {item.clienteNombre}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {item.clienteTelefono}
                            </Typography>
                            {cleanPhone && (
                              <Tooltip title="Chatear en WhatsApp">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={waLink}
                                  target="_blank"
                                  sx={{ color: "#25D366", p: 0.2 }}
                                >
                                  <WhatsAppIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={item.tipo === "SALON" ? <EventSeatIcon sx={{ fontSize: 16 }} /> : <RestaurantIcon sx={{ fontSize: 16 }} />}
                            label={item.tipo === "SALON" ? "Mesa / Salón" : "Para Recoger"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CalendarMonthIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {item.fecha}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 14 }} /> {item.hora}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600}>
                              {item.personas ? `${item.personas} pers.` : "—"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography variant="body2" color="text.secondary" noWrap title={item.notas || ""}>
                            {item.notas || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>{renderStatusChip(item.status)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {item.status !== "CONFIRMADO" && item.status !== "CANCELADO" && (
                              <Tooltip title="Confirmar Reserva">
                                <IconButton
                                  size="small"
                                  sx={{ color: theme.palette.success.main }}
                                  onClick={() => handleConfirmReserva(item)}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {item.status !== "CANCELADO" && (
                              <Tooltip title="Enviar Recordatorio (1h antes o manual)">
                                <IconButton
                                  size="small"
                                  sx={{ color: theme.palette.info.main }}
                                  onClick={() => handleOpenReminderModal(item)}
                                >
                                  <NotificationsActiveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {item.status !== "CANCELADO" && (
                              <Tooltip title="Cancelar Reserva">
                                <IconButton
                                  size="small"
                                  sx={{ color: theme.palette.error.main }}
                                  onClick={() => handleCancelReserva(item)}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
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

      {/* ─── TAB 1: CONFIGURACIÓN DE DISPONIBILIDAD ────────────────────────────── */}
      {currentTab === 1 && (
        <Card sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
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
                      Habilitar Sistema de Reservas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Permite a los clientes agendar reservas de mesa o pedidos anticipados desde la tienda online.
                    </Typography>
                  </Box>
                  <Switch
                    checked={config.activo}
                    onChange={(e) => setConfig((p) => ({ ...p, activo: e.target.checked }))}
                    color="primary"
                  />
                </Box>

                <Divider />

                {/* DÍAS DISPONIBLES */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Días Disponibles para Reservas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Selecciona qué días de la semana la sucursal acepta reservaciones.
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Button size="small" variant="outlined" onClick={handleSelectAllDays}>
                      Todos los días
                    </Button>
                    <Button size="small" variant="outlined" onClick={handleSelectWeekdays}>
                      Lunes a Viernes
                    </Button>
                    <Button size="small" variant="outlined" onClick={handleSelectWeekends}>
                      Fines de Semana
                    </Button>
                  </Stack>

                  <Grid container spacing={1.5}>
                    {DIAS_SEMANA.map((dia) => {
                      const isSelected = config.diasDisponibles.includes(dia.id);
                      return (
                        <Grid size={{ xs: 6, sm: 3, md: 1.7 }} key={dia.id}>
                          <Paper
                            onClick={() => handleToggleDay(dia.id)}
                            elevation={0}
                            sx={{
                              p: 1.5,
                              textAlign: "center",
                              cursor: "pointer",
                              border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                              bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                              borderRadius: 2,
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: theme.palette.primary.main,
                              },
                            }}
                          >
                            <Typography variant="body2" fontWeight={700} color={isSelected ? "primary.main" : "text.primary"}>
                              {dia.label}
                            </Typography>
                            <Chip
                              size="small"
                              label={isSelected ? "Abierto" : "Cerrado"}
                              sx={{
                                mt: 0.5,
                                fontSize: "0.65rem",
                                height: 20,
                                bgcolor: isSelected ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.error.main, 0.1),
                                color: isSelected ? theme.palette.success.dark : theme.palette.error.dark,
                                fontWeight: 700,
                              }}
                            />
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>

                <Divider />

                {/* HORARIO DE RESERVAS */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Horario de Atención para Reservas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Franja horaria durante la cual los comensales pueden agendar su visita.
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Hora de Inicio"
                        type="time"
                        value={config.horaInicio}
                        onChange={(e) => setConfig((p) => ({ ...p, horaInicio: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Hora de Cierre / Límite"
                        type="time"
                        value={config.horaFin}
                        onChange={(e) => setConfig((p) => ({ ...p, horaFin: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* REGLAS DE ANTICIPACIÓN Y CAPACIDAD */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Reglas de Reserva y Capacidad
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Anticipación Mínima (Horas)"
                        type="number"
                        value={config.anticipacionMinHoras}
                        onChange={(e) => setConfig((p) => ({ ...p, anticipacionMinHoras: parseInt(e.target.value) || 1 }))}
                        helperText="Tiempo mínimo previo antes de la reserva (ej. 1 hora)"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Anticipación Máxima (Días)"
                        type="number"
                        value={config.anticipacionMaxDias}
                        onChange={(e) => setConfig((p) => ({ ...p, anticipacionMaxDias: parseInt(e.target.value) || 30 }))}
                        helperText="Máximo de días a futuro permitidos para agendar (ej. 30 días)"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Máx. Personas por Mesa"
                        type="number"
                        value={config.capacidadMaximaPersonas || ""}
                        onChange={(e) => setConfig((p) => ({ ...p, capacidadMaximaPersonas: parseInt(e.target.value) || undefined }))}
                        helperText="Límite de comensales por grupo/mesa (opcional)"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Máx. Reservas por Turno/Horario"
                        type="number"
                        value={config.maxReservasPorHorario || ""}
                        onChange={(e) => setConfig((p) => ({ ...p, maxReservasPorHorario: parseInt(e.target.value) || undefined }))}
                        helperText="Cupo de reservas simultáneas por franja horaria (ej. 3 mesas)"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Máx. Reservas Totales por Día"
                        type="number"
                        value={config.maxReservasPorDia || ""}
                        onChange={(e) => setConfig((p) => ({ ...p, maxReservasPorDia: parseInt(e.target.value) || undefined }))}
                        helperText="Tope diario de reservas para toda la fecha (opcional)"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={isSavingConfig ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                    sx={{ px: 4, py: 1.2, fontWeight: 700 }}
                  >
                    Guardar Configuración
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── MODAL ENVIAR RECORDATORIO ─────────────────────────────────────────── */}
      <Dialog open={reminderDialogOpen} onClose={() => setReminderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Enviar Recordatorio al Cliente</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Este mensaje se enviará a la cola BullMQ de recordatorios y notificará en tiempo real al cliente:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mensaje del Recordatorio"
            value={customReminderMsg}
            onChange={(e) => setCustomReminderMsg(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReminderDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendReminder}
            disabled={isSendingReminder}
            startIcon={isSendingReminder ? <CircularProgress size={16} /> : <NotificationsActiveIcon />}
          >
            Enviar Ahora
          </Button>
        </DialogActions>
      </Dialog>
    </SimpleContainerBox>
  );
};

export default ReservasPage;
