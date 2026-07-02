import { useCallback, useState } from 'react'

/**
 * Custom hook para el control de seleccion de articulos para el carrito y seleccion de articulos inventario
 * @author isi-template
 */
export const useSeleccionArticuloInventario = (id: string) => {
  const [open, setOpen] = useState(false)
  const [articuloId, setArticuloId] = useState<string | null>(null)
  /** Valor arbitrario negativo */
  const [index, setIndex] = useState<number>(-1)

  const openSeleccion = useCallback((articuloId: string, index: number) => {
    setArticuloId(articuloId)
    setIndex(index)
    setOpen(true)
  }, [])

  /**
   * Cierra la seleccion, mantiene index y articuloId
   */
  const closeSeleccion = useCallback(() => {
    setOpen(false)
  }, [])

  /**
   * Cierra la seleccion, resetea index y articuloId
   */
  const resetSeleccion = useCallback(() => {
    setOpen(false)
    setIndex(-1)
    setArticuloId(null)
  }, [])

  return {
    id,
    openSeleccion,
    closeSeleccion,
    resetSeleccion,
    open,
    articuloId,
    index,
  }
}
