<script lang="ts">
    import PageMeta from "./PageMeta.svelte";

    export let selectedItem: string = "";

    const navItems = [
        {name: "Home", href: "/"},
        {name: "Color Palette", href: "/color-palette"},
        {name: "Text File to Template", href: "/text-file-to-template"},
    ];
</script>

<PageMeta title={selectedItem}/>

<nav class="grid grid-cols-2 gap-5 p-2 bg-zinc-800 border-b-zinc-700 border-b-2 justify-around">
    <div class="w-fit">
        <a class="flex gap-5 items-center text-xl text-theme font-medium" href="/">
            <img alt="Website Logo" class="transition-transform hover:scale-110 active:scale-100" src="/favicon.png"
                 width="50">
            RedVortex_
        </a>
    </div>
    <button class="md:hidden ml-auto fill-white" on:click={
        () => {
            const nav = document.getElementById('nav-links');
            if (nav) nav.classList.toggle('hidden');
        }
    }>
        <svg class="size-12" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75 9h16.5m-16.5 6.75h16.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>
    <div class="md:inline-flex hidden flex flex-col md:flex-row justify-end md:gap-8 gap-5 w-fit md:w-full m-2"
         id="nav-links">
        {#each navItems as item}
            <a href={item.href}
               class="whitespace-nowrap mr-4 transition-all px-3 py-1 text-xl md:text-lg cursor-pointer hover:underline {selectedItem === item.name ? 'text-theme font-medium' : ''}">
                <div class="flex items-center">
                    > {item.name}
                    <span class="blinker {selectedItem === item.name ? 'blinker-visible' : ''}"></span>
                </div>
            </a>
        {/each}
    </div>
</nav>