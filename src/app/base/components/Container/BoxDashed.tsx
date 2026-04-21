import { Box, styled } from '@mui/material'
import { grey } from '@mui/material/colors'

import { alphaDark } from '../../../utils/colorUtils.ts'

/**
 * SimpleBox con border dashed, ideal para mostrar datos incompletos
 * @author isi-template
 */
export const BoxDashed = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  border: `2px dashed`,
  borderColor: alphaDark(grey[400], theme),
  borderRadius: 8,
}))
