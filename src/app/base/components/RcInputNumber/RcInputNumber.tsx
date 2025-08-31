/**
 * @description pintamos de color cuando se cambia el control a error
 * @author isi-template
 * @param error
 */
export const rcInputError = (error: boolean): string => {
  return error ? 'rc-input-error' : ''
}
