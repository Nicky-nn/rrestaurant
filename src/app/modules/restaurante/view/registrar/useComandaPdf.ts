import pdfMake from 'pdfmake/build/pdfmake'
import { useCallback, useEffect, useRef, useState } from 'react'

import { RestPedido } from '../../types'
;(pdfMake as any).fonts = {
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
}

const formatFechaHora = (raw?: string) => {
  let date: Date
  if (!raw) {
    date = new Date()
  } else {
    // Intenta parsear "DD/MM/YYYY HH:MM:SS" o "DD/MM/YYYY HH:MM"
    const dmyMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}:\d{2}(?::\d{2})?)$/)
    if (dmyMatch) {
      date = new Date(`${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}T${dmyMatch[4]}`)
    } else {
      date = new Date(raw)
    }
  }
  if (isNaN(date.getTime())) date = new Date()
  return {
    fecha: date.toLocaleDateString('es-BO'),
    hora: date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
  }
}

const getUbicacionLabel = (pedido: RestPedido): string => {
  // Intentar obtener descripción del área desde localStorage
  try {
    const cached = localStorage.getItem('ubicacion')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed?.descripcion) return parsed.descripcion
    }
  } catch {
    // ignorar
  }
  // Fallback: ubicacion de mesa, espacio o tipo
  return pedido.mesa?.ubicacion ?? pedido.espacio ?? pedido.tipo ?? 'Salón'
}

const buildComandaDefinition = (pedido: RestPedido) => {
  const cliente = pedido.cliente?.razonSocial ?? 'Sin Razón Social'
  const mesa = pedido.mesa?.nombre ?? '-'
  const orden = pedido.numeroOrden ?? pedido.numeroPedido ?? '-'
  const ubicacion = getUbicacionLabel(pedido)
  const { fecha, hora } = formatFechaHora(pedido.updatedAt ?? pedido.createdAt)
  const nota = pedido.nota ?? ''
  const usuario = pedido.usucre ?? ''

  // 🔥 construir filas tabla
  const body: any[] = [
    [
      { text: 'CANT', style: 'tableHeader' },
      { text: 'DETALLE', style: 'tableHeader' },
    ],
  ]

  ;(pedido.productos ?? []).forEach((prod) => {
    const nombre = prod.nombreArticulo ?? 'Producto'
    const cantidad = prod.articuloPrecio?.cantidad ?? prod.articuloPrecioBase?.cantidad ?? 1

    let detalle = nombre

    // modificadores
    const mods = Object.entries(
      (prod.modificadores ?? []).reduce<Record<string, number>>((acc, m) => {
        const key = m.nombreArticulo ?? ''
        if (!key) return acc
        acc[key] = (acc[key] || 0) + (m.articuloPrecio?.cantidad ?? 1)
        return acc
      }, {}),
    ) as [string, number][]
    if (mods.length) {
      detalle += `\n  + ${mods.join(', ')}`
    }

    // notas
    const notas = (prod.notaRapida ?? []).map((n) => n.valor).filter(Boolean)

    if (prod.nota) notas.unshift(prod.nota)

    if (notas.length) {
      detalle += `\n  ※ ${notas.join(' | ')}`
    }

    body.push([
      { text: String(cantidad), style: 'tdCant' },
      { text: detalle, style: 'tdDet' },
    ])
  })

  return {
    pageSize: { width: 180, height: 'auto' },
    pageMargins: [0, 0, 0, 0],

    content: [
      { text: 'COMANDA', style: 'header' },
      { text: `CLIENTE: ${cliente}`, style: 'subheader' },
      { text: `MESA: ${mesa} - ORDEN: ${orden}`, style: 'subheader' },
      { text: `Ubc.: ${ubicacion}`, style: 'subheader' },
      { text: `Fecha: ${fecha}  Hora: ${hora}`, style: 'subheader' },

      {
        style: 'table',
        table: {
          widths: ['auto', '*'],
          body,
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0.5 : 0.3),
          vLineWidth: () => 0,
          paddingLeft: () => 2,
          paddingRight: () => 2,
          paddingTop: () => 1,
          paddingBottom: () => 1,
        },
      },

      { text: 'Comentarios:', style: 'subheader' },
      nota ? { text: `-${nota}`, style: 'subheader' } : {},

      { text: ' ' },
      { text: `Usuario: ${usuario}`, style: 'subheader' },
    ],

    styles: {
      header: {
        fontSize: 9,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 2],
      },
      subheader: {
        fontSize: 7,
        margin: [0, 1, 0, 0],
      },
      table: {
        fontSize: 7,
        margin: [0, 2, 0, 2],
      },
      tableHeader: {
        fontSize: 8,
        bold: true,
        alignment: 'center',
      },
      tdCant: {
        fontSize: 8,
        bold: true,
        alignment: 'center',
      },
      tdDet: {
        fontSize: 7,
        bold: true,
      },
    },

    defaultStyle: {
      fontSize: 6,
    },
  }
}

export const useComandaPdf = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  const generarComanda = useCallback(async (pedido: RestPedido) => {
    const def = buildComandaDefinition(pedido)
    const blob = await pdfMake.createPdf(def as any).getBlob()

    if (urlRef.current) URL.revokeObjectURL(urlRef.current)

    const url = URL.createObjectURL(blob)
    urlRef.current = url
    setPdfUrl(url)
  }, [])

  const clear = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    setPdfUrl(null)
  }, [])

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  return { pdfUrl, generarComanda, clear }
}
