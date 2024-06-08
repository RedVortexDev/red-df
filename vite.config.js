import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                text_file_to_template: resolve(__dirname, 'pages/text_file_to_template.html'),
            },
        },
    },
})