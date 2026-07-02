/** Flujo de estados para determinadas tablas que cumplan la condición
 * Esquema de trazabilidad para auditoria
 * @author isi-template
 * */
export interface WorkflowProps {
  /** Estado anterior, si es inicial devuelve null o NINGUNO */
  estadoAnterior: string | null;
  /** Nuevo estado segun las transiciones delimitadas por el backend */
  estadoNuevo: string;
  /** Fecha de cambio de estado */
  fecha: string;
  /** Usuario que realizó el cambio de estado */
  usuario: string;
  /** Comentario o motivo del cambio de estado */
  comentario: string;
}
