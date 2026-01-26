import React, { createContext, FC, ReactNode, useContext, useState } from 'react'

export interface BreadcrumbSegment {
  name: string
  path?: string
}

interface BreadcrumbContextProps {
  breadcrumbs: BreadcrumbSegment[]
  setBreadcrumbs: (_segments: BreadcrumbSegment[]) => void
  currentPath: string
  setCurrentPath: (_path: string) => void
  rootMenu: string
  setRootMenu: (_menu: string) => void
  fullHierarchy: string[]
  setFullHierarchy: (_hierarchy: string[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextProps | undefined>(undefined)

/**
 *
 * @param children
 * @author isi-template 2026.1 para rol dominio
 * @constructor
 */
export const BreadcrumbProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbSegment[]>([])
  const [currentPath, setCurrentPath] = useState<string>('')
  const [rootMenu, setRootMenu] = useState<string>('')
  const [fullHierarchy, setFullHierarchy] = useState<string[]>([])

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        currentPath,
        setCurrentPath,
        rootMenu,
        setRootMenu,
        fullHierarchy,
        setFullHierarchy,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  )
}

/**
 * Hook para acceder al contexto de breadcrumbs
 * @author isi-template 2026.1 para rol dominio
 */
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}
