import React, { FunctionComponent } from 'react'

import MontoMonedaTexto from '../../../../../../base/components/PopoverMonto/MontoMonedaTexto.tsx'
import { ArticuloProps } from '../../../../../../interfaces/articulo.ts'
import { ArticuloUnidadMedidaProps } from '../../../../../../interfaces/articuloUnidadMedida.ts'
import { articuloUnidadMedidaCalculoEquivalencia } from './articuloUnidadMedidaCalculoEquivalencia.ts'

interface OwnProps {
  cantidad?: number
  articulo?: ArticuloProps
  articuloUnidadMedida?: ArticuloUnidadMedidaProps
}

type Props = OwnProps

/**
 * Calculamos la cantidad equivalente con su respectivo unidad de medida
 * @param props
 * @author isi-template
 * @constructor
 */
const ArticuloUnidadMedidaCantidadEquivalente: FunctionComponent<Props> = (props) => {
  const { cantidad, articulo, articuloUnidadMedida } = props

  if (cantidad && articulo && articuloUnidadMedida) {
    const equivalencia = articuloUnidadMedidaCalculoEquivalencia({
      cantidad,
      articulo,
      articuloUnidadMedida,
    })

    if (equivalencia) {
      return (
        <MontoMonedaTexto
          monto={equivalencia.cantidad}
          sigla={equivalencia.articuloUnidadMedida.nombreUnidadMedida}
        />
      )
    }
  }

  return null
}

export default ArticuloUnidadMedidaCantidadEquivalente
