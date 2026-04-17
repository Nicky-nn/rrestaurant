import * as pdfMake from 'pdfmake/build/pdfmake'
import printJS from 'print-js'
import { toast } from 'react-toastify'
;(pdfMake as any).fonts = {
  Roboto: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
}

// Función para formatear la dirección desde JSON o formatos legacy
const formatearDireccion = (direccion: string): string => {
  if (!direccion || direccion.trim() === '') return ''

  // Intentar parsear como JSON primero
  try {
    const parsed = JSON.parse(direccion)
    const partes = []

    if (parsed.calle) partes.push(`CALLE: ${parsed.calle}`)
    if (parsed.número) partes.push(`NUMERO: ${parsed.número}`)
    if (parsed.apartamento) partes.push(`PISO: ${parsed.apartamento}`)
    if (parsed.barrio || parsed.colonia)
      partes.push(`BARRIO: ${parsed.barrio || parsed.colonia}`)
    if (parsed.referenciasAdicionales)
      partes.push(`REF: ${parsed.referenciasAdicionales}`)

    return partes.filter(Boolean).join(', ')
  } catch {
    // Si falla JSON, ya podría estar formateado o en formato legacy
  }

  // Si ya tiene formato "CALLE: valor", retornar tal cual
  if (direccion.includes('CALLE:') || direccion.includes(':')) {
    return direccion
  }

  // Formato legacy con pipes
  if (direccion.includes('|')) {
    const titulos = ['CALLE', 'NUMERO', 'PISO', 'BARRIO', 'CIUDAD', 'REF']
    const partes = direccion.split('|')
    return partes
      .map((valor: string, index: number) =>
        valor && valor.trim() ? `${titulos[index]}: ${valor}` : '',
      )
      .filter(Boolean)
      .join(', ')
  }

  return direccion
}

