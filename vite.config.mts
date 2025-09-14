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
        outFileName: `${process.env.ISI_BASE_URL || 'dist'}.zip`,
      }),
    ],
    envPrefix: 'ISI_',
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Separa todas las dependencias de node_modules en un chunk 'vendor'
            if (id.includes('node_modules')) {
              // Agrupamos MUI y su motor de estilos (Emotion) en un solo chunk por que cambia con poco frecuencia.
              if (
                id.includes('@mui/material') ||
                id.includes('@mui/icons-material') ||
                id.includes('@emotion/react') ||
                id.includes('@emotion/styled')
              ) {
                return 'vendor-mui'
              }
              // Agrupamos el core de React y el router en otro chunk.
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router-dom')
              ) {
                return 'vendor-react'
              }
              return 'vendor' // Chunk para el resto de dependencias
            }
          },
        },
      },
    },
  })
}
