import { persisted } from 'svelte-persisted-store'


export const preferences = persisted('preferences', {
    customPalette: null
})