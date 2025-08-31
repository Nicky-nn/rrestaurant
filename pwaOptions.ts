import type { VitePWAOptions } from 'vite-plugin-pwa'

/**
 * Configuración para service worker según la instancia
 * @author isi-template
 */
const pwaOptions = (env: any): Partial<VitePWAOptions> => ({
  mode: `${env.APP_ENV}` === 'local' ? 'development' : 'production',
  registerType: `${env.APP_ENV}` === 'local' ? 'autoUpdate' : 'prompt',
  includeAssets: [`${env.ISI_FAVICON}`],
  minify: false,
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}'],
    globIgnores: [
      'node_modules/**/*',
      'dist-zip/**/*',
      'sw.js',
      'workbox-*.js',
      '**/*.png', // the code to ignore caching the icon file
      '**/*.ico', // the code to ignore caching the icon file
    ],
  },
  manifest: {
    name: `${env.ISI_TITLE || 'isi.invoice'}`,
    short_name: `${env.ISI_SIGLA || 'ISI'}`,
    theme_color: '#ffffff',
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
    enabled: `${env.APP_ENV}` === 'local',
  },
})

export default pwaOptions