export const generarComandaPDF = (
  data: any[] | any,
  usuario: string,
  mesa: string = 'NAN',
  orden: string = '',
  tipoPedido: any = 'ACA',
  cliente: any = null,
  notasGenerales: string = '',
  ultimaTransaccionProductos?: any,
  nombre?: string,
) => {
  console.info('Comanda')
  let notasFormateadas = ''
  if (
    notasGenerales &&
    typeof notasGenerales === 'string' &&
    notasGenerales.trim() !== '' &&
    notasGenerales !== 'undefined'
  ) {
    notasFormateadas = notasGenerales
  }

  const fechaActual = new Date().toLocaleDateString()
  const horaActual = new Date().toLocaleTimeString()

  if (!Array.isArray(data) || data.length === 0) {
    console.info('No se encontraron productos para imprimir la comanda')
    return
  }

  let productos: any[] = data

  if (
    ultimaTransaccionProductos &&
    Array.isArray(ultimaTransaccionProductos) &&
    ultimaTransaccionProductos.length > 0
  ) {
    const todosNuevos = ultimaTransaccionProductos.every(
      (item: any) => item.state === 'NUEVO',
    )

    if (todosNuevos) {
      productos = data
    } else {
      const productosConCambios = ultimaTransaccionProductos.filter(
        (item: any) =>
          item.state === 'ACTUALIZADO' ||
          item.state === 'ELIMINADO' ||
          item.state === 'NUEVO',
      )

      if (productosConCambios.length > 0) {
        productos = productosConCambios.map((item: any) => {
          const productoOriginal = data.find(
            (p: any) =>
              p.articuloId === item.articuloId ||
              p.codigoArticulo === item.codigoArticulo,
          )

          return {
            // IMPORTANTE: quantity es la cantidad anterior (del rastro)
            quantity: item.articuloPrecio?.cantidad || 1,
            name: item.nombreArticulo,
            extraDetalle: productoOriginal?.extraDetalle || '',
            extraDescription: productoOriginal?.extraDescription || '',
            listaComplemento: productoOriginal?.listaComplemento || [],
            impresoras: item.impresoras?.[0] || productoOriginal?.impresoras,
            articuloId: item.articuloId,
            codigoArticulo: item.codigoArticulo,
            state: item.state,
            nroItem: item.nroItem,
            // cantidadOriginal = cantidad nueva (del producto actual)
            cantidadOriginal: productoOriginal?.quantity || 0,
          }
        })
      }
    }
  }

  const productosImprimibles = (Array.isArray(productos) ? productos : []).filter(
    (producto: any) => {
      if (producto?.state === 'ACTUALIZADO') {
        const cantidadAnterior = producto.quantity ?? 0
        const cantidadNueva = producto.cantidadOriginal ?? 0
        const diferenciaCantidad = cantidadNueva - cantidadAnterior

        // Si la cantidad cambió, imprimir
        if (diferenciaCantidad !== 0) {
          return true
        }

        // Si la cantidad no cambió pero tiene complementos, también imprimir
        // (porque los complementos pueden haber cambiado)
        if (producto.listaComplemento && producto.listaComplemento.length > 0) {
          return true
        }

        return false
      }
      return true
    },
  )

  if (productosImprimibles.length === 0) {
    console.info('No se encontraron productos para imprimir la comanda')
    return
  }

  productos = productosImprimibles

  const printerSettings = localStorage.getItem('printers')
  let selectedPrinter = ''
  let printersMap: Record<string, string> = {}
  let impresionPorCategorias = false
  let categoriasMap: Record<string, string> = {}

  if (printerSettings) {
    const parsedSettings = JSON.parse(printerSettings)
    if (typeof parsedSettings.comanda === 'string') {
      selectedPrinter = parsedSettings.comanda
    } else if (parsedSettings.comanda && typeof parsedSettings.comanda === 'object') {
      printersMap = parsedSettings.comanda
      impresionPorCategorias = !!parsedSettings.impresionPorCategorias
      categoriasMap = parsedSettings.categoriasAsignadas || {}
    }
  }

  const documentDefinition: any = {
    pageMargins: [0, 0, 0, 0],
    pageSize: { width: 180, height: 'auto' },
    content: [
      { text: 'COMANDA', style: 'header' },
      ...(nombre && nombre.trim() !== ''
        ? [{ text: nombre, style: 'nombreSubtitulo' }]
        : []),
      ...(cliente
        ? [{ text: `CLIENTE: ${cliente.razonSocial}`, style: 'subheader' }]
        : []),
      ...(tipoPedido &&
      tipoPedido.trim() !== '' &&
      cliente &&
      cliente.direccion &&
      cliente.direccion.trim() !== '' &&
      formatearDireccion(cliente.direccion).trim() !== ''
        ? [
            {
              text: `DIRECCIÓN: ${formatearDireccion(cliente.direccion)}`,
              style: 'direccion',
            },
          ]
        : []),
      ...(tipoPedido &&
      tipoPedido.trim() !== '' &&
      cliente &&
      cliente.telefono &&
      cliente.direccion &&
      cliente.direccion.trim() !== '' &&
      formatearDireccion(cliente.direccion).trim() !== ''
        ? [{ text: `TELÉFONO: ${cliente.telefono}`, style: 'subheader' }]
        : []),

      ...(tipoPedido ? [{ text: `PARA: ${tipoPedido}`, style: 'tipoPedido' }] : []),
      { text: `MESA: ${mesa} - ORDEN: ${orden}`, style: 'subheader' },
      ...(() => {
        const ubicacionStr = localStorage.getItem('ubicacion')
        if (ubicacionStr) {
          try {
            const ubicacion = JSON.parse(ubicacionStr)
            if (ubicacion.descripcion) {
              return [
                {
                  text: `Ubc.: ${ubicacion.descripcion.toUpperCase()}`,
                  style: 'subheader',
                },
              ]
            }
          } catch (e) {
            console.error('Error al parsear la ubicación:', e)
          }
        }
        return []
      })(),
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 228, y2: 0, lineWidth: 1 }],
        margin: [0, 2, 0, 2],
      },
      { text: `Fecha: ${fechaActual}  Hora: ${horaActual}`, style: 'subheader' },

      ...(ultimaTransaccionProductos &&
      Array.isArray(ultimaTransaccionProductos) &&
      ultimaTransaccionProductos.length > 0 &&
      productos.some((p: any) => p.state)
        ? [{ text: 'MOSTRANDO SOLO PRODUCTOS MODIFICADOS', style: 'notaModificaciones' }]
        : []),

      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['auto', '*'],
          body: [
            [
              { text: 'CANT', style: 'tableHeader' },
              { text: 'DETALLE', style: 'tableHeader' },
            ],
            ...productos
              .filter((producto: any) => {
                if (producto.state === 'ACTUALIZADO') {
                  const cantidadAnterior = producto.quantity ?? 0
                  const cantidadNueva = producto.cantidadOriginal ?? 0
                  const diferencia = cantidadNueva - cantidadAnterior
                  return diferencia !== 0
                }
                return true
              })
              .map((producto: any) => {
                const complementosTexto = producto.listaComplemento?.length
                  ? `\n  * Complementos: ${producto.listaComplemento
                      .map((c: any) => {
                        const cantidad =
                          c.cantidad ?? c.articuloPrecio?.cantidad ?? 'Error'
                        return `${c.nombreArticulo} (x${cantidad})`
                      })
                      .join(', ')}`
                  : ''

                let estiloTexto: any = {}
                let estiloCantidad: any = {}
                let prefijoEstado = ''
                let cantidadMostrar = producto.quantity.toString()

                if (producto.state) {
                  switch (producto.state) {
                    case 'ELIMINADO':
                      estiloTexto = { style: 'eliminados' }
                      prefijoEstado = '[ELIMINADO] '
                      break
                    case 'NUEVO':
                      estiloTexto = { style: 'nuevos' }
                      prefijoEstado = '[NUEVO] '
                      break
                    case 'ACTUALIZADO': {
                      estiloTexto = { style: 'modificaciones' }
                      prefijoEstado = '[ACT.] '

                      const cantidadAnterior = producto.quantity ?? 0
                      const cantidadNueva = producto.cantidadOriginal ?? 0
                      const diferencia = cantidadNueva - cantidadAnterior

                      cantidadMostrar =
                        diferencia > 0
                          ? `(+${diferencia})`
                          : diferencia < 0
                            ? `(-${Math.abs(diferencia)})`
                            : `(0)`
                      break
                    }
                    default:
                      break
                  }
                } else {
                  estiloCantidad = { style: 'cantidadNormal' }
                }

                return [
                  {
                    text: cantidadMostrar,
                    ...estiloTexto,
                    ...estiloCantidad,
                  },
                  {
                    text: `${prefijoEstado}${producto.name} ${producto.extraDetalle}${
                      producto.extraDescription ? ' - ' + producto.extraDescription : ''
                    }${complementosTexto}`,
                    ...estiloTexto,
                  },
                ]
              }),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) =>
            i === 0 || i === node.table.body.length ? 0.5 : 0.3,
          vLineWidth: () => 0,
          hLineColor: () => '#aaa',
          paddingLeft: () => 2,
          paddingRight: () => 2,
          paddingTop: () => 1,
          paddingBottom: () => 1,
        },
      },

      { text: 'Comentarios:', style: 'subheader' },
      ...(notasFormateadas
        ? [{ text: ` -${notasFormateadas}`, style: 'subheader' }]
        : []),
      { text: ' ' },
      { text: ' ' },
      { text: ' ' },
      { text: 'Usuario: ' + usuario, style: 'subheader' },
    ],
    styles: {
      header: { fontSize: 9, bold: true, alignment: 'center', margin: [0, 0, 0, 1] },
      nombreSubtitulo: {
        fontSize: 8,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 2],
      },
      subheader: { fontSize: 8, margin: [0, 1, 0, 0] },
      direccion: { fontSize: 8, margin: [0, 1, 0, 0], bold: true },
      tableExample: { fontSize: 7, margin: [0, 1, 0, 1] },
      tableHeader: { fontSize: 9, bold: true, alignment: 'center' },
      eliminados: {
        fontSize: 7,
        italics: true,
        color: 'gray',
        decoration: 'lineThrough',
      },
      tipoPedido: { fontSize: 9, bold: true, alignment: 'right', margin: [0, 0, 0, 1] },
      nuevos: { fontSize: 7, bold: true },
      modificaciones: { fontSize: 8, bold: true, margin: [0, 1, 0, 0] },
      notaModificaciones: { fontSize: 6, italics: true, margin: [0, 0, 0, 0] },
      cantidadNormal: {
        fontSize: 9,
        bold: true,
        alignment: 'center',
        color: '#000',
      },
    },
    defaultStyle: { fontSize: 6 },
  }

  const pdfDocGenerator = pdfMake.createPdf(documentDefinition)

  if (impresionPorCategorias) {
    const productsByPrinter: Record<string, any[]> = {}
    const unassigned: any[] = []
    productos.forEach((producto: any) => {
      const printerId = producto.impresoras?._id
      if (printerId) {
        if (!productsByPrinter[printerId]) productsByPrinter[printerId] = []
        productsByPrinter[printerId].push(producto)
      } else {
        unassigned.push(producto)
      }
    })

    if (Object.keys(productsByPrinter).length === 0) {
      console.info('No se encontraron productos para imprimir la comanda')
      return
    }

    if (unassigned.length > 0) {
      toast.warn('Algunos productos no tienen impresora asignada y no se imprimirán')
    }

    Object.entries(productsByPrinter).forEach(([printerId, productos]) => {
      const printerName = printersMap[printerId] || categoriasMap[printerId]
      if (!printerName) {
        toast.warn(`No tiene impresora asignada`)
        return
      }

      const productosGrupoImprimibles = productos.filter((producto: any) => {
        if (producto?.state === 'ACTUALIZADO') {
          const cantidadAnterior = producto.quantity ?? 0
          const cantidadNueva = producto.cantidadOriginal ?? 0
          const diferencia = cantidadNueva - cantidadAnterior
          return diferencia !== 0
        }
        return true
      })

      if (productosGrupoImprimibles.length === 0) {
        console.info('No se encontraron productos para imprimir la comanda')
        return
      }

      const newDef: any = JSON.parse(JSON.stringify(documentDefinition))
      const idx = newDef.content.findIndex((item: any) => item.style === 'tableExample')
      if (idx >= 0) {
        const table = newDef.content[idx]
        const header = table.table.body[0]
        table.table.body = [
          header,
          ...productosGrupoImprimibles.map((producto: any) => {
            const complementosTexto = producto.listaComplemento?.length
              ? `\n  * Complementos: ${producto.listaComplemento
                  .map((c: any) => `${c.nombreArticulo} (x${c?.cantidad ?? 'Error'})`)
                  .join(', ')}`
              : ''

            let estiloTexto = {}
            let prefijoEstado = ''
            let cantidadMostrar = producto.quantity.toString()

            if (producto.state) {
              switch (producto.state) {
                case 'ELIMINADO':
                  estiloTexto = { style: 'eliminados' }
                  prefijoEstado = '[ELIMINADO] '
                  break
                case 'NUEVO':
                  estiloTexto = { style: 'nuevos' }
                  prefijoEstado = '[NUEVO] '
                  break
                case 'ACTUALIZADO': {
                  estiloTexto = { style: 'modificaciones' }
                  prefijoEstado = '[ACTUALIZADO] '

                  const cantidadAnterior = producto.quantity ?? 0
                  const cantidadNueva = producto.cantidadOriginal ?? 0
                  const diferencia = cantidadNueva - cantidadAnterior

                  cantidadMostrar =
                    diferencia > 0
                      ? `(+${diferencia})`
                      : diferencia < 0
                        ? `(-${Math.abs(diferencia)})`
                        : `(0)`
                  break
                }
                default:
                  estiloTexto = {}
                  break
              }
            }

            return [
              { text: cantidadMostrar, ...estiloTexto },
              {
                text: `${prefijoEstado}${producto.name} ${producto.extraDetalle}${
                  producto.extraDescription ? ' - ' + producto.extraDescription : ''
                }${complementosTexto}`,
                ...estiloTexto,
              },
            ]
          }),
        ]
      }

      const pdfGroup = pdfMake.createPdf(newDef)
      pdfGroup.getBlob((blob: Blob) => {
        const formData = new FormData()
        formData.append('file', blob, 'comanda.pdf')
        formData.append('printer', printerName)
        fetch('http://localhost:7777/print', { method: 'POST', body: formData })
          .then((resp) => resp.json())
          .then((res) => {
            res.error
              ? toast.error(`Error al imprimir en ${printerName}: ${res.error}`)
              : toast.success(`Impresión iniciada en ${printerName}`)
          })
          .catch((err) =>
            toast.error(`Error al imprimir en ${printerName}: ${err.message}`),
          )
      })
    })
  } else {
    if (selectedPrinter) {
      pdfDocGenerator.getBlob((blob: Blob) => {
        const formData = new FormData()
        formData.append('file', blob, 'comanda.pdf')
        formData.append('printer', selectedPrinter)
        fetch('http://localhost:7777/print', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            data.error
              ? toast.error(
                  `Error al imprimir, la impresora no responde o no está encendida`,
                )
              : toast.success('Impresión de Comanda iniciada')
          })
          .catch(() => {
            toast.error(`Error al imprimir, la impresora no responde o no está encendida`)
          })
      })
    } else {
      pdfDocGenerator.getBlob((blob: any) => {
        const pdfUrl = URL.createObjectURL(blob)
        printJS({
          printable: pdfUrl,
          type: 'pdf',
          style:
            '@media print { @page { size: 100%; margin: 0mm; } body { width: 100%; } }',
        })
      })
    }
  }
}
