<script lang="ts">
    import NavigationBar from "./NavigationBar.svelte";
    import PageContent from "./PageContent.svelte";
    import PageMeta from "./PageMeta.svelte";

    export let pageName: string;
    export let subtitle: string;
</script>

<PageMeta description={subtitle} title={pageName}/>

<NavigationBar selectedItem={pageName}/>
<main>
    <header>
        <h1>{pageName}</h1>
        <h2>{subtitle}</h2>
    </header>

    <hr class="block h-0 rounded-full border-0 my-2 p-0 border-t-2 border-theme w-32 mx-auto">

    <PageContent>
        <slot/>
    </PageContent>
</main>