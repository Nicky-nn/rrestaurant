import { Edit, MenuOpen } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'
import React, { FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'

import AuditIconButton from '../../../../base/components/Auditoria/AuditIconButton'
import SimpleMenu, { SimpleMenuItem } from '../../../../base/components/MyMenu/SimpleMenu'
import { ProductoProps } from '../../interfaces/producto.interface'
import { productosRouteMap } from '../../ProductosRoutesMap'

interface OwnProps {
  row: ProductoProps
  refetch: () => any
}

type Props = OwnProps

const ProductoMenu: FunctionComponent<Props> = (props) => {
  const { row, refetch } = props
  const navigate = useNavigate()

  return (
    <>
      <Box>
        <SimpleMenu
          menuButton={
            <>
              <IconButton aria-label="menuGestionProductos">
                <MenuOpen />
              </IconButton>
            </>
          }
        >
          <SimpleMenuItem
            onClick={() => navigate(`${productosRouteMap.modificar.path}/${row._id}`)}
          >
            <Edit /> {productosRouteMap.modificar.name}
          </SimpleMenuItem>
        </SimpleMenu>
        <AuditIconButton row={row} />
      </Box>
    </>
  )
}

export default ProductoMenu
