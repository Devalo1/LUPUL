import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173, // Revenire la portul Vite implicit pentru a evita conflictele
        host: true,
        open: true,
        hmr: {
            overlay: false,
        },
    },
    preview: {
        port: 5173,
    },
});