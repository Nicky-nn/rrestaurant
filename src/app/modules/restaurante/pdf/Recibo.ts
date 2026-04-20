import * as pdfMake from 'pdfmake/build/pdfmake'
import printJS from 'print-js' // Import printJS
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

export const generarReciboPDF = (
  data: any,
  usuario: string,
  totalNeto: number,
  mesa: string = 'NAN',
  orden: string = '',
  descuentoAdicional: string = '0',
) => {
  console.info('Generando Estado de Cuenta PDF...')
  const fechaActual = new Date().toLocaleDateString()
  const horaActual = new Date().toLocaleTimeString()

  if (!data || data.length === 0) {
    toast.error('Debe agregar al menos un producto')
    return
  }

  const printerSettings = localStorage.getItem('printers')
  let selectedPrinter = ''
  if (printerSettings) {
    const parsedSettings = JSON.parse(printerSettings)
    selectedPrinter = parsedSettings.estadoDeCuenta
  }

  const documentDefinition: any = {
    pageOrientation: 'portrait',
    pageMargins: [0, 0, 0, 0], // Reducir márgenes a 0
    pageSize: { width: 190, height: 'auto' }, // Ancho: 80 mm (8 cm), Alto: automático
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
          widths: [20, '*', 25, 20, 30], // Optimizado para 190mm
          body: [
            // Header sin bordes superiores
            [
              { text: 'QTY', style: 'th' },
              { text: 'DETALLE', style: 'th' },
              { text: 'P.U.', style: 'th' },
              { text: 'DSC', style: 'th' },
              { text: 'TOTAL', style: 'th' },
            ],

            // Productos con formato compacto
            ...data.map((producto: any) => [
              { text: producto.quantity.toString(), style: 'td', alignment: 'center' },
              {
                text: producto.extraDetalle
                  ? `${producto.name}\n${producto.extraDetalle}`
                  : producto.name,
                style: 'td',
              },
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
                      text: descuentoAdicional,
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
      { text: 'CORREO:__________________________', style: 'footer' },
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

  const pdfDocGenerator = pdfMake.createPdf(documentDefinition)

  if (selectedPrinter) {
    pdfDocGenerator.getBlob((blob: Blob) => {
      const formData = new FormData()
      formData.append('file', blob, 'estado_de_cuenta.pdf')
      formData.append('printer', selectedPrinter)

      fetch('http://localhost:7777/print', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            toast.error(`Error al imprimir, la impresora no responde o no está encendida`)
          } else {
            toast.success('Impresión de Estado de Cuenta iniciada')
          }
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
