<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import {Textarea} from "$lib/components/ui/textarea";
    import {onMount} from "svelte";

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

    onMount(() => {
        const textAreas = [...document.querySelectorAll('.text-area')] as HTMLTextAreaElement[];
        textAreas.forEach(area => area.value = sampleText);
    });


</script>

<div class="flex flex-col items-center p-2">
    <h1 class="font-bold">Small Caps Font</h1>
    <h2 class="max-w-lg text-center">Made by RedVortex & RaffyRaffy14, maintained by RedVortex.<br>License: LGPLv3-only.
    </h2>
</div>
<div class="grid md:grid-rows-1 md:grid-cols-2 grid-rows-2 grid-cols-1 gap-5">
    {#each fonts as font}
        <div
                class="bg-zinc-800 p-5 rounded-lg flex items-center flex-col h-full w-full text-wrap gap-2"
        >
            <div class="flex flex-col gap-2 w-full">
                <div class="flex items-start">
                    <h3 class="font-semibold text-xl">{font.title}</h3>
                    {#if font.tag}
                        <span class="bg-cyan-400 text-zinc-900 rounded-sm px-1 py-0 text-sm scale-75 uppercase font-semibold">{font.tag}</span>
                    {/if}
                </div>
                <Textarea dir="auto"
                          class="{font.fontClass} text-lg leading-6 resize-none bg-none rounded-sm p-3 text-area outline-none bg-zinc-800 transition-all ring-red-600 ring-0 focus-visible:ring-2 focus-visible:bg-zinc-900"
                          spellcheck="false" rows="8"></Textarea>
            </div>
            <a class="w-full" href={font.title.replace(" ", "%20") + ".ttf"} download>
                <Button variant="default" class="mt-2 w-full">Download</Button>
            </a>
        </div>
    {/each}
</div>
