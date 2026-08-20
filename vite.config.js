import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        dashboard: resolve(import.meta.dirname, 'src/page/index.html'),
        analista: resolve(import.meta.dirname, 'src/page/analista.html'),
        solicitante: resolve(import.meta.dirname, 'src/page/solicitante.html'),
        registroMovil: resolve(import.meta.dirname, 'src/page/registro-movil.html')
      }
    }
  }
});
