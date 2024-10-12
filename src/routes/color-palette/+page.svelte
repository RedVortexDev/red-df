<DefaultPage pageName="Color Palette" subtitle="Updated DiamondFire Color Palette">
    <h1 id="palette-status">Click on a color to copy it!</h1>
    
    <RadioGroup.Root class="flex gap-4">
        <div class="flex items-center space-x-2">
            <RadioGroup.Item value="copyHex" id="copyHex" />
            <Label for="copyHex">Copy Hex</Label>
        </div>
        <div class="flex items-center space-x-2">
            <RadioGroup.Item value="copyTag" id="copyTag" />
            <Label for="copyTag">Copy MiniMessage Tag</Label>
        </div>
        <div class="flex items-center space-x-2">
            <RadioGroup.Item value="copyName" id="copyName" />
            <Label for="copyName">Copy Color Name</Label>
        </div>
    </RadioGroup.Root>
    
    <div class="palette-container">
        {#each COLOR_NAMES as color}
            {#each COLOR_SHADES as shade}
                {#if getColorObj(color, shade)}
                    <div
                        class="palette-color"
                        role="button"
                        tabindex="0"
                        on:click={() => {clickColor(getColorObj(color, shade))}}
                        on:keydown={() => {clickColor(getColorObj(color, shade))}}
                        style="
                        --color: {getColorObj(color, shade).hex};
                        grid-row: {getGridPosition(shade, 'row')};
                        grid-column: {getGridPosition(color, 'column')};
                        "
                    ></div>
                {/if}
            {/each}
        {/each}
    </div>

        <Toolbar title="Text Background">
            <button
                    id="bg-color"
                    class="text-sm"
                    on:click={() => {changeImage(null)}}
                >COLOR</button>
            {#each IMAGES as image}
                <button
                    style="background-image: url({image})"
                    on:click={() => {changeImage(image)}}
                ></button>
            {/each}
        </Toolbar>
</DefaultPage>

<script lang="ts">
    import DefaultPage from "../../components/DefaultPage.svelte";
    import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
    import {Label} from "$lib/components/ui/label/";
    import Toolbar from "../../components/Toolbar.svelte";

    class Color {
        hex: string;
        group: string;
        shade: string;
        override?: string;

        constructor(hex: string, group: string, shade: number, override?: string) {
            this.hex = hex;
            this.group = group
            this.shade = COLOR_SHADES[shade + 4];
            if (override) this.override = override;
        }
    }
    
    const COLOR_NAMES = [
        "RED", "SCARLET", "ORANGE", "GOLD", "MUSTARD", "YELLOW", "LIME", "GREEN", "TEAL", "AQUA", "SKY", "BLUE", "PURPLE", "AMETHYST", "MAGENTA", "PINK", "ROSE", "BROWN", "GRAY"
    ]
    const COLOR_SHADES = [
        "DARK_4", "DARK_3", "DARK_2", "DARK", "NEUTRAL", "LIGHT", "LIGHT_2", "LIGHT_3"
    ]

    var currentColor: Color = new Color("#FFFFFF", "GRAY", 3, "WHITE");
    var currentBackground: string | null = null;

    const IMAGES = [
        "/palette/bg_overworld.jpg",
        "/palette/bg_night.avif",
        "/palette/bg_nether.avif"
    ]

    function changeImage(image: string | null) {
        const paletteColorText = document.querySelector(".palette-color-text") as HTMLElement;
        if (!paletteColorText) return;
        currentBackground = image;
        updateDisplay();
    }

    function getColorObj(color: string, shade: string) {
        return COLORS.find(c => c.group === color && c.shade === shade);
    }

    function getGridPosition(index: string, type: string) {
        return type === 'row' ? COLOR_SHADES.indexOf(index) + 1 : COLOR_NAMES.indexOf(index) + 1;
    }

    function hexToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }


    function clickColor(color: Color) {
        currentColor = color;
        const copy = updateDisplay();
        if (copy) navigator.clipboard.writeText(copy);
    }

    /**
     * Updates the display with the current color and background.
     * @returns The text the user wants to copy, but does not copy it.
     */
    function updateDisplay(): string {
        const copyTag = document.getElementById("copyTag")?.ariaChecked == "true";
        const copyName = document.getElementById("copyName")?.ariaChecked == "true";

        const colorName = currentColor.override ? currentColor.override : (currentColor.group + '_' + currentColor.shade).replace('_NEUTRAL', '');

        var copy = currentColor.hex;
        if (copyTag) copy = `<${currentColor.hex}>`;
        if (copyName) copy = colorName;
    
        const statusText = document.getElementById("palette-status");
        if (!statusText) return copy;
        
        statusText.innerHTML = `Copied<span class="palette-color-text" style="--color: ${currentColor.hex}">
        ${colorName}
        </span>to clipboard! <i>(${copy})</i>`;
    
        
        const paletteColorText = document.querySelector(".palette-color-text") as HTMLElement;
        if (!paletteColorText) return copy;

        const rgb = hexToRgb(currentColor.hex);
        if (!rgb) return copy;
        
        const textColor = currentBackground === null ? (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.5 ? "black" : "white" : currentColor.hex;
        paletteColorText.style.setProperty("--text-color", textColor);

        const bg = currentBackground === null ? currentColor.hex : `url('${currentBackground}')`;
        paletteColorText.style.setProperty("--color", bg);
        return copy;
    }

    // <editor-fold defaultstate="collapsed" desc="> Colors">
    const COLORS = [
        new Color("#550000", "RED", -2),
        new Color("#AA0000", "RED", -1),
        new Color("#FF0000", "RED", 0),
        new Color("#FF5555", "RED", 1),
        new Color("#FFAAAA", "RED", 2),
        new Color("#FFD4D4", "RED", 3),
        new Color("#AA002A", "SCARLET", -1),
        new Color("#FF2A00", "SCARLET", 0),
        new Color("#FF7F7F", "SCARLET", 1),
        new Color("#D42A00", "ORANGE", -1),
        new Color("#FF5500", "ORANGE", 0),
        new Color("#FF7F55", "ORANGE", 1),
        new Color("#FFAA7F", "ORANGE", 2),
        new Color("#7F2A00", "GOLD", -2),
        new Color("#AA5500", "GOLD", -1),
        new Color("#FFAA00", "GOLD", 0),
        new Color("#FFD47F", "GOLD", 1),
        new Color("#AA7F00", "MUSTARD", -2),
        new Color("#D4AA2A", "MUSTARD", -1),
        new Color("#FFD42A", "MUSTARD", 0),
        new Color("#7F7F2A", "YELLOW", -3),
        new Color("#AAAA55", "YELLOW", -2),
        new Color("#D4D455", "YELLOW", -1),
        new Color("#FFFF55", "YELLOW", 0),
        new Color("#FFFFAA", "YELLOW", 1),
        new Color("#FFFFD4", "YELLOW", 2),
        new Color("#55AA00", "LIME", -2),
        new Color("#7FD42A", "LIME", -1),
        new Color("#AAFF55", "LIME", 0),
        new Color("#005500", "GREEN", -4),
        new Color("#2A7F00", "GREEN", -3),
        new Color("#00AA00", "GREEN", -2),
        new Color("#2AD42A", "GREEN", -1),
        new Color("#55FF55", "GREEN", 0),
        new Color("#7FFF7F", "GREEN", 1),
        new Color("#AAFFAA", "GREEN", 2),
        new Color("#D4FFD4", "GREEN", 3),
        new Color("#00D4AA", "TEAL", -1),
        new Color("#2AFFAA", "TEAL", 0),
        new Color("#7FFFD4", "TEAL", 1),
        new Color("#005555", "AQUA", -3),
        new Color("#007F7F", "AQUA", -2),
        new Color("#00AAAA", "AQUA", -1),
        new Color("#2AD4D4", "AQUA", 0),
        new Color("#55FFFF", "AQUA", 1),
        new Color("#AAFFFF", "AQUA", 2),
        new Color("#D4FFFF", "AQUA", 3),
        new Color("#2A70D4", "SKY", -1),
        new Color("#55AAFF", "SKY", 0),
        new Color("#AAD4FF", "SKY", 1),
        new Color("#000055", "BLUE", -3),
        new Color("#0000AA", "BLUE", -2),
        new Color("#5500FF", "BLUE", -1),
        new Color("#5555FF", "BLUE", 0),
        new Color("#7070FF", "BLUE", 1),
        new Color("#AAAAFF", "BLUE", 2),
        new Color("#D4D4FF", "BLUE", 3),
        new Color("#2A007F", "PURPLE", -3),
        new Color("#5500AA", "PURPLE", -2),
        new Color("#7F2AD4", "PURPLE", -1),
        new Color("#AA55FF", "PURPLE", 0),
        new Color("#AA7FFF", "PURPLE", 1),
        new Color("#D4AAFF", "PURPLE", 2),
        new Color("#7F00AA", "AMETHYST", -1),
        new Color("#AA00D4", "AMETHYST", 0),
        new Color("#D400FF", "AMETHYST", 1),
        new Color("#550055", "MAGENTA", -3),
        new Color("#7F007F", "MAGENTA", -2),
        new Color("#AA00AA", "MAGENTA", -1),
        new Color("#D42AD4", "MAGENTA", 0),
        new Color("#FF55FF", "MAGENTA", 1),
        new Color("#FFAAFF", "MAGENTA", 2),
        new Color("#FFD4FF", "MAGENTA", 3),
        new Color("#D5007F", "PINK", -2),
        new Color("#FF00AA", "PINK", -1),
        new Color("#FF55AA", "PINK", 0),
        new Color("#FF7FD4", "PINK", 1),
        new Color("#FF0055", "ROSE", -2),
        new Color("#FF557F", "ROSE", -1),
        new Color("#FF7FAA", "ROSE", 0),
        new Color("#FFAAD4", "ROSE", 1),
        new Color("#552A00", "BROWN", -2),
        new Color("#80552A", "BROWN", -1),
        new Color("#AA8055", "BROWN", 0),
        new Color("#D4AA80", "BROWN", 1),
        new Color("#FFD4AA", "BROWN", 2),
        new Color("#000000", "GRAY", -3, "BLACK"),
        new Color("#2A2A2A", "GRAY", -2),
        new Color("#555555", "GRAY", -1),
        new Color("#808080", "GRAY", 0),
        new Color("#AAAAAA", "GRAY", 1),
        new Color("#D4D4D4", "GRAY", 2),
        new Color("#FFFFFF", "GRAY", 3, "WHITE"),
    ]
    // </editor-fold>
</script>