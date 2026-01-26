import { MRT_ColumnFiltersState } from 'material-react-table'

export type CastType = 'boolean' | 'number' | 'date' | 'string'

// Helper para excluir tipos que no queremos recorrer (como Date o Arrays simples)
type Primitive = string | number | boolean | Date | null | undefined | any[]

// /**
//  * Genera todas las rutas posibles de un objeto usando notación de punto.
//  * Ejemplo: { user: { name: string } } -> "user" | "user.name"
//  */
// export type NestedKeyOf<T> = T extends Primitive
//   ? never
//   : {
//       [K in keyof T & (string | number)]: T[K] extends object
//         ? T[K] extends Date // Detener recursión en Dates
//           ? `${K}`
//           : `${K}` | `${K}.${NestedKeyOf<T[K]>}` // Recursión profunda
//         : `${K}`
//     }[keyof T & (string | number)]

type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? K // Si es primitivo, solo devuelve la llave (Nivel 1)
    : // Si es objeto, devuelve "Llave" | "Llave.Subllave"
      K | `${K}.${keyof T[K] & string}`
}[keyof T & string]

// Esto dice: "Un objeto donde las claves SON propiedades de T, y los valores son CastType"
export type FilterTypeMap<T> = Partial<Record<NestedKeyOf<T>, CastType>> & {
  [key: string]: CastType | undefined
}

/**
 * Convierte los valores de los filtros.
 * @template T El tipo de dato de la fila (Row Data)
 */
export const castMrtFilters = <T>(
  filters: MRT_ColumnFiltersState,
  typeMap: FilterTypeMap<T>,
): MRT_ColumnFiltersState => {
  return filters.map((filter) => {
    // Forzamos el tipado aquí porque filter.id viene como string genérico
    const columnId = filter.id as any
    const targetType = typeMap[columnId]

    let rawValue = filter.value

    // Si no hay configuración para esta columna, devolvemos el filtro intacto
    if (!targetType) return filter

    const convertValue = (val: any) => {
      // Validación extra para evitar transformar nulos/undefined
      if (val === null || val === undefined) return val

      switch (targetType) {
        case 'boolean':
          // Maneja "true" (string) y true (boolean)
          return String(val).toLowerCase() === 'true'
        case 'number':
          // Maneja strings numéricos
          return Number(val)
        case 'date':
          return new Date(val)
        default:
          return val
      }
    }

    // Manejo de Arrays (Multi-Select)
    if (Array.isArray(rawValue)) {
      return { ...filter, value: rawValue.map(convertValue) }
    }

    // Manejo de valor simple
    return { ...filter, value: convertValue(rawValue) }
  })
}
