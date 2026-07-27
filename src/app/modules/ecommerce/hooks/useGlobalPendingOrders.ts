import { useQuery, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useEffect, useMemo } from 'react'
import useAuth from '../../../base/hooks/useAuth'
import { getInboxClient } from '../api/inboxClient'

export const useGlobalPendingOrders = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Conexión global de SSE para invalidar consultas
  useEffect(() => {
    if (!user) return
    const shop = typeof user.miEmpresa === 'string' ? user.miEmpresa : user.miEmpresa?.tienda || 'sandbox'
    const sucursal = user.sucursal?.codigo || 0
    const pdv = user.puntoVenta?.codigo || 0

    let rawUrl =
      import.meta.env.VITE_ISI_API_INBOX_URL ||
      import.meta.env.ISI_API_INBOX_URL ||
      'http://localhost:4000/api'
    if (rawUrl.startsWith('/')) {
      rawUrl = window.location.origin + rawUrl
    }
    const sseUrl = `${rawUrl.replace(/\/api$/, '')}/api/sse/orders?shop=${shop}&codigoSucursal=${sucursal}&pdv=${pdv}`
    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connectSSE = () => {
      eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.event === 'CONNECTED') {
          console.log('Conectado a notificaciones SSE (Global Ecommerce Inbox)')
        }
        if (data.event === 'NEW_ORDER' || data.event === 'ORDER_UPDATED') {
          console.log('¡Nuevo evento de pedido!', data)
          queryClient.invalidateQueries({ queryKey: ['listOrders'] })

          // 🔔 Tono armónico corporativo al recibir un pedido nuevo
          if (data.event === 'NEW_ORDER') {
            try {
              const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
              const audioCtx = new AudioCtx()
              if (audioCtx.state === 'suspended') audioCtx.resume()
              const tiempo = audioCtx.currentTime
              const notas = [523.25, 659.25, 783.99]
              notas.forEach((frecuencia, indice) => {
                const osc = audioCtx.createOscillator()
                const gain = audioCtx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(frecuencia, tiempo + indice * 0.04)
                gain.gain.setValueAtTime(0.1, tiempo + indice * 0.04)
                gain.gain.exponentialRampToValueAtTime(0.001, tiempo + 0.4)
                osc.connect(gain)
                gain.connect(audioCtx.destination)
                osc.start(tiempo + indice * 0.04)
                osc.stop(tiempo + 0.4)
              })
            } catch (e) {
              console.warn('[Audio] No se pudo reproducir el tono de nuevo pedido:', e)
            }
          }
        }
      }

      eventSource.onerror = (error) => {
        console.error('Error en SSE Global, reconectando...', error)
        eventSource?.close()
        // Si hay un error fatal o de red, intentamos reconectar en 3 segundos
        reconnectTimeout = setTimeout(() => connectSSE(), 3000)
      }
    }

    // Iniciar la conexión inicial
    connectSSE()

    return () => {
      eventSource?.close()
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
    }
  }, [user, queryClient])

  // Consulta global de pedidos de hoy (activas)
  const { data: listOrdersData } = useQuery({
    queryKey: ['listOrders', user?.miEmpresa, user?.sucursal?.codigo, user?.puntoVenta?.codigo, 'activas'],
    queryFn: async () => {
      const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
      const codigoSucursal = user?.sucursal?.codigo || 0
      const pdv = user?.puntoVenta?.codigo || 0

      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      const parts = formatter.formatToParts(now)
      const ye = parts.find((p) => p.type === 'year')?.value
      const mo = parts.find((p) => p.type === 'month')?.value
      const da = parts.find((p) => p.type === 'day')?.value
      const dateFrom = `${ye}-${mo}-${da}T00:00:00.000-04:00`
      const dateTo = `${ye}-${mo}-${da}T23:59:59.999-04:00`
      const dateFilter = `, dateFrom: "${dateFrom}", dateTo: "${dateTo}"`

      const client = getInboxClient()
      const q = gql`
        query ListOrders {
          listOrders(
            filter: {
              shop: "${shop}",
              codigoSucursal: ${codigoSucursal},
              pdv: ${pdv}${dateFilter}
            },
            page: 1,
            limit: 1000
          ) {
            orders
          }
        }
      `
      const data: any = await client.request(q)
      return data
    },
    enabled: !!user,
  })

  // Calcular la cantidad de pendientes
  const pendingCount = useMemo(() => {
    const rawOrders = listOrdersData?.listOrders?.orders || []
    return rawOrders.filter((o: any) => o.estadoInbox === 'NUEVO' || o.estadoInbox === 'PENDIENTE').length
  }, [listOrdersData])

  return { pendingCount }
}
