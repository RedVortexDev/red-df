<script lang="ts">
    import { onMount } from "svelte";
    import { gsap } from "gsap";

    let container: HTMLDivElement;
    const textParts = {
        greeting: "Hey, I'm ",
        name: "Red",
    };

    onMount(() => {
        const wrapper = document.querySelector(".wrapper") as HTMLElement;
        wrapper.style.opacity = "100%";

        const chars = [...container.querySelectorAll(".char")];

        gsap.set(chars, {
            opacity: 0,
            y: 50,
            rotateX: -90,
            filter: `blur(8px)`,
        });

        const tl = gsap.timeline();

        tl.to(chars, {
            duration: 0.8,
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: `blur(0px)`,
            stagger: {
                each: 0.1,
                ease: "power.out",
            },
        });

        chars.forEach((char, index) => {
            gsap.to(char, {
                y: 0,
                duration: 2,
                yoyo: true,
                ease: "sine.inOut",
                delay: index * 0.08,
                rotateZ: gsap.utils.random(-20, 10),
                scale: gsap.utils.random(0.85, 1.15),
            });

            gsap.to(char, {
                y: 20,
                duration: 2,
                repeat: 0,
                yoyo: true,
                ease: "sine.inOut(15)",
                delay: index * 0.08 + 2,
                rotateZ: 0,
                scale: 1,
            });
        });
    });
</script>

<div class="wrapper opacity-0 text-3xl font-bold flex" style="perspective: 1000px" bind:this={container}>
    {#each textParts.greeting.split("") as char}
        <span class="char white inline-block transform-origin-center will-change-transform">
            {char === " " ? "\u00A0" : char}
        </span>
    {/each}
    {#each textParts.name.split("") as char}
        <span class="char text-theme inline-block transform-origin-center will-change-transform">
            {char === " " ? "\u00A0" : char}
        </span>
    {/each}
</div>
