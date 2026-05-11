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

const buildComandaDefinition = (
  pedido: RestPedido,
  options?: { titulo?: string; ignorarHistorico?: boolean },
) => {
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
  const snapshotArticulos = options?.ignorarHistorico ? [] : (pedido.ultimaTransaccion?.articulos ?? [])
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

  // Retorna un array de nodos pdfMake: nombre del plato + sublista de modificadores + notas
  const buildDetalle = (prod: any, detallePrefijo = '', totalFinal?: number): any[] => {
    const nombre = prod.nombreArticulo ?? 'Producto'
    const sufijo = totalFinal != null ? ` (total:${totalFinal})` : ''
    const nodos: any[] = [{ text: detallePrefijo + nombre + sufijo, bold: true }]

    const mods = Object.entries(
      ((prod.modificadores ?? []) as any[]).reduce(
        (acc: Record<string, { qty: number; opcion?: string }>, m: any) => {
          const key = m.nombreArticulo ?? ''
          if (!key) return acc
          // UM + nombreOpcion en la clave para distinguir variantes del mismo artículo
          const um =
            m.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ||
            m.articuloPrecio?.codigoArticuloUnidadMedida ||
            ''
          const opcion = m.nombreOpcion ?? ''
          const groupKey = [key, um, opcion].filter(Boolean).join('::')
          if (!acc[groupKey]) acc[groupKey] = { qty: 0, opcion: opcion || undefined }
          acc[groupKey].qty += m.articuloPrecio?.cantidad ?? 1
          return acc
        },
        {},
      ),
    ).map(([k, { qty, opcion }]) => {
      const baseName = k.split('::')[0]
      const label = opcion ? `${baseName} - ${opcion}` : baseName
      return [label, qty] as [string, number]
    })

    const variacionAgrupada = ((prod.variacionReceta ?? []) as any[]).reduce(
      (
        acc: { sin: Record<string, number>; extra: Record<string, number>; receta: Record<string, number> },
        v: any,
      ) => {
        const nombreVar = v.nombreArticulo ?? v.codigoArticulo ?? ''
        if (!nombreVar) return acc

        if (v.removido) {
          acc.sin[nombreVar] = (acc.sin[nombreVar] ?? 0) + 1
          return acc
        }

        const qty = v.articuloPrecio?.cantidad ?? 1
        if (v.esExtra) {
          acc.extra[nombreVar] = (acc.extra[nombreVar] ?? 0) + qty
        } else {
          acc.receta[nombreVar] = (acc.receta[nombreVar] ?? 0) + qty
        }

        return acc
      },
      { sin: {}, extra: {}, receta: {} },
    )

    // Notas del usuario (una por línea)
    const notasUsuario = ((prod.notaRapida ?? []) as any[]).map((n: any) => n.valor).filter(Boolean)
    if (prod.nota) notasUsuario.unshift(prod.nota)
    if (prod.detalleExtra) notasUsuario.push(prod.detalleExtra)
    notasUsuario.forEach((nota: string) => {
      nodos.push({ text: `* ${nota}`, italics: true, fontSize: 6 })
    })

    // MOD: una línea por cada modificador
    mods.forEach(([label, qty]) => {
      nodos.push({
        text: qty > 1 ? `+ ${label} x${qty}` : `+ ${label}`,
        italics: true,
        fontSize: 6,
        bold: true,
      })
    })

    // SIN: una línea por ingrediente removido
    Object.keys(variacionAgrupada.sin).forEach((label) => {
      nodos.push({ text: `* SIN ${label}`, italics: true, fontSize: 6 })
    })

    // EXTRA: una línea por ingrediente extra
    Object.entries(variacionAgrupada.extra).forEach(([label, qty]) => {
      nodos.push({
        text: qty > 1 ? `* EXTRA ${label} x${qty}` : `* EXTRA ${label}`,
        italics: true,
        fontSize: 6,
      })
    })

    // RECETA: variaciones sin flag extra ni removido
    Object.entries(variacionAgrupada.receta).forEach(([label, qty]) => {
      nodos.push({
        text: qty > 1 ? `~ ${label} x${qty}` : `~ ${label}`,
        italics: true,
        fontSize: 6,
      })
    })

    return nodos
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
          { stack: buildDetalle(prod), style: 'tdDetNuevo' },
        ])
      } else if (cambio.tipo === 'ELIMINADO') {
        itemsPorCategoria.cancelados.push([
          { text: String(cambio.delta), style: 'tdCantElim' },
          { stack: buildDetalle(prod), style: 'tdDetElim' },
        ])
      } else {
        const cantPrev =
          snapshotIndex.get(`${prod.articuloId ?? ''}-${prod.nroItem ?? 0}-${prod.codigoArticulo ?? ''}`)
            ?.cantidad ?? 0
        const totalFinal = cantPrev + cambio.delta
        itemsPorCategoria.cambios.push([
          { text: cambio.delta > 0 ? `+${cambio.delta}` : String(cambio.delta), style: 'tdCantEdit' },
          { stack: buildDetalle(prod, '', totalFinal), style: 'tdDetEdit' },
        ])
      }
    })
  } else {
    productosActuales.forEach((prod) => {
      const cant = getCantidad(prod)
      itemsPorCategoria.normales.push([
        { text: String(cant), style: 'tdCant' },
        { stack: buildDetalle(prod), style: 'tdDet' },
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
      { text: options?.titulo || 'COMANDA', style: 'header' },
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

// ---------------------------------------------------------------------------
// Estado de Cuenta (ticket de finalización / pre-cuenta)
// ---------------------------------------------------------------------------

const buildEstadoCuentaDefinition = (pedido: RestPedido, descuentoAdicional = 0) => {
  const mesa = pedido.mesa?.nombre ?? '-'
  const orden = pedido.numeroOrden ?? pedido.numeroPedido ?? '-'
  const usuario = pedido.usucre ?? ''
  const { fecha: fechaActual, hora: horaActual } = formatFechaHora(pedido.updatedAt ?? pedido.createdAt)

  // Construye un stack pdfMake para la celda DETALLE:
  // nombre en negrita + cada modificador/receta como "- item" + comentarios como "* nota"
  const buildDetalleStack = (prod: any): any[] => {
    const nodos: any[] = [
      { text: prod.nombreArticulo ?? prod.codigoArticulo ?? 'Producto', style: 'td', bold: true },
    ]

    // Modificadores: agrupar por nombre+UM+nombreOpcion para distinguir variantes iguales
    const modMap: Record<string, { qty: number; opcion?: string }> = {}
    ;((prod.modificadores ?? []) as any[]).forEach((m: any) => {
      const nombre = m.nombreArticulo ?? m.codigoArticulo ?? ''
      if (!nombre) return
      const um =
        m.articuloPrecio?.articuloUnidadMedida?.codigoUnidadMedida ||
        m.articuloPrecio?.codigoArticuloUnidadMedida ||
        ''
      const opcion = m.nombreOpcion ?? ''
      const key = [nombre, um, opcion].filter(Boolean).join('::')
      if (!modMap[key]) modMap[key] = { qty: 0, opcion: opcion || undefined }
      modMap[key].qty += m.articuloPrecio?.cantidad ?? 1
    })
    Object.entries(modMap).forEach(([k, { qty, opcion }]) => {
      const nombre = k.split('::')[0]
      const label = opcion ? `${nombre} - ${opcion}` : nombre
      nodos.push({ text: qty > 1 ? `- ${label} (x${qty})` : `- ${label}`, style: 'tdSub' })
    })

    // Variaciones de receta: solo mostrar las que NO fueron removidas
    ;((prod.variacionReceta ?? []) as any[]).forEach((v: any) => {
      const nombre = v.nombreArticulo ?? v.codigoArticulo ?? ''
      if (!nombre || v.removido) return
      const qty = v.articuloPrecio?.cantidad ?? 1
      nodos.push({ text: qty > 1 ? `- ${nombre} (x${qty})` : `- ${nombre}`, style: 'tdSub' })
    })

    // Notas rápidas y nota libre: "* nota"
    const notas = ((prod.notaRapida ?? []) as any[]).map((n: any) => n.valor).filter(Boolean)
    if (prod.nota) notas.unshift(prod.nota)
    if (prod.detalleExtra) notas.push(prod.detalleExtra)
    notas.forEach((nota: string) => {
      nodos.push({ text: `* ${nota}`, style: 'tdSub', italics: true })
    })

    return nodos
  }

  // Mapear productos a la forma que espera el document definition
  const data = (pedido.productos ?? []).map((prod: any) => {
    const isCortesia = prod.cortesia ?? false
    const price = isCortesia ? 0 : (prod.articuloPrecio?.valor ?? prod.articuloPrecioBase?.valor ?? 0)
    const quantity = prod.articuloPrecio?.cantidad ?? prod.articuloPrecioBase?.cantidad ?? 1
    const discount = isCortesia
      ? (prod.articuloPrecio?.valor ?? prod.articuloPrecioBase?.valor ?? 0) * quantity
      : (prod.articuloPrecio?.descuento ?? 0)

    return {
      name: prod.nombreArticulo ?? prod.codigoArticulo ?? 'Producto',
      quantity,
      price,
      discount,
      detalleStack: buildDetalleStack(prod),
    }
  })

  // Total neto: sum(qty*price - discount) - descuentoAdicional
  const subtotalProductos = data.reduce((acc: number, p: any) => acc + (p.quantity * p.price - p.discount), 0)
  const totalNeto = Math.max(0, subtotalProductos - descuentoAdicional)

  const descuentoAdicionalStr = descuentoAdicional > 0 ? `-${descuentoAdicional.toFixed(2)}` : '0.00'

  const documentDefinition: any = {
    pageOrientation: 'portrait',
    pageMargins: [0, 0, 0, 0],
    pageSize: { width: 190, height: 'auto' },
    content: [
      // Header compacto
      {
        text: 'ESTADO DE CUENTA',
        style: 'header',
      },

      // Info del pedido en una línea
      {
        text: `PEDIDO: ${orden} - MESA: ${mesa}`,
        style: 'compact',
      },
      {
        text: `${fechaActual} - ${horaActual}`,
        style: 'compact',
      },

      // Ubicación compacta (condicional)
      ...(() => {
        const ubicacionStr = localStorage.getItem('ubicacion')
        if (ubicacionStr) {
          try {
            const ubicacion = JSON.parse(ubicacionStr)
            if (ubicacion.descripcion) {
              return [
                {
                  text: `UBICACIÓN: ${ubicacion.descripcion}`,
                  style: 'compact',
                },
              ]
            }
          } catch (e) {
            console.error('Error al parsear la ubicación:', e)
          }
        }
        return []
      })(),

      // Separador mínimo
      { text: '--------------------------------', style: 'separator' },

      // Tabla ultra compacta
      {
        style: 'tableCompact',
        table: {
          headerRows: 1,
          widths: [20, '*', 25, 20, 30],
          body: [
            // Header
            [
              { text: 'QTY', style: 'th' },
              { text: 'DETALLE', style: 'th' },
              { text: 'P.U.', style: 'th' },
              { text: 'DSC', style: 'th' },
              { text: 'TOTAL', style: 'th' },
            ],

            // Productos
            ...data.map((producto: any) => [
              { text: producto.quantity.toString(), style: 'td', alignment: 'center' },
              { stack: producto.detalleStack },
              { text: producto.price.toFixed(2), style: 'td', alignment: 'right' },
              { text: producto.discount.toFixed(2), style: 'td', alignment: 'right' },
              {
                text: (producto.quantity * producto.price - producto.discount).toFixed(2),
                style: 'td',
                alignment: 'right',
              },
            ]),

            // Descuento adicional (solo si existe)
            ...(Number(descuentoAdicional) > 0
              ? [
                  [
                    { text: '', border: [false, false, false, false] },
                    { text: '', border: [false, false, false, false] },
                    { text: '', border: [false, false, false, false] },
                    {
                      text: 'DESC:',
                      style: 'totalLabel',
                      border: [false, true, false, false],
                    },
                    {
                      text: descuentoAdicionalStr,
                      style: 'totalValue',
                      border: [false, true, false, false],
                    },
                  ],
                ]
              : []),

            // Total final
            [
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: '', border: [false, false, false, false] },
              { text: 'TOTAL:', style: 'totalLabel', border: [false, true, false, true] },
              {
                text: totalNeto.toFixed(2),
                style: 'totalValue',
                border: [false, true, false, true],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: number, node: { table: { body: any[] } }) {
            return i === 1 || i === node.table.body.length ? 0.5 : 0
          },
          vLineWidth: function () {
            return 0
          },
          hLineColor: function () {
            return '#000'
          },
          paddingLeft: function () {
            return 1
          },
          paddingRight: function () {
            return 1
          },
          paddingTop: function () {
            return 0.5
          },
          paddingBottom: function () {
            return 0.5
          },
        },
      },

      { text: ' ', style: 'footer' },
      { text: 'PROPINA:_________________________', style: 'footer', alignment: 'right' },
      { text: ' ', style: 'footer' },
      { text: 'NIT:_____________________________', style: 'footer' },
      { text: 'NOMBRE:__________________________', style: 'footer' },
      { text: 'CORREO/CELULAR:__________________________', style: 'footer' },
      { text: 'Usuario: ' + usuario, style: 'usuario' },
    ],

    styles: {
      header: {
        fontSize: 9,
        bold: true,
        alignment: 'center',
        margin: [0, 1, 0, 1],
      },
      compact: {
        fontSize: 7,
        bold: true,
        alignment: 'center',
        margin: [0, 0.5, 0, 0.5],
      },
      separator: {
        fontSize: 6,
        alignment: 'center',
        margin: [0, 1, 0, 1],
      },
      tableCompact: {
        margin: [0, 1, 0, 1],
      },
      th: {
        fontSize: 6,
        bold: true,
        alignment: 'center',
        fillColor: '#eeeeee',
      },
      td: {
        fontSize: 6,
        margin: [0, 0.5, 0, 0.5],
      },
      tdSub: {
        fontSize: 5.5,
        margin: [2, 0, 0, 0],
        color: '#444444',
      },
      totalLabel: {
        fontSize: 6,
        bold: true,
        alignment: 'right',
      },
      totalValue: {
        fontSize: 8,
        bold: true,
        alignment: 'right',
      },
      footer: {
        fontSize: 9,
        margin: [0, 0.5, 0, 0],
      },
      usuario: {
        fontSize: 5,
        alignment: 'center',
        margin: [0, 1, 0, 1],
      },
    },

    defaultStyle: {
      fontSize: 6,
      lineHeight: 1,
    },
  }

  return documentDefinition
}

export const useComandaPdf = () => {
  const imprimirComanda = async (
    pedido: RestPedido,
    selectedPrinter = '',
    options?: { titulo?: string; ignorarHistorico?: boolean },
  ) => {
    const documentDefinition: any = buildComandaDefinition(pedido, options)
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

  const imprimirEstadoCuenta = async (pedido: RestPedido, descuentoAdicional = 0, selectedPrinter = '') => {
    const documentDefinition: any = buildEstadoCuentaDefinition(pedido, descuentoAdicional)
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition) as any
    const blob: Blob = await pdfDocGenerator.getBlob()

    if (selectedPrinter) {
      try {
        await printBlobToLocalPrinter({
          blob,
          printer: selectedPrinter,
          filename: 'estado-cuenta.pdf',
        })
        notSuccess('Impresión de Estado de Cuenta iniciada')
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

  const imprimirFactura = async (facturaResponse: any, tipoRepresentacionGrafica: string) => {
    if (!facturaResponse?.factura) return

    console.log('Imprimiendo factura con representación gráfica tipo:', tipoRepresentacionGrafica)
    const { representacionGrafica } = facturaResponse.factura

    // Configuración de impresión automática
    const printerSettings = JSON.parse(localStorage.getItem('printers') || '{}')
    const impresionAutomatica = printerSettings.impresionAutomatica || {}

    if (impresionAutomatica.facturar) {
      if (tipoRepresentacionGrafica === 'pdf') {
        setTimeout(async () => {
          try {
            const res = await fetch(representacionGrafica.pdf)
            const blob = await res.blob()
            const localPdfUrl = URL.createObjectURL(blob)
            printJS({ printable: localPdfUrl, type: 'pdf' })
          } catch (error) {
            console.error('Error al obtener el PDF de la factura', error)
            window.open(representacionGrafica.pdf, '_blank')
          }
        }, 1500)
      } else if (
        tipoRepresentacionGrafica === 'rollo' ||
        tipoRepresentacionGrafica === 'rolloResumen' ||
        tipoRepresentacionGrafica === 'rolloReducido'
      ) {
        const pdfUrl =
          tipoRepresentacionGrafica === 'rollo'
            ? representacionGrafica.rollo
            : tipoRepresentacionGrafica === 'rolloResumen'
              ? representacionGrafica.rolloResumen || representacionGrafica.rollo
              : representacionGrafica.rolloReducido || representacionGrafica.rollo

        const selectedPrinter = printerSettings.facturar || ''

        if (selectedPrinter) {
          fetch('http://localhost:7777/printPDF', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pdf_url: pdfUrl,
              printer: selectedPrinter,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.message) {
                notSuccess('Impresión iniciada')
              } else {
                notError('Error al iniciar la impresión')
              }
            })
            .catch((error) => {
              console.error('Error al imprimir el PDF:', error)
              notError('Error al imprimir el PDF')
            })
        } else {
          console.log('No se ha seleccionado una impresora para facturación. Mostrando vista previa en PDF.')
          setTimeout(async () => {
            try {
              const res = await fetch(pdfUrl)
              const blob = await res.blob()
              const localPdfUrl = URL.createObjectURL(blob)

              printJS({
                printable: localPdfUrl,
                type: 'pdf',
                style: '@media print { @page { size: 100%; margin: 0mm; } body { width: 100%; } }',
              })
            } catch (error) {
              console.error('Error al obtener el PDF de la factura en rollo', error)
              window.open(pdfUrl, '_blank') // Fallback
            }
          }, 1500)
        }
      }
    }
  }

  return { imprimirComanda, imprimirEstadoCuenta, imprimirFactura }
}
