import Swal, { SweetAlertResult } from 'sweetalert2'

import { swalExceptionMsg } from '../base/services/swalExceptionMsg'

export const swalConfirm = {
  title: 'Confirmación',
  showCancelButton: true,
  allowOutsideClick: false,
  confirmButtonText: 'Confirmar',
  showLoaderOnConfirm: true,
}

export const swalErrorMsg = (
  msg: string | Array<any>,
  size: 'sm' | 'md' | 'lg' = 'lg',
) => {
  const width = size === 'sm' ? 450 : size === 'md' ? 600 : size === 'lg' ? 800 : 450
  Swal.fire({
    title: 'Alerta!!',
    width: 800,
    customClass: {
      popup: 'swalError',
    },
    allowEscapeKey: false,
    allowOutsideClick: false,
    html: msg,
  }).then()
}

/**
 * Custom error para excepciones
 * @param e
 */
export const swalException = (e: Error | any) => {
  Swal.fire({
    title: 'Alerta!!',
    width: 700,
    customClass: {
      popup: 'swalError', // 'swalError' es aplicado al popup
    },
    allowEscapeKey: false,
    allowOutsideClick: true,
    confirmButtonColor: '#d33',
    html: swalExceptionMsg(e),
    confirmButtonText: 'Cerrar',
  }).then()
}

/**
 * @description Dialog de confirmación devuelve un Promise en then
 * @param title
 * @param text
 */
export const swalConfirmDialog = async ({
  title = 'Confirmación',
  text = 'Confirma que desea realizar la acción',
}: {
  title?: string
  text?: string
}): Promise<SweetAlertResult<any>> => {
  return Swal.fire({
    title,
    html: text,
    showCancelButton: true,
    confirmButtonText: 'Si, Confirmar',
    cancelButtonText: 'Cancelar',
  })
}

/*
await swalAsyncConfirmDialog({
  title: `Inactivar al usuario ${row.usuario}`,
  text: `Confirma que desea INACTIVAR al usuario ${row.nombres}, el usuario ya no podrá iniciar sesión`,
  preConfirm: async () => {
    return fetch(...args).catch((e) => {
      swalException(e)
      return false
    })
  },
}).then((resp) => {
  if (resp.isConfirmed) {
    notSuccess(); setRowSelection({}); refetch();
  }
})
*/
/**
 * @description Confirmación para datos asincronos, usado para api rest, debe usar preConfirm(), y then
 * @param title
 * @param text
 * @param preConfirm, función que retorna los datos del fetch, return api.save()
 */
export const swalAsyncConfirmDialog = async ({
  title = 'Confirmación',
  text = 'Confirma que desea realizar la acción',
  preConfirm,
}: {
  title?: string
  text?: string
  preConfirm: ({ ...props }: any) => any
}): Promise<SweetAlertResult<Awaited<any>>> => {
  return Swal.fire({
    title,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    cancelButtonColor: '#d33',
    backdrop: true,
    html: text,
    didOpen: () => {
      // @ts-ignore
      if (Swal.getPopup().querySelector('button.swal2-confirm') !== null) {
        // @ts-ignore
        Swal.getPopup().querySelector('button.swal2-confirm').focus()
      }
    },
    showLoaderOnConfirm: true,
    preConfirm, // allowOutsideClick: () => !Swal.isLoading()
  })
}
/**
 * Creamos una carga de loading
 */
export const swalLoading = (): void => {
  Swal.fire({
    timer: 30000,
    timerProgressBar: true,
    allowOutsideClick: false,
    didOpen: () => {
      // @ts-ignore
      Swal.showLoading()
    },
  }).then()
}
/**
 * Cerramos algun dialog abierto
 */
export const swalClose = () => {
  Swal.close()
}
