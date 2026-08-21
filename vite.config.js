import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        registro: resolve(import.meta.dirname, 'registro.html'),
        dashboard: resolve(import.meta.dirname, 'src/page/index.html'),
        analista: resolve(import.meta.dirname, 'src/page/analista.html'),
        gerencia: resolve(import.meta.dirname, 'src/page/gerencia.html'),
        solicitante: resolve(import.meta.dirname, 'src/page/solicitante.html'),
        registroMovil: resolve(import.meta.dirname, 'src/page/registro-movil.html')
      }
    }
  }
});
