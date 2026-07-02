import { useAppConfirm } from '../../../base/contexts/AppConfirmProvider'
import { useError } from '../../../base/contexts/ErrorProvider'
import { useToast } from '../../../base/contexts/ToastContext'

/**
 * Utilidades generales para el manejo de componentes
 * @author isi-template
 */
export const useUtils = () => {
  const { toast } = useToast()
  const { requestConfirm } = useAppConfirm()
  const { showError } = useError()
  return {
    /** Mensajes flash */
    toast,
    /** Custom confirmación */
    requestConfirm,
    /** Excepcion de errores backend / api */
    showError,
  }
}
