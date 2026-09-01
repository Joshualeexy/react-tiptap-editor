import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ command, mode }) => {
  // If running dev server or building the demo site
  if (command === 'serve' || mode === 'demo') {
    return {
      plugins: [react()],
      server: {
        port: 5173,
        open: false,
      },
    };
  }

  // Official library build for npm publishing
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, 'index.js'),
        name: 'ReactTiptapEditor',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
        ],
        output: {
          exports: 'named',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    },
  };
});
