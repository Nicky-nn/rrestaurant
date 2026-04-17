export interface DepartamentoProps {
  codigo: number
  codigoPais: number
  departamento: string
  sigla: string
}

export interface SucursalProps {
  codigo: number
  departamento: DepartamentoProps
  direccion: string
  municipio: string
  telefono: string
}
