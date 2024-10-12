<script lang="ts">
    export let title: string = "";
</script>

<footer class="fixed lg:left-0 mt-20 bg-zinc-800 lg:rounded-r-sm bottom-0 lg:top-0 lg:bottom-auto px-5 py-2 rounded-t-sm">
    {#if title}
        <h2 class="text-lg font-semibold">{title}</h2>
    {/if}
    <div class="flex gap-4" id="sidebar-content">
        <slot/>
    </div>
</footer>