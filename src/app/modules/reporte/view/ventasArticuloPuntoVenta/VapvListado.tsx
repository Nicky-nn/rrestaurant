import { Close, Download, PictureAsPdf } from '@mui/icons-material'
import { Box, Button, IconButton, Modal } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import exportFromJSON from 'export-from-json'
import {
  MaterialReactTable,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import pdfMake from 'pdfmake/build/pdfmake'
import { FunctionComponent, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import MuiRenderTopToolbarCustomActions from '../../../../base/components/MuiTable/MuiRenderTopToolbarCustomActions'
// Configure pdfMake fonts
import TipoDeDescarga from '../../../../base/components/RepresentacionGrafica/TipoDeDescarga'
import useAuth from '../../../../base/hooks/useAuth'
import { MuiToolbarAlertBannerProps } from '../../../../utils/muiTable/materialReactTableUtils'
import { MuiTableNormalOptionsProps } from '../../../../utils/muiTable/muiTableNormalOptionsProps'
import { notDanger } from '../../../../utils/notification'
import { swalClose, swalLoading } from '../../../../utils/swal'
import {
  obtenerReporteVentasPorArticuloPuntoVenta,
  ReportePedidoVentasPorArticuloPuntoVenta,
} from '../../../pos/api/reporteVentasArticulo'
import { VapvListadoColumns } from './VapvListadoColumns'
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
  codigoSucursal: number
  codigoPuntoVenta: number[]
  mostrarTodos: boolean
}

type Props = OwnProps

/**
 * Listado de articulos mas vendidos por punto de venta
 * @param props
 * @constructor
 */
const VapvListado: FunctionComponent<Props> = (props) => {
  const { fechaInicial, fechaFinal, codigoPuntoVenta, codigoSucursal, mostrarTodos } =
    props
  const {
    user: { usuario, razonSocial },
  } = useAuth()
  const mySwal = withReactContent(Swal)

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const fi = format(fechaInicial, 'dd/MM/yyyy')
  const ff = format(fechaFinal, 'dd/MM/yyyy')

  const columns = useMemo(() => VapvListadoColumns(), [])
  // API FETCH
  const {
    data: respData,
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'vapvListado',
      fechaInicial,
      fechaFinal,
      codigoPuntoVenta,
      codigoSucursal,
      mostrarTodos,
    ],
    queryFn: async () => {
      if (!fechaInicial || !fechaFinal) return []
      return await obtenerReporteVentasPorArticuloPuntoVenta(
        fi,
        ff,
        codigoSucursal,
        codigoPuntoVenta,
        mostrarTodos,
      )
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
        puntoVenta: codigoPuntoVenta.join(', '),
        fechaInicial: fi,
        fechaFinal: ff,
        codigoArticulo: item.codigoArticulo,
        articulo: item.nombreArticulo,
        nroVentas: item.nroVentas,
        montoVentas: item.montoVentas,
        montoDescuento: item.montoDescuento,
        totalFinal: item.totalFinal,
        tuvoVariacionPrecio: item.tuvoVariacionPrecio ? 'SI' : 'NO',
        preciosRegistrados: !item.preciosRegistrados?.length
          ? '--'
          : item.preciosRegistrados
              .map((p) => `${p.precio.toFixed(2)} x ${p.cantidad}`)
              .join(' | '),
        moneda: item.moneda,
      })),
      fileName: `rep_articulos_punto_venta_${fi}_${ff}`,
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
          onSelected={(value) => {
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
    pdfDocGenerator.getBlob((blob) => {
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setOpenModal(true)
    })
  }

  const formatAmount = (monto: number) => {
    return monto.toFixed(2)
  }

  const formatVariacionPrecio = (value?: boolean) => {
    return value ? 'SI' : 'NO'
  }

  const formatPreciosRegistrados = (
    precios: ReportePedidoVentasPorArticuloPuntoVenta['preciosRegistrados'],
  ) => {
    if (!precios || precios.length === 0) return '--'
    return precios.map((p) => `${formatAmount(p.precio)} x ${p.cantidad}`).join(' | ')
  }

  const formatPreciosRollo = (
    precios: ReportePedidoVentasPorArticuloPuntoVenta['preciosRegistrados'],
  ) => {
    if (!precios || precios.length === 0) return '--'
    return precios.map((p) => `${formatAmount(p.precio)}x${p.cantidad}`).join(' - ')
  }

  const generateRolloPDF = (data: ReportePedidoVentasPorArticuloPuntoVenta[]) => {
    const totalGeneral = data.reduce((acc, item) => acc + item.totalFinal, 0)
    const groupedByTipoArticulo = data.reduce(
      (acc, item) => {
        const key = item.tipoArticulo || '--'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      },
      {} as Record<string, ReportePedidoVentasPorArticuloPuntoVenta[]>,
    )

    const rollBodyRows = Object.entries(groupedByTipoArticulo).flatMap(
      ([tipoArticulo, items]) => [
        [
          {
            text: `Tipo Articulo: ${tipoArticulo}`,
            colSpan: 4,
            style: 'rollTipoCell',
          },
          {},
          {},
          {},
        ],
        ...items.flatMap((item) => [
          [
            {
              text: `${item.codigoArticulo}-${item.nombreArticulo}`,
              style: 'rollCell',
            },
            { text: `${item.nroVentas}`, style: 'rollCellRight' },
            { text: formatAmount(item.montoVentas), style: 'rollCellRight' },
            { text: formatAmount(item.montoDescuento), style: 'rollCellRight' },
          ],
          [
            {
              text: [
                { text: 'Total: ', bold: true },
                {
                  text: `${formatAmount(item.totalFinal)}`,
                  bold: true,
                  background: '#d1d5db',
                },
                ' | ',
                { text: 'Var: ', bold: true },
                `${formatVariacionPrecio(item.tuvoVariacionPrecio)} | `,
                { text: 'Precios: ', bold: true },
                item.tuvoVariacionPrecio
                  ? formatPreciosRollo(item.preciosRegistrados)
                  : '--',
              ],
              colSpan: 4,
              style: 'rollDetailCell',
            },
            {},
            {},
            {},
          ],
        ]),
      ],
    )

    return {
      pageSize: { width: 227, height: 'auto' },
      pageMargins: [8, 8, 8, 8],
      content: [
        { text: 'Reporte Detallado de Ventas', style: 'header' },
        {
          text: `Fecha: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          style: 'subheader',
        },
        { text: `${razonSocial}`, style: 'subheader' },
        {
          text: `Punto(s) de venta: ${codigoPuntoVenta.join(', ') || 'Todos'}`,
          style: 'subheader',
        },
        { text: `Usuario: ${usuario}`, style: 'subheader' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 22, 38, 38],
            body: [
              [
                { text: 'Articulo', style: 'rollTableHeader' },
                { text: 'Vta', style: 'rollTableHeader' },
                { text: 'M.Vta', style: 'rollTableHeader' },
                { text: 'M.Desc', style: 'rollTableHeader' },
              ],
              ...rollBodyRows,
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 6],
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'TOTAL GENERAL', style: 'rollTotalLabel' },
                { text: formatAmount(totalGeneral), style: 'rollTotalValue' },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 2, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
        subheader: { fontSize: 9, alignment: 'center', color: 'gray' },
        rollTableHeader: {
          fontSize: 8,
          bold: true,
          alignment: 'center',
          fillColor: '#e5e7eb',
        },
        rollCell: { fontSize: 8 },
        rollCellRight: { fontSize: 8, alignment: 'right' },
        rollDetailCell: {
          fontSize: 7,
          color: '#374151',
          fillColor: '#f9fafb',
          margin: [0, 1, 0, 1],
        },
        rollTipoCell: {
          fontSize: 7,
          bold: true,
          color: '#ffffff',
          fillColor: '#6b7280',
          margin: [0, 1, 0, 1],
        },
        rollTotalLabel: {
          fontSize: 10,
          bold: true,
          alignment: 'right',
          color: '#ffffff',
          fillColor: '#4b5563',
          margin: [0, 2, 0, 2],
        },
        rollTotalValue: {
          fontSize: 10,
          bold: true,
          alignment: 'right',
          color: '#ffffff',
          fillColor: '#4b5563',
          margin: [0, 2, 0, 2],
        },
      },
      defaultStyle: {
        fontSize: 8,
      },
    }
  }

  const generateLetterPDF = (data: ReportePedidoVentasPorArticuloPuntoVenta[]) => {
    const totalGeneral = data.reduce((acc, item) => acc + item.totalFinal, 0)
    const groupedByTipoArticulo = data.reduce(
      (acc, item) => {
        const key = item.tipoArticulo || '--'
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      },
      {} as Record<string, ReportePedidoVentasPorArticuloPuntoVenta[]>,
    )

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
        { text: 'Reporte Detallado de Ventas por Artículo', style: 'header' },
        {
          text: `Fecha de Generación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`,
          style: 'subheader',
        },
        {
          text: `Período: ${format(fechaInicial, 'dd/MM/yyyy')} - ${format(
            fechaFinal,
            'dd/MM/yyyy',
          )}`,
          style: 'subheader',
        },
        {
          text: `${razonSocial}`,
          style: 'subheader',
        },
        {
          text: `Generado por: ${usuario}`,
          style: 'subheader',
        },
        { text: '\n' },
        ...Object.entries(groupedByTipoArticulo).map(([tipoArticulo, items]) => ({
          table: {
            headerRows: 2,
            widths: ['*', 42, 42, 54, 54, 54, 34, '*'],
            body: [
              [
                {
                  text: `Tipo Articulo: ${tipoArticulo}`,
                  colSpan: 8,
                  style: 'groupHeaderCell',
                },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
              ],
              [
                { text: 'Articulo', style: 'tableHeader' },
                { text: 'Codigo', style: 'tableHeader' },
                { text: 'Nro. Ventas', style: 'tableHeader' },
                { text: 'Monto Ventas', style: 'tableHeader' },
                { text: 'Monto Desc.', style: 'tableHeader' },
                { text: 'Total Final', style: 'tableHeader' },
                { text: 'Var.', style: 'tableHeader' },
                { text: 'Precios Reg.', style: 'tableHeader' },
              ],
              ...items.map((item) => [
                `${item.codigoArticulo} - ${item.nombreArticulo}`,
                item.codigoArticulo,
                { text: `${item.nroVentas}`, alignment: 'right' },
                {
                  text: `${item.moneda} ${formatAmount(item.montoVentas)}`,
                  alignment: 'right',
                },
                {
                  text: `${item.moneda} ${formatAmount(item.montoDescuento)}`,
                  alignment: 'right',
                },
                {
                  text: `${item.moneda} ${formatAmount(item.totalFinal)}`,
                  alignment: 'right',
                },
                {
                  text: formatVariacionPrecio(item.tuvoVariacionPrecio),
                  alignment: 'center',
                },
                item.tuvoVariacionPrecio
                  ? formatPreciosRegistrados(item.preciosRegistrados)
                  : '--',
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 8],
        })),
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'TOTAL GENERAL', style: 'letterTotalLabel' },
                {
                  text: formatAmount(totalGeneral),
                  style: 'letterTotalValue',
                },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 6, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 12, alignment: 'center', color: 'gray' },
        groupHeaderCell: {
          fontSize: 11,
          bold: true,
          color: '#ffffff',
          fillColor: '#1f2937',
          alignment: 'center',
          margin: [0, 4, 0, 4],
        },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 20, 0, 10] },
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          fillColor: '#f8f9fa',
        },
        subsubheader: { fontSize: 12, bold: true, margin: [0, 5, 0, 5] },
        totalHeader: { fontSize: 12, bold: true, alignment: 'right' },
        totalValue: { fontSize: 12, bold: true, alignment: 'right' },
        letterTotalLabel: { fontSize: 12, bold: true, alignment: 'right' },
        letterTotalValue: { fontSize: 12, bold: true, alignment: 'right' },
      },
      defaultStyle: {
        fontSize: 10,
      },
    }
  }

  const table = useMaterialReactTable({
    ...(MuiTableNormalOptionsProps as MRT_TableOptions<ReportePedidoVentasPorArticuloPuntoVenta>),
    columns: columns,
    data: respData || [],
    muiToolbarAlertBannerProps: MuiToolbarAlertBannerProps(isError),
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      density: 'compact',
    },
    enableColumnActions: false,
    enableRowActions: false,
    renderTopToolbarCustomActions: () => (
      <MuiRenderTopToolbarCustomActions refetch={refetch}>
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
      </MuiRenderTopToolbarCustomActions>
    ),
  })

  return (
    <>
      <MaterialReactTable table={table} />
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

export default VapvListado
