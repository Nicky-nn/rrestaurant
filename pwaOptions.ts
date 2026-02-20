import type { VitePWAOptions } from 'vite-plugin-pwa'

/**
 * Generamos un cache único para dev y producción evitando coolicion de caches
 * @param env
 */
const generateCacheId = (env: any): string => {
  const hostname = new URL(env.ISI_BASE_URL).hostname
  // localhost:3002     -> "localhost"
  // dev.test.net      -> "dev.test.net"
  // produccion.test.net -> "produccion.test.net"
  return `${env.ISI_SIGLA}-${env.APP_ENV}-${hostname}`.toLowerCase()
}

/**
 * Configuración para service worker según la instancia
 * @author isi-template
 */
const pwaOptions = (env: any): Partial<VitePWAOptions> => {
  const isLocal = `${env.APP_ENV}` === 'local'
  return {
    mode: isLocal ? 'development' : 'production',
    registerType: isLocal ? 'autoUpdate' : 'prompt',
    workbox: {
      globPatterns: isLocal ? [] : ['**/*.{js,css,html,ico,png,jpeg,svg,webp}'], // Precache correcto
      cacheId: generateCacheId(env),
      cleanupOutdatedCaches: true, // Limpia cachés viejos
      clientsClaim: true, // SW toma control inmediato de las pestañas
      skipWaiting: true, // No espera a cerrar pestañas para activarse
      navigateFallback: 'index.html', // SPA routing funciona offline
    },
    includeAssets: [env.ISI_FAVICON, env.ISI_FONDO, env.ISI_LOGO_FULL, env.ISI_LOGO_MINI],
    manifest: {
      name: `${env.ISI_TITLE || 'isi.invoice'}`,
      short_name: `${env.ISI_SIGLA || 'ISI'}`,
      theme_color: env.ISI_THEME_COLOR,
      display: 'minimal-ui',
      icons: [
        {
          src: `${env.ISI_ASSETS_URL}/64.png`, // <== don't add slash, for testing
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: `${env.ISI_ASSETS_URL}/128.png`, // <== don't add slash, for testing
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: `${env.ISI_ASSETS_URL}/192.png`, // <== don't add slash, for testing
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: `${env.ISI_ASSETS_URL}/512.png`, // <== don't add slash, for testing
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    devOptions: {
      enabled: isLocal,
      navigateFallback: 'index.html',
      suppressWarnings: true,
    },
  }
}

export default pwaOptions
