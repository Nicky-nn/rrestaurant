import {
  endOfDay,
  format,
  lastDayOfMonth,
  lastDayOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'

export interface HomePeriodosProp {
  key: string
  fechaInicial: string
  fechaFinal: string
  value: string
}

/**
 * Periodos de busqueda para el home
 */
export const homePeriodos: HomePeriodosProp[] = [
  {
    key: '0',
    fechaInicial: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'dd/MM/yyyy'),
    fechaFinal: format(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), 'dd/MM/yyyy'),
    // value: `Semana del ${format(
    //   startOfWeek(new Date(), { weekStartsOn: 1 }),
    //   'dd/MM/yyyy',
    // )} Al ${format(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), 'dd/MM/yyyy')}`,
    value: `Semana actual`,
  },
  {
    key: '1',
    fechaInicial: format(startOfDay(new Date()), 'dd/MM/yyyy'),
    fechaFinal: format(endOfDay(new Date()), 'dd/MM/yyyy'),
    value: `Hoy ${format(new Date(), 'dd/MM/yyyy')}`,
  },
  {
    key: '2',
    fechaInicial: format(startOfMonth(new Date()), 'dd/MM/yyyy'),
    fechaFinal: format(lastDayOfMonth(new Date()), 'dd/MM/yyyy'),
    value: format(new Date(), 'MM/yyyy'),
  },
  {
    key: '3',
    fechaInicial: format(startOfMonth(subMonths(new Date(), 1)), 'dd/MM/yyyy'),
    fechaFinal: format(lastDayOfMonth(subMonths(new Date(), 1)), 'dd/MM/yyyy'),
    value: format(subMonths(new Date(), 1), 'MM/yyyy'),
  },
]
