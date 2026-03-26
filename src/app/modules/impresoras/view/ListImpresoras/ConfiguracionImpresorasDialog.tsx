import {
  CheckCircle,
  Close,
  Delete,
  Description,
  GridView,
  Print,
  Refresh,
  Save,
  Search,
  Settings,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { FunctionComponent, useEffect, useRef, useState } from 'react'

import useAuth from '../../../../base/hooks/useAuth'
import { notError, notSuccess } from '../../../../utils/notification'
import { useTipoArticuloListado } from '../../../restaurante/queries/useTipoArticuloListado'

interface OwnProps {
  open: boolean
  onClose: (saved?: boolean) => void
}

type Props = OwnProps

interface Printer {
  name: string
  ip?: string
}

interface PrinterSettings {
  comanda: string | { [key: string]: string }
  estadoDeCuenta: string
  facturar: string
  impresionAutomatica: {
    facturar: boolean
    comanda: boolean
    estadoDeCuenta: boolean
    actualizarYComandar?: boolean
  }
  manualPrinters: Printer[]
  impresionPorCategorias?: boolean
  categoriasAsignadas?: { [key: string]: string }
}

const ConfiguracionImpresorasDialog: FunctionComponent<Props> = ({ open, onClose }) => {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [isServerConnected, setIsServerConnected] = useState(false)
  const [selectedComandaPrinter, setSelectedComandaPrinter] = useState<string>('')
  const [selectedEstadoDeCuentaPrinter, setSelectedEstadoDeCuentaPrinter] = useState<string>('')
  const [selectedFacturarPrinter, setSelectedFacturarPrinter] = useState<string>('')
  const [impresionAutomatica, setImpresionAutomatica] = useState({
    facturar: false,
    comanda: false,
    estadoDeCuenta: false,
    actualizarYComandar: false,
  })
  const [newPrinterName, setNewPrinterName] = useState('')
  const [newPrinterIP, setNewPrinterIP] = useState('')
  const [manualPrinters, setManualPrinters] = useState<Printer[]>([])
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [errorIP, setErrorIP] = useState(false)

  // Nuevos estados para categorías
  const [impresionPorCategorias, setImpresionPorCategorias] = useState(false)
  const [categoriasAsignadas, setCategoriasAsignadas] = useState<{ [key: string]: string }>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const { li } = useAuth()

  const { data: catData, isLoading: loadingCategorias } = useTipoArticuloListado(
    { limit: 100, reverse: false },
    { enabled: open && impresionPorCategorias },
  )
  const categoriasPorSucursal = catData?.docs || []

  const impresion = li
  const state = impresion?.licencia?.state || ''
  const fechaVencimiento = impresion?.licencia?.fechaVencimiento || ''
  const fechaActual = new Date()

  const parseFechaVencimiento = (dateStr: string): Date => {
    if (!dateStr) return new Date(0)
    const parts = dateStr.split('/')
    if (parts.length < 3) return new Date(0)
    const [day, month, rest] = parts
    const [year, time] = rest.split(' ')
    return new Date(`${year}-${month}-${day}T${time || '00:00'}`)
  }

  const fechaVencimientoDate = parseFechaVencimiento(fechaVencimiento)
  const showComponent = state === 'ACTIVADO' && fechaVencimientoDate > fechaActual

  const saveSettings = () => {
    // Si impresión por categorías está activado, guardamos el map en 'comanda', de lo contrario el string puro
    const printerSettings: PrinterSettings = {
      comanda: impresionPorCategorias ? categoriasAsignadas : getPrinterValue(selectedComandaPrinter),
      estadoDeCuenta: getPrinterValue(selectedEstadoDeCuentaPrinter),
      facturar: getPrinterValue(selectedFacturarPrinter),
      impresionAutomatica,
      manualPrinters,
      impresionPorCategorias,
      categoriasAsignadas,
    }
    localStorage.setItem('printers', JSON.stringify(printerSettings))
    setHasUnsavedChanges(false)

    notSuccess('Configuración guardada correctamente')
    onClose(true)
  }

  const scan = async (manual = true) => {
    setIsScanning(true)
    const TOKEN = import.meta.env.ISI_SECRET_PRINTER_TOKEN
    const serverUrl = TOKEN ? '/local-printers/printers' : 'http://localhost:7777/printers'
    const fallbackUrl = 'AdePrint:live'

    const headers: Record<string, string> = {}
    if (TOKEN) {
      headers['X-Secret-Token'] = TOKEN
    }

    try {
      const response = await fetch(serverUrl, { method: 'HEAD', headers }).catch(() => null)
      if (response && response.ok) {
        const dataResponse = await fetch(serverUrl, { headers })
        const data = await dataResponse.json()
        const availablePrinters = (data.printers || []).map((printerName: string) => ({
          name: printerName,
        }))

        // Usamos prevPrinters para obtener las impresoras manuales más recientes (que tienen IP)
        // evitando problemas de estado obsoleto (stale closure) al momento en que `scan` fue definido.
        setPrinters((prevPrinters) => {
          const currentManuals = prevPrinters.filter((p) => p.ip)
          const combinedPrinters = [...availablePrinters, ...currentManuals]
          return Array.from(new Set(combinedPrinters.map((p) => p.name))).map(
            (name) => combinedPrinters.find((p) => p.name === name)!,
          )
        })
        setIsServerConnected(true)
      } else {
        setIsServerConnected(false)
        throw new Error('Servidor local no disponible')
      }
    } catch (error) {
      setIsServerConnected(false)
      console.error('Error al escanear impresoras:', error)
      if (manual) {
        notError(
          'No se pudo escanear las impresoras disponibles en la red, verifique que la Aplicación de Impresión esté en ejecución.',
        )
      }

      try {
        if (manual) window.location.href = fallbackUrl
      } catch (fallbackError) {
        console.error('Error al usar el fallback AdePrint:live:', fallbackError)
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
        if (!/android/i.test(userAgent) && !/iPad|iPhone|iPod/.test(userAgent)) {
          if (manual) {
            notError('No se pudo abrir la Aplicación de Impresión. Verifique que esté instalada.')
          }
        }
      }
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => {
    if (!open) return

    const savedPrinters = localStorage.getItem('printers')
    let parsedPrinters: PrinterSettings | null = null

    if (savedPrinters) {
      try {
        parsedPrinters = JSON.parse(savedPrinters)
        const storedManual = parsedPrinters?.manualPrinters || []
        setManualPrinters(storedManual)

        const getPrinterName = (storedValue: string) => {
          const manualMatch = storedManual.find((m: Printer) => m.ip === storedValue)
          return manualMatch ? manualMatch.name : storedValue
        }

        const comandaVal = typeof parsedPrinters?.comanda === 'string' ? parsedPrinters.comanda : ''
        setSelectedComandaPrinter(getPrinterName(comandaVal))

        const estadoDeCuentaValue = parsedPrinters?.estadoDeCuenta || ''
        setSelectedEstadoDeCuentaPrinter(getPrinterName(estadoDeCuentaValue))

        const facturarValue = parsedPrinters?.facturar || ''
        setSelectedFacturarPrinter(getPrinterName(facturarValue))

        setImpresionAutomatica({
          facturar: parsedPrinters?.impresionAutomatica?.facturar || false,
          comanda: parsedPrinters?.impresionAutomatica?.comanda || false,
          estadoDeCuenta: parsedPrinters?.impresionAutomatica?.estadoDeCuenta || false,
          actualizarYComandar: parsedPrinters?.impresionAutomatica?.actualizarYComandar || false,
        })

        setImpresionPorCategorias(parsedPrinters?.impresionPorCategorias || false)
        
        const rawCategorias = parsedPrinters?.categoriasAsignadas || {}
        const mappedCategorias = Object.keys(rawCategorias).reduce((acc, key) => {
          acc[key] = getPrinterName(rawCategorias[key])
          return acc
        }, {} as { [key: string]: string })
        setCategoriasAsignadas(mappedCategorias)
      } catch (error) {
        console.error('Error parsing printers from localStorage:', error)
      }
    }

    // Escaneo silencioso
    scan(false)

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    if (/android|iPad|iPhone|iPod/i.test(userAgent)) {
      setIsMobile(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    setPrinters((prevPrinters) => {
      const existingPrinters = prevPrinters.filter((p) => !p.ip)
      const merged = [...existingPrinters, ...manualPrinters]
      // Eliminar duplicados por nombre
      return Array.from(new Set(merged.map((p) => p.name))).map((n) => merged.find((p) => p.name === n)!)
    })
  }, [manualPrinters])

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setHasUnsavedChanges(true)
  }, [
    selectedComandaPrinter,
    selectedEstadoDeCuentaPrinter,
    selectedFacturarPrinter,
    impresionAutomatica,
    manualPrinters,
    impresionPorCategorias,
    categoriasAsignadas,
  ])

  const getPrinterValue = (selectedPrinter: string) => {
    const printer = printers.find((p) => p.name === selectedPrinter)
    if (printer && printer.ip) {
      return printer.ip
    }
    return selectedPrinter
  }

  const handleImpresionAutomaticaChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'facturar' | 'comanda' | 'estadoDeCuenta' | 'actualizarYComandar',
  ) => {
    if (type === 'comanda' && !event.target.checked) {
      setImpresionAutomatica((prev) => ({
        ...prev,
        comanda: false,
        actualizarYComandar: false,
      }))
    } else {
      setImpresionAutomatica((prev) => ({
        ...prev,
        [type]: event.target.checked,
      }))
    }
  }

  const handleCategoriaAsignacion = (categoriaId: string, impresora: string) => {
    setCategoriasAsignadas((prev) => ({
      ...prev,
      [categoriaId]: impresora,
    }))
  }

  const handleAddPrinter = () => {
    if (newPrinterName && newPrinterIP && !errorIP) {
      const newPrinter: Printer = {
        name: newPrinterName,
        ip: newPrinterIP,
      }
      setManualPrinters([...manualPrinters, newPrinter])
      setNewPrinterName('')
      setNewPrinterIP('')
      notSuccess('Impresora manual agregada localmente')
    }
  }

  const removeManualPrinter = (name: string) => {
    setManualPrinters((prev) => prev.filter((p) => p.name !== name))
  }

  const validateIP = (value: string) => {
    const ipPortPattern =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:\d{1,5})?$/
    return ipPortPattern.test(value)
  }

  const handleChangeIP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPrinterIP(value)
    setErrorIP(!validateIP(value) && value !== '')
  }

  // Si no hay licencia activa local
  if (!showComponent) {
    return (
      <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configuración de Impresión Local</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning">
            Para usar las configuraciones locales automáticas, su equipo debe tener Licencia de Impresión
            activa y vigente.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxWidth: 900, bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
              display: 'flex',
              color: 'primary.main',
            }}
          >
            <Print fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            Configuración de Impresoras
          </Typography>
        </Box>
        <IconButton onClick={() => onClose(false)}>
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ p: 0, display: 'flex', minHeight: 450 }}>
        {/* SIDEBAR */}
        <Box
          sx={{
            width: 260,
            borderRight: 1,
            borderColor: 'divider',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {[
            { label: 'Equipos', icon: <Print /> },
            { label: 'Documentos', icon: <Description /> },
            { label: 'Áreas (Categorías)', icon: <GridView /> },
            { label: 'Automatización', icon: <Settings /> },
          ].map((tab, idx) => (
            <Box
              key={idx}
              onClick={() => setActiveTab(idx)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor:
                  activeTab === idx ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                color: activeTab === idx ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  bgcolor:
                    activeTab === idx ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'action.hover',
                },
                fontWeight: activeTab === idx ? 'bold' : 'medium',
              }}
            >
              {tab.icon}
              <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                {tab.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* CONTENT AREA */}
        <Box sx={{ flex: 1, p: 4, overflowY: 'auto', bgcolor: 'background.default' }}>
          {activeTab === 0 && (
            <Box>
              <Box
                sx={{
                  bgcolor: isServerConnected
                    ? (theme) => alpha(theme.palette.success.main, 0.1)
                    : 'background.paper',
                  borderRadius: 3,
                  p: 5,
                  textAlign: 'center',
                  mb: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: 1,
                  borderColor: isServerConnected ? 'success.main' : 'divider',
                  transition: 'all 0.3s ease',
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'background.paper',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                    color: isServerConnected ? 'success.main' : 'primary.main',
                    boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  {isServerConnected ? <CheckCircle fontSize="large" /> : <Search fontSize="large" />}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: isServerConnected ? 'success.dark' : 'text.primary',
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                >
                  {isServerConnected ? 'Servidor Local Conectado' : 'Búsqueda Automática'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isServerConnected ? 'success.main' : 'text.secondary', mb: 3, maxWidth: 350 }}
                >
                  {isServerConnected
                    ? 'Las impresoras se han sincronizado correctamente con la aplicación local.'
                    : 'Requiere la aplicación local ejecutándose en localhost:7777 para detectar impresoras USB o de red local.'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={isServerConnected ? <Refresh /> : <Search />}
                  onClick={() => scan(true)}
                  disabled={isScanning}
                  disableElevation
                  color={isServerConnected ? 'success' : 'primary'}
                  sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1.5, fontWeight: 'bold' }}
                >
                  {isServerConnected ? 'Volver a Escanear' : 'Escanear Impresoras'}
                </Button>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  mb: 2,
                  display: 'block',
                }}
              >
                IMPRESORAS DETECTADAS
              </Typography>

              {printers.length === 0 && !isScanning && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  No se han detectado impresoras. Intente escanear nuevamente.
                </Typography>
              )}

              {printers.map((p) => (
                <Box
                  key={p.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1.5,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box
                    sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, mr: 2, color: 'text.secondary' }}
                  >
                    <Print />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      {p.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {p.ip ? `Red / ${p.ip}` : 'USB / Local'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                      color: 'success.main',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 4,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Online
                    </Typography>
                  </Box>
                </Box>
              ))}

              {!isMobile && (
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    Agregar Impresora (Manual)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: manualPrinters.length > 0 ? 2 : 0 }}>
                    <TextField
                      label="Nombre IP (Ej: Cocina)"
                      size="small"
                      sx={{ flex: 1 }}
                      value={newPrinterName}
                      onChange={(e) => setNewPrinterName(e.target.value)}
                    />
                    <TextField
                      label="IP:Puerto (192.168.1.100:9100)"
                      size="small"
                      sx={{ flex: 1 }}
                      value={newPrinterIP}
                      onChange={handleChangeIP}
                      error={errorIP}
                      helperText={errorIP ? 'Formato Invalido' : ''}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ textTransform: 'none' }}
                      onClick={handleAddPrinter}
                      disabled={!newPrinterIP || !newPrinterName || errorIP}
                    >
                      Agregar
                    </Button>
                  </Box>

                  {manualPrinters.length > 0 && (
                    <Box>
                      {manualPrinters.map((mp) => (
                        <Box
                          key={mp.name}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            bgcolor: 'action.hover',
                            p: 1.5,
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {mp.name}{' '}
                            <Typography component="span" variant="caption" color="text.secondary">
                              ({mp.ip})
                            </Typography>
                          </Typography>
                          <IconButton size="small" color="error" onClick={() => removeManualPrinter(mp.name)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                Documentos Principales
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Asignación rápida de las impresoras predeterminadas por tipo de documento.
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }} size="small">
                <InputLabel>Impresora Factura</InputLabel>
                <Select
                  value={selectedFacturarPrinter}
                  label="Impresora Factura"
                  onChange={(e) => setSelectedFacturarPrinter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Ninguna</em>
                  </MenuItem>
                  {printers.map((p) => (
                    <MenuItem key={p.name} value={p.name}>
                      {p.name} {p.ip ? `(${p.ip})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }} size="small">
                <InputLabel>Impresora Estado de Cuenta</InputLabel>
                <Select
                  value={selectedEstadoDeCuentaPrinter}
                  label="Impresora Estado de Cuenta"
                  onChange={(e) => setSelectedEstadoDeCuentaPrinter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Ninguna</em>
                  </MenuItem>
                  {printers.map((p) => (
                    <MenuItem key={p.name} value={p.name}>
                      {p.name} {p.ip ? `(${p.ip})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }} size="small" disabled={impresionPorCategorias}>
                <InputLabel>Impresora Comanda (General)</InputLabel>
                <Select
                  value={selectedComandaPrinter}
                  label="Impresora Comanda (General)"
                  onChange={(e) => setSelectedComandaPrinter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Ninguna</em>
                  </MenuItem>
                  {printers.map((p) => (
                    <MenuItem key={p.name} value={p.name}>
                      {p.name} {p.ip ? `(${p.ip})` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {impresionPorCategorias && (
                  <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                    Habilitado desde la pestaña de Áreas (Categorías), esto desactiva la comanda general.
                  </Typography>
                )}
              </FormControl>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                Áreas y Categorías (Comandas Por Separado)
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Si tienes distintas áreas de preparación (Cocina, Bar, Parrilla), puedes enviar las comandas
                de cada producto a su impresora específica.
              </Typography>

              <Box
                sx={{
                  p: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={impresionPorCategorias}
                      onChange={(e) => {
                        setImpresionPorCategorias(e.target.checked)
                        if (!e.target.checked) setCategoriasAsignadas({})
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Habilitar Envío por Categorías
                    </Typography>
                  }
                />
              </Box>

              {impresionPorCategorias && (
                <Box>
                  {loadingCategorias ? (
                    <Typography variant="body2" color="textSecondary">
                      Cargando categorías...
                    </Typography>
                  ) : (
                    (categoriasPorSucursal || []).map((cat) => (
                      <FormControl fullWidth sx={{ mb: 2 }} size="small" key={cat._id || 'anon'}>
                        <InputLabel>{cat.descripcion}</InputLabel>
                        <Select
                          value={categoriasAsignadas[cat._id || ''] || ''}
                          label={cat.descripcion}
                          onChange={(e) => handleCategoriaAsignacion(cat._id || '', e.target.value)}
                        >
                          <MenuItem value="">
                            <em>No imprimir esta categoría</em>
                          </MenuItem>
                          {printers.map((p) => (
                            <MenuItem key={p.name} value={p.name}>
                              {p.name} {p.ip ? `(${p.ip})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))
                  )}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
                Automatización
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Configura en qué momento del proceso quieres que los documentos se impriman solos sin que el
                usuario tenga que dar click manualmente.
              </Typography>

              <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'text.primary' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={impresionAutomatica.facturar}
                      onChange={(e) => handleImpresionAutomaticaChange(e, 'facturar')}
                    />
                  }
                  label="Al cobrar e emitir Factura"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={impresionAutomatica.estadoDeCuenta}
                      onChange={(e) => handleImpresionAutomaticaChange(e, 'estadoDeCuenta')}
                    />
                  }
                  label="Al generar Estado de Cuenta"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={impresionAutomatica.comanda}
                      onChange={(e) => handleImpresionAutomaticaChange(e, 'comanda')}
                    />
                  }
                  label="Al confirmar un Pedido (Comanda)"
                />
                <Box sx={{ pl: 4 }}>
                  <FormControlLabel
                    disabled={!impresionAutomatica.comanda}
                    control={
                      <Checkbox
                        checked={impresionAutomatica.actualizarYComandar}
                        onChange={(e) => handleImpresionAutomaticaChange(e, 'actualizarYComandar')}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{ color: impresionAutomatica.comanda ? 'text.primary' : 'text.disabled' }}
                      >
                        Solo al Actualizar y Comandar ítems nuevos
                      </Typography>
                    }
                  />
                </Box>
              </FormGroup>
            </Box>
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: 'background.paper' }}>
        <Button
          onClick={() => onClose(false)}
          sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 'bold' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={saveSettings}
          disableElevation
          variant="contained"
          color="primary"
          startIcon={<Save />}
          disabled={!hasUnsavedChanges}
          sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1, fontWeight: 'bold' }}
        >
          Guardar Configuración
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfiguracionImpresorasDialog
