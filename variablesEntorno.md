# Variables de entornos para los clientes de integración



**Versión de implementación 2025.3**

Modelo de variables de entorno para diferentes proyectos

1. .env.integrate

   ```bash
   APP_ENV=local
   
   ISI_BASE_URL=http://localhost:3002
   ISI_API_URL=https://api.isipass.com.bo/api
   
   ISI_DOCUMENTO_SECTOR=1
   ISI_CAPTCHA_KEY=0x4AAAAAAAIcp-nx8ps0Ynbv
   
   ISI_TITLE="Módugo de Facturación"
   ISI_SIGLA="FCV"
   ISI_VERSION="v2025.3"
   
   #### INTEGRATE ISI.INVOICE
   ISI_ASSETS_URL=/integrate
   ISI_FONDO=/integrate/fondo-login-adm.wepb
   ISI_LOGO_FULL=/integrate/logo.webp
   ISI_LOGO_MINI=/integrate/logo-mini.webp
   ISI_NOMBRE_COMERCIAL=ISI.INVOICE
   ISI_URL=https://integrate.com.bo
   ISI_FAVICON=/integrate/favicon.ico
   ISI_THEME_COLOR="#ffffff"
   ISI_THEME=blue
   # green, blue, blue1, purple, indigo, default,
   ```

2. .env.sandbox

   ```bash
   APP_ENV=production
   
   ISI_BASE_URL=dev.fcv.isipass.net
   ISI_API_URL=https://api.isipass.com.bo/api
   
   ISI_DOCUMENTO_SECTOR=1
   ISI_CAPTCHA_KEY=0x4AAAAAAAIcp-nx8ps0Ynbv
   
   ISI_TITLE="Módugo de Facturación"
   ISI_SIGLA="FCV"
   ISI_VERSION="v2025.3"
   
   #### INTEGRATE ISI.INVOICE
   ISI_ASSETS_URL=/integrate
   ISI_FONDO=/integrate/fondo-login-adm.wepb
   ISI_LOGO_FULL=/integrate/logo.webp
   ISI_LOGO_MINI=/integrate/logo-mini.webp
   ISI_NOMBRE_COMERCIAL=ISI.INVOICE
   ISI_URL=https://integrate.com.bo
   ISI_FAVICON=/integrate/favicon.ico
   ISI_THEME_COLOR="#ffffff"
   ISI_THEME=blue
   # green, blue, blue1, purple, indigo, default,
   
   
   ```

3. .env.gosocket

   ```bash
   APP_ENV=production
   
   ISI_BASE_URL=dev.fcv.isipass.net
   ISI_API_URL=https://api.isipass.com.bo/api
   
   ISI_DOCUMENTO_SECTOR=1
   ISI_CAPTCHA_KEY=0x4AAAAAAAIcp-nx8ps0Ynbv
   
   ISI_TITLE="Módugo de Facturación"
   ISI_SIGLA="FCV"
   ISI_VERSION="v2025.3"
   
   #### GOSOCKET
   ISI_ASSETS_URL=/gosocket
   ISI_FONDO=/gosocket/fondo-login.jpg
   ISI_LOGO_FULL=/gosocket/logo.png
   ISI_LOGO_MINI=/gosocket/logo-mini.png
   ISI_NOMBRE_COMERCIAL=GOSOCKET
   ISI_URL=https://gosocket.net
   ISI_FAVICON=/gosocket/favicon.png
   ISI_THEME_COLOR="#ffffff"
   ISI_THEME=green
   #green, blue, blue1, purple, indigo, default,
   
   ```

7. .env.fenix
   ```bash
   APP_ENV=production
   
   ISI_BASE_URL=fcv.fenix.isipay.me
   #ISI_API_URL=https://api.isipass.com.bo/api
   ISI_API_URL=https://fenix.isipay.me/api
   #ISI_API_URL=http://localhost:3000/api
   ISI_TITLE="Módulo de Facturación"
   ISI_SIGLA="FCV"
   ISI_VERSION="v2025.3"
   ISI_DOCUMENTO_SECTOR=1
   ISI_CAPTCHA_KEY=0x4AAAAAAAyKn3L98hCOL4i_
   
   #### FENIX
   ISI_ASSETS_URL=/fenix
   ISI_FONDO=/fenix/fondo-login.webp
   ISI_LOGO_FULL=/fenix/logo.webp
   ISI_LOGO_MINI=/fenix/logo-mini.webp
   ISI_NOMBRE_COMERCIAL=FENIX
   ISI_URL=https://fenix.com
   ISI_FAVICON=/fenix/favicon.ico
   ISI_THEME_COLOR="#ffffff"
   ISI_THEME=default
   #green, blue, blue1, blue2, purple, indigo, default,
   
   ```
