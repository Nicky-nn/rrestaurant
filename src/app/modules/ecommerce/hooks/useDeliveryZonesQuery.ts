import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import useAuth from '../../../base/hooks/useAuth'
import { getInboxClient } from '../api/inboxClient'

export interface PuntoPoligono {
  lat: number
  lng: number
}

export interface DeliveryZoneDTO {
  id?: string
  nombreZona: string
  costoEnvio: number | string
  colorHex: string
  poligono: PuntoPoligono[]
}

export const useDeliveryZonesQuery = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const shop = typeof user?.miEmpresa === 'string' ? user.miEmpresa : user?.miEmpresa?.tienda || 'sandbox'
  const codigoSucursal = user?.sucursal?.codigo || 0
  const codigoPuntoVenta = user?.puntoVenta?.codigo || 0

  const deliveryZonesQuery = useQuery({
    queryKey: ['deliveryZones', shop, codigoSucursal, codigoPuntoVenta],
    queryFn: async () => {
      const client = getInboxClient()

      const q = gql`
        query DeliveryZones($shop: String!, $codigoSucursal: Int!, $codigoPuntoVenta: Int!) {
          deliveryZones(shop: $shop, codigoSucursal: $codigoSucursal, codigoPuntoVenta: $codigoPuntoVenta) {
            id
            nombreZona
            costoEnvio
            colorHex
            poligono {
              lat
              lng
            }
          }
        }
      `
      interface ResponseType {
        deliveryZones: DeliveryZoneDTO[]
      }
      const data = await client.request<ResponseType>(q, { shop, codigoSucursal, codigoPuntoVenta })
      return data.deliveryZones || []
    },
    enabled: !!user,
  })

  const saveDeliveryZonesMutation = useMutation({
    mutationFn: async (zonas: DeliveryZoneDTO[]) => {
      const client = getInboxClient()

      // Mapeamos para enviar exactamente lo que pide el schema
      const zonasCleaned = zonas.map(z => ({
        nombreZona: z.nombreZona,
        costoEnvio: z.costoEnvio === '' ? 0 : Number(z.costoEnvio),
        colorHex: z.colorHex,
        poligono: z.poligono.map(p => ({ lat: p.lat, lng: p.lng }))
      }))

      const m = gql`
        mutation SaveDeliveryZones($shop: String!, $codigoSucursal: Int!, $codigoPuntoVenta: Int!, $zonas: [DeliveryZoneInput!]!) {
          saveDeliveryZones(shop: $shop, codigoSucursal: $codigoSucursal, codigoPuntoVenta: $codigoPuntoVenta, zonas: $zonas) {
            id
            nombreZona
            costoEnvio
            colorHex
          }
        }
      `
      const data = await client.request(m, { shop, codigoSucursal, codigoPuntoVenta, zonas: zonasCleaned })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] })
    },
  })

  return {
    deliveryZonesQuery,
    saveDeliveryZonesMutation,
  }
}
