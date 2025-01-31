<script lang="ts">
    import {gsap} from "gsap";
    import {BadgeInfo} from "lucide-svelte";
    import {onMount} from "svelte";

    export let title: string;
    export let message: string;
    export let icon = BadgeInfo;
    export let border = "border-blue-400";

    onMount(() => {
        const card = document.querySelector(".info") as HTMLDivElement;
        gsap.from(card, {
            duration: 0.5,
            scale: 0.8,
            filter: "blur(8px)",
            opacity: 0,
            y: 50,
            ease: "back.out(1)",
        });
    });
</script>

<div class="shadow-sm scale-100 hover:scale-[101%] transition-all">
    <div class="info bg-secondary px-4 py-2 rounded-md max-w-sm m-3 w-full h-full {border} border-2">
        <div class="flex gap-2 items-center">
            <svelte:component this={icon}/>
            <span class="font-bold">{title}</span>
        </div>
        <p class="mt-1">{message}</p>
    </div>
</div>