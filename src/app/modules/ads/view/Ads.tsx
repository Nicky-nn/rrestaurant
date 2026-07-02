import { removeBackground } from '@imgly/background-removal'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import ImageIcon from '@mui/icons-material/Image'
import LayersIcon from '@mui/icons-material/Layers'
import PaletteIcon from '@mui/icons-material/Palette'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import TitleIcon from '@mui/icons-material/Title'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import TuneIcon from '@mui/icons-material/Tune'
import CampaignIcon from '@mui/icons-material/Campaign'
import StyleIcon from '@mui/icons-material/Style'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import InterestsIcon from '@mui/icons-material/Interests'
import OpacityIcon from '@mui/icons-material/Opacity'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import AddIcon from '@mui/icons-material/Add'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { GraphQLClient, gql } from 'graphql-request'

// New Icons
import StarIcon from '@mui/icons-material/Star'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import LocalDiningIcon from '@mui/icons-material/LocalDining'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import StorefrontIcon from '@mui/icons-material/Storefront'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'

import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  Tooltip,
  Typography,
  Menu,
  IconButton,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress
} from '@mui/material'
import html2canvas from 'html2canvas'
import React, { useEffect, useMemo, useRef, useState } from 'react'

// ─── Constants & Types ────────────────────────────────────────────────────────

const MUI_ICONS: Record<string, any> = {
  Star: StarIcon,
  Favorite: FavoriteIcon,
  Fastfood: FastfoodIcon,
  LocalDining: LocalDiningIcon,
  LocalOffer: LocalOfferIcon,
  ThumbUp: ThumbUpIcon,
  Whatshot: WhatshotIcon,
  EmojiEvents: EmojiEventsIcon,
  Storefront: StorefrontIcon,
  DeliveryDining: DeliveryDiningIcon,
}

type AppElement = {
  id: string
  type: 'text' | 'image' | 'logo' | 'icon'
  x: number
  y: number
  z: number
  rotation?: number
  text?: string
  fontSize?: number
  color?: string
  fontFamily?: string
  fontWeight?: string
  src?: string
  originalSrc?: string
  width?: number
  scale?: number
  isBackgroundRemoved?: boolean
  hasShadow?: boolean
  hasRounded?: boolean
  iconName?: string
  opacity?: number
  hasOutline?: boolean
  outlineColor?: string
}

const CANVAS_WIDTH = 740
const CANVAS_HEIGHT = 230
const BORDER_RADIUS = 24

const FONTS = [
  { name: 'Impacto (Anton)', value: "'Anton', sans-serif" },
  { name: 'Moderna (Montserrat)', value: "'Montserrat', sans-serif" },
  { name: 'Cursiva (Pacifico)', value: "'Pacifico', cursive" },
  { name: 'Clásica (Serif)', value: 'Georgia, serif' },
]

const COLORS = [
  '#ffffff',
  '#000000',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#1f2937',
  '#f3f4f6',
  '#fca5a5',
  '#fdba74',
]

const FORBIDDEN_COMBOS: Record<string, string[]> = {
  '#8b5cf6': ['#ef4444', '#f97316'],
  '#ef4444': ['#8b5cf6', '#22c55e'],
  '#22c55e': ['#ef4444', '#8b5cf6'],
  '#3b82f6': ['#f97316'],
  '#f97316': ['#3b82f6', '#8b5cf6'],
}

const getAutoGradient = (c: string) => {
  const map: Record<string, string> = {
    '#ffffff': 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
    '#000000': 'linear-gradient(135deg, #374151 0%, #000000 100%)',
    '#ef4444': 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
    '#f97316': 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    '#eab308': 'linear-gradient(135deg, #eab308 0%, #854d0e 100%)',
    '#22c55e': 'linear-gradient(135deg, #22c55e 0%, #166534 100%)',
    '#3b82f6': 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    '#8b5cf6': 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)',
    '#1f2937': 'linear-gradient(135deg, #4b5563 0%, #111827 100%)',
    '#f3f4f6': 'linear-gradient(135deg, #ffffff 0%, #d1d5db 100%)',
    '#fca5a5': 'linear-gradient(135deg, #fca5a5 0%, #b91c1c 100%)',
    '#fdba74': 'linear-gradient(135deg, #fdba74 0%, #c2410c 100%)',
  }
  return map[c] || c
}

// ─── Sub-component: element on canvas ─────────────────────────────────────────

