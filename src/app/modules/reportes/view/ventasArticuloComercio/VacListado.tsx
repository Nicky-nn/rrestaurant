import { Close, Download, PictureAsPdf } from '@mui/icons-material'
import { Box, Button, IconButton, Modal } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import exportFromJSON from 'export-from-json'
import { MrtDynamicTable } from '../../../../base/components/Table/MrtDynamicTable'
import { MrtTableConfig } from '../../../../base/components/Table/mrtTypes'
import pdfMake from 'pdfmake/build/pdfmake'
import { FunctionComponent, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import TipoDeDescarga from '../../../../base/components/RepresentacionGrafica/TipoDeDescarga'
import useAuth from '../../../../base/hooks/useAuth'
import { notDanger } from '../../../../utils/notification'
import { swalClose, swalLoading } from '../../../../utils/swal'
import {
  obtenerReporteVentasPorArticuloComercio,
  ReportePedidoVentasPorArticuloComercio,
} from '../../api/reporteVentasArticulo'
import { VacListadoColumns } from './VacListadoColumns'
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
interface OwnProps {
  fechaInicial: Date
  fechaFinal: Date
  codigoSucursal: number[]
}

type Props = OwnProps

/**
 * Listado de articulos mas vendidos por punto de venta
 * @param props
 * @constructor
 */
const VacListado: FunctionComponent<Props> = (props) => {
  const { fechaInicial, fechaFinal, codigoSucursal } = props
  const {
    user: { usuario, razonSocial, sucursal },
  } = useAuth()
  const mySwal = withReactContent(Swal)

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const fi = format(fechaInicial, 'dd/MM/yyyy')
  const ff = format(fechaFinal, 'dd/MM/yyyy')

  const columns = useMemo(() => VacListadoColumns(), [])
  // API FETCH
  const {
    data: respData,
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['vapvListado', fechaInicial, fechaFinal, codigoSucursal],
    queryFn: async () => {
      if (!fechaInicial || !fechaFinal) return []
      return await obtenerReporteVentasPorArticuloComercio(fi, ff, codigoSucursal)
    },
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })

  const onExportar = async () => {
    if (!respData) return
    if (respData?.length === 0) {
      notDanger('No se encontraron ventas en el periodo seleccionado')
      return
    }
    swalLoading()
    const exportType = exportFromJSON.types.csv
    const fi = format(fechaInicial, 'dd/MM/yyyy')
    const ff = format(fechaFinal, 'dd/MM/yyyy')
    exportFromJSON({
      data: respData.map((item) => ({
        sucursal: item.sucursal,
        puntoVenta: item.puntoVenta,
        fechaInicial: fi,
        fechaFinal: ff,
        codigoArticulo: item.codigoArticulo,
        articulo: item.nombreArticulo,
        nroVentas: item.nroVentas,
        montoVentas: item.montoVentas,
        montoDescuento: item.montoDescuento,
        montoDescuentoAdicional: item.montoDescuentoAdicional,
        moneda: item.moneda,
      })),
      fileName: `rep_articulos_comercio_${fi}_${ff}`,
      exportType,
      delimiter: ';',
      withBOM: true,
    })
    swalClose()
  }

  const generarPdf = async () => {
    let tipoDescarga: string | undefined

    // Mostrar el SweetAlert
    await mySwal.fire({
      title: 'Selecciona el formato del PDF',
      html: (
        <TipoDeDescarga
          onSelected={(value: string) => {
            tipoDescarga = value
            mySwal.close() // Cierra el modal una vez seleccionado
          }}
        />
      ),
      showCancelButton: false,
      showCloseButton: true,
      showConfirmButton: false,
      didOpen: () => {
        // Importante para manejar eventos React dentro del modal
        mySwal.getHtmlContainer()?.addEventListener('click', () => {})
      },
    })

    if (!tipoDescarga) return

    if (!respData || respData.length === 0) {
      notDanger('No hay datos para generar el PDF.')
      return
    }

    // Genera el documento según el formato seleccionado
    const pdfDefinition =
      tipoDescarga === 'pdf' ? generateLetterPDF(respData) : generateRolloPDF(respData)

    // Mostrar el PDF en un modal con iframe
    const pdfDocGenerator = pdfMake.createPdf(pdfDefinition as any)
    pdfDocGenerator.getBlob((blob:Blob) => {
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setOpenModal(true)
    })
  }

  const formatAmount = (monto?: number | null) => {
    return Number(monto ?? 0).toFixed(2)
  }

  const formatTextValue = (value?: string | number | null) => {
    if (value === null || value === undefined) return '--'
    const valueAsString = String(value).trim()
    return valueAsString.length > 0 ? valueAsString : '--'
  }

  const generateLetterPDF = (data: ReportePedidoVentasPorArticuloComercio[]) => {
    return {
      pageSize: 'LETTER',
      pageMargins: [40, 40, 40, 40],
      footer: function (currentPage: any, pageCount: any) {
        return {
          text: `Página ${currentPage.toString()} de ${pageCount}`,
          alignment: 'center',
          fontSize: 9,
          margin: [0, 10, 0, 10],
        }
      },
      content: [
        { text: 'Reporte Detallado de Ventas por Sucursal', style: 'header' },
        {
          text: `Fecha de Generación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          style: 'subheader',
        },
        {
          text: `Período: ${format(fechaInicial, 'dd/MM/yyyy')} - ${format(fechaFinal, 'dd/MM/yyyy')}`,
          style: 'subheader',
        },
        {
          text: `${razonSocial}`,
          style: 'subheader',
        },
        {
          text: `Casa Matriz: ${sucursal.codigo} - ${sucursal.direccion}`,
          style: 'subheader',
        },
        {
          text: `Generado por: ${usuario}`,
          style: 'subheader',
        },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: [55, '*', 42, 48, 52, 56, 56, 60, 50, 50],
            body: [
              [
                { text: 'Tipo Art.', style: 'tableHeader' },
                { text: 'Artículo', style: 'tableHeader' },
                { text: 'Código', style: 'tableHeader' },
                { text: 'Nro. Ventas', style: 'tableHeader' },
                { text: 'Unidad', style: 'tableHeader' },
                { text: 'Monto Ventas', style: 'tableHeader' },
                { text: 'Monto Desc.', style: 'tableHeader' },
                { text: 'Monto Desc. Ad.', style: 'tableHeader' },
                { text: 'Punto Venta', style: 'tableHeader' },
                { text: 'Sucursal', style: 'tableHeader' },
              ],
              ...data.map((item) => [
                item.tipoArticulo || '--',
                `${item.codigoArticulo} - ${item.nombreArticulo || '--'}`,
                item.codigoArticulo || '--',
                { text: `${item.nroVentas ?? 0}`, alignment: 'right' },
                item.unidadMedida || '--',
                {
                  text: `${item.moneda} ${formatAmount(item.montoVentas)}`,
                  alignment: 'right',
                },
                {
                  text: `${item.moneda} ${formatAmount(item.montoDescuento)}`,
                  alignment: 'right',
                },
                {
                  text: `${item.moneda} ${formatAmount(item.montoDescuentoAdicional)}`,
                  alignment: 'right',
                },
                formatTextValue(item.puntoVenta),
                formatTextValue(item.sucursal),
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 12, alignment: 'center', color: 'gray' },
        tableHeader: {
          fontSize: 9,
          bold: true,
          alignment: 'center',
          fillColor: '#f8f9fa',
        },
      },
      defaultStyle: {
        fontSize: 8,
      },
    }
  }

  const generateRolloPDF = (data: ReportePedidoVentasPorArticuloComercio[]) => {
    return {
      pageSize: { width: 227, height: 'auto' },
      pageMargins: [10, 10, 10, 10],
      content: [
        { text: 'Reporte Detallado por Sucursal', style: 'header' },
        {
          text: `Fecha: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          style: 'subheader',
        },
        {
          text: `Período: ${format(fechaInicial, 'dd/MM/yyyy')} - ${format(fechaFinal, 'dd/MM/yyyy')}`,
          style: 'subheader',
        },
        { text: `${razonSocial}`, style: 'subheader' },
        {
          text: `Sucursal: ${sucursal.codigo} - ${sucursal.direccion}`,
          style: 'subheader',
        },
        { text: `Usuario: ${usuario}`, style: 'subheader' },
        { text: '\n' },
        ...data.map((item) => {
          return {
            stack: [
              {
                text: `${item.codigoArticulo} - ${item.nombreArticulo || '--'}`,
                style: 'rollItemTitle',
              },
              {
                table: {
                  widths: [62, '*'],
                  body: [
                    [
                      { text: 'Tipo', style: 'kvLabel' },
                      { text: item.tipoArticulo || '--', style: 'kvValue' },
                    ],
                    [
                      { text: 'Cant / UM', style: 'kvLabel' },
                      {
                        text: `${item.nroVentas ?? 0} / ${item.unidadMedida || '--'}`,
                        style: 'kvValue',
                      },
                    ],
                    [
                      { text: 'Punto Venta', style: 'kvLabel' },
                      { text: formatTextValue(item.puntoVenta), style: 'kvValue' },
                    ],
                    [
                      { text: 'Sucursal', style: 'kvLabel' },
                      { text: formatTextValue(item.sucursal), style: 'kvValue' },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
              {
                table: {
                  widths: [78, '*'],
                  body: [
                    [
                      { text: 'Monto Ventas', style: 'kvLabel' },
                      {
                        text: `${item.moneda} ${formatAmount(item.montoVentas)}`,
                        style: 'montoVal',
                      },
                    ],
                    [
                      { text: 'Monto Descuento', style: 'kvLabel' },
                      {
                        text: `${item.moneda} ${formatAmount(item.montoDescuento)}`,
                        style: 'montoVal',
                      },
                    ],
                    [
                      { text: 'Monto Desc. Ad.', style: 'kvLabel' },
                      {
                        text: `${item.moneda} ${formatAmount(item.montoDescuentoAdicional)}`,
                        style: 'montoVal',
                      },
                    ],
                  ],
                },
                layout: 'noBorders',
                margin: [0, 2, 0, 2],
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: 207,
                    y2: 0,
                    lineWidth: 1,
                    dash: { length: 2 },
                  },
                ],
                margin: [0, 5, 0, 5],
              },
            ],
          }
        }),
      ],
      styles: {
        header: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
        subheader: { fontSize: 9, alignment: 'center', color: 'gray' },
        rollItemTitle: { fontSize: 9, bold: true, margin: [0, 4, 0, 2] },
        kvLabel: { fontSize: 8, bold: true, color: 'gray' },
        kvValue: { fontSize: 8 },
        montoVal: { fontSize: 8, alignment: 'right' },
      },
      defaultStyle: {
        fontSize: 8,
      },
    }
  }

  const config = useMemo<MrtTableConfig<ReportePedidoVentasPorArticuloComercio>>(
    () => ({
      id: 'vac-listado',
      columns,
      showIconRefetch: true,
      renderTopToolbarCustomActions: () => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={'outlined'}
            size={'small'}
            startIcon={<Download />}
            onClick={() => onExportar()}
          >
            Exportar
          </Button>
          <Button
            variant={'outlined'}
            size={'small'}
            startIcon={<PictureAsPdf />}
            onClick={() => generarPdf()}
          >
            Generar PDF
          </Button>
        </Box>
      ),
      additionalOptions: {
        enableColumnActions: false,
        enableRowActions: false,
      },
    }),
    [columns, respData, fi, ff],
  )

  return (
    <>
      <MrtDynamicTable
        config={config}
        data={respData || []}
        isLoading={isLoading}
        isFetching={isRefetching}
        isError={isError}
        refetch={refetch as any}
      />
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl)
            setPdfUrl(null)
          }
        }}
        aria-labelledby="pdf-modal-title"
        aria-describedby="pdf-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            onClick={() => {
              setOpenModal(false)
              if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl)
                setPdfUrl(null)
              }
            }}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="PDF Viewer"
            />
          )}
        </Box>
      </Modal>
    </>
  )
}

export default VacListado
