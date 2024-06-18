<script lang="ts">
    export let title: string = "";
</script>

<svelte:head>
    <title>Red DF{title ? ` | ${title}` : ""}</title>
</svelte:head>