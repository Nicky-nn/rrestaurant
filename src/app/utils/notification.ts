import { toast, ToastOptions } from 'react-toastify'

const options: ToastOptions = {
  position: 'top-center',
  theme: 'colored',
}

/**
 * @author isi-template
 * @param msg
 */
export const notError = (msg: string) => {
  toast.error(msg, { ...options })
}

/**
 * @description Notificacion de accion satisfactoria
 * @author isi-template
 * @param msg
 */
export const notSuccess = (msg: string = 'Acción realizada correctamente') => {
  toast.success(msg, { ...options })
}
/**
 * @description Notificacion de de alerta
 * @author isi-template
 * @param msg
 */
export const notDanger = (msg: string) => {
  toast.warning(msg, { ...options })
}

/**
 * Mensaje generico
 * @author isi-template
 * @param msg
 * @param opts
 */
export const toastMsg = (msg: string, opts?: ToastOptions) => {
  toast(msg, {
    ...options,
    theme: 'light',
    ...(opts ?? {}),
  })
}
