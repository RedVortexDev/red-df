import {defineConfig} from 'vite'

export default defineConfig({
    root: 'src',
    base: '/red-df',
    build: {
        rollupOptions: {
            input: ["src/color_palette.html", "src/text_file_to_template.html", "src/index.html"],
        },
        outDir: '../dist'
    },
})