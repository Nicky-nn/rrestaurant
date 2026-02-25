import { FunctionComponent } from 'react'

import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import { clientsRoutesMap } from '../clientsRoutes'
import CreditsList from './ListCredits/CreditsList'

interface CreditProps {}

type Props = CreditProps

/**
 * Listado de clientes con linea de credito
 * @param _props
 * @constructor
 */
const Credit: FunctionComponent<Props> = (_prop) => {
  return (
    <SimpleContainerBox>
      <Breadcrumb routeSegments={[clientsRoutesMap.credits]} />
      <CreditsList />
    </SimpleContainerBox>
  )
}

export default Credit
