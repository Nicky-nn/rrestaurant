import { Badge, styled } from '@mui/material'
import { FC } from 'react'

/**
 * @author isi-template
 */
const BadgeSelected: FC<any> = styled(Badge)(() => ({
  top: '0',
  right: '0',
  height: '32px',
  width: '32px',
  borderRadius: '50%',
}))

export default BadgeSelected
