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
 * @author isi-template
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
 * @author isi-template
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
 * @author isi-template
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
 * @author isi-template
 */
export const swalLoading = (mensaje?: string): void => {
  Swal.fire({
    html: `<div class="nano-text">${mensaje || 'Procesando...'}</div>`,
    width: '220px', // Ancho solicitado
    padding: '13px 10px 10px', // Padding superior casi nulo (4px)
    showConfirmButton: false,
    allowOutsideClick: false, // Bloquea clic fuera
    allowEscapeKey: false, // BLOQUEO DE TECLA ESC
    background: '#fff',
    backdrop: 'rgba(0,0,0,0.45)',
    timer: 60000,
    customClass: {
      popup: 'isi-swal-nano',
      htmlContainer: 'nano-html-override',
      actions: 'nano-actions-override', // Clase para controlar el área del spinner
    },
    didOpen: () => {
      Swal.showLoading()
    },
  }).then()
}
/**
 * Cerramos algun dialog abierto
 * @author isi-template
 */
export const swalClose = () => {
  Swal.close()
}
