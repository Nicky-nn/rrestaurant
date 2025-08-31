import React, { FC, ReactNode, Suspense } from 'react'

import MatxLoading from '../MatxLoading/MatxLoading'

type MatxSuspenseProps = {
  children: ReactNode
}

/**
 * @author isi-template
 * @param children
 * @constructor
 */
const MatxSuspense: FC<MatxSuspenseProps> = ({ children }: MatxSuspenseProps) => {
  return <Suspense fallback={<MatxLoading />}>{children}</Suspense>
}

export default MatxSuspense
