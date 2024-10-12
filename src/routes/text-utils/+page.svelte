<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { Label } from "$lib/components/ui/label";
    import DefaultPage from "../../components/DefaultPage.svelte";

    import { onMount } from "svelte";
    import Toolbar from "../../components/Toolbar.svelte";

    //@ts-ignore
    var widthData;
    onMount(async () => {
        widthData = await fetch("/minecraft_default.json").then((res) =>
            res.json()
        );
    });

    const makeSmallCaps = (str: string) => {
        const letters: Record<string, string> = {
            a: "ᴀ",
            b: "ʙ",
            c: "ᴄ",
            d: "ᴅ",
            e: "ᴇ",
            f: "ꜰ",
            g: "ɢ",
            h: "ʜ",
            i: "ɪ",
            j: "ᴊ",
            k: "ᴋ",
            l: "ʟ",
            m: "ᴍ",
            n: "ɴ",
            o: "ᴏ",
            p: "ᴘ",
            q: "ǫ",
            r: "ʀ",
            s: "s",
            t: "ᴛ",
            u: "ᴜ",
            v: "ᴠ",
            w: "ᴡ",
            x: "x",
            y: "ʏ",
            z: "ᴢ",
        };

        return str
            .toLowerCase()
            .split("")
            .map((letter) => letters[letter] || letter)
            .join("");
    };

    const generate = async () => {
        const input = document.getElementById("input") as HTMLInputElement;
        const makeSmall = document.getElementById(
            "make-small",
        ) as HTMLInputElement;
        const output = document.getElementById(
            "output",
        ) as HTMLParagraphElement;

        let text = input.value;

        if (makeSmall.ariaChecked == "true") {
            text = makeSmallCaps(text);
        }

        output.innerText = text;
    };
</script>

<DefaultPage
    pageName="Text Utilities"
    subtitle="Generating and manipulating text"
>
    <div class="max-w-lg flex flex-col gap-5 items-center">
        <Input id="input" placeholder="Insert text" />
        <div class="flex flex-col gap-2">
            <div class="flex gap-2">
                <Checkbox id="make-small" />
                <Label for="make-small">Make Small Caps</Label>
            </div>
        </div>
        <Button id="generate" on:click={generate}>Generate</Button>
        <p class="bg-zinc-800 px-2 rounded-sm" id="output"></p>
    </div>
    <Toolbar>
        <button on:click={() => navigator.clipboard.writeText("‌")}>
            Copy ZWNJ
        </button>
    </Toolbar>
</DefaultPage>
