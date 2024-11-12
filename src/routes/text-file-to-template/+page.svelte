<DefaultPage pageName="Text File to Template" subtitle="Convert a text file separated by newlines to a list">
    <div>
        <Label for="file-input">Choose a file</Label>
        <Input class="hover:cursor-pointer" id="file-input" type="file"/>
    </div>
    <br>
    <div class="flex gap-5 lg:items-center flex-col md:flex-row">
        <div>
            <Input id="function-name" placeholder="Function name"/>
        </div>
        <div>
            <Input id="variable-name" placeholder="Variable name"/>
        </div>
        <div>
            <Select.Root>
                <Select.Trigger id="variable-scope">
                    <Select.Value placeholder="Variable scope"/>
                </Select.Trigger>
                <Select.Content>
                    {#each ["Global", "Saved", "Local", "Line"] as name }
                        <Select.Item value={name}>{name}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <div class="flex flex-col justify-center items-center gap-3">
            <Tooltip.Root>
                <Tooltip.Trigger class="flex flex-col items-center gap-2">
                    <Label for="use-parameter">Use parameter</Label>
                    <Switch id="use-parameter"/>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <p>Add a parameter to the function chest & override variable scope</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </div>
    </div>
    <br>
    <Button id="send-template" on:click={() => {parseTemplate()}}>Send Template</Button>
    <br>
    <!-- Let's assume people have already updated. -->
    <!-- <p class="text-sm flex gap-2 items-center">
        <TriangleAlert/>
        If you're not using the latest CodeClient version, run <code>/auth</code> right now!
    </p> -->
</DefaultPage>

<script lang="ts">
    import DefaultPage from "../../components/DefaultPage.svelte";
    import {Input} from "$lib/components/ui/input/";
    import {Label} from "$lib/components/ui/label/";
    import {Button} from "$lib/components/ui/button/";
    import {Switch} from "$lib/components/ui/switch/";
    import {toast} from "svelte-sonner";

    //@ts-ignore
    import * as Select from "$lib/components/ui/select/";
    //@ts-ignore
    import * as Tooltip from "$lib/components/ui/tooltip";
    //import {TriangleAlert} from "lucide-svelte";
    import pako from "pako";
    import {onMount} from "svelte";

    let recodeSocketOpen = false
    let codeClientSocketOpen = false
    let recodeSocket: WebSocket;
    let codeClientSocket: WebSocket;
    onMount(() => {
        recodeSocket = new WebSocket('ws://localhost:31371/codeutilities/item')
        recodeSocket.onopen = () => {
            recodeSocketOpen = true
        }

        codeClientSocket = new WebSocket('ws://localhost:31375');
        codeClientSocket.onopen = () => {
            codeClientSocketOpen = true
        }

    })

    interface Template {
        blocks: Block[];
    }

    interface Block {
        id: string;
        block: string;
        args?: {
            items: Item[];
        };
        data?: string;
        action?: string;
    }

    interface Item {
        item: {
            id: string;
            data: any;
        };
        slot: number;
    }

    function encodeTemplate(template: string): string {
        const data = pako.gzip(template);
        const data2 = String.fromCharCode.apply(null, [...new Uint16Array(data)]);
        return btoa(data2);
    }

    async function parseTemplate(): Promise<void> {
        const FILE_PICKER = document.querySelector<HTMLInputElement>('#file-input');
        const FUNCTION_NAME = (document.querySelector<HTMLInputElement>('#function-name')!.value).replace("\r", "");
        const VARIABLE_NAME = (document.querySelector<HTMLInputElement>('#variable-name')!.value).replace("\r", "");
        const USE_PARAMETER = (document.querySelector<HTMLDivElement>('#use-parameter')!.ariaChecked === "true");
        const SCOPES: Record<string, string> = {
            "Global": "unsaved",
            "Saved": "saved",
            "Local": "local",
            "Line": "line"
        }
        const VARIABLE_SCOPE = USE_PARAMETER ? "line" : SCOPES[document.querySelector<HTMLDivElement>('#variable-scope')!.children[0].innerHTML] ?? "unsaved";

        if (!FILE_PICKER || !FILE_PICKER.files || FILE_PICKER.files.length !== 1) {
            toast.error("Please select a file!");
            return;
        }

        const file = FILE_PICKER.files[0];
        const text = await file.text();

        const lines = text.split('\n');

        const template: Template = {
            blocks: [
                {
                    id: "block",
                    block: "func",
                    args: {
                        items: [
                            {
                                item: {
                                    id: "bl_tag",
                                    data: {
                                        option: "False",
                                        tag: "Is Hidden",
                                        action: "dynamic",
                                        block: "func"
                                    }
                                },
                                slot: 26
                            }
                        ]
                    },
                    data: FUNCTION_NAME
                }
            ]
        };

        function getStringValue(str: string, slot: number): Item {
            return {
                item: {
                    id: "txt",
                    data: {
                        name: str.replace("\r", "")
                    }
                },
                slot: slot
            };
        }

        if (USE_PARAMETER) {
            template.blocks[0].args!.items.push({
                item: {
                    id: "pn_el",
                    data: {
                        name: VARIABLE_NAME,
                        type: "var",
                        plural: false,
                        optional: false
                    }
                },
                slot: 0
            });
        }

        let placedCreateList = false;
        let items = [
            {
                item: {
                    id: "var",
                    data: {
                        name: VARIABLE_NAME,
                        scope: VARIABLE_SCOPE,
                    },
                },
                slot: 0,
            },
        ];
        let slot = 0;

        for (let index = 0; index < lines.length; index++) {
            items.push(getStringValue(lines[index], slot));
            slot++;

            // Place the action if we ran out of slots or if we're at the end of the lines
            if (slot === 27 || index === lines.length - 1) {
                template.blocks.push({
                    id: "block",
                    block: "set_var",
                    args: {
                        items: items
                    },
                    action: placedCreateList ? "AppendValue" : "CreateList",
                });
                if (!placedCreateList) placedCreateList = true; // We only want to create the list once

                items = [
                    {
                        item: {
                            id: "var",
                            data: {
                                name: VARIABLE_NAME,
                                scope: VARIABLE_SCOPE
                            }
                        },
                        slot: 0
                    }
                ];
                slot = 1;
            }
        }

        let sentTo;
        if (recodeSocketOpen) {
            recodeSocket.send(JSON.stringify({
                type: "template",
                data: JSON.stringify({
                    author: "Red DF Website",
                    name: "Text File to Template",
                    code: encodeTemplate(JSON.stringify(template)).toString()
                }),
                source: "Red DF Website"
            }));
            sentTo = "recode";
        }

        if (codeClientSocketOpen) {
            codeClientSocket.send(
                `give {Count:1b,Slot:0b,id:"minecraft:ender_chest",tag:{display: {Name: '{"text":"Text File To Template","color":"aqua","italic":false}'}, PublicBukkitValues:{"hypercube:codetemplatedata": '{"author":"Red DF Website","name":"Text File to Template","code":"${encodeTemplate(JSON.stringify(template))}"}'}}}`
            );
            sentTo = "CodeClient";
        }

        if (!recodeSocketOpen && !codeClientSocketOpen) toast.error("Couldn't send to recode nor CodeClient!");
        else toast.success(`Template sent to ${sentTo}!`);
    }

</script>
