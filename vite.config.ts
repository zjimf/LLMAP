import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react({
            // 使用 Classic JSX runtime，避免引用 react/jsx-runtime
            jsxRuntime: 'classic'
        })
    ],
    build: {
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content.tsx'),
                background: resolve(__dirname, 'src/background.ts')
            },
            output: {
                entryFileNames: '[name].js'
            }
        },
        outDir: 'dist'
    }
});