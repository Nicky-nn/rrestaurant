export interface ImagenProps {
  altText: string
  url: string
}

export interface MonedaParamsProps {
  codigo: number
  descripcion: string
  sigla: string
  tipoCambio?: number
}

export type TipoRepresentacionGrafica = 'pdf' | 'rollo' | 'rolloResumen' | 'rolloReducido'

export type KeyValueProp<T> = {
  key: T
  value: T
}
