import { Menu as MenuIcon } from '@mui/icons-material'
import {
  alpha,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Palette,
  PaletteColor,
  useTheme,
} from '@mui/material'
import { MouseEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ActionIconButton } from './ActionIconButton.tsx'
import { MrtMenuAction } from './mrtTypes.ts'

interface MrtRowMenuProps<T> {
  row: T
  actions: MrtMenuAction<T>[]
  refetch: () => Promise<any>
}
export const MrtRowMenu = <T extends Record<string, any>>({ row, actions, refetch }: MrtRowMenuProps<T>) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const open = Boolean(anchorEl)

  // 1. FILTRAR ACCIONES VISIBLES
  // Calculamos qué acciones mostrar basándonos en la prop 'hidden'
  const visibleActions = useMemo(() => {
    return actions.filter((action) => {
      return typeof action.hidden === 'function' ? !action.hidden(row) : !action.hidden
    })
  }, [actions, row])

  // Si no hay ninguna acción visible, ocultamos el menú completo (el gatillo)
  if (visibleActions.length === 0) return null

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    // Evitamos que el click afecte a la fila de la tabla si el menú está dentro
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <ActionIconButton
        label="Más opciones"
        icon={<MenuIcon />}
        row={row}
        refetch={refetch}
        color="inherit"
        onClick={({ event }) => handleOpen(event)}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              minWidth: 180,
              borderRadius: '10px',
              mt: 0.5,
              p: 0,
              border: '1px solid',
              borderColor: 'divider',
              overFlow: 'hidden',
              boxShadow: `0px 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
            },
          },
          list: {
            sx: {
              py: 0.5, // Solo un pequeño respiro arriba y abajo de la lista completa
            },
          },
        }}
      >
        {visibleActions.flatMap((action, index) => {
          const isDisabled = action.disabled ? action.disabled(row) : false
          const path = typeof action.to === 'function' ? action.to(row) : action.to

          // Lógica de color
          const getActionColor = () => {
            if (isDisabled) return theme.palette.text.disabled
            const paletteKey = action.color as keyof Palette
            return (theme.palette[paletteKey] as PaletteColor)?.main || theme.palette.text.primary
          }

          const finalColor = getActionColor()
          const items = []

          // 2. DIVIDER INTELIGENTE
          if (action.divider || (action.color === 'error' && index > 0)) {
            items.push(
              <Divider
                key={`divider-${index}`}
                sx={{
                  my: '4px !important', // Espacio vertical
                  mx: 0, // Sin margen lateral para que toque los bordes
                  opacity: 0.6,
                }}
              />,
            )
          }

          // MENU ITEM (BOTÓN O LINK)
          items.push(
            <MenuItem
              key={`menu-item-${index}`}
              disabled={isDisabled}
              // Si tiene 'to', se comporta como Link
              component={path ? Link : 'button'}
              to={path}
              {...(action.linkProps as any)}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                // Ejecutar la acción si existe, pasando el objeto de parámetros
                if (action.onClick) {
                  action.onClick({
                    row,
                    refetch,
                    event,
                  })
                }
                // Cerrar el menú después de la acción
                handleClose()
              }}
              sx={{
                // 1. FORZAR ANCHO TOTAL SIN CENTRAR
                width: '100%',
                display: 'flex', // Aseguramos que sea flex
                justifyContent: 'flex-start', // ALINEACIÓN A LA IZQUIERDA
                textAlign: 'left', // Por seguridad para el texto
                m: 0,
                py: 1.2, // Un poco más de altura para mejor área de toque (touch target)
                px: 2.1, // Padding lateral para alejar el texto del borde del Paper
                gap: 1, // Espacio entre icono y texto
                borderRadius: 0, // Importante: En menús de borde a borde, el item no suele ser redondeado
                margin: 0, // Sin márgenes externos
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  // Usamos un color un poco más sólido para que se note el "edge-to-edge"
                  backgroundColor: alpha(finalColor, 0.08),
                },
                // 3. CORRECCIÓN DE HIJOS (Para evitar que se muevan)
                '& .MuiListItemIcon-root': {
                  minWidth: 'unset', // Evita que el icono reserve espacio innecesario
                  margin: 0, // Evita empujes
                },
                '& .MuiListItemText-root': {
                  margin: 0, // Asegura que el texto pegue con el icono
                },
                pointerEvents: 'auto',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              {action.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 'unset !important',
                    color: finalColor,
                    '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
                  }}
                >
                  {action.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={action.label}
                slotProps={{
                  primary: {
                    variant: 'body2',
                    sx: { fontWeight: 600, color: finalColor, fontSize: '0.85rem' },
                  },
                }}
              />
            </MenuItem>,
          )

          return items
        })}
      </Menu>
    </>
  )
}