function ElementView({
  el,
  isSelected,
  isEditingText,
  onPointerDown,
  onDoubleClick,
  onTextEditChange,
  onTextEditBlur,
}: {
  el: AppElement
  isSelected: boolean
  isEditingText: boolean
  onPointerDown: (e: React.PointerEvent, el: AppElement, action: string, domNode: HTMLDivElement | null) => void
  onDoubleClick: (el: AppElement) => void
  onTextEditChange: (val: string) => void
  onTextEditBlur: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: el.x,
    top: el.y,
    zIndex: el.z,
    transform: `rotate(${el.rotation || 0}deg)`,
    transformOrigin: 'center center',
    cursor: isEditingText ? 'text' : 'move',
    userSelect: 'none',
    filter: el.hasShadow ? 'drop-shadow(0px 8px 15px rgba(0,0,0,0.6))' : 'none',
    opacity: el.opacity !== undefined ? el.opacity : 1,
  }

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    background: '#ffffff',
    border: '2px solid #3b82f6',
    borderRadius: '50%',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  }

  let content = null

  if (el.type === 'text') {
    const strokeSize = Math.max(1, (el.fontSize || 20) * 0.04) + 'px'
    const textStyles: React.CSSProperties = {
      color: el.hasOutline ? 'transparent' : el.color,
      fontSize: el.fontSize,
      fontFamily: el.fontFamily,
      fontWeight: el.fontWeight,
      lineHeight: 1.1,
      padding: 4,
      WebkitTextStroke: el.hasOutline ? `${strokeSize} ${el.color || '#000000'}` : 'none',
    }

    if (isEditingText) {
      content = (
        <textarea
          autoFocus
          value={el.text}
          onChange={(e) => onTextEditChange(e.target.value)}
          onBlur={onTextEditBlur}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            ...textStyles,
            background: 'transparent',
            border: '2px dashed #3b82f6',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            width: `${Math.max(200, (el.text?.length || 0) * (el.fontSize || 20) * 0.6)}px`,
            minHeight: `${(el.fontSize || 20) * 2}px`,
          }}
        />
      )
    } else {
      content = (
        <div
          style={{
            ...textStyles,
            whiteSpace: 'pre-wrap',
          }}
        >
          {el.text}
        </div>
      )
    }
  } else if (el.type === 'image' || el.type === 'logo') {
    content = (
      <img
        src={el.src}
        style={{
          width: (el.width || 200) * (el.scale || 1),
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
          borderRadius: el.hasRounded ? '16px' : '0px',
        }}
        alt={el.type}
        crossOrigin="anonymous"
        draggable={false}
      />
    )
  } else if (el.type === 'icon') {
    const IconCmp = MUI_ICONS[el.iconName || 'Star'] || StarIcon
    content = (
      <div style={{ color: el.color, display: 'flex' }}>
        <IconCmp style={{ fontSize: (el.fontSize || 50) * (el.scale || 1), pointerEvents: 'none' }} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={baseStyle}
      onPointerDown={(e) => onPointerDown(e, el, 'move', containerRef.current)}
      onDoubleClick={() => onDoubleClick(el)}
    >
      {content}

      {isSelected && !isEditingText && (
        <div style={{ position: 'absolute', inset: -4, border: '2px solid #3b82f6', pointerEvents: 'none', zIndex: 9999 }}>
          <div
            style={{ ...handleStyle, top: -30, left: '50%', transform: 'translateX(-50%)', cursor: 'grab', pointerEvents: 'auto' }}
            onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, el, 'rotate', containerRef.current) }}
          />
          <div style={{ position: 'absolute', top: -18, left: '50%', width: 2, height: 14, background: '#3b82f6', pointerEvents: 'none' }} />

          <div
            style={{ ...handleStyle, top: -7, left: -7, cursor: 'nwse-resize', pointerEvents: 'auto' }}
            onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, el, 'resize', containerRef.current) }}
          />
          <div
            style={{ ...handleStyle, top: -7, right: -7, cursor: 'nesw-resize', pointerEvents: 'auto' }}
            onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, el, 'resize', containerRef.current) }}
          />
          <div
            style={{ ...handleStyle, bottom: -7, left: -7, cursor: 'nesw-resize', pointerEvents: 'auto' }}
            onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, el, 'resize', containerRef.current) }}
          />
          <div
            style={{ ...handleStyle, bottom: -7, right: -7, cursor: 'nwse-resize', pointerEvents: 'auto' }}
            onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, el, 'resize', containerRef.current) }}
          />
        </div>
      )}
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {COLORS.map((c) => (
        <Tooltip title={c} key={c} placement="top" arrow>
          <Box
            onClick={() => onChange(c)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              bgcolor: c,
              border: value === c ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transform: value === c ? 'scale(1.1)' : 'scale(1)',
              transition: 'all .2s ease',
              boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e2e8f0' : 'none',
            }}
          />
        </Tooltip>
      ))}
    </Box>
  )
}

function SectionHeader({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: '#64748b',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1.5,
        fontSize: '0.7rem'
      }}
    >
      {icon} {children}
    </Typography>
  )
}

