import Swal, { SweetAlertResult } from 'sweetalert2'

import { swalExceptionMsg } from '../base/services/swalExceptionMsg'

const isDarkMode = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

const getSwalTheme = () => {
  const dark = isDarkMode()

  return {
    background: dark ? '#1e1e1e' : '#ffffff',
    color: dark ? '#eaeaea' : '#1a1a1a',
    confirmButtonColor: dark ? '#90caf9' : '#1976d2',
    cancelButtonColor: dark ? '#ef5350' : '#d33',
  }
}

export const swalConfirm = {
  title: 'Confirmación',
  showCancelButton: true,
  allowOutsideClick: false,
  confirmButtonText: 'Confirmar',
  showLoaderOnConfirm: true,
}

export const swalErrorMsg = (msg: string | Array<any>, size: 'sm' | 'md' | 'lg' = 'lg') => {
  const width = size === 'sm' ? 450 : size === 'md' ? 600 : 800
  const theme = getSwalTheme()

  Swal.fire({
    title: 'Alerta',
    width,
    background: theme.background,
    color: theme.color,
    customClass: {
      popup: 'swalError',
    },
    allowEscapeKey: false,
    allowOutsideClick: false,
    html: msg,
  })
}

export const swalException = (e: Error | any) => {
  const theme = getSwalTheme()

  Swal.fire({
    title: 'Alerta',
    width: 700,
    background: theme.background,
    color: theme.color,
    confirmButtonColor: theme.cancelButtonColor,
    customClass: {
      popup: 'swalError',
    },
    allowEscapeKey: false,
    allowOutsideClick: true,
    html: swalExceptionMsg(e),
    confirmButtonText: 'Cerrar',
  })
}

export const swalConfirmDialog = async ({
  title = 'Confirmación',
  text = 'Confirma que desea realizar la acción',
}: {
  title?: string
  text?: string
}): Promise<SweetAlertResult<any>> => {
  const theme = getSwalTheme()

  return Swal.fire({
    title,
    html: text,
    background: theme.background,
    color: theme.color,
    showCancelButton: true,
    confirmButtonText: 'Si, Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: theme.confirmButtonColor,
    cancelButtonColor: theme.cancelButtonColor,
  })
}

export const swalAsyncConfirmDialog = async ({
  title = 'Confirmación',
  text = 'Confirma que desea realizar la acción',
  preConfirm,
}: {
  title?: string
  text?: string
  preConfirm: ({ ...props }: any) => any
}): Promise<SweetAlertResult<Awaited<any>>> => {
  const theme = getSwalTheme()

  return Swal.fire({
    title,
    html: text,
    background: theme.background,
    color: theme.color,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: theme.confirmButtonColor,
    cancelButtonColor: theme.cancelButtonColor,
    backdrop: true,
    didOpen: () => {
      const btn = Swal.getPopup()?.querySelector('button.swal2-confirm') as HTMLButtonElement | null
      if (btn) btn.focus()
    },
    showLoaderOnConfirm: true,
    preConfirm,
  })
}

export const swalLoading = (mensaje?: string): void => {
  const theme = getSwalTheme()

  Swal.fire({
    html: `<div class="nano-text">${mensaje || 'Procesando...'}</div>`,
    width: '220px',
    padding: '13px 10px 10px',
    background: theme.background,
    color: theme.color,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    backdrop: 'rgba(0,0,0,0.6)',
    timer: 60000,
    customClass: {
      popup: 'isi-swal-nano',
      htmlContainer: 'nano-html-override',
      actions: 'nano-actions-override',
    },
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

export const swalClose = () => {
  Swal.close()
}
