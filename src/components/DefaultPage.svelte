<script lang="ts">
    import {gsap} from "gsap";
    import NavigationBar from "./NavigationBar.svelte";
    import PageContent from "./PageContent.svelte";
    import PageMeta from "./PageMeta.svelte";
    import {onMount} from "svelte";

    export let pageName: string;
    export let subtitle: string;

    const splitTitle = pageName.split("");

    onMount(() => {
        const main = document.querySelector(".title") as HTMLElement;
        const subtitle = document.querySelector(".subtitle") as HTMLElement;
        const chars = [...main.querySelectorAll(".title")];
        const tl = gsap.timeline();
        chars.forEach((char, index) => {
            tl.call(() => {
                gsap.from(char, {
                    duration: chars.length > 15 ? 0.25 : 0.5,
                    opacity: 0,
                    y:  chars.length > 15 ? 50 : index % 2 == 0 ? -25 : 25,
                    ease: chars.length > 15 ? "sine.out" : "back.out(2)",
                    delay: index * 0.05,
                });
            })
        });
        tl.from(subtitle, {
            duration: 0.5,
            opacity: 0,
            y: 50,
            ease: "back.out(1)",
            delay: chars.length > 15 ? 0.8 : 0.5,
        });
    });

</script>

<PageMeta description={subtitle} title={pageName}/>

<NavigationBar selectedItem={pageName}/>
<main>
    <header>
        <div class="flex flex-row title overflow-hidden">
            {#each splitTitle as char}
                <h1 class="title">
                    {char === " " ? "\u00A0" : char}
                </h1>
            {/each}
        </div>
        <h2 class="subtitle overflow-hidden">{subtitle}</h2>
    </header>

    <hr class="block h-0 rounded-full border-0 my-2 p-0 border-t-2 border-theme w-32 mx-auto">

    <PageContent>
        <slot/>
    </PageContent>
</main>