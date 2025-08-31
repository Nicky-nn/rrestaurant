import { Dialog, DialogProps, DialogTitle } from '@mui/material'
import { FC } from 'react'

type Props = DialogProps & {
  title: string
}
// ✔️ create the dialog you want to use
/**
 * @author isi-template
 * @param title
 * @param props
 * @constructor
 */
const SimpleDialog: FC<Props> = ({ title, ...props }) => (
  <Dialog {...props}>
    <DialogTitle>{title}</DialogTitle>
  </Dialog>
)

export default SimpleDialog
