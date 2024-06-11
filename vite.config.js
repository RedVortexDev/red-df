import {defineConfig} from 'vite';
import {resolve} from 'path';
import alias from '@rollup/plugin-alias';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                text_file_to_template: resolve(__dirname, 'pages/text_file_to_template.html'),
                color_palette: resolve(__dirname, 'pages/color_palette.html'),
            },
            plugins: [
                alias({
                    entries: [
                        {find: '/color_palette.html', replacement: '/pages/color_palette.html'},
                        {find: '/text_file_to_template.html', replacement: '/pages/text_file_to_template.html'},
                    ],
                }),
            ],
        },
    },
});
