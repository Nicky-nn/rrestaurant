# Implementación Plantilla ISI.INVOICE

## Nuevo Proyecto

1. Crear el proyecto nuevo según requerimiento.

2. Una vez creado, adicionar el repositorio secundario

   ```bash
   git init
   git remote add remote [repo]
   # Creamos una rama plantilla
   git switch -c plantilla
   # Clonamos el repositorio
   git remote add plantilla https://github.com/integrate-bolivia/isi-template.git
   # Volvemos a la rama main
   git switch main
   ```

3. renombramos el archivo `package.json.b` por `package.json`

4. Descomprimimos en el directorio raíz el archivo compreso, `nuevoProyecto.zip`

5. Modificamos el archivo `.env`, cambiamos `ISI_DOCUMENTO_SECTOR, ISI_API_URL` por los valores según el documento sector

   ```bash
   APP_ENV=local
   
   ISI_BASE_URL=http://localhost:3002
   #ISI_API_URL=https://api.isipass.com.bo/api
   #ISI_API_URL=https://sandbox.isipass.net/api
   ISI_API_URL=http://localhost:3000/api
   
   ISI_DOCUMENTO_SECTOR=0
   ISI_CAPTCHA_KEY=0x4AAAAAAAIR3qJWMFMaFVXX
   
   #### SANDBOX
   ISI_ASSETS_URL=/assets/images/integrate
   ISI_FONDO=/assets/images/integrate/fondo-login.jpg
   ISI_LOGO_FULL=/assets/images/integrate/logo.png
   ISI_LOGO_MINI=/assets/images/integrate/logo-mini.png
   ISI_NOMBRE_COMERCIAL=ISI.INVOICE
   ISI_URL=https://integrate.com.bo
   ISI_FAVICON=/assets/images/integrate/favicon.ico
   ISI_THEME=blue
   #green, blue, blue1, purple, indigo, default,
   
   ```

6. Modificamos el archivo `.env.production`cambiamos `ISI_BASE_URL, ISI_API_URL, ISI_DOCUMENTO_SECTOR, ISI_THEME` por el nuevo valor según el indicado

   ```bash
   APP_ENV=production
   
   ISI_BASE_URL=dev.adm.isipass.com.bo
   ISI_API_URL=https://sandbox.isipass.net/api
   
   #### INTEGRATE SANDBOX
   ISI_ASSETS_URL=/assets/integrate
   ISI_FONDO=/assets/integrate/fondo-login.jpg
   ISI_LOGO_FULL=/assets/integrate/logo.png
   ISI_LOGO_MINI=/assets/integrate/logo-mini.png
   ISI_NOMBRE_COMERCIAL=ISI.INVOICE
   ISI_URL=https://integrate.com.bo
   ISI_FAVICON=/assets/integrate/favicon.ico
   ISI_THEME=blue1
   #green, blue, blue1, purple, indigo, default,
   
   ISI_DOCUMENTO_SECTOR=0
   ISI_CAPTCHA_KEY=0x4AAAAAAAIR3qJWMFMaFVXX
   
   ```

7. Modificar `index.html` cambiando los valores
   ```html
   # linea 8
   <meta name="description" content="[DescripcionProyecto]" />
   # linea 34
   <title>[DescripcionProyectp]</title>
   ```

8. Adicionar `<LayoutRestriccion />` en `src/app/base/components/Template/MatxLayout/Layout1/Layout1.tsx` y modificar para que coincida con el documento sector al que corresponda

9. Crear el directorio `dist-zip` en la raiz del proyecto

10. Realizar las pruebas
    ```bash
    # Hot reload, modo developer
    yarn dev
    
    # Producción para la instancia sandbox
    yarn build
    
    # producción sandbox, require .env.sandbox
    yarn build -m sandbox 
    
    # producción integrate, require .env.integrate
    yarn build -m integrate
    
    ```







    ## Proyecto existente

Migración de las rutas de home

- Se elimina las vistas de `app/base/view` ya que esta será una dependencia de actualización de template.

- eliminar el archivo `src\app\utils\materialReactTableUtils.ts`

- Se migran los modulos de sessión al directorio `app/modules/base/sessions`

- Se migran los modulos de home (**antes llamado dashboard**) `app/modules/base/home`

- Eliminar los directorios `src\app\base/` dashboard y session

- Modificar el archivo `\src\app/navigations.tsx` y añadir lo siguiente

  ```typescript
  // modificar la ruta de la pagina princiap
  [
    {
      name: homeRoutesMap.home.name,
      path: homeRoutesMap.home.path,
      icon: 'dashboard',
    }
  ]
  ```

  modificar `\src\app\routes\routes.tsx` y reemplazar `dashboardRoutes` por `carritoRoutes`

  Cambiar `{ path: '/', element: <Navigate to="dashboard/default" /> }` por `{ path: '/', element: <Navigate to={homeRoutesMap.home.path} /> },`





- Se adjunta codigo fuente

- Se quita todo rastro relacionado a redux y redux-toolkit. En caso de querer usar una libreria de estados globales se recomienda `zustand`

- Se debe migrar material-react-table a su nueva estructura basado en la versión 2.0.0

- Se debe migrar react-query a su nueva estructura

- Adicionar `<LayoutRestriccion />` en `src/app/base/components/Template/MatxLayout/Layout1/Layout1.tsx` y modificar para que coincida con el documento sector al que corresponda

- Se ha cambiado el componente `StyledMenuItem` por `SimpleMenuItem`



