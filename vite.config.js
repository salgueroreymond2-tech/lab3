import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        dashboard: resolve(import.meta.dirname, 'src/page/index.html'),
        registroMovil: resolve(import.meta.dirname, 'src/page/registro-movil.html')
      }
    }
  }
});