const AdsApp = () => {
  const [editorMode, setEditorMode] = useState<'list' | 'select' | 'design'>('list')
  const [elements, setElements] = useState<AppElement[]>([])
  const [bgColor, setBgColor] = useState('#ffffff')
  const [useAutoGradient, setUseAutoGradient] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [isProcessingBg, setIsProcessingBg] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [scale, setScale] = useState(1)
  const [hasInitializedScale, setHasInitializedScale] = useState(false)
  const [iconMenuAnchor, setIconMenuAnchor] = useState<null | HTMLElement>(null)

  const [banners, setBanners] = useState<any[]>([])
  const [isLoadingBanners, setIsLoadingBanners] = useState(false)
  const [cloudinaryAuth, setCloudinaryAuth] = useState<any>(null)
  const [isFetchingSignature, setIsFetchingSignature] = useState(false)

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [fechaInicio, setFechaInicio] = useState<Dayjs | null>(dayjs())
  const [fechaFin, setFechaFin] = useState<Dayjs | null>(dayjs().add(1, 'month'))
  const [isSaving, setIsSaving] = useState(false)

  const getInboxClient = () => {
    const token = localStorage.getItem('accessToken') || ''
    let rawUrl = import.meta.env.ISI_API_INBOX_URL || 'http://localhost:4000/api'
    if (rawUrl.startsWith('/')) {
      rawUrl = window.location.origin + rawUrl
    }
    return new GraphQLClient(rawUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  const fetchBanners = async () => {
    setIsLoadingBanners(true)
    try {
      const client = getInboxClient()
      const q = gql`
        query AllBanes {
          banners(shop: "sandbox") {
            id shop publicId url fechaInicio fechaFin activo createdAt
          }
        }
      `
      const data: any = await client.request(q)
      setBanners(data.banners || [])
    } catch (e) {
      showError('Error al obtener banners.')
    } finally {
      setIsLoadingBanners(false)
    }
  }

  useEffect(() => {
    if (editorMode === 'list') fetchBanners()
  }, [editorMode])

  const goSelectMode = async () => {
    setIsFetchingSignature(true)
    try {
      const client = getInboxClient()
      const q = gql`
        query FIRMA {
          cloudinarySignature(shop: "sandbox") {
            signature timestamp apiKey cloudName
          }
        }
      `
      const data: any = await client.request(q)
      setCloudinaryAuth(data.cloudinarySignature)
      setEditorMode('select')
    } catch (e: any) {
      console.error("GraphQL Error [FIRMA]:", e)
      showError('Error al obtener firma de Cloudinary. Revisa la consola.')
    } finally {
      setIsFetchingSignature(false)
    }
  }

  const handleSaveBanner = async () => {
    if (!fechaInicio || !fechaFin) return showError('Debe seleccionar fechas.')
    if (!cloudinaryAuth) return showError('No hay firma de Cloudinary. Vuelve al listado e intenta crear de nuevo.')
    
    setIsSaving(true)
    setSelectedId(null)
    setEditingTextId(null)
    try {
      await new Promise((r) => requestAnimationFrame(r))
      await new Promise((r) => setTimeout(r, 200))
      const cv = await html2canvas(canvasRef.current!, {
        scale: 4,
        useCORS: true,
        backgroundColor: useAutoGradient ? null : bgColor,
        logging: false,
      })
      
      const blob: Blob = await new Promise((resolve, reject) => {
        cv.toBlob(b => {
          if (b) resolve(b)
          else reject(new Error('Blob creation failed'))
        }, 'image/png')
      })
      
      const fd = new FormData()
      fd.append('file', blob)
      fd.append('api_key', cloudinaryAuth.apiKey)
      fd.append('timestamp', String(cloudinaryAuth.timestamp))
      fd.append('signature', cloudinaryAuth.signature)

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryAuth.cloudName}/image/upload`, {
        method: 'POST',
        body: fd
      })
      if (!cloudRes.ok) throw new Error('Error subiendo imagen a Cloudinary')
      const cloudData = await cloudRes.json()
      
      const client = getInboxClient()
      const m = gql`
        mutation Guardar($publicId: String!, $fechaInicio: String!, $fechaFin: String!) {
          saveBanner(
            shop: "sandbox"
            publicId: $publicId
            fechaInicio: $fechaInicio
            fechaFin: $fechaFin
          ) { id }
        }
      `
      await client.request(m, {
        publicId: cloudData.public_id,
        fechaInicio: fechaInicio.startOf('day').format(),
        fechaFin: fechaFin.endOf('day').format()
      })
      
      const a = document.createElement('a')
      a.href = cv.toDataURL('image/png')
      a.download = 'banner-restaurante.png'
      a.click()
      
      setShowSaveModal(false)
      setEditorMode('list')
      setElements([])
    } catch (e: any) {
      showError('Error al guardar: ' + e.message)
    } finally {
      setIsSaving(false)
    }
  }
  
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<{ id: string; position: 'top' | 'bottom' } | null>(null)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const dragInfo = useRef({
    action: 'move',
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialScale: 1,
    initialFontSize: 20,
    initialRotation: 0,
    elId: '',
    centerX: 0,
    centerY: 0,
    startAngle: 0,
    startDistance: 0,
  })

  useEffect(() => {
    const el = wrapperRef.current
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        setScale((prev) => {
          const delta = e.deltaY > 0 ? -0.05 : 0.05
          return Math.min(Math.max(0.2, prev + delta), 3)
        })
      }
    }
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false })
    }
    return () => {
      if (el) el.removeEventListener('wheel', handleWheel)
    }
  }, [editorMode])

  useEffect(() => {
    if (wrapperRef.current && editorMode === 'design' && !hasInitializedScale) {
      const MathScale = Math.min(
        (wrapperRef.current.clientWidth - 80) / CANVAS_WIDTH,
        (wrapperRef.current.clientHeight - 80) / CANVAS_HEIGHT,
        1,
      )
      setScale(MathScale)
      setHasInitializedScale(true)
    }
  }, [editorMode, hasInitializedScale])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return
      const { action, startX, startY, initialX, initialY, initialScale, initialFontSize, initialRotation, elId, centerX, centerY, startAngle, startDistance } = dragInfo.current
      
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== elId) return el

          if (action === 'move') {
            const dx = (e.clientX - startX) / scale
            const dy = (e.clientY - startY) / scale
            return { ...el, x: initialX + dx, y: initialY + dy }
          }
          
          if (action === 'rotate') {
            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
            const angleDiff = (currentAngle - startAngle) * (180 / Math.PI)
            return { ...el, rotation: initialRotation + angleDiff }
          }

          if (action === 'resize') {
            const currentDistance = Math.hypot(e.clientX - centerX, e.clientY - centerY)
            const ratio = currentDistance / startDistance
            if (el.type === 'text' || el.type === 'icon') {
              return { ...el, fontSize: Math.max(10, initialFontSize * ratio) }
            } else {
              return { ...el, scale: Math.max(0.1, initialScale * ratio) }
            }
          }

          return el
        }),
      )
    }
    const onUp = () => {
      if (isDragging) setIsDragging(false)
    }
    if (isDragging) {
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isDragging, scale])

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(''), 5000)
  }

  const checkColorHarmony = (bg: string, text: string) => {
    if (bg === text && bg !== 'transparent')
      return 'Las letras tienen el mismo color que el fondo.'
    for (const [key, bad] of Object.entries(FORBIDDEN_COMBOS)) {
      if ((bg === key && bad.includes(text)) || (text === key && bad.includes(bg))) {
        return 'Esa combinación de colores no armoniza bien.'
      }
    }
    return null
  }

  const handleBgColor = (c: string) => {
    const conflict = elements.find((el) => (el.type === 'text' || el.type === 'icon') && checkColorHarmony(c, el.color || ''))
    if (conflict) {
      showError(checkColorHarmony(c, conflict.color || '') || '')
      return
    }
    setBgColor(c)
  }

  const selectedElement = useMemo(() => elements.find((el) => el.id === selectedId), [elements, selectedId])

  const updateSelected = (updates: Partial<AppElement>) => {
    if (!selectedId) return
    const current = elements.find((el) => el.id === selectedId)
    if (!current) return

    if (updates.color && (current.type === 'text' || current.type === 'icon')) {
      const err = checkColorHarmony(bgColor, updates.color)
      if (err) return showError(err)
    }

    setElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el)))
  }

  const handlePointerDown = (e: React.PointerEvent, el: AppElement, action: string, domNode: HTMLDivElement | null) => {
    if (editingTextId === el.id && action === 'move') return
    e.stopPropagation()
    setSelectedId(el.id)
    if (editingTextId && editingTextId !== el.id) setEditingTextId(null)

    let centerX = 0
    let centerY = 0
    let startAngle = 0
    let startDistance = 0

    if (domNode && (action === 'rotate' || action === 'resize')) {
      const rect = domNode.getBoundingClientRect()
      centerX = rect.left + rect.width / 2
      centerY = rect.top + rect.height / 2
      startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      startDistance = Math.hypot(e.clientX - centerX, e.clientY - centerY)
    }

    dragInfo.current = {
      action,
      startX: e.clientX,
      startY: e.clientY,
      initialX: el.x,
      initialY: el.y,
      initialScale: el.scale || 1,
      initialFontSize: el.fontSize || 20,
      initialRotation: el.rotation || 0,
      elId: el.id,
      centerX,
      centerY,
      startAngle,
      startDistance
    }
    setIsDragging(true)
  }

  const handleDoubleClick = (el: AppElement) => {
    if (el.type === 'text') {
      setEditingTextId(el.id)
    }
  }

  const addText = () => {
    const id = Math.random().toString(36).substr(2, 9)
    let defaultC = '#1f2937'
    if (bgColor === '#1f2937' || bgColor === '#000000') defaultC = '#ffffff'
    setElements((prev) => [
      ...prev,
      {
        id,
        type: 'text',
        text: 'Escribe aquí...',
        x: CANVAS_WIDTH / 2 - 100,
        y: CANVAS_HEIGHT / 2 - 30,
        z: prev.length + 1,
        fontSize: 48,
        color: defaultC,
        fontFamily: "'Anton', sans-serif",
        fontWeight: 'normal',
        hasShadow: false,
        rotation: 0,
      },
    ])
    setSelectedId(id)
    setEditingTextId(id)
  }

  const addIcon = (iconName: string) => {
    setIconMenuAnchor(null)
    const id = Math.random().toString(36).substr(2, 9)
    let defaultC = '#ffffff'
    if (bgColor === '#ffffff' || bgColor === '#f3f4f6') defaultC = '#ef4444'
    setElements((prev) => [
      ...prev,
      {
        id,
        type: 'icon',
        iconName,
        x: CANVAS_WIDTH / 2 - 25,
        y: CANVAS_HEIGHT / 2 - 25,
        z: prev.length + 1,
        fontSize: 100,
        color: defaultC,
        hasShadow: false,
        rotation: 0,
        scale: 1,
      },
    ])
    setSelectedId(id)
  }

  const loadDefaultDesign = () => {
    setElements([
      {
        id: 'bg-shape',
        type: 'icon',
        iconName: 'Fastfood',
        x: CANVAS_WIDTH - 280,
        y: -100,
        z: 1,
        fontSize: 500,
        color: '#fef08a',
        rotation: 15,
        scale: 1,
        opacity: 0.15,
        hasShadow: false,
      },
      {
        id: 'title',
        type: 'text',
        text: '¡BURGER\nEXTREMA!',
        x: 40,
        y: 30,
        z: 2,
        fontSize: 64,
        color: '#facc15',
        fontFamily: "'Anton', sans-serif",
        fontWeight: 'normal',
        hasOutline: true,
        hasShadow: true,
        rotation: -4,
      },
      {
        id: 'subtitle',
        type: 'text',
        text: 'Doble carne + queso derretido',
        x: 40,
        y: 150,
        z: 3,
        fontSize: 22,
        color: '#ffffff',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 'bold',
        hasShadow: true,
        rotation: -4,
      },
      {
        id: 'promo',
        type: 'icon',
        iconName: 'LocalOffer',
        x: 35,
        y: 185,
        z: 4,
        fontSize: 28,
        color: '#facc15',
        rotation: 0,
        scale: 1,
      },
      {
        id: 'promo-text',
        type: 'text',
        text: 'Solo por hoy - 20% Dcto',
        x: 70,
        y: 188,
        z: 5,
        fontSize: 16,
        color: '#facc15',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 'bold',
        rotation: 0,
      },
      {
        id: 'burger-img',
        type: 'image',
        src: '/image.png',
        originalSrc: '/image.png',
        x: CANVAS_WIDTH - 290,
        y: -30,
        z: 6,
        width: 310,
        scale: 1,
        hasRounded: false,
        hasShadow: true,
        rotation: 0,
      }
    ])
    setBgColor('#ef4444')
    setUseAutoGradient(true)
    setEditorMode('design')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLogo = false, isFullBanner = false) => {
    if (!e.target.files?.[0]) return
    const url = URL.createObjectURL(e.target.files[0])
    const img = new Image()
    img.onload = async () => {
      const id = Math.random().toString(36).substr(2, 9)
      let finalSrc = url
      let w = isLogo ? 150 : 300
      let h = img.height * (w / img.width)
      let x = isLogo ? 30 : CANVAS_WIDTH - w - 30
      let y = CANVAS_HEIGHT / 2 - h / 2

      if (isFullBanner) {
        const ratioX = CANVAS_WIDTH / img.width
        const ratioY = CANVAS_HEIGHT / img.height
        const maxRatio = Math.max(ratioX, ratioY)
        w = img.width * maxRatio
        h = img.height * maxRatio
        x = (CANVAS_WIDTH - w) / 2
        y = (CANVAS_HEIGHT - h) / 2
      }

      const newEl: AppElement = {
        id,
        type: isLogo ? 'logo' : 'image',
        src: finalSrc,
        originalSrc: url,
        x,
        y,
        z: elements.length + 1,
        width: w,
        scale: 1,
        isBackgroundRemoved: false,
        hasRounded: !isLogo && !isFullBanner,
        rotation: 0,
      }

      setElements((prev) => [...prev, newEl])
      setSelectedId(id)

      if (isFullBanner) {
        setEditorMode('design')
      }
    }
    img.src = url
  }

  const toggleBgRemoval = async () => {
    const el = elements.find((e) => e.id === selectedId)
    if (!el?.originalSrc) return
    if (el.isBackgroundRemoved) {
      updateSelected({ src: el.originalSrc, isBackgroundRemoved: false })
    } else {
      setIsProcessingBg(true)
      try {
        const imageBlob = await fetch(el.originalSrc).then((r) => r.blob())
        const resultBlob = await removeBackground(imageBlob)
        updateSelected({ src: URL.createObjectURL(resultBlob), isBackgroundRemoved: true })
      } catch (e) {
        showError('Error procesando IA de imagen.')
      }
      setIsProcessingBg(false)
    }
  }

  const actualBackground = useAutoGradient ? getAutoGradient(bgColor) : bgColor

  const onDragStartLayer = (e: React.DragEvent, id: string) => {
    setDraggedLayerId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOverLayer = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedLayerId === id) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const isTopHalf = e.clientY < rect.top + rect.height / 2
    setDropIndicator({ id, position: isTopHalf ? 'top' : 'bottom' })
  }

  const onDragLeaveLayer = () => {
    setDropIndicator(null)
  }

  const onDropLayer = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedLayerId || !dropIndicator) {
      setDraggedLayerId(null)
      setDropIndicator(null)
      return
    }

    const { id: targetId, position } = dropIndicator

    setElements(prev => {
      const sorted = [...prev].sort((a, b) => b.z - a.z)
      const fromIdx = sorted.findIndex(el => el.id === draggedLayerId)
      const toIdx = sorted.findIndex(el => el.id === targetId)

      if (fromIdx < 0 || toIdx < 0) return prev

      const [moved] = sorted.splice(fromIdx, 1)
      
      let finalIdx = toIdx
      if (position === 'bottom') {
        finalIdx = toIdx + 1
      }
      if (fromIdx < toIdx && position === 'top') {
        finalIdx = toIdx - 1
      }
      
      sorted.splice(finalIdx, 0, moved)
      return sorted.map((item, idx) => ({ ...item, z: sorted.length - idx }))
    })

    setDraggedLayerId(null)
    setDropIndicator(null)
  }

  const onDragEndLayer = () => {
    setDraggedLayerId(null)
    setDropIndicator(null)
  }

  const deleteLayer = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setElements(prev => prev.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  if (editorMode === 'list') {
    return (
      <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="900" color="#0f172a">Gestión de Banners</Typography>
          <Button variant="contained" startIcon={isFetchingSignature ? <CircularProgress size={20} color="inherit" /> : <AddIcon />} onClick={goSelectMode} disabled={isFetchingSignature} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: 2, px: 3 }}>
            {isFetchingSignature ? 'Conectando...' : 'Crear Nuevo Banner'}
          </Button>
        </Box>
        
        {isLoadingBanners ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '800', color: '#475569' }}>VISTA PREVIA</TableCell>
                  <TableCell sx={{ fontWeight: '800', color: '#475569' }}>ESTADO</TableCell>
                  <TableCell sx={{ fontWeight: '800', color: '#475569' }}>FECHA INICIO</TableCell>
                  <TableCell sx={{ fontWeight: '800', color: '#475569' }}>FECHA FIN</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners.map((b) => (
                  <TableRow key={b.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ width: 140, height: 44, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {b.url ? <img src={b.url} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon sx={{ color: '#cbd5e1' }} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {b.activo ? (
                        <Box component="span" sx={{ background: '#dcfce7', color: '#166534', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 800 }}>ACTIVO</Box>
                      ) : (
                        <Box component="span" sx={{ background: '#fee2e2', color: '#991b1b', px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 800 }}>INACTIVO</Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#334155', fontWeight: 600 }}>{dayjs(b.fechaInicio).format('DD/MM/YYYY')}</TableCell>
                    <TableCell sx={{ color: '#334155', fontWeight: 600 }}>{dayjs(b.fechaFin).format('DD/MM/YYYY')}</TableCell>
                  </TableRow>
                ))}
                {banners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
                      <CampaignIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                      <Typography variant="h6">No tienes banners creados todavía</Typography>
                      <Typography variant="body2">Tus promociones activas aparecerán aquí.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    )
  }

  if (editorMode === 'select') {
    return (
      <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'transparent' }}>
        <Typography variant="h3" fontWeight="900" mb={2} color="#0f172a">Banners Promocionales</Typography>
        <Typography variant="h6" color="#64748b" mb={6}>¿Qué te gustaría hacer hoy?</Typography>
        <Stack direction="row" spacing={4}>
          <Box 
            onClick={() => setEditorMode('list')} 
            sx={{ position: 'absolute', top: 40, left: 40, p: 1, cursor: 'pointer', color: '#64748b', '&:hover': { color: '#0f172a' }, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 16 }} /> Volver al listado
          </Box>
          <Box 
            onClick={() => fileInputRef.current?.click()} 
            sx={{ p: 5, cursor: 'pointer', textAlign: 'center', width: 320, borderRadius: 6, bgcolor: '#ffffff', border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { borderColor: '#3b82f6', transform: 'translateY(-4px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' } }}
          >
            <CloudUploadIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" mb={1} color="#0f172a">Subir mi diseño</Typography>
            <Typography variant="body2" color="#64748b">Tengo mi propio banner diseñado. Se ajustará al tamaño oficial ({CANVAS_WIDTH}x{CANVAS_HEIGHT}px).</Typography>
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={(e) => handleImageUpload(e, false, true)} />
          </Box>
          <Box 
            onClick={loadDefaultDesign} 
            sx={{ p: 5, cursor: 'pointer', textAlign: 'center', width: 320, borderRadius: 6, bgcolor: '#ffffff', border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { borderColor: '#3b82f6', transform: 'translateY(-4px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' } }}
          >
            <PaletteIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" mb={1} color="#0f172a">Diseñar Aquí</Typography>
            <Typography variant="body2" color="#64748b">Usar el editor avanzado para crear un banner espectacular desde cero.</Typography>
          </Box>
        </Stack>
      </Box>
    )
  }

  const sortedLayers = [...elements].sort((a, b) => b.z - a.z)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@400;700;900&family=Pacifico&display=swap');
      `}</style>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f1f5f9' }}>
        
        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', zIndex: 20 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
              sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, '&:hover': { color: '#0f172a', bgcolor: 'transparent' } }}
              onClick={() => {
                if(window.confirm('¿Volver al inicio? Se perderá el diseño actual.')) {
                  setEditorMode('list')
                  setElements([])
                }
              }}
            >
              Volver
            </Button>
            <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
              <CampaignIcon sx={{ verticalAlign: 'middle', fontSize: 18, mr: 0.5, color: '#3b82f6' }}/> 
              Editor Oficial de Banners
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<NoteAddIcon />}
              onClick={() => {
                if(window.confirm('¿Empezar un diseño nuevo en blanco? Se perderá el actual.')) {
                  setElements([])
                  setBgColor('#ffffff')
                }
              }}
              sx={{
                borderColor: '#e2e8f0',
                color: '#64748b',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
              }}
            >
              Nuevo
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setShowSaveModal(true)}
              disableElevation
              sx={{
                bgcolor: '#3b82f6',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Guardar y Descargar
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              py: 3,
              zIndex: 10,
              boxShadow: '4px 0 15px rgba(0,0,0,0.02)'
            }}
          >
            <Stack spacing={3} sx={{ width: '100%' }}>
              <Tooltip title="Añadir Texto" placement="right" arrow>
                <Box onClick={addText} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: '#64748b', '&:hover': { color: '#3b82f6' } }}>
                  <TitleIcon sx={{ fontSize: 28, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Texto</Typography>
                </Box>
              </Tooltip>
              
              <Tooltip title="Añadir Foto" placement="right" arrow>
                <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: '#64748b', '&:hover': { color: '#3b82f6' } }}>
                  <AddPhotoAlternateIcon sx={{ fontSize: 28, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Foto</Typography>
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, false)} />
                </Box>
              </Tooltip>

              <Tooltip title="Añadir Logo" placement="right" arrow>
                <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: '#64748b', '&:hover': { color: '#3b82f6' } }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 28, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Logo</Typography>
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, true)} />
                </Box>
              </Tooltip>

              <Tooltip title="Añadir Icono" placement="right" arrow>
                <Box onClick={(e) => setIconMenuAnchor(e.currentTarget)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: '#64748b', '&:hover': { color: '#3b82f6' } }}>
                  <InterestsIcon sx={{ fontSize: 28, mb: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Iconos</Typography>
                </Box>
              </Tooltip>
            </Stack>

            <Menu
              anchorEl={iconMenuAnchor}
              open={Boolean(iconMenuAnchor)}
              onClose={() => setIconMenuAnchor(null)}
              anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
              transformOrigin={{ vertical: 'center', horizontal: 'left' }}
              PaperProps={{ sx: { ml: 2, borderRadius: 2, p: 1, width: 240 } }}
              sx={{ zIndex: 100000 }}
            >
              <Typography variant="subtitle2" sx={{ px: 1, mb: 1, color: '#64748b', fontWeight: 700 }}>Iconos Material UI</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1 }}>
                {Object.keys(MUI_ICONS).map(name => {
                  const IconCmp = MUI_ICONS[name]
                  return (
                    <IconButton key={name} onClick={() => addIcon(name)} sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#e0e7ff', color: '#3b82f6' } }}>
                      <IconCmp />
                    </IconButton>
                  )
                })}
              </Box>
            </Menu>

          </Box>

          <Box
            ref={wrapperRef}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              p: 4,
              overflow: 'hidden',
            }}
            onPointerDown={() => {
              setSelectedId(null)
              setEditingTextId(null)
            }}
          >
            <Box
              ref={canvasRef}
              sx={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                background: actualBackground,
                position: 'relative',
                borderRadius: `${BORDER_RADIUS}px`,
                overflow: 'hidden',
                flexShrink: 0,
                transition: isDragging ? 'none' : 'background 0.3s ease',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              }}
            >
              {[...elements]
                .sort((a, b) => a.z - b.z)
                .map((el) => (
                  <ElementView
                    key={el.id}
                    el={el}
                    isSelected={selectedId === el.id}
                    isEditingText={editingTextId === el.id}
                    onPointerDown={handlePointerDown}
                    onDoubleClick={handleDoubleClick}
                    onTextEditChange={(v) => updateSelected({ text: v })}
                    onTextEditBlur={() => setEditingTextId(null)}
                  />
                ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4, bgcolor: '#ffffff', p: 1, borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', zIndex: 1 }}>
              <Tooltip title="Reducir (Ctrl + Rueda abajo)" arrow>
                <Button size="small" sx={{ minWidth: 0, p: 0.5, color: '#64748b' }} onClick={() => setScale(s => Math.max(0.2, s - 0.1))}>
                  <ZoomOutIcon />
                </Button>
              </Tooltip>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', minWidth: 40, textAlign: 'center' }}>
                {Math.round(scale * 100)}%
              </Typography>
              <Tooltip title="Ampliar (Ctrl + Rueda arriba)" arrow>
                <Button size="small" sx={{ minWidth: 0, p: 0.5, color: '#64748b' }} onClick={() => setScale(s => Math.min(3, s + 0.1))}>
                  <ZoomInIcon />
                </Button>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              width: 280,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              bgcolor: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              flexShrink: 0,
              zIndex: 10,
              boxShadow: '-4px 0 15px rgba(0,0,0,0.02)'
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', minHeight: '40%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TuneIcon sx={{ color: '#0f172a', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">PROPIEDADES</Typography>
              </Box>

              {!selectedElement ? (
                <Box sx={{ animation: 'fadeIn 0.2s' }}>
                  <SectionHeader icon={<PaletteIcon fontSize="inherit" />}>Fondo</SectionHeader>
                  <ColorPicker value={bgColor} onChange={handleBgColor} />
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Switch size="small" checked={useAutoGradient} onChange={(e) => setUseAutoGradient(e.target.checked)} color="primary" />}
                      label={<Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>Degradado Automático</Typography>}
                    />
                  </Box>
                </Box>
              ) : null}

              {selectedElement && (
                <Box sx={{ mb: 2, animation: 'fadeIn 0.2s' }}>
                  <SectionHeader icon={<OpacityIcon fontSize="inherit" />}>Transparencia</SectionHeader>
                  <Slider
                    size="small"
                    value={selectedElement.opacity !== undefined ? selectedElement.opacity * 100 : 100}
                    onChange={(e, val) => updateSelected({ opacity: (val as number) / 100 })}
                    valueLabelDisplay="auto"
                    step={5}
                    sx={{ color: '#3b82f6' }}
                  />
                </Box>
              )}

              {(selectedElement?.type === 'text' || selectedElement?.type === 'icon') && (
                <Box sx={{ animation: 'fadeIn 0.2s' }}>
                  <SectionHeader icon={<StyleIcon fontSize="inherit" />}>{selectedElement.type === 'text' ? 'Texto' : 'Icono Vectorial'}</SectionHeader>
                  <Stack spacing={2}>
                    {selectedElement.type === 'text' && (
                      <Box>
                        <Select
                          fullWidth
                          size="small"
                          sx={{ borderRadius: '8px', fontSize: '0.8rem', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }}
                          value={selectedElement.fontFamily}
                          onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                        >
                          {FONTS.map((f) => (
                            <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.85rem' }}>
                              {f.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Color principal:</Typography>
                      <ColorPicker value={selectedElement.color ?? '#000000'} onChange={(c) => updateSelected({ color: c })} />
                    </Box>
                    
                    {selectedElement.type === 'text' && (
                      <Box>
                        <FormControlLabel
                          control={<Switch size="small" checked={!!selectedElement.hasOutline} onChange={(e) => updateSelected({ hasOutline: e.target.checked })} />}
                          label={<Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>Texto Hueco (Contorno)</Typography>}
                        />
                      </Box>
                    )}

                    <FormControlLabel
                      control={<Switch size="small" checked={!!selectedElement.hasShadow} onChange={(e) => updateSelected({ hasShadow: e.target.checked })} />}
                      label={<Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>Sombra paralela</Typography>}
                    />
                  </Stack>
                </Box>
              )}

              {(selectedElement?.type === 'image' || selectedElement?.type === 'logo') && (
                <Box sx={{ animation: 'fadeIn 0.2s' }}>
                  <SectionHeader icon={<ImageIcon fontSize="inherit" />}>Imagen</SectionHeader>
                  <Stack spacing={1.5}>
                    <FormControlLabel
                      control={<Switch size="small" checked={!!selectedElement.hasRounded} onChange={(e) => updateSelected({ hasRounded: e.target.checked })} />}
                      label={<Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>Bordes redondos</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch size="small" checked={!!selectedElement.hasShadow} onChange={(e) => updateSelected({ hasShadow: e.target.checked })} />}
                      label={<Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>Sombra paralela</Typography>}
                    />
                    <Button
                      variant={selectedElement.isBackgroundRemoved ? 'contained' : 'outlined'}
                      size="small"
                      fullWidth
                      startIcon={<AutoAwesomeIcon fontSize="small" />}
                      onClick={toggleBgRemoval}
                      disabled={isProcessingBg}
                      disableElevation
                      sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, mt: 1 }}
                    >
                      {isProcessingBg ? 'Procesando...' : selectedElement.isBackgroundRemoved ? 'Restaurar fondo' : 'Quitar Fondo (IA)'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>

            <Box sx={{ p: 2.5, flex: 1, overflowY: 'auto', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LayersIcon sx={{ color: '#0f172a', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">CAPAS (Arrástralas)</Typography>
              </Box>
              
              <Stack spacing={1}>
                {sortedLayers.map((el) => {
                  const isDropTarget = dropIndicator?.id === el.id
                  return (
                    <Box
                      key={el.id}
                      draggable
                      onDragStart={(e) => onDragStartLayer(e, el.id)}
                      onDragOver={(e) => onDragOverLayer(e, el.id)}
                      onDragLeave={onDragLeaveLayer}
                      onDrop={onDropLayer}
                      onDragEnd={onDragEndLayer}
                      onClick={() => setSelectedId(el.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.2,
                        pr: 1,
                        borderRadius: '8px',
                        bgcolor: selectedId === el.id ? '#eff6ff' : '#ffffff',
                        border: '1px solid',
                        borderColor: selectedId === el.id ? '#bfdbfe' : '#e2e8f0',
                        cursor: 'grab',
                        transition: 'all 0.1s',
                        '&:hover': { borderColor: '#bfdbfe', bgcolor: '#eff6ff' },
                        opacity: draggedLayerId === el.id ? 0.5 : 1,
                        borderTopWidth: isDropTarget && dropIndicator.position === 'top' ? 4 : 1,
                        borderTopColor: isDropTarget && dropIndicator.position === 'top' ? '#3b82f6' : undefined,
                        borderBottomWidth: isDropTarget && dropIndicator.position === 'bottom' ? 4 : 1,
                        borderBottomColor: isDropTarget && dropIndicator.position === 'bottom' ? '#3b82f6' : undefined,
                      }}
                    >
                      <Box sx={{ color: '#94a3b8', mr: 1.5, display: 'flex' }}>
                        {el.type === 'text' ? <TextFieldsIcon fontSize="small" /> : el.type === 'icon' ? <InterestsIcon fontSize="small" /> : el.type === 'logo' ? <WorkspacePremiumIcon fontSize="small" /> : <ImageIcon fontSize="small" />}
                      </Box>
                      <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: '0.85rem', color: '#334155', fontWeight: selectedId === el.id ? 600 : 400 }}>
                        {el.type === 'text' ? (el.text || 'Texto').split('\n')[0] : el.type === 'icon' ? 'Icono' : (el.type === 'logo' ? 'Logo' : 'Imagen')}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', opacity: selectedId === el.id ? 1 : 0.4, '&:hover': { opacity: 1 } }}>
                        <Box component="span" onClick={(e) => deleteLayer(e, el.id)} sx={{ display: 'flex', alignItems: 'center', ml: 0.5, p: 0.5, color: '#64748b', borderRadius: 1, cursor: 'pointer', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
                {sortedLayers.length === 0 && (
                  <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', display: 'block', mt: 2 }}>
                    No hay capas en el lienzo.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog open={showSaveModal} onClose={() => setShowSaveModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }} sx={{ zIndex: 100000 }}>
          <DialogTitle fontWeight={800} color="#0f172a">Publicar Banner</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="#64748b" mb={3} mt={1}>
              Selecciona el rango de fechas en los que este banner estará activo en tu restaurante. Al confirmar, el banner se subirá al servidor y se descargará una copia localmente.
            </Typography>
            <Stack spacing={3} mt={1}>
              <DatePicker
                label="Fecha de Inicio"
                value={fechaInicio}
                onChange={(newValue) => setFechaInicio(newValue)}
                format="DD/MM/YYYY"
                slotProps={{ 
                  textField: { fullWidth: true },
                  popper: { sx: { zIndex: 100005 } },
                  dialog: { sx: { zIndex: 100005 } }
                }}
              />
              <DatePicker
                label="Fecha de Fin"
                value={fechaFin}
                onChange={(newValue) => setFechaFin(newValue)}
                format="DD/MM/YYYY"
                slotProps={{ 
                  textField: { fullWidth: true },
                  popper: { sx: { zIndex: 100005 } },
                  dialog: { sx: { zIndex: 100005 } }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setShowSaveModal(false)} color="inherit" disabled={isSaving} sx={{ fontWeight: 600 }}>Cancelar</Button>
            <Button onClick={handleSaveBanner} variant="contained" disabled={isSaving || !fechaInicio || !fechaFin} sx={{ fontWeight: 700, borderRadius: 2, px: 3, bgcolor: '#3b82f6' }} disableElevation>
              {isSaving ? 'Guardando y Subiendo...' : 'Confirmar Guardado'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <Snackbar open={!!errorMsg} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ zIndex: 100000 }}>
        <Alert
          severity="error"
          variant="filled"
          sx={{ fontWeight: 700, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AdsApp
