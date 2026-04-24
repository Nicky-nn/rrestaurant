import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import printJS from 'print-js'

import { RestPedido } from '../../types'
;(pdfMake as any).addVirtualFileSystem(pdfFonts)

const formatFechaHora = (raw?: string) => {
  let date: Date
  if (!raw) {
    date = new Date()
  } else {
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
    hora: date.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

const getUbicacionLabel = (pedido: RestPedido): string => {
  const rawUbicacion = pedido.mesa?.ubicacion
  const isObjectId = (val?: string) => Boolean(val && /^[0-9a-fA-F]{24}$/.test(val))
  if (!rawUbicacion || isObjectId(rawUbicacion)) return 'S. Principal'
  return rawUbicacion
}

const buildComandaDefinition = (pedido: RestPedido) => {
  const cliente = pedido.cliente?.razonSocial ?? 'Sin Razón Social'
  const mesa = pedido.mesa?.nombre ?? '-'
  const orden = pedido.numeroOrden ?? pedido.numeroPedido ?? '-'
  const ubicacion = getUbicacionLabel(pedido)
  const { fecha, hora } = formatFechaHora(pedido.updatedAt ?? pedido.createdAt)
  const nota = pedido.nota ?? ''
  const usuario = pedido.usucre ?? ''

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
  const imprimirComanda = async (pedido: RestPedido) => {
    const documentDefinition: any = buildComandaDefinition(pedido)
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition) as any
    console.log('Generando PDF con definición', documentDefinition)
    const blob: Blob = await pdfDocGenerator.getBlob()
    const pdfUrl = URL.createObjectURL(blob)
    console.log('PDF generado, URL:', pdfUrl)
    printJS({
      printable: pdfUrl,
      type: 'pdf',
      style: '@media print { @page { size: 100%; margin: 0mm; } body { width: 100%; } }',
    })
  }

  return { imprimirComanda }
}
