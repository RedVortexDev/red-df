<script lang="ts">
    import DefaultPage from "../../components/DefaultPage.svelte";
    import {Label} from "$lib/components/ui/label";
    import Toolbar from "../../components/Toolbar.svelte";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import {toast} from "svelte-sonner";
    //@ts-ignore
    import * as Tooltip from "$lib/components/ui/tooltip";
    //@ts-ignore
    import * as Popover from "$lib/components/ui/popover";
    //@ts-ignore
    import * as Accordion from "$lib/components/ui/accordion/index.js";
    //@ts-ignore
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import {get} from 'svelte/store';
    import {preferences} from './stores';
    import type {ColorPaletteSchema} from './palette_schema';

    // Constants
    const COLOR_SHADES = [
        "DARK_4", "DARK_3", "DARK_2", "DARK", "NEUTRAL", "LIGHT", "LIGHT_2", "LIGHT_3", "LIGHT_4"
    ] as const;

    const DEFAULT_COLOR_NAMES = [
        "RED", "SCARLET", "ORANGE", "GOLD", "MUSTARD", "YELLOW", "LIME", "GREEN",
        "TEAL", "AQUA", "SKY", "BLUE", "PURPLE", "AMETHYST", "MAGENTA", "PINK",
        "ROSE", "BROWN", "GRAY"
    ] as const;

    const IMAGES = {
        "/palette/bg_overworld.jpg": "Overworld",
        "/palette/bg_chat.png": "Chat",
        "/palette/bg_lore.png": "Lore",
        "/palette/bg_book.png": "Book",
        "/palette/bg_night.avif": "Night",
        "/palette/bg_nether.avif": "Nether"
    }

    type ColorSection = {
        label: string;
        colors: Color[];
    };

    const colorSections =
        {
            colors: [
                {
                    hex: "#FFD42A",
                    group: "MUSTARD",
                    shade: "NEUTRAL",
                    label: "Tokens"
                },
                {
                    hex: "#AAD4FF",
                    group: "SKY",
                    shade: "LIGHT",
                    label: "Sparks"
                },
            ]
        };

    // Types
    type ColorShade = typeof COLOR_SHADES[number];
    type DefaultColorName = typeof DEFAULT_COLOR_NAMES[number];
    type RGB = { r: number; g: number; b: number };

    class Color {
        readonly hex: string;
        readonly group: string;
        readonly shade: ColorShade;
        readonly override?: string;

        constructor(hex: string, group: string, shade: ColorShade, override?: string) {
            this.hex = hex;
            this.group = group;
            this.shade = shade;
            this.override = override;
        }
    }

    function getDisplayName(color: Color) {
        return color.override || `${color.group}_${color.shade}`.replace('_NEUTRAL', '');
    }

    // State
    let currentColor: Color = new Color("#FFFFFF", "GRAY", "LIGHT_3", "WHITE");
    let currentBackground: string | null = null;
    let colors: Color[] = [];
    let colorNames: string[] = [];


    function jsonSyntaxToast(message: string) {
        console.log("%cCustom Palette Error:\n", "color: red; font-weight: bold;", message + "\n\nReference the schema:\n" + window.location.origin + "/palette/palette_schema.json");
        toast.error(message, {
            description: `Reference the schema: ${window.location.origin}/palette/palette_schema.json`,
            duration: 3000
        });
    }

    function parseCustomPalette(): [Color[], string[]] | undefined {
        let colors = []
        const json = get(preferences) as unknown as ColorPaletteSchema;

        // Validate custom palette
        if (!json.customPalette || typeof json.customPalette !== 'object') {
            jsonSyntaxToast("Invalid custom palette format!");
            return;
        }

        // Get color names from custom palette
        colorNames = Object.keys(json.customPalette).filter(name => name !== "$schema");
        if (colorNames.length === 0) {
            jsonSyntaxToast("Custom palette has no color groups!");
            return;
        }

        for (const groupName of colorNames) {
            const colorGroup = json.customPalette[groupName];
            if (!colorGroup || typeof colorGroup !== 'object') {
                jsonSyntaxToast(`Invalid color group format for ${groupName}!`);
                return;
            }

            if (Object.keys(colorGroup).length === 0) {
                jsonSyntaxToast(`Color group ${groupName} has no shades!`);
                return;
            }

            for (const [shadeName, shade] of Object.entries(colorGroup)) {
                if (!COLOR_SHADES.includes(shadeName as ColorShade)) {
                    jsonSyntaxToast(`Invalid shade name ${shadeName} in group ${groupName}!`);
                    return;
                }
                if (!shade.hex || typeof shade.hex !== 'string') {
                    jsonSyntaxToast(`Missing or invalid hex value for ${shadeName} in group ${groupName}!`);
                    return;
                }
                colors.push(new Color(
                    shade.hex,
                    groupName.toUpperCase(),
                    shadeName as ColorShade,
                    shade.override
                ));
            }
        }

        colorNames = colorNames.map(name => name.toUpperCase());

        console.log("%cCustom Palette:\n", "color: green; font-weight: bold;", colors);
        return [colors, colorNames];
    }

    // Initialize colors from preferences
    $: (() => {
        let useDefaultPalette = true;
        if (get(preferences).customPalette) {
            let parsed = parseCustomPalette();
            if (parsed !== undefined && parsed.length > 0) {
                useDefaultPalette = false;
                colors = parsed[0];
                colorNames = parsed[1];
            }
        }
        if (useDefaultPalette) {
            colorNames = [...DEFAULT_COLOR_NAMES];
            colors = [
                new Color("#550000", "RED", "DARK_2"),
                new Color("#AA0000", "RED", "DARK"),
                new Color("#FF0000", "RED", "NEUTRAL"),
                new Color("#FF5555", "RED", "LIGHT"),
                new Color("#FFAAAA", "RED", "LIGHT_2"),
                new Color("#FFD4D4", "RED", "LIGHT_3"),
                new Color("#AA002A", "SCARLET", "DARK"),
                new Color("#FF2A00", "SCARLET", "NEUTRAL"),
                new Color("#FF7F7F", "SCARLET", "LIGHT"),
                new Color("#D42A00", "ORANGE", "DARK"),
                new Color("#FF5500", "ORANGE", "NEUTRAL"),
                new Color("#FF7F55", "ORANGE", "LIGHT"),
                new Color("#FFAA7F", "ORANGE", "LIGHT_2"),
                new Color("#7F2A00", "GOLD", "DARK_2"),
                new Color("#AA5500", "GOLD", "DARK"),
                new Color("#FFAA00", "GOLD", "NEUTRAL"),
                new Color("#FFD47F", "GOLD", "LIGHT"),
                new Color("#AA7F00", "MUSTARD", "DARK_2"),
                new Color("#D4AA2A", "MUSTARD", "DARK"),
                new Color("#FFD42A", "MUSTARD", "NEUTRAL"),
                new Color("#7F7F2A", "YELLOW", "DARK_3"),
                new Color("#AAAA55", "YELLOW", "DARK_2"),
                new Color("#D4D455", "YELLOW", "DARK"),
                new Color("#FFFF55", "YELLOW", "NEUTRAL"),
                new Color("#FFFFAA", "YELLOW", "LIGHT"),
                new Color("#FFFFD4", "YELLOW", "LIGHT_2"),
                new Color("#55AA00", "LIME", "DARK_2"),
                new Color("#7FD42A", "LIME", "DARK"),
                new Color("#AAFF55", "LIME", "NEUTRAL"),
                new Color("#005500", "GREEN", "DARK_4"),
                new Color("#2A7F00", "GREEN", "DARK_3"),
                new Color("#00AA00", "GREEN", "DARK_2"),
                new Color("#2AD42A", "GREEN", "DARK"),
                new Color("#55FF55", "GREEN", "NEUTRAL"),
                new Color("#7FFF7F", "GREEN", "LIGHT"),
                new Color("#AAFFAA", "GREEN", "LIGHT_2"),
                new Color("#D4FFD4", "GREEN", "LIGHT_3"),
                new Color("#00D4AA", "TEAL", "DARK"),
                new Color("#2AFFAA", "TEAL", "NEUTRAL"),
                new Color("#7FFFD4", "TEAL", "LIGHT"),
                new Color("#005555", "AQUA", "DARK_3"),
                new Color("#007F7F", "AQUA", "DARK_2"),
                new Color("#00AAAA", "AQUA", "DARK"),
                new Color("#2AD4D4", "AQUA", "NEUTRAL"),
                new Color("#55FFFF", "AQUA", "LIGHT"),
                new Color("#AAFFFF", "AQUA", "LIGHT_2"),
                new Color("#D4FFFF", "AQUA", "LIGHT_3"),
                new Color("#2A70D4", "SKY", "DARK"),
                new Color("#55AAFF", "SKY", "NEUTRAL"),
                new Color("#AAD4FF", "SKY", "LIGHT"),
                new Color("#000055", "BLUE", "DARK_3"),
                new Color("#0000AA", "BLUE", "DARK_2"),
                new Color("#5500FF", "BLUE", "DARK"),
                new Color("#5555FF", "BLUE", "NEUTRAL"),
                new Color("#7070FF", "BLUE", "LIGHT"),
                new Color("#AAAAFF", "BLUE", "LIGHT_2"),
                new Color("#D4D4FF", "BLUE", "LIGHT_3"),
                new Color("#2A007F", "PURPLE", "DARK_3"),
                new Color("#5500AA", "PURPLE", "DARK_2"),
                new Color("#7F2AD4", "PURPLE", "DARK"),
                new Color("#AA55FF", "PURPLE", "NEUTRAL"),
                new Color("#AA7FFF", "PURPLE", "LIGHT"),
                new Color("#D4AAFF", "PURPLE", "LIGHT_2"),
                new Color("#7F00AA", "AMETHYST", "DARK"),
                new Color("#AA00D4", "AMETHYST", "NEUTRAL"),
                new Color("#D400FF", "AMETHYST", "LIGHT"),
                new Color("#550055", "MAGENTA", "DARK_3"),
                new Color("#7F007F", "MAGENTA", "DARK_2"),
                new Color("#AA00AA", "MAGENTA", "DARK"),
                new Color("#D42AD4", "MAGENTA", "NEUTRAL"),
                new Color("#FF55FF", "MAGENTA", "LIGHT"),
                new Color("#FFAAFF", "MAGENTA", "LIGHT_2"),
                new Color("#FFD4FF", "MAGENTA", "LIGHT_3"),
                new Color("#D5007F", "PINK", "DARK_2"),
                new Color("#FF00AA", "PINK", "DARK"),
                new Color("#FF55AA", "PINK", "NEUTRAL"),
                new Color("#FF7FD4", "PINK", "LIGHT"),
                new Color("#FF0055", "ROSE", "DARK_2"),
                new Color("#FF557F", "ROSE", "DARK"),
                new Color("#FF7FAA", "ROSE", "NEUTRAL"),
                new Color("#FFAAD4", "ROSE", "LIGHT"),
                new Color("#552A00", "BROWN", "DARK_2"),
                new Color("#80552A", "BROWN", "DARK"),
                new Color("#AA8055", "BROWN", "NEUTRAL"),
                new Color("#D4AA80", "BROWN", "LIGHT"),
                new Color("#FFD4AA", "BROWN", "LIGHT_2"),
                new Color("#000000", "GRAY", "DARK_3", "BLACK"),
                new Color("#2A2A2A", "GRAY", "DARK_2"),
                new Color("#555555", "GRAY", "DARK"),
                new Color("#808080", "GRAY", "NEUTRAL"),
                new Color("#AAAAAA", "GRAY", "LIGHT"),
                new Color("#D4D4D4", "GRAY", "LIGHT_2"),
                new Color("#FFFFFF", "GRAY", "LIGHT_3", "WHITE")
            ]
        }
    })();

    // Utility functions
    function hexToRgb(hex: string): RGB | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function getColorObj(color: string, shade: string): Color | undefined {
        return colors.find(c => c.group === color && c.shade === shade);
    }

    function getGridPosition(shade: string, type: string): number {
        return type === 'row' ?
            COLOR_SHADES.indexOf(shade as ColorShade) + 1 :
            colorNames.indexOf(shade) + 1;
    }

    // Event handlers
    function clickColor(color: Color): void {
        currentColor = color;
        const copyText = updateDisplay();
        navigator.clipboard.writeText(copyText);
        toast.success("Copied to clipboard!", {
            description: `Copied ${copyText} to clipboard.`,
            duration: 1000
        });
    }

    function changeImage(image: string | null): void {
        currentBackground = image;
        updateDisplay();
    }

    function customPalette(): void {
        const fileInput = document.getElementById("custom-palette-json") as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!file) return;
        if (file.type !== "application/json") {
            toast.error("Invalid file type! Please upload a JSON file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string);
                preferences.set({customPalette: data});
                window.location.reload();
            } catch (error) {
                jsonSyntaxToast("Invalid JSON file format!");
            }
        };
        reader.readAsText(file);
    }

    function deleteCustomPalette(): void {
        preferences.reset();
        window.location.reload();
    }

    function updateDisplay(): string {
        const copyTag = document.getElementById("copyTag")?.ariaChecked === "true";
        const copyName = document.getElementById("copyName")?.ariaChecked === "true";

        const displayName = getDisplayName(currentColor);

        const copyText = copyTag ? `<${currentColor.hex}>` :
            copyName ? displayName :
                currentColor.hex;

        const statusText = document.getElementById("palette-status");
        if (statusText) {
            statusText.innerHTML = `Copied <span class="palette-color-text" style="--color: ${currentColor.hex}">${displayName}</span> to clipboard! <i>(${copyText})</i>`;
        }

        const colorText = document.querySelector(".palette-color-text") as HTMLElement;
        if (colorText) {
            const rgb = hexToRgb(currentColor.hex);
            if (rgb) {
                const brightness = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
                const textColor = currentBackground === null ?
                    (brightness > 0.5 ? "black" : "white") :
                    currentColor.hex;

                colorText.style.setProperty("--text-color", textColor);
                colorText.style.setProperty("--color",
                    currentBackground === null ?
                        currentColor.hex :
                        `url('${currentBackground}')`
                );
            }
        }

        return copyText;
    }
</script>

<DefaultPage pageName="Color Palette" subtitle="Updated DiamondFire Color Palette">
    <h1 id="palette-status">Click on a color to copy it!</h1>

    <RadioGroup.Root class="flex gap-4">
        <div class="flex items-center space-x-2">
            <RadioGroup.Item id="copyHex" value="copyHex"/>
            <Label for="copyHex">Copy Hex</Label>
        </div>
        <div class="flex items-center space-x-2">
            <RadioGroup.Item id="copyTag" value="copyTag"/>
            <Label for="copyTag">Copy MiniMessage Tag</Label>
        </div>
        <div class="flex items-center space-x-2">
            <RadioGroup.Item id="copyName" value="copyName"/>
            <Label for="copyName">Copy Color Name</Label>
        </div>
    </RadioGroup.Root>

    <div class="palette-container">
        {#each colorNames as color}
            {#each COLOR_SHADES as shade}
                {#if getColorObj(color, shade)}
                    <div
                            class="palette-color"
                            role="button"
                            tabindex="0"
                            on:click={() => {
                            const colorObj = getColorObj(color, shade);
                            if (colorObj) clickColor(colorObj);
                        }}
                            on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                const colorObj = getColorObj(color, shade);
                                if (colorObj) clickColor(colorObj);
                            }
                        }}
                            style="
                            --color: {getColorObj(color, shade)?.hex};
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
                class="text-sm"
                id="bg-color"
                on:click={() => changeImage(null)}
        >
            COLOR
        </button>
        {#each Object.entries(IMAGES) as [image, description]}
            <Tooltip.Root>
                <Tooltip.Trigger asChild let:builder>
                    <Button
                            builders={[builder]}
                            aria-label="Change background image"
                            style="background-image: url({image})"
                            on:click={() => changeImage(image)}
                    ></Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>{description}</p>
                </Tooltip.Content>
            </Tooltip.Root>
        {/each}
    </Toolbar>

    <div class="fixed bottom-0 left-0 mb-5 p-2 bg-zinc-800 transition-all hover:rounded-r-3xl hover:scale-x-[105%] active:scale-x-100 rounded-r-sm invisible md:visible">
        <Popover.Root>
            <Popover.Trigger>Custom Palette</Popover.Trigger>
            <Popover.Content>
                <div class="flex flex-col gap-2 p-2">
                    <p>Check out the <a href="https://red.dfonline.dev/palette/example_palette.json" target="_blank"
                                        class="underline">Example palette</a> for format and schema.</p>
                    <Input
                            accept=".json"
                            id="custom-palette-json"
                            multiple={false}
                            type="file"
                    />
                    <Button on:click={customPalette} type="submit">
                        Apply
                    </Button>
                    <Button on:click={deleteCustomPalette} type="submit">
                        Delete
                    </Button>
                </div>
            </Popover.Content>
        </Popover.Root>
    </div>

    <Accordion.Root class="w-full sm:max-w-[70%]">
        <Accordion.Item value="item-1">
            <Accordion.Trigger>Common DiamondFire Colors (Feel free to suggest more)</Accordion.Trigger>
            <Accordion.Content>
                <div class="flex gap-2 items-center">
                    {#each colorSections.colors as color}
                        <div class="flex flex-col items-center">
                            {#if color.label}
                                <span class="-mb-3">{color.label}</span>
                            {/if}
                            <div class="w-8">
                                <button
                                        class="palette-color"
                                        tabindex="0"
                                        on:click={() => clickColor(color)}
                                        style="--color: {color.hex};"
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    </Accordion.Root>
</DefaultPage>