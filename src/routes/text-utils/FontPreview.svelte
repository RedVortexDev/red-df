<script>
    import Button from "$lib/components/ui/button/button.svelte";

    export let fonts = [
        {
            title: "Minecraft Small Caps",
            fontClass: "font-small_caps",
        },
        {
            title: "Minecraft Small Caps Bold",
            fontClass: "font-small_caps font-bold",
            tag: "New"
        },
    ];

    const sampleText = `Hello, World 1234\n\nLorem ipsum, dolor sit amet consectetur adipisicing elit. Recusandae, reiciendis!`;
</script>

<div class="flex flex-col items-center p-2">
    <h1 class="font-bold">Small Caps Font</h1>
    <h2 class="max-w-lg text-center">Made by RedVortex & RaffyRaffy14, maintained by RedVortex.<br>License: LGPLv3-only.</h2>
</div>
<div class="grid md:grid-rows-1 md:grid-cols-2 grid-rows-2 grid-cols-1 gap-5">
    {#each fonts as font}
        <div
            class="bg-zinc-800 p-5 rounded-lg flex items-center md:flex-col h-52 text-wrap gap-2"
        >
            <div class="flex flex-col gap-2 w-full">
                <div class="flex items-start">
                    <h3 class="font-semibold text-xl">{font.title}</h3>
                    {#if font.tag}
                        <span class="bg-cyan-400 text-zinc-900 rounded-sm px-1 py-0 text-sm scale-75 uppercase font-semibold">{font.tag}</span>
                    {/if}
                </div>
                <textarea class="{font.fontClass} resize-none bg-none rounded-sm p-1" rows="5" spellcheck="false"
                    >{sampleText}</textarea
                >
            </div>
            <a href={font.title.replace(" ", "%20") + ".ttf"} download>
                <Button variant="default" class="mt-5">Download</Button>
            </a>
        </div>
    {/each}
</div>
