import { useState } from 'react'

import { WorkflowProps } from '../../../interfaces/workflow.ts'

/**
 * Custom hook para el control del historizal de trazabilidad
 * - Ejemplo de uso
 * const workflow = useWorkflow();
 * <button onClick={() => workflow.openWorkflow(datos[], "Historial registro 1")}>...
 * <WorkflowDialog {...workflow.dialogProps} />
 * @author isi-template
 */
export const useWorkflow = () => {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<WorkflowProps[]>([])
  const [title, setTitle] = useState<string>('Historial de trazabilidad')
  const [code, setCode] = useState<string>('')

  const openWorkflow = (workflowData: WorkflowProps[], props?: { dialogTitle?: string; code?: string }) => {
    setData(workflowData)
    if (props && props.dialogTitle) setTitle(props.dialogTitle)
    if (props && props.code) setCode(props.code)
    setOpen(true)
  }

  const closeWorkflow = () => {
    setOpen(false)
  }

  return {
    openWorkflow,
    closeWorkflow,
    dialogProps: {
      open,
      onClose: closeWorkflow,
      data,
      title,
      code,
    },
  }
}
