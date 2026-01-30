import React, { FC } from 'react'

import { useBreadcrumbDetector } from '../../../hooks/useBreadcrumbDetector.ts'
import useSettings from '../../../hooks/useSettings'
import { RouteGuard } from '../../RouteGuard/RouteGuard.tsx'
import MatxSuspense from '../MatxSuspense/MatxSuspense'
import { MatxLayouts } from './index'

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
