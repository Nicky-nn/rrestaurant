import { useContext } from 'react'

import OperacionesContext from '../contexts/OperacionesContext.tsx'

const useOperaciones = () => useContext(OperacionesContext)

export default useOperaciones
