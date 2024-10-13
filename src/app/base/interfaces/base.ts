export interface ImagenProps {
  altText: string
  url: string
}

export interface MonedaParamsProps {
  codigo: number
  descripcion: string
  sigla: string
}

export type TipoRepresentacionGrafica = 'pdf' | 'rollo'

export type KeyValueProp<T> = {
  key: T
  value: T
}
