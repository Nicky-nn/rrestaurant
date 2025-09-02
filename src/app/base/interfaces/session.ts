// noinspection GraphQLUnresolvedReference

import { gql } from 'graphql-request'

/**
 * GraphQL fragment for the Perfil type.
 * @author isi-template
 */
export const PerfilFragment = gql`
  fragment PerfilField on Perfil {
    nombres
    apellidos
    avatar
    cargo
    ci
    correo
    rol
    sigla
    dominio
    tipo
    vigente
    actividadEconomica {
      codigoCaeb
      descripcion
      tipoActividad
    }
    sucursal {
      codigo
      telefono
      direccion
      departamento {
        codigo
        sigla
        codigoPais
        departamento
      }
      municipio
    }
    puntoVenta {
      codigo
      tipoPuntoVenta {
        codigoClasificador
        descripcion
      }
      nombre
      descripcion
    }
    moneda {
      codigo
      descripcion
      sigla
    }
    monedaTienda {
      codigo
      descripcion
      sigla
    }
    modificarMontos
    razonSocial
    miEmpresa {
      tienda
      codigoModalidad
      codigoAmbiente
      razonSocial
      fechaValidezToken
      email
      emailFake
      denominacion
    }
    tipoRepresentacionGrafica
    usuario
    integracionSiat
  }
`
