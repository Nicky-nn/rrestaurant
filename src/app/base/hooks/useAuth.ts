import { useContext } from 'react'

import { AuthContext } from '../contexts/JWTAuthContext.tsx'

const useAuth = () => useContext(AuthContext)

export default useAuth
