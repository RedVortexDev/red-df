<script lang="ts">
    import {BadgeInfo} from "lucide-svelte";

    export let title: string;
    export let message: string;
    export let icon = BadgeInfo;
    export let border = "border-blue-400";
</script>

<div class="bg-secondary px-4 py-2 rounded-md max-w-sm m-3 {border} border-2 shadow-sm shadow-secondary transition-all hover:scale-[101%] hover:shadow-md hover:shadow-secondary">
    <div class="flex gap-2 items-center">
        <svelte:component this={icon}/>
        <span class="font-bold">{title}</span>
    </div>
    <p class="mt-1">{message}</p>
</div>