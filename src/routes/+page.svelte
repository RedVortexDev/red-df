<script>
    import NavigationBar from "../components/NavigationBar.svelte";
    import PageContent from "../components/PageContent.svelte";
    import {Info} from "lucide-svelte";
    import PageMeta from "../components/PageMeta.svelte";
</script>

<PageMeta description="DiamondFire Utilities"/>

<NavigationBar selectedItem="Home"/>
<PageContent>
    <img alt="RedVortex_ Player Head" class="w-44 h-auto" src="/favicon.png">
    <h1 class="font-medium">Hey, I'm <span class="text-theme font-bold">Red</span>!</h1>
    <p class="text-center max-w-md">This is my website, here you can find a bunch of DiamondFire utilities.</p>
    <br>
    <div class="flex flex-col items-center justify-center">
        <p class="font-bold flex gap-2">
            <Info/>
            Please note!
        </p>
        <p class="text-center max-w-md">This website assumes you know what you're doing, and have either recode or
            CodeClient installed.</p>
    </div>
</PageContent>