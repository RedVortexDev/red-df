<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { Label } from "$lib/components/ui/label";
    import DefaultPage from "../../components/DefaultPage.svelte";

    import { onMount } from "svelte";

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

    const centerText = async (str: string, width: number, useZWNJ: boolean) => {
        const { chars, missingCharWidth } = await widthData;
        const totalWidth = str.split("").reduce((acc, char) => {
            if (chars[char]) {
                return acc + chars[char].width;
            } else {
                return acc + missingCharWidth;
            }
        }, 0);

    
        const spaceWidth = 4;
        const space = "<space:" + Math.floor((width - totalWidth) / spaceWidth / 2) + ">";
        const zwnj = "<b>" + "‌".repeat(1 + (width - totalWidth) % spaceWidth) + "</b>";

        console.log(space, zwnj);

        return space + (useZWNJ ? zwnj : "") + str + space;
    
    };

    const generate = async () => {
        const input = document.getElementById("input") as HTMLInputElement;
        const makeSmall = document.getElementById(
            "make-small",
        ) as HTMLInputElement;
        const center = document.getElementById("center") as HTMLInputElement;
        const useZWNJ = document.getElementById("zwnj") as HTMLInputElement;
        const output = document.getElementById(
            "output",
        ) as HTMLParagraphElement;

        let text = input.value;

        if (makeSmall.ariaChecked == "true") {
            text = makeSmallCaps(text);
        }

        if (center.ariaChecked == "true") {
            text = await centerText(text, 160, useZWNJ.ariaChecked == "true");
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
            <div class="flex gap-2">
                <Checkbox id="center" />
                <Label for="center">Center for menu title</Label>
            </div>
            <div class="flex gap-2 hidden">
                <Checkbox id="zwnj" />
            </div>
        </div>
        <Button id="generate" on:click={generate}>Generate</Button>
        <p class="bg-zinc-800 px-2 rounded-sm" id="output"></p>
    </div>
</DefaultPage>
