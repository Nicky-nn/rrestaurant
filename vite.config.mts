import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import zipPack from 'vite-plugin-zip-pack'

import pwaOptions from './pwaOptions'

// https://vitejs.dev/config/
/**
 * node_modules es principalmente la razón principal del problema de los fragmentos grandes.
 * Con esto le estás diciendo a Vite que trate los módulos usados por separado
 * @author isi-template
 * */
export default ({ mode }) => {
  // Mapeamos los valores de .env a process.env
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [
      react(), // splitVendorChunkPlugin(),
      VitePWA(pwaOptions(env) as any),
      zipPack({
        outDir: `dist-zip`,
        outFileName: `${env.ISI_BASE_URL || 'dist-error'}.zip`,
      }),
    ],
    envPrefix: 'ISI_',
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 5000,
    },
  })
}
