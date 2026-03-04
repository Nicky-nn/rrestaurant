import { useContext } from 'react'

import CajasContext from '../contexts/CajasContext.tsx'

/**
 * Hook para acceder al estado y acciones del provider de cajas
 */
const useCajas = () => useContext(CajasContext)

export default useCajas
