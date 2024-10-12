<script>
    import {page} from '$app/stores';
    import DefaultPage from "../components/DefaultPage.svelte";
</script>

<DefaultPage pageName={$page.error?.message ?? "Unexpected Error"} subtitle={$page.status.toString()}>
    <h1>Whoops! {$page.status === 404 ? "Looks like you took a wrong turn." : "Seems like something broke..."}</h1>
    <p>Use the navigation bar to get back on track.</p>

    {#if $page.status === 404}

        <div class="mt-8 flex">
            <div class="cblock">
                <div>
                    <div class="air"></div>
                    <div class="loader mat">
                        <div class="sign">
                            <span>LOADER</span>
                            <span>LoadUnknownPage</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cblock">
                <div class="stone"></div>
            </div>
            <div class="cblock">
                <div>
                    <div class="chest"></div>
                    <div class="game_action mat">
                        <div class="sign">
                            <span>SET STATUS</span>
                            <span>{($page.error?.message ?? "Unexpected Error").replace(" ", "").substring(0, 16)}</span>
                            <span>{$page.status}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cblock">
                <div class="stone"></div>
            </div>
            <div class="cblock">
                <div>
                    <div class="chest"></div>
                    <div class="player_action mat">
                        <div class="sign">
                            <span>CLIENT ACTION</span>
                            <span>ShowPage</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cblock">
                <div class="stone"></div>
            </div>
        </div>

    {/if}
</DefaultPage>

<style>
    .cblock {
        @apply relative w-max max-w-80 min-w-40 h-40 flex;
    }

    .cblock * {
        @apply min-w-40 max-w-80 h-40 bg-contain bg-bottom bg-no-repeat grid;
    }

    .cblock .mat {
        @apply grid place-items-center;
    }

    .cblock .sign {
        @apply font-[minecraft] font-light bg-[url('/block/sign.png')] w-40 h-20 bg-cover block;
    }

    .cblock .sign span {
        @apply text-center block h-min text-base leading-5 text-black min-h-5 select-none;
    }

    .cblock .stone {
        @apply bg-[url('/block/stone.png')] h-80;
    }

    .cblock .air {
        @apply bg-none;
    }

    .cblock .chest {
        @apply bg-[url('/block/chest.png')]
    }

    .cblock .loader {
        @apply bg-[url('/block/redstone_block.png')]
    }

    .cblock .game_action {
        @apply bg-[url('/block/netherrack.png')]
    }

    .cblock .player_action {
        @apply bg-[url('/block/cobblestone.png')]
    }
</style>