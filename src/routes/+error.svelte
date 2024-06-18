<script>
    import {page} from '$app/stores';
    import DefaultPage from "../components/DefaultPage.svelte";
</script>

<DefaultPage pageName={$page.error?.message ?? "Unexpected Error"} subtitle={$page.status.toString()}>
    <h1>Whoops! {$page.status === 404 ? "Looks like you took a wrong turn." : "Seems like something broke..."}</h1>
    <p>Use the navigation bar to get back on track.</p>
</DefaultPage>