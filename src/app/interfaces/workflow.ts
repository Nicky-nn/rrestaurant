/**
 * Esquema de trazabilidad para auditoria
 * @author isi-template
 */
export interface WorkflowProps {
  //Comentario de cambio de estado
  comentario: string
  // Fecha de acción
  fecha: string
  //Nombre de usuario
  usuario: string
}
