import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField, Typography, Paper } from '@mui/material'
import { Delete, ColorLens } from '@mui/icons-material'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Swal from 'sweetalert2'

// Fix para el error 404 del icono de Leaflet en producción / servidor
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
})

import { useDeliveryZonesQuery, DeliveryZoneDTO, PuntoPoligono } from '../../hooks/useDeliveryZonesQuery'
import useAuth from '../../../../base/hooks/useAuth'

import { useQuery } from '@tanstack/react-query'
import { apiUsuarioRestriccion } from '../../../base/cuenta/api/usuarioRestriccion.api'

interface Props {
  open: boolean
  onClose: () => void
}

const DEFAULT_CENTER: [number, number] = [-16.5, -68.15] // La Paz, Bolivia as default

// Component to handle map clicks and drawing polygons
const MapDrawLayer = ({
  isDrawing,
  currentPolygon,
  setCurrentPolygon
}: {
  isDrawing: boolean
  currentPolygon: PuntoPoligono[]
  setCurrentPolygon: (p: PuntoPoligono[]) => void
}) => {
  useMapEvents({
    click(e) {
      if (!isDrawing) return
      setCurrentPolygon([...currentPolygon, { lat: e.latlng.lat, lng: e.latlng.lng }])
    }
  })

  return (
    <>
      {currentPolygon.length > 0 && (
        <Polygon positions={currentPolygon.map(p => [p.lat, p.lng])} color="#3388ff" />
      )}
    </>
  )
}

