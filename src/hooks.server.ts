import {redirect} from '@sveltejs/kit';

const redirects = {
    '/color_palette': '/color-palette',
    '/text_file_to_template': '/text-file-to-template',
}

export async function handle({event, resolve}) {
    //@ts-ignore
    if (redirects[event.url.pathname]) {
        //@ts-ignore
        throw redirect(301, redirects[event.url.pathname]);
    }

    return await resolve(event);
}
