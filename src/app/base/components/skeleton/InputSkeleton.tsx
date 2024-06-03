import { Skeleton, SkeletonProps } from '@mui/material'
import React, { FunctionComponent } from 'react'

interface OwnProps extends SkeletonProps {
  size?: 'small' | 'normal'
}

type Props = OwnProps

/**
 * Skeleton para campos de formulario
 * @param props
 * @constructor
 */
const InputSkeleton: FunctionComponent<Props> = (props) => {
  const { size, ...others } = props
  const height = size ? (size === 'small' ? '37px' : '53.13px') : '37px'
  return <Skeleton variant={'rounded'} height={height} {...others} />
}

export default InputSkeleton