const DeliveryZonesDialog: React.FC<Props> = ({ open, onClose }) => {
  const { user } = useAuth()
  const { deliveryZonesQuery, saveDeliveryZonesMutation } = useDeliveryZonesQuery()
  const [zonas, setZonas] = useState<DeliveryZoneDTO[]>([])

  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPolygon, setCurrentPolygon] = useState<PuntoPoligono[]>([])

  // Traer las coordenadas de la sucursal actual
  const sucursalQuery = useQuery({
    queryKey: ['sucursalRestriccion'],
    queryFn: async () => {
      const resp = await apiUsuarioRestriccion()
      // Buscar por dirección del perfil ya que el codigo en el perfil puede diferir
      const sucDir = user?.sucursal?.direccion
      const found = resp.sucursales.find(s =>
        s.direccion === sucDir || s.codigo === user?.sucursal?.codigo
      )
      return found ?? resp.sucursales[0] ?? null
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  })


  // Sincronizar data inicial
  useEffect(() => {
    if (open && deliveryZonesQuery.data) {
      setZonas(deliveryZonesQuery.data)
    }
  }, [open, deliveryZonesQuery.data])

  const handleFinishDrawing = () => {
    if (currentPolygon.length < 3) {
      Swal.fire('Atención', 'Un polígono debe tener al menos 3 puntos', 'warning')
      return
    }
    const generateRandomColor = () => {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }

    const newZone: DeliveryZoneDTO = {
      nombreZona: `Zona ${zonas.length + 1}`,
      costoEnvio: '',
      colorHex: generateRandomColor(),
      poligono: currentPolygon
    }
    setZonas([...zonas, newZone])
    setCurrentPolygon([])
    setIsDrawing(false)
  }

  const handleCancelDrawing = () => {
    setCurrentPolygon([])
    setIsDrawing(false)
  }

  const handleDeleteZone = (index: number) => {
    setZonas(zonas.filter((_, i) => i !== index))
  }

  const handleUpdateZone = (index: number, field: keyof DeliveryZoneDTO, value: any) => {
    const newZonas = [...zonas]
    newZonas[index] = { ...newZonas[index], [field]: value }
    setZonas(newZonas)
  }

  const handleSaveAll = async () => {
    try {
      await saveDeliveryZonesMutation.mutateAsync(zonas)
      Swal.fire('Éxito', 'Zonas de entrega guardadas correctamente', 'success')
      onClose()
    } catch (e) {
      console.error(e)
      Swal.fire('Error', 'Hubo un error al guardar las zonas', 'error')
    }
  }

  // Posición FIJA de la sucursal — nunca cambia con las zonas
  const sucursalPosition = useMemo(() => {
    let lat = -16.5
    let lng = -68.15
    const coords = sucursalQuery.data?.coordenadas
    if (coords?.latitud && coords?.longitud) {
      lat = parseFloat(coords.latitud)
      lng = parseFloat(coords.longitud)
    }
    return [lat, lng] as [number, number]
  }, [sucursalQuery.data])

  // Centro inicial del mapa — congelado con useRef para no saltar al añadir zonas
  const mapCenterRef = useRef<[number, number] | null>(null)
  if (!mapCenterRef.current && (sucursalPosition[0] !== -16.5 || sucursalPosition[1] !== -68.15)) {
    mapCenterRef.current = sucursalPosition
  }
  const mapCenter = mapCenterRef.current ?? sucursalPosition


  const sucursalNombre = user?.sucursal?.direccion || user?.sucursal?.municipio || 'Sucursal Actual'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Configurar Zonas de Entrega - {sucursalNombre}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ height: '70vh' }}>

          <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%', position: 'relative' }}>
            {/* Controles de Dibujo Flotantes */}
            <Paper sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, p: 1 }}>
              {!isDrawing ? (
                <Button variant="contained" onClick={() => setIsDrawing(true)}>
                  Dibujar Nueva Zona
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button variant="contained" color="success" onClick={handleFinishDrawing}>
                    Terminar Zona
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleCancelDrawing}>
                    Cancelar
                  </Button>
                </Box>
              )}
              {isDrawing && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Haz clic en el mapa para añadir vértices.
                </Typography>
              )}
            </Paper>

            <Box sx={{ height: '100%', width: '100%', border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Pin fijo de la sucursal — nunca se mueve */}
                <Marker position={sucursalPosition} />

                {/* Zonas guardadas */}
                {zonas.map((z, idx) => (
                  <Polygon
                    key={idx}
                    positions={z.poligono.map(p => [p.lat, p.lng])}
                    pathOptions={{ color: z.colorHex, fillColor: z.colorHex, fillOpacity: 0.4 }}
                  />
                ))}

                {/* Zona en progreso */}
                <MapDrawLayer
                  isDrawing={isDrawing}
                  currentPolygon={currentPolygon}
                  setCurrentPolygon={setCurrentPolygon}
                />
              </MapContainer>
            </Box>
          </Grid>

          {/* Panel Lateral: Lista de Zonas */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Zonas Definidas ({zonas.length})
            </Typography>

            {zonas.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No hay zonas definidas. Haz clic en "Dibujar Nueva Zona" para empezar.
              </Typography>
            )}

            {zonas.map((z, i) => (
              <Paper key={i} sx={{ p: 2, mb: 2, borderLeft: `4px solid ${z.colorHex}` }} variant="outlined">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">Zona {i + 1}</Typography>
                  <IconButton size="small" color="error" onClick={() => handleDeleteZone(i)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Nombre de la Zona"
                  value={z.nombreZona}
                  onChange={(e) => handleUpdateZone(i, 'nombreZona', e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label="Precio de Envío (Costo)"
                    type="number"
                    value={z.costoEnvio}
                    onChange={(e) => handleUpdateZone(i, 'costoEnvio', e.target.value)}
                  />
                  <input
                    type="color"
                    value={z.colorHex}
                    onChange={(e) => handleUpdateZone(i, 'colorHex', e.target.value)}
                    style={{ height: '40px', width: '50px', cursor: 'pointer', padding: 0, border: 'none' }}
                  />
                </Box>
              </Paper>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button
          onClick={handleSaveAll}
          variant="contained"
          color="primary"
          disabled={isDrawing || saveDeliveryZonesMutation.isPending}
        >
          {isDrawing ? 'Termina de dibujar la zona primero' : (saveDeliveryZonesMutation.isPending ? 'Guardando...' : 'Guardar Zonas')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeliveryZonesDialog
