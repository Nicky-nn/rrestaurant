import React, { useCallback, useEffect, useRef, useState } from 'react'

/****
 EJEMPLO DE USO
 const { ref, handlers, style } = useHorizontalDragScroll()
 //
 <Box sx={{ ...style }} ref={ref} {...handlers}>
 {categorias?.map((item, index) => (
 <Button key={index}>{item.descripcion}</ItemButton>
 ))}
 </Box>
 ****/

interface HorizontalDragScrollOptions {
  gridSize?: number // Tamaño de la cuadrícula para el snap e inercia
  snapEnabled?: boolean // Habilita el snap al arrastrar, es decir se reordena el scroll segun el gridSize
  inertiaEnabled?: boolean // Habilita la inercia al arrastrar, es decir se mueve un poco más después de soltar
  dragResistance?: number // Controla la fluidez del arrastre valores entre 0.9 y 0.99 para hacer el arrastre más/menos fluido
  bounds?: {
    left?: number // Mueve de izquierda a derecha el nro left
    right?: number // Mueve de derecha a izquierda el nro right
  }
  onSnap?: (position: number) => void // Callback cuando ocurre un snap, el valor de movimiento del scroll
  onDragStart?: () => void // Cuando se inicia el drag o click izquierdo
  onDragEnd?: () => void // Cuando Finaliza el drag o click izquierdo
  disableOnMobile?: boolean // Deshabilitar toda la logica en dispositivos móviles
  enableWheelDrag?: boolean // Habilitacion scroll con mouse
  wheelResistance?: number // Resistencia al scroll con mouse
}

/**
 * Hook para implementar el desplazamiento horizontal arrastrando
 * usamos useCallback para evitar multiples renderizados al mover el scroll
 * @author isi-template
 * @version 2025.3
 * @param options
 */
export const useHorizontalDragScroll = (options?: HorizontalDragScrollOptions) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)
  const velocity = useRef(0)
  const lastTime = useRef(0)
  const lastX = useRef(0)
  const animationFrame = useRef<number>(0)
  const inertiaAnimation = useRef<number>(0)
  const wheelTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Configuración por defecto
  const {
    gridSize = 105,
    snapEnabled = true,
    inertiaEnabled = true,
    dragResistance = 0.95,
    bounds,
    onSnap,
    onDragStart,
    onDragEnd,
    disableOnMobile = true, // Valor por defecto true para deshabilitar en móviles
    wheelResistance = 1,
    enableWheelDrag = true,
  } = options || {}

  // Calcula los límites de desplazamiento
  const calculateBounds = useCallback(() => {
    if (!containerRef.current) return { min: 0, max: 0 }

    const container = containerRef.current
    const min = bounds?.left ?? 0
    const max = bounds?.right ?? container.scrollWidth - container.clientWidth

    return { min, max }
  }, [bounds])

  // Aplica límites al scroll
  const applyBounds = useCallback(
    (scroll: number) => {
      const { min, max } = calculateBounds()
      return Math.max(min, Math.min(scroll, max))
    },
    [calculateBounds],
  )

  // Maneja el inicio del arrastre (solo si no es móvil o está deshabilitado)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || isMobileDevice) return
      setIsDragging(true)
      startX.current = e.clientX
      startScrollLeft.current = containerRef.current.scrollLeft
      lastX.current = e.clientX
      lastTime.current = performance.now() // Momento en que se crea el callback
      velocity.current = 0

      cancelAnimationFrame(animationFrame.current)
      cancelAnimationFrame(inertiaAnimation.current)
      clearTimeout(wheelTimeout.current)

      containerRef.current.style.cursor = 'grabbing'
      containerRef.current.style.userSelect = 'none'
      containerRef.current.style.scrollBehavior = 'auto'

      onDragStart?.()
      e.preventDefault()
    },
    [isMobileDevice, onDragStart],
  )

  // Calcula la velocidad del arrastre
  const updateVelocity = useCallback((x: number) => {
    const now = performance.now()
    const deltaTime = now - lastTime.current

    if (deltaTime > 0) {
      const deltaX = x - lastX.current
      velocity.current = deltaX / deltaTime
    }

    lastX.current = x
    lastTime.current = now
  }, [])

  // Maneja el movimiento durante el arrastre
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || isMobileDevice) return

      const x = e.clientX
      const walk = x - startX.current
      const newScroll = applyBounds(startScrollLeft.current - walk)

      containerRef.current.scrollLeft = newScroll
      setScrollLeft(newScroll)
      updateVelocity(x)

      e.preventDefault()
    },
    [isDragging, isMobileDevice, applyBounds, updateVelocity],
  )

  // Aplica el snap-to-grid
  const applySnap = useCallback(() => {
    if (!snapEnabled || !containerRef.current || isMobileDevice) return

    const currentScroll = containerRef.current.scrollLeft
    const snappedPosition = Math.round(currentScroll / gridSize) * gridSize
    const boundedPosition = applyBounds(snappedPosition)

    containerRef.current.style.scrollBehavior = 'smooth'
    containerRef.current.scrollLeft = boundedPosition
    setScrollLeft(boundedPosition)
    onSnap?.(boundedPosition)
  }, [snapEnabled, gridSize, applyBounds, onSnap, isMobileDevice])

  // Animación de inercia
  const inertiaAnimationStep = useCallback(() => {
    if (!containerRef.current || Math.abs(velocity.current) < 0.1 || isMobileDevice) {
      applySnap()
      return
    }

    const container = containerRef.current
    const currentScroll = container.scrollLeft
    const newScroll = applyBounds(currentScroll - velocity.current * 10) // 16

    container.scrollLeft = newScroll
    setScrollLeft(newScroll)
    velocity.current *= dragResistance

    inertiaAnimation.current = requestAnimationFrame(inertiaAnimationStep)
  }, [applyBounds, applySnap, dragResistance, isMobileDevice])

  // Maneja el final del arrastre
  const handleMouseUp = useCallback(() => {
    if (!containerRef.current || isMobileDevice) return

    setIsDragging(false)
    containerRef.current.style.cursor = 'grab'
    containerRef.current.style.removeProperty('user-select')

    if (inertiaEnabled && Math.abs(velocity.current) > 0.5) {
      inertiaAnimation.current = requestAnimationFrame(inertiaAnimationStep)
    } else {
      applySnap()
    }

    onDragEnd?.()
  }, [inertiaEnabled, applySnap, inertiaAnimationStep, onDragEnd, isMobileDevice])

  // Maneja el scroll con rueda del mouse
  // Si isMobileDevice, si es telefono se desactiva todo
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!enableWheelDrag || !containerRef.current || isMobileDevice || isDragging)
        return

      // Solo manejar scroll horizontal
      if (Math.abs(e.deltaX) === 0 && Math.abs(e.deltaY) > 0) {
        e.preventDefault()

        const container = containerRef.current
        const currentScroll = container.scrollLeft
        // Usamos deltaY para el scroll horizontal con rueda
        const newScroll = applyBounds(currentScroll + e.deltaY * wheelResistance)

        container.scrollLeft = newScroll
        setScrollLeft(newScroll)

        // Calcular velocidad para inercia
        const now = performance.now()
        if (lastTime.current > 0) {
          const deltaTime = now - lastTime.current
          velocity.current = -e.deltaY / deltaTime
        }
        lastTime.current = now

        // Resetear el temporizador de snap
        clearTimeout(wheelTimeout.current)
        container.style.scrollBehavior = 'auto'

        // Aplicar snap después de que termine el scroll
        wheelTimeout.current = setTimeout(() => {
          if (!isDragging) {
            applySnap()
          }
        }, 150)
      }
    },
    [
      enableWheelDrag,
      isMobileDevice,
      isDragging,
      applyBounds,
      wheelResistance,
      applySnap,
    ],
  )

  // Configura el event listener de scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft)
    }
  }, [])

  /********************************************************************************/
  /********************************************************************************/
  /********************************************************************************/
  /********************************************************************************/

  // Configura los event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (isDragging && !isMobileDevice) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    if (enableWheelDrag && !isMobileDevice) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [
    isDragging,
    isMobileDevice,
    handleMouseMove,
    handleMouseUp,
    enableWheelDrag,
    handleWheel,
  ])

  // Detectar si es un dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
      setIsMobileDevice(isMobile && disableOnMobile)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [disableOnMobile])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Limpia las animaciones al desmontar
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrame.current)
      cancelAnimationFrame(inertiaAnimation.current)
      clearTimeout(wheelTimeout.current)
    }
  }, [])

  /*********************************************************************************/
  /*********************************************************************************/
  /*********************************************************************************/
  /*********************************************************************************/
  /*********************************************************************************/

  return {
    ref: containerRef, // Referencia al contenedor, generalmente un div, para mui un BOX
    scrollLeft,
    isDragging,
    isMobileDevice, // Exportamos esta información por si es útil
    handlers: {
      onMouseDown: isMobileDevice
        ? undefined
        : (e: React.MouseEvent) => handleMouseDown(e),
    }, // Manejadores del contenedor
    style: {
      padding: 0.2,
      paddingBottom: 0.4,
      cursor: isMobileDevice ? 'auto' : isDragging ? 'grabbing' : 'grab',
      overflowX: 'auto',
      display: 'flex',
      userSelect: isMobileDevice ? 'auto' : 'none',
      scrollSnapType: snapEnabled ? 'x mandatory' : 'none',
      scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
      overscrollBehaviorX: 'contain', // Estilos específicos para móvil
      ...(isMobileDevice
        ? {
            touchAction: 'pan-x', // Permite scroll horizontal nativo
            msTouchAction: 'pan-x',
            WebkitUserSelect: 'auto',
          }
        : {}),
    },
  }
}
