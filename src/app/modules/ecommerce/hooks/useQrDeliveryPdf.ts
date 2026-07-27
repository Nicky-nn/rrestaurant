import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { useCallback, useState } from 'react'

import { RestPedido } from '../../restaurante/types'

// Setup pdfmake fonts
;(pdfMake as any).addVirtualFileSystem(pdfFonts)

const buildQrDeliveryDefinition = (pedido: RestPedido, authShopId?: string) => {
  const clienteNombre = pedido.cliente?.razonSocial ?? 'Sin Nombre'
  let telefono = pedido.cliente?.telefono ?? '-'
  
  let direccion = pedido.cliente?.direccion ?? pedido.direccionEntrega ?? 'Para recoger'
  // Si la dirección viene como JSON string, la parseamos para extraer la calle/referencia
  if (typeof direccion === 'string' && direccion.startsWith('{')) {
    try {
      const parsedDir = JSON.parse(direccion)
      direccion = parsedDir.calle || parsedDir.direccion || direccion
      if (telefono === '-' && parsedDir.telefono) {
        telefono = parsedDir.telefono
      }
    } catch (e) {
      // Ignorar error de parseo
    }
  } else if (typeof direccion === 'object' && direccion !== null) {
    if (telefono === '-' && (direccion as any).telefono) {
      telefono = (direccion as any).telefono
    }
    direccion = (direccion as any).calle || (direccion as any).direccion || JSON.stringify(direccion)
  }

  const orden = pedido.numeroOrden ?? pedido.numeroPedido ?? '-'
  // shopId can come from auth or pedido.tienda
  const tiendaId = authShopId || (pedido as any).tienda || '-'
  
  // The QR code contains JSON payload with the exact identifiers
  const qrPayload = JSON.stringify({
    orderId: pedido._id,
    shopId: tiendaId,
    action: 'DELIVERY_SCAN',
  })

  const docDefinition: any = {
    pageSize: { width: 226, height: 'auto' }, // 80mm thermal paper
    pageMargins: [10, 10, 10, 10],
    content: [
      { text: 'ORDEN DE DELIVERY', style: 'header' },
      { text: `Orden #${orden}`, style: 'subheader' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 206, y2: 0, lineWidth: 1 }] },
      { text: ' ', fontSize: 5 },
      {
        layout: 'noBorders',
        table: {
          widths: ['auto', '*'],
          body: [
            [{ text: 'Cliente:', bold: true, fontSize: 10 }, { text: clienteNombre, fontSize: 10 }],
            [{ text: 'Teléfono:', bold: true, fontSize: 10 }, { text: telefono, fontSize: 10 }],
            [{ text: 'Dirección:', bold: true, fontSize: 10 }, { text: direccion, fontSize: 10 }],
          ],
        },
      },
      { text: ' ', fontSize: 10 },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 206, y2: 0, lineWidth: 1 }] },
      { text: ' ', fontSize: 10 },
      { text: 'Escanea el QR para asignar el pedido', style: 'info' },
      { text: ' ', fontSize: 5 },
      {
        qr: qrPayload,
        fit: 180,
        alignment: 'center',
      },
      { text: ' ', fontSize: 10 },
      { text: 'Este QR es único e intransferible.', style: 'footer' },
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 5],
      },
      subheader: {
        fontSize: 12,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 5],
      },
      info: {
        fontSize: 10,
        alignment: 'center',
        italics: true,
      },
      footer: {
        fontSize: 8,
        alignment: 'center',
        italics: true,
      },
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
    },
  }

  return docDefinition
}

export const useQrDeliveryPdf = () => {
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const generateQrPdfUrl = useCallback(async (pedido: RestPedido, authShopId?: string) => {
    setLoading(true)
    try {
      const docDefinition = buildQrDeliveryDefinition(pedido, authShopId)
      const pdfDocGenerator = pdfMake.createPdf(docDefinition)

      const blob: Blob = await pdfDocGenerator.getBlob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setLoading(false)
      return url
    } catch (error) {
      console.error('Error al generar PDF de QR:', error)
      setLoading(false)
      throw error
    }
  }, [])

  const clearPdfUrl = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }, [pdfUrl])

  return {
    generateQrPdfUrl,
    pdfUrl,
    loading,
    clearPdfUrl,
  }
}
