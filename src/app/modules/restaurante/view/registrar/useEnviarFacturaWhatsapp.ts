import { useCallback } from 'react'
import { useWaapiEnviarUrl } from '../../mutations/useWaapiEnviarUrl'
import useAuth from '../../../../base/hooks/useAuth'

interface SendWhatsappParams {
  telefono: string
  urlPdf: string
  nombreFactura?: string
  mensajePersonalizado?: string
}

export const useEnviarFacturaWhatsapp = () => {
  const { mutateAsync: enviarUrl, isPending } = useWaapiEnviarUrl()
  const { user } = useAuth()

  const sendFactura = useCallback(
    async ({ telefono, urlPdf, nombreFactura, mensajePersonalizado }: SendWhatsappParams) => {
      if (!telefono) return

      let codigoArea = '591'
      let numeroTelefono = telefono.trim()

      if (numeroTelefono.startsWith('+')) {
        const spaceIndex = numeroTelefono.indexOf(' ')
        if (spaceIndex !== -1) {
          codigoArea = numeroTelefono.substring(1, spaceIndex)
          numeroTelefono = numeroTelefono.substring(spaceIndex + 1).trim()
        } else {
          codigoArea = ''
          numeroTelefono = numeroTelefono.substring(1)
        }
      }

      const mensaje =
        mensajePersonalizado || `Hola, le adjuntamos su factura de compra. ¡Gracias por su preferencia!`
      const nombre = nombreFactura || 'Factura'

      const entidad = {
        codigoSucursal: user.sucursal.codigo,
        codigoPuntoVenta: user.puntoVenta.codigo,
      }

      try {
        await enviarUrl({
          entidad,
          input: {
            nombre,
            mensaje,
            url: urlPdf,
            codigoArea,
            telefono: numeroTelefono,
          },
        })
        return true
      } catch (error) {
        console.error('Error enviando factura por WhatsApp', error)
        throw error
      }
    },
    [enviarUrl, user],
  )

  return { sendFactura, isPending }
}
