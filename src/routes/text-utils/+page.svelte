<script lang="ts">
    import FontPreview from "./FontPreview.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import {Label} from "$lib/components/ui/label";
    import DefaultPage from "../../components/DefaultPage.svelte";
    import {toast} from "svelte-sonner";
    import Toolbar from "../../components/Toolbar.svelte";
    import InfoCard from "../../components/InfoCard.svelte";
    import {Textarea} from "$lib/components/ui/textarea";

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

    const makeSmallCaps = (str: string): string => {
        return str.toLowerCase()
            .split("")
            .map(letter => letters[letter] || letter)
            .join("");
    };

    function nonGreedyWrap(content: string, maxWidth: number): string {
        if (!content || maxWidth <= 0) return content;

        const lines = content.split('\n');
        const wrappedLines: string[] = [];

        for (const line of lines) {
            if (line.length <= maxWidth) {
                wrappedLines.push(line);
                continue;
            }

            const words = line.split(' ');
            const n = words.length;
            const dp: number[] = new Array(n + 1).fill(Infinity);
            const breaks: number[] = new Array(n + 1).fill(0);

            dp[0] = 0;

            for (let i = 1; i <= n; i++) {
                let width = 0;
                dp[i] = Infinity;
                for (let j = i; j >= 1; j--) {
                    width += words[j - 1].length + (i !== j ? 1 : 0);
                    if (width > maxWidth) {
                        if (i === j) {
                            breaks[i] = j - 1;
                            dp[i] = 0;
                        }
                        break;
                    }
                    const penalty = Math.pow(maxWidth - width, 2) + dp[j - 1];
                    if (penalty < dp[i]) {
                        dp[i] = penalty;
                        breaks[i] = j - 1;
                    }
                }
            }

            let i = n;
            const currentLine: string[] = [];
            while (i > 0) {
                const start = breaks[i];
                const lineWords = words.slice(start, i);
                const lineText = lineWords.join(' ');
                currentLine.unshift(lineText);
                i = start;
            }

            wrappedLines.push(...currentLine);
        }

        return wrappedLines.join('\n');
    }


    const generate = async () => {
        const elements = {
            input: document.getElementById("input") as HTMLInputElement,
            lineLength: document.getElementById("line-length") as HTMLInputElement,
            makeSmall: document.getElementById("make-small") as HTMLInputElement,
            output: document.getElementById("output") as HTMLParagraphElement
        };

        const text = elements.input.value;
        const lineLength = parseInt(elements.lineLength.value) || 32;

        let result = text;
        if (elements.makeSmall.ariaChecked === "true") {
            result = makeSmallCaps(result);
        }

        elements.output.innerText = nonGreedyWrap(result, lineLength);
    };
</script>

<DefaultPage
        pageName="Text Utilities"
        subtitle="Generating and manipulating text"
>
    <div class="max-w-xl flex flex-col gap-5 items-center">
        <Textarea id="input" placeholder="Insert text"/>
        <Input id="line-length" type="number" placeholder="Line length" min="1" value=""/>
        <div class="flex flex-col gap-2">
            <div class="flex gap-2">
                <Checkbox id="make-small"/>
                <Label for="make-small">Make Small Caps</Label>
            </div>
        </div>
        <Button id="generate" on:click={generate}>Generate</Button>
        <p class="bg-zinc-800 px-2 rounded-sm whitespace-pre-wrap" id="output"/>
    </div>

    <Toolbar>
        <button on:click={() => {
            navigator.clipboard.writeText("‌");
            toast.success("Copied to clipboard!", { description: "Copied a zero-width non-joined to clipboard." });
        }}>
            Copy ZWNJ
        </button>
    </Toolbar>

    <InfoCard title="Have more ideas for text utilities?"
              message="Feel free to make an issue on the GitHub repository! (in the navigation bar)"/>

    <FontPreview/>
</DefaultPage>
