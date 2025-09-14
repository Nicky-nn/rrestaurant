import { Button, Snackbar } from '@mui/material'
import React, { FC, Fragment, useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Componente que muestra un mensaje de actualización disponible
 * @author isi-template
 * @constructor
 * const updateSW = registerSW({
 *   onNeedRefresh() {
 *     Toast.fire({
 *       icon: "info",
 *       title: "New Content Available",
 *     }).then((result: any) => {
 *       if (result.isConfirmed) {
 *         updateSW();
 *       }
 *     });
 *   },
 *   onOfflineReady() {
 *     Toast2.fire({
 *       icon: "info",
 *       title: "App is Ready To Work Offline",
 *     });
 *   },
 * });
 */
const ReloadPrompt: FC<any> = () => {
  const [open, setOpen] = useState(false)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (needRefresh) {
      setOpen(true)
    }
  }, [needRefresh])

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        message="Nuevo contenido disponible, haga clic en el botón actualizar para recargar el sistema."
        action={
          <Fragment>
            <Button
              variant={'contained'}
              color="secondary"
              size="small"
              onClick={() => updateServiceWorker(true)}
            >
              Actualizar
            </Button>
          </Fragment>
        }
      />
    </>
  )
}

export default ReloadPrompt
