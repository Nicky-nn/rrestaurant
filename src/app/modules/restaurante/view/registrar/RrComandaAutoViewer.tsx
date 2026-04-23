import { FunctionComponent, useEffect } from 'react'

import PdfViewerDialog from '../../../reporte/components/PdfViewerDialog'
import { RestPedido } from '../../types'
import { useComandaPdf } from './useComandaPdf'

interface Props {
  pedido: RestPedido | null
  onClose: () => void
}

const RrComandaAutoViewer: FunctionComponent<Props> = ({ pedido, onClose }) => {
  const { pdfUrl, generarComanda, clear } = useComandaPdf()

  useEffect(() => {
    if (pedido) {
      generarComanda(pedido)
    } else {
      clear()
    }
  }, [pedido, generarComanda, clear])

  return (
    <PdfViewerDialog
      open={Boolean(pedido && pdfUrl)}
      pdfUrl={pdfUrl ?? ''}
      onClose={() => {
        clear()
        onClose()
      }}
    />
  )
}

export default RrComandaAutoViewer
