import { AccessTime, EditNote, HistoryEdu, Person, Visibility } from '@mui/icons-material'
import { Box, Divider, Popover, Stack, Typography } from '@mui/material'
import React, { MouseEvent, useState } from 'react'

import { AuditoriaProps } from '../../../interfaces'
import { ActionIconButton } from './ActionIconButton.tsx'

/**
 * Estilos de item de auditoria
 * @param icon
 * @param label
 * @param value
 * @constructor
 * @author isi-template
 */
const AuditItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string
}) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1.5,
      mb: 0.7,
      alignItems: 'flex-start',
      '& .MuiSvgIcon-root': {
        fontSize: '1.1rem',
        color: 'primary.light', // Color corporativo suave
        mt: 0.1,
      },
    }}
  >
    {icon}
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: 'text.disabled',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.6rem',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'text.primary',
          lineHeight: 1.3,
        }}
      >
        {value ?? '--'}
      </Typography>
    </Box>
  </Box>
)

/**
 * Boton de auditoria dependiente de MRTtable
 * @param data
 * @constructor
 */
export const MrtAuditPopoverAction = ({ data }: { data: AuditoriaProps }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    // Evitamos que el click afecte a la fila de la tabla si el menú está dentro
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <ActionIconButton
        label="Ver Auditoría"
        icon={<Visibility />}
        color="warning"
        row={data}
        refetch={async () => {}}
        onClick={({ event }) => handleOpen(event)}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              width: 220,
              borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.12)', // Sombra más profunda para el popover
              border: '1px solid',
              borderColor: 'divider',
              mt: 1, // Separación del botón
            },
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            mb: 2,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
          }}
        >
          <HistoryEdu sx={{ fontSize: '1.2rem', color: 'info.main' }} />
          Auditoría del Registro
        </Typography>

        <Stack spacing={1.5}>
          {/* Bloque de Creación */}
          <Box>
            <AuditItem
              icon={<Person />}
              label="Creado por"
              value={`${data.usucre ?? '--'}`}
            />
            <AuditItem
              icon={<AccessTime />}
              label="Fecha creación"
              value={data.createdAt ?? '--'}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed', opacity: 0.8 }} />

          {/* Bloque de Modificación */}
          <Box>
            <AuditItem
              icon={<EditNote />}
              label="Última modificación"
              value={data.usumod ?? '--'}
            />
            <AuditItem
              icon={<AccessTime />}
              label="Fecha modificación"
              value={data.updatedAt ?? '--'}
            />
          </Box>
        </Stack>
      </Popover>
    </>
  )
}
