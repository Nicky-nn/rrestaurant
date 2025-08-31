import { Visibility } from '@mui/icons-material'
import { Box, IconButton, IconButtonProps, Popover, Tooltip } from '@mui/material'
import React, { FunctionComponent, useState } from 'react'

import { AuditoriaProps } from '../../../interfaces'

interface OwnProps extends IconButtonProps {
  row: AuditoriaProps | any
}

type Props = OwnProps
/**
 * @author isi-template
 * @param row
 * @param others
 * @constructor
 */
const AuditIconButton: FunctionComponent<Props> = ({ row, ...others }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <Tooltip title="Auditoria" placement="top" leaveDelay={10} disableInteractive>
        <IconButton onClick={handleClick} {...others}>
          <Visibility color={'warning'} />
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
      >
        <Box
          sx={{
            minWidth: 320,
            width: 325,
            maxWidth: 350,
          }}
        >
          <div className="responsive-table tableAuditoria">
            <table>
              <caption>AUDITORIA</caption>
              <tbody>
                <tr>
                  <td>
                    <strong>Usucre</strong>
                  </td>
                  <td>{row.usucre || '--'}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Fecha Creación</strong>
                  </td>
                  <td>{row.createdAt || '--'}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Usumod</strong>
                  </td>
                  <td>{row.usumod || '--'}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Fecha Modificación</strong>
                  </td>
                  <td>{row.updatedAt || '--'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Box>
      </Popover>
    </>
  )
}

export default AuditIconButton
