import { lighten } from '@mui/material'
import { alpha, Theme, useTheme } from '@mui/material/styles'
import { useMemo } from 'react'
import { GroupBase, StylesConfig } from 'react-select'

// Definimos los tamaños permitidos
export type MuiSelectSize = 'small' | 'medium' | 'large'

// Configuración de dimensiones según el tamaño
const sizeConfig = {
  small: {
    minHeight: '36.13px',
    fontSize: '14px', // 14px
    paddingY: '0', // Padding vertical interno reducido
  },
  medium: {
    minHeight: '56px', // Estándar MUI
    fontSize: '1rem', // 16px
    paddingY: '8px',
  },
  large: {
    minHeight: '64px',
    fontSize: '1.25rem', // 20px
    paddingY: '12px',
  },
}

// =============================================================================
// 1. FUNCIÓN PURA DE ESTILOS
// =============================================================================
export const getSelectStyles = <
  OptionType = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>(
  theme: Theme,
  error: boolean = false,
  size: MuiSelectSize = 'small', // <--- Nuevo parámetro
): StylesConfig<OptionType, IsMulti, Group> => {
  const isDark = theme.palette.mode === 'dark'

  // Obtenemos las variables del tamaño actual
  const currentSize = sizeConfig[size]

  return {
    // --- CONTROL (El contenedor principal) ---
    control: (provided, state) => {
      let borderColor = isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
      let focusBorderColor = theme.palette.primary.main
      let backgroundColor = theme.palette.background.paper

      if (error) {
        borderColor = theme.palette.error.main
        focusBorderColor = theme.palette.error.main
      } else if (state.isFocused) {
        borderColor = theme.palette.primary.main
      } else if (state.isDisabled) {
        borderColor = alpha(theme.palette.text.disabled, 0.4)
        backgroundColor =
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.03)'
      }

      return {
        ...provided,
        backgroundColor,
        borderColor,
        color: theme.palette.text.primary,
        ...(state.isDisabled && {
          borderStyle: 'dashed',
          borderWidth: '1px',
        }),
        // APLICAMOS TAMAÑO
        minHeight: currentSize.minHeight,
        fontSize: currentSize.fontSize,

        boxShadow: state.isFocused ? `0 0 0 1px ${focusBorderColor}` : 'none',
        '&:hover': {
          borderColor: error
            ? theme.palette.error.main
            : state.isFocused
              ? focusBorderColor
              : theme.palette.text.primary,
        },
      }
    },

    // --- VALUE CONTAINER (Donde van los textos y chips) ---
    // Importante ajustar el padding aquí para que el texto quede centrado verticalmente
    valueContainer: (provided) => ({
      ...provided,
      paddingTop: currentSize.paddingY,
      paddingBottom: currentSize.paddingY,
      paddingLeft: '14px', // Similar al padding X de MUI
    }),

    // --- INPUT (El cursor parpadeante) ---
    input: (provided) => ({
      ...provided,
      color: theme.palette.text.primary,
      margin: 0, // Resetear margen para alinear bien en small
      padding: 0,
    }),

    // --- SINGLE VALUE (El texto seleccionado) ---
    singleValue: (provided, state) => ({
      ...provided,
      color: state.isDisabled ? theme.palette.text.secondary : theme.palette.text.primary,
      marginLeft: 0, // Ajuste fino
    }),

    // --- PLACEHOLDER ---
    placeholder: (provided) => ({
      ...provided,
      color: error ? theme.palette.error.main : theme.palette.text.secondary,
      opacity: error ? 0.8 : 0.7,
      marginLeft: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),

    // --- MENU (Dropdown) ---
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[8],
      zIndex: theme.zIndex.modal + 1,
    }),

    // --- MENU PORTAL (Necesario si usas menuPortalTarget={document.body}) ---
    menuPortal: (base) => ({
      ...base,
      zIndex: theme.zIndex.modal + 1, // Opción 2: zIndex alto para el portal
    }),

    // --- OPCIONES ---
    option: (provided, state) => {
      let backgroundColor = 'transparent'
      let color = theme.palette.text.primary

      if (state.isSelected) {
        backgroundColor = theme.palette.primary.main
        color = theme.palette.primary.contrastText
      } else if (state.isFocused) {
        backgroundColor = theme.palette.action.hover
      }

      return {
        ...provided,
        backgroundColor,
        color,
        cursor: 'pointer',
        fontSize: '0.94rem', // Las opciones suelen mantener un tamaño legible estándar
        padding: '10px 16px', // Espaciado cómodo para clickear
        '&:active': {
          backgroundColor: theme.palette.primary.light,
        },
      }
    },

    // --- MULTI VALUE (Chips) ---
    multiValue: (provided, state) => ({
      ...provided,
      backgroundColor: state.isDisabled
        ? alpha(theme.palette.primary.main, 0.08)
        : alpha(theme.palette.primary.main, 0.16),
      borderRadius: theme.shape.borderRadius,
      // Ajustamos el chip si es modo small
      margin: size === 'small' ? '1px' : '2px',
    }),

    multiValueLabel: (provided) => ({
      ...provided,
      color:
        theme.palette.mode === 'dark'
          ? lighten(theme.palette.primary.main, 0.5)
          : theme.palette.primary.main,
      fontWeight: 500,
      fontSize: size === 'small' ? '0.75rem' : '0.85rem', // Chip más pequeño en small
      padding: size === 'small' ? '1px 4px' : '3px 6px',
    }),

    multiValueRemove: (provided) => ({
      ...provided,
      color: theme.palette.primary.main,
      cursor: 'pointer',
      ':hover': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      },
    }),

    // --- INDICADORES ---
    indicatorsContainer: (provided) => ({
      ...provided,
      height: currentSize.minHeight, // Asegura que los iconos estén centrados
      color: error ? theme.palette.error.main : theme.palette.text.secondary,
    }),

    dropdownIndicator: (provided) => ({
      ...provided,
      padding: size === 'small' ? '4px' : '8px', // Menos padding en small
      color: error ? theme.palette.error.main : theme.palette.text.secondary,
      '&:hover': {
        color: error ? theme.palette.error.dark : theme.palette.text.primary,
      },
    }),
  }
}

// =============================================================================
// 2. HOOK PERSONALIZADO
// =============================================================================
export const useMuiSelectStyles = <
  OptionType = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>(
  error: boolean = false,
  size: MuiSelectSize = 'small', // <--- Pasamos el size al hook
): StylesConfig<OptionType, IsMulti, Group> => {
  const theme = useTheme()

  return useMemo(
    () => getSelectStyles<OptionType, IsMulti, Group>(theme, error, size),
    [theme, error, size], // Agregamos size a las dependencias
  )
}
