import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pwaOptions from './pwaOptions'
import zipPack from 'vite-plugin-zip-pack'
// https://vitejs.dev/config/
/**
 * node_modules es principalmente la razón principal del problema de los fragmentos grandes.
 * Con esto le estás diciendo a Vite que trate los módulos usados por separado
 * */
export default ({ mode }) => {
  // Mapeamos los valores de .env a process.env
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return defineConfig({
    plugins: [
      react(),
      splitVendorChunkPlugin(),
      VitePWA(pwaOptions(process.env)),
      zipPack({
        outDir: `dist-zip`,
        outFileName: `${process.env.ISI_BASE_URL || 'dist'}.zip`,
      }),
    ],
    envPrefix: 'ISI_',
    build: {
      chunkSizeWarningLimit: 550, // No resuelve el problema de los fragmentos grandes
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          },
        },
      },
    },
  })
}
