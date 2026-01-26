import { IconButtonProps, Tooltip } from '@mui/material'
import { MouseEvent, ReactNode } from 'react'
import { Link, LinkProps } from 'react-router-dom'

import { MrtIconButtonStyled } from './MrtIconButtonStyled.tsx'

/**
 * Parámetros estandarizados para cualquier acción de fila
 * @author isi-template
 */
export interface MrtActionParams<T> {
  row: T
  refetch: () => Promise<any>
  event: MouseEvent<HTMLButtonElement>
}

/**
 * Componente Funcional que envuelve el Styled y el Tooltip
 * @author isi-template
 */
interface ActionIconButtonProps<T> {
  // Texto descriptivo para el Tooltip
  label: string
  // Icono de Material UI a renderizar
  icon: ReactNode
  // Datos originales de la fila para procesar en onClick o to
  row: T
  // Función para refrescar los datos de la tabla después de una acción
  refetch: () => Promise<any>
  // Color basado en el sistema de diseño de MUI
  color?: IconButtonProps['color']
  // Estado de interacción
  disabled?: boolean
  // Control de visibilidad
  hidden?: boolean | ((row: T) => boolean)
  // Esta de carga icono
  loading?: boolean
  // ACCIÓN LÓGICA: Función que se ejecuta al hacer clic
  onClick?: (params: MrtActionParams<T>) => void
  // NAVEGACIÓN: Ruta estática o función que genera una ruta dinámica
  to?: string | ((row: T) => string)
  // Propiedades adicionales si el botón actúa como un Link (ej: target="_blank")
  linkProps?: Partial<LinkProps>
  // Tamaño del botón (predeterminado: 'small')
  size?: IconButtonProps['size']
}

/**
 * Btn accion
 * @param label
 * @param icon
 * @param color
 * @param onClick
 * @param disabled
 * @param hidden
 * @param size
 * @param to
 * @param row
 * @param refetch
 * @param linkProps
 * @author isi-template
 * @constructor
 */
export const ActionIconButton = <T extends Record<string, any>>({
  label,
  icon,
  color = 'primary',
  onClick,
  disabled = false,
  hidden = false,
  size = 'small',
  to,
  row,
  refetch,
  linkProps,
}: ActionIconButtonProps<T>) => {
  // 1. Evaluar si el componente debe renderizarse
  const isHidden = typeof hidden === 'function' ? hidden(row) : hidden

  // Si está oculto, retornamos null inmediatamente
  if (isHidden) return null

  // Resolvemos el path si es una función
  const path = typeof to === 'function' ? to(row) : to
  return (
    <Tooltip
      title={label}
      arrow
      disableInteractive
      placement={'top'}
      // Esta prop ayuda a que el tooltip no intente forzar el foco en el botón deshabilitado
      followCursor={false}
    >
      {/* El span es necesario para que el Tooltip funcione en botones deshabilitados */}
      <span
        style={{
          display: 'inline-flex',
          pointerEvents: 'auto',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <MrtIconButtonStyled
          size={size}
          customColor={color}
          disabled={disabled}
          // Si hay 'to', se comporta como un Link de React Router
          component={path ? Link : 'button'}
          // @ts-ignore
          to={path}
          {...linkProps}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            // Pasamos el evento como tercer parámetro
            if (onClick) {
              onClick({ row, refetch, event })
            }
          }}
        >
          {/* Si loading es true, podrías mostrar un CircularProgress pequeño aquí */}
          {icon}
        </MrtIconButtonStyled>
      </span>
    </Tooltip>
  )
}
