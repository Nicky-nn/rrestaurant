import { Box, styled } from '@mui/material'

/**
 * @description Item para lo StackMenu y StackMenuActionTable
 * @author isi-template
 */
export const StackMenuItem = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
}))
