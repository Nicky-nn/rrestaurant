import React, { FC } from 'react'

import useSettings from '../../../hooks/useSettings'
import MatxSuspense from '../MatxSuspense/MatxSuspense'
import { MatxLayouts } from './index'
import { useBreadcrumbDetector } from '../../../hooks/useBreadcrumbDetector'
import { RouteGuard } from '../../RouteGuard/RouteGuard'

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const MatxLayout: FC<any> = (props) => {
  const { settings } = useSettings()
  const Layout = MatxLayouts[settings.activeLayout]
  useBreadcrumbDetector()

  return (
    <MatxSuspense>
      <RouteGuard>
        <Layout {...props} />
      </RouteGuard>
    </MatxSuspense>
  )
}

export default MatxLayout
