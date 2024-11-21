<script lang="ts">
    import InfoCard from "./InfoCard.svelte";
    import {TriangleAlert} from "lucide-svelte";

    export let title: string;
    export let message: string;
</script>

<InfoCard title={title} message={message} icon={TriangleAlert} border="border-primary"/>