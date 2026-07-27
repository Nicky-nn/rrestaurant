import { Box } from '@mui/material'
import React from 'react'
import { SimpleContainerBox } from '../../../base/components/Container/SimpleBox'
import Breadcrumb from '../../../base/components/Template/Breadcrumb/Breadcrumb'
import RepartidoresTable from '../components/Repartidores/RepartidoresTable'
import { ecommerceRoutesMap } from '../ecommerceRoutes'

const RepartidoresPage: React.FC = () => {
  return (
    <SimpleContainerBox>
      <Breadcrumb routeSegments={[
        { name: 'Ecommerce', path: ecommerceRoutesMap.ecommerce.path }, 
        { name: 'Repartidores' }
      ]} />
      
      <RepartidoresTable />
    </SimpleContainerBox>
  )
}

export default RepartidoresPage
