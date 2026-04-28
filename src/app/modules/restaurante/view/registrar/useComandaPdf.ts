import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import printJS from 'print-js'

import { printBlobToLocalPrinter } from '../../../../base/services/localPrinterService'
import { notError, notSuccess } from '../../../../utils/notification'
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

  // Regla backend:
  // - ultimaTransaccion.articulos guarda snapshot ANTES del cambio
  // - productos guarda estado ACTUAL
  // Para detectar cambio real, comparar snapshot vs actual en tiempo real.
  const snapshotArticulos = pedido.ultimaTransaccion?.articulos ?? []
  const productosActuales = pedido.productos ?? []

  const getKey = (prod: any) => `${prod.articuloId ?? ''}-${prod.nroItem ?? 0}-${prod.codigoArticulo ?? ''}`
  const getCantidad = (prod: any) => prod.articuloPrecio?.cantidad ?? prod.articuloPrecioBase?.cantidad ?? 1

  const buildIndex = (items: any[]) => {
    const index = new Map<string, { prod: any; cantidad: number }>()
    items.forEach((prod) => {
      const key = getKey(prod)
      const prev = index.get(key)
      const cantidad = getCantidad(prod)
      if (prev) {
        prev.cantidad += cantidad
      } else {
        index.set(key, { prod, cantidad })
      }
    })
    return index
  }

  const snapshotIndex = buildIndex(snapshotArticulos)
  const actualIndex = buildIndex(productosActuales)

  const keys = new Set([...snapshotIndex.keys(), ...actualIndex.keys()])
  const cambios = Array.from(keys)
    .map((key) => {
      const prev = snapshotIndex.get(key)
      const curr = actualIndex.get(key)
      const cantPrev = prev?.cantidad ?? 0
      const cantCurr = curr?.cantidad ?? 0

      if (cantPrev === cantCurr) return null
      if (cantPrev === 0) return { tipo: 'NUEVO' as const, delta: cantCurr, prod: curr?.prod }
      if (cantCurr === 0) return { tipo: 'ELIMINADO' as const, delta: -cantPrev, prod: prev?.prod }
      return { tipo: 'ACTUALIZADO' as const, delta: cantCurr - cantPrev, prod: curr?.prod }
    })
    .filter(Boolean) as Array<{ tipo: 'NUEVO' | 'ACTUALIZADO' | 'ELIMINADO'; delta: number; prod: any }>

  const esModificacion = snapshotArticulos.length > 0 && cambios.length > 0

  const subTituloMod = esModificacion ? '** MODIFICACION **' : null

  const body: any[] = [
    [
      { text: 'CANT', style: 'tableHeader' },
      { text: 'DETALLE', style: 'tableHeader' },
    ],
  ]

  const buildDetalle = (prod: any, detallePrefijo = '', totalFinal?: number) => {
    const nombre = prod.nombreArticulo ?? 'Producto'
    const sufijo = totalFinal != null ? ` (total:${totalFinal})` : ''
    let detalle = detallePrefijo + nombre + sufijo
    const mods = Object.entries(
      ((prod.modificadores ?? []) as any[]).reduce((acc: Record<string, number>, m: any) => {
        const key = m.nombreArticulo ?? ''
        if (!key) return acc
        // UM en la clave para distinguir variantes del mismo artículo
        const um =
          m.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ||
          m.articuloPrecio?.codigoArticuloUnidadMedida ||
          ''
        const groupKey = um ? `${key}::${um}` : key
        acc[groupKey] = (acc[groupKey] || 0) + (m.articuloPrecio?.cantidad ?? 1)
        return acc
      }, {}),
    ).map(([k, qty]) => [k.split('::')[0], qty]) as [string, number][]

    if (mods.length) {
      detalle += `\n  + ${mods.join(', ')}`
    }

    const notas = ((prod.notaRapida ?? []) as any[]).map((n: any) => n.valor).filter(Boolean)
    if (prod.nota) notas.unshift(prod.nota)
    if (prod.detalleExtra) notas.push(prod.detalleExtra)
    if (notas.length) {
      detalle += `\n  * ${notas.join(' | ')}`
    }

    return detalle
  }

  // Organizar por categoría para mejor claridad al chef
  const itemsPorCategoria = {
    nuevos: [] as any[],
    cambios: [] as any[],
    cancelados: [] as any[],
    normales: [] as any[],
  }

  if (esModificacion) {
    cambios.forEach((cambio) => {
      const prod = cambio.prod
      if (!prod) return

      if (cambio.tipo === 'NUEVO') {
        itemsPorCategoria.nuevos.push([
          { text: `+${cambio.delta}`, style: 'tdCantNuevo' },
          { text: buildDetalle(prod), style: 'tdDetNuevo' },
        ])
      } else if (cambio.tipo === 'ELIMINADO') {
        itemsPorCategoria.cancelados.push([
          { text: String(cambio.delta), style: 'tdCantElim' },
          { text: buildDetalle(prod), style: 'tdDetElim' },
        ])
      } else {
        const cantPrev =
          snapshotIndex.get(`${prod.articuloId ?? ''}-${prod.nroItem ?? 0}-${prod.codigoArticulo ?? ''}`)
            ?.cantidad ?? 0
        const totalFinal = cantPrev + cambio.delta
        itemsPorCategoria.cambios.push([
          { text: cambio.delta > 0 ? `+${cambio.delta}` : String(cambio.delta), style: 'tdCantEdit' },
          { text: buildDetalle(prod, '', totalFinal), style: 'tdDetEdit' },
        ])
      }
    })
  } else {
    productosActuales.forEach((prod) => {
      const cant = getCantidad(prod)
      itemsPorCategoria.normales.push([
        { text: String(cant), style: 'tdCant' },
        { text: buildDetalle(prod), style: 'tdDet' },
      ])
    })
  }

  // Agregar items de forma compacta (sin secciones) para ahorrar espacio de papel
  if (esModificacion) {
    body.push(...itemsPorCategoria.nuevos)
    body.push(...itemsPorCategoria.cambios)
    body.push(...itemsPorCategoria.cancelados)
  } else {
    body.push(...itemsPorCategoria.normales)
  }

  return {
    pageSize: { width: 180, height: 'auto' },
    pageMargins: [0, 0, 0, 0],
    content: [
      { text: 'COMANDA', style: 'header' },
      subTituloMod ? { text: subTituloMod, style: 'subMod' } : {},
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
      subMod: {
        fontSize: 8,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 2],
        italics: true,
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
      seccionHeader: {
        fontSize: 8,
        bold: true,
        alignment: 'left',
        margin: [0, 2, 0, 1],
        fillColor: '#f5f5f5',
      },
      // --- Normal ---
      tdCant: { fontSize: 8, bold: true, alignment: 'center' },
      tdDet: { fontSize: 7, bold: true },
      // --- NUEVO ---
      tdCantNuevo: { fontSize: 10, bold: true, alignment: 'center' },
      tdDetNuevo: { fontSize: 8, bold: true },
      // --- ACTUALIZADO ---
      tdCantEdit: { fontSize: 9, bold: true, alignment: 'center', italics: true },
      tdDetEdit: { fontSize: 8, bold: true, italics: true },
      // --- ELIMINADO ---
      tdCantElim: {
        fontSize: 8,
        bold: true,
        alignment: 'center',
        decoration: 'lineThrough',
        color: '#999999',
      },
      tdDetElim: { fontSize: 7, bold: true, decoration: 'lineThrough', color: '#999999' },
    },
    defaultStyle: {
      fontSize: 6,
    },
  }
}

export const useComandaPdf = () => {
  const imprimirComanda = async (pedido: RestPedido, selectedPrinter = '') => {
    const documentDefinition: any = buildComandaDefinition(pedido)
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition) as any
    const blob: Blob = await pdfDocGenerator.getBlob()

    if (selectedPrinter) {
      try {
        await printBlobToLocalPrinter({
          blob,
          printer: selectedPrinter,
          filename: 'comanda.pdf',
        })
        notSuccess('Impresión de Comanda iniciada')
        return
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'la impresora no responde o no está encendida'
        notError(`Error al imprimir: ${msg}`)
        return
      }
    }

    const pdfUrl = URL.createObjectURL(blob)
    printJS({
      printable: pdfUrl,
      type: 'pdf',
      style: '@media print { @page { size: 100%; margin: 0mm; } body { width: 100%; } }',
    })
  }

  return { imprimirComanda }
}
