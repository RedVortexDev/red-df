<script lang="ts">
    export let title: string = "";
    export let description: string = "";
</script>

<svelte:head>
    <title>Red DF{title ? ` | ${title}` : ''}</title>
    <meta content="#ce0000" name="theme-color">
    <meta content="Red DF{title ? ` | ${title}` : ''}" name="title">
    <meta content={description} name="description">
</svelte:head>