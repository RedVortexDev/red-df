import {defineConfig} from 'vite'

export default defineConfig({
    root: 'src',
    build: {
        rollupOptions: {
            input: ["src/color_palette.html", "src/text_file_to_template.html", "src/index.html", "src/404.html", "src/patch_notes_renderer.html"],
        },
        outDir: '../dist'
    },
})