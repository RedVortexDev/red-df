<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Input} from "$lib/components/ui/input";
    import {toast} from "svelte-sonner";
    import DefaultPage from "../../components/DefaultPage.svelte";
    import {onMount} from "svelte";
    import WarningCard from "../../components/WarningCard.svelte";
    import { ws } from '$lib/websocket';

    onMount(() => {
        ws.connect();

        const removeConnectListener = ws.onConnect(() => {
            toast.success('Connected to CodeClient!');
        });

        return () => {
            removeConnectListener();
            ws.disconnect();
        };
    });

    function sendToSocket(data: string, message?: string) {
        if (ws.send(data)) {
            toast.success(message ?? "Template has been sent to CodeClient!");
        } else {
            toast.error("Not connected to CodeClient!");
        }
    }

    //NBS file to item

    let fileArray: number[];

    function newBiArray(dim1: number, dim2: number) {
        var biArray = new Array(dim1);

        for (var i = 0; i < biArray.length; i++) {
            biArray[i] = new Array(dim2);
        }
        return biArray;
    }

    function readShort() {
        let byte1 = fileArray.shift() ?? 0;
        let byte2 = fileArray.shift() ?? 0;
        return byte1 + (byte2 << 8);
    }

    function readInt() {
        let byte1 = fileArray.shift() ?? 0;
        let byte2 = fileArray.shift() ?? 0;
        let byte3 = fileArray.shift() ?? 0;
        let byte4 = fileArray.shift() ?? 0;
        return byte1 + (byte2 << 8) + (byte3 << 16) + (byte4 << 24);
    }

    function readString() {
        let length = readInt();
        let string = "";
        for (; length > 0; --length) {
            let c = String.fromCharCode(fileArray.shift() ?? 0);
            if (c == '\r') {
                c = " ";
            }
            string = string + c;
        }
        return string;
    }

    function getMinecraftPitch(key: number, offset: number) {
        if (key < 33) key -= 9;
        else if (key > 57) key -= 57;
        else key -= 33;

        key += offset;

        return 0.5 * Math.pow(2, key / 12) * 1000;
    }

    function receivedNbs() {
        let nbsElement = document.getElementById("nbs") as HTMLInputElement;
        if (nbsElement.files === null || nbsElement.files.length === 0 || nbsElement.files[0] === null) {
            toast.error("Please select a file.");
            return;
        }

        var fr = new FileReader();
        fr.onload = function () {
            let uint8Array: Uint8Array | undefined;
            if (fr.result instanceof ArrayBuffer) {
                uint8Array = new Uint8Array(fr.result);
                fileArray = Array.from(uint8Array);
            } else {
                toast.error("Failed to read file as ArrayBuffer.");
                return;
            }

            let title = "";
            let author = "";
            let file = nbsElement.files ? nbsElement.files[0].name : '';
            let speed = 0;
            let actualSpeed = 0;
            let timeSignature = 4;
            let loopTick = 0;
            let loopCount = 0;
            let vanillaInstruments = 9;

            let stringBuilder = "";
            let layerStringBuilder = "";
            length = readShort();
            let nbsversion = 0;
            if (length == 0) {
                nbsversion = fileArray.shift() ?? 0;
                vanillaInstruments = fileArray.shift() ?? 0;
                if (nbsversion >= 3) {
                    length = readShort();
                } else if (nbsversion == 1 || nbsversion == 2) {
                    toast.error(
                        "Whoops! This version of NBS is not supported.",
                    );
                }
            }
            let layers = readShort(); //song height
            title = readString(); //title
            author = readString(); //author
            readString(); //original author
            let description = readString(); //description
            actualSpeed = readShort(); //speed
            speed = actualSpeed / 100; //speed
            fileArray.shift(); //autosave        (should be bool but idk man)
            fileArray.shift(); //autosave duration
            timeSignature = fileArray.shift() ?? 4; //time signature
            readInt(); //minutes spent
            readInt(); //left clicks
            readInt(); //right clicks
            readInt(); //blocks added
            readInt(); //nlocks removed
           readString(); // mid or schematic filename
            if (nbsversion >= 4) {
                fileArray.shift(); //loop on/off
                loopCount = fileArray.shift() ?? 0; //loop count
                loopTick = readShort(); //loop start tick
            }

            let tick = -1;
            let addStringList = newBiArray(layers, length + 1);
            let instrumentList = newBiArray(layers, length + 1);
            let pitchList = newBiArray(layers, length + 1);
            let finepitchList = newBiArray(layers, length + 1);
            let velocityList = newBiArray(layers, length + 1);
            let panningList = newBiArray(layers, length + 1);
            let columnExistence = new Array(length + 1);
            let noteExistence = newBiArray(layers, length + 1);
            let firstNoted = false;

            while (true) {
                //Read notes
                let t = readShort();
                if (t == 0) {
                    break;
                }
                tick += t;

                columnExistence[tick] = true;

                let layer = -1;
                while (true) {
                    let jumpLayers = readShort();
                    if (jumpLayers == 0) {
                        break;
                    }
                    layer += jumpLayers;
                    let instrument = fileArray.shift();
                    let note = fileArray.shift();
                    let velocity = 100;
                    let panning = 100;
                    let finepitch = 0;
                    if (nbsversion >= 4) {
                        velocity = fileArray.shift() ?? 100;
                        panning = fileArray.shift() ?? 100;
                        finepitch = readShort();
                    }
                    instrumentList[layer][tick] = instrument;
                    pitchList[layer][tick] = note;
                    finepitchList[layer][tick] = finepitch;
                    velocityList[layer][tick] = velocity;
                    panningList[layer][tick] = panning;
                    noteExistence[layer][tick] = true;
                }
            }

            for (let i = 0; i < layers; i++) {
                //Read layer data

                readString(); //layer name

                if (nbsversion >= 4) {
                    fileArray.shift();
                }

                let volume = fileArray.shift() ?? 100;
                let panning = 100;

                if (nbsversion >= 2) {
                    panning = fileArray.shift() ?? 100;
                }

                for (
                    let currentTick = 0;
                    currentTick < length + 1;
                    currentTick++
                ) {
                    let noteExists = noteExistence[i][currentTick];
                    if (noteExists == true) {
                        let noteVelocity = velocityList[i][currentTick];
                        let notePanning = panningList[i][currentTick];

                        let averageVelocity = noteVelocity * (volume / 100);
                        let averagePanning = (notePanning + panning) / 2;

                        let preFinalPanning = (averagePanning - 100) / 50;

                        // let finalVelocity = new BigDecimal(averageVelocity).setScale(3, BigDecimal.ROUND_FLOOR).stripTrailingZeros().toPlainString();
                        let finalVelocity = averageVelocity + "";
                        // let finalPanning = new BigDecimal(preFinalPanning).setScale(3, BigDecimal.ROUND_FLOOR).stripTrailingZeros().toPlainString();
                        let finalPanning = preFinalPanning + "";
                        let finalString;
                        if (isNaN(preFinalPanning)) {
                            finalString = "," + finalVelocity;
                        } else {
                            finalString =
                                "," + finalVelocity + "," + finalPanning;
                        }
                        addStringList[i][currentTick] = finalString;
                    }
                }

                // let finalLayerVolume = new BigDecimal(volume).setScale(3, BigDecimal.ROUND_FLOOR).stripTrailingZeros().toPlainString();
                let finalLayerVolume = volume + "";
                // let finalLayerPanning = new BigDecimal(panning).setScale(3, BigDecimal.ROUND_FLOOR).stripTrailingZeros().toPlainString();
                let finalLayerPanning = panning + "";
                layerStringBuilder =
                    layerStringBuilder +
                    "=" +
                    finalLayerVolume +
                    "," +
                    finalLayerPanning;
            }
            let customInstruments = 0;
            customInstruments = fileArray.shift() ?? 0;
            let customInstrumentNames = new Array(customInstruments);
            let customPitchList = new Array(customInstruments);
            if (customInstruments >= 1) {
                for (let i = 0; i < customInstruments; i++) {
                    /*let instrumentOffset =
                        vanillaInstruments + customInstruments;*/
                    let instrumentPitch = 0;

                    customInstrumentNames[i] = readString(); //Instrument name
                    readString(); //Sound file

                    instrumentPitch = fileArray.shift() ?? 0; //Sound pitch

                    customPitchList[i] = instrumentPitch;

                    fileArray.shift(); //Press key
                }
            }

            for (let currentTick = 0; currentTick < length + 1; currentTick++) {
                let columnExists = columnExistence[currentTick];
                if (columnExists == true) {
                    let columnStringBuilder = "";
                    if (!firstNoted) {
                        columnStringBuilder =
                            columnStringBuilder + (currentTick + 1);
                        firstNoted = true;
                    } else {
                        columnStringBuilder =
                            columnStringBuilder + "=" + (currentTick + 1);
                    }
                    let firstAppend = true;
                    for (let i = 0; i < layers; i++) {
                        let noteExists = noteExistence[i][currentTick];
                        if (noteExists == true) {
                            let laterNoteString = addStringList[i][currentTick];

                            let noteInstrument = instrumentList[i][currentTick];
                            let noteKey = pitchList[i][currentTick];
                            let noteFinePitch = finepitchList[i][currentTick];
                            let noteKeyOffset = 0;

                            if (noteInstrument >= vanillaInstruments) {
                                let instrumentId =
                                    noteInstrument - vanillaInstruments;
                                noteKeyOffset =
                                    customPitchList[instrumentId] - 45;
                            }
                            if (firstAppend) {
                                columnStringBuilder =
                                    columnStringBuilder +
                                    ":" +
                                    (noteInstrument + 1) +
                                    "," +
                                    Math.floor(
                                        getMinecraftPitch(
                                            noteKey + noteFinePitch / 100,
                                            noteKeyOffset,
                                        ),
                                    ) +
                                    laterNoteString;
                                firstAppend = false;
                            } else {
                                columnStringBuilder =
                                    columnStringBuilder +
                                    ";" +
                                    (noteInstrument + 1) +
                                    "," +
                                    Math.floor(
                                        getMinecraftPitch(
                                            noteKey + noteFinePitch / 100,
                                            noteKeyOffset,
                                        ),
                                    ) +
                                    laterNoteString;
                            }
                        }
                    }
                    stringBuilder = stringBuilder + columnStringBuilder;
                }
            }

            console.log(
                `Resulting data: \nTitle: ${title}\nAuthor: ${author}\nDescription: ${description}\nSpeed: ${speed}\nLength: ${length + timeSignature}\nNotes: ${stringBuilder}\nFilename: ${file}\nLayers: ${layerStringBuilder}\nLoop Tick: ${loopTick + 1}\nLoop Count: ${loopCount}\nThere are ${customInstruments} custom instruments: ${customInstrumentNames}`,
            );
            let customInstrumentNbtStr = "";

            if (customInstruments > 0) {
                customInstrumentNbtStr =
                    ',"hypercube:instruments":"' +
                    customInstrumentNames.join("=") +
                    '"';
            }

            // let splitNoteArray = stringBuilder.match(/.{1,2500}=|.{1,2500}$/g);

            // let noteNBTTags = `"hypercube:notestrings":"${splitNoteArray.length}"`;
            // for(let i=0; i < splitNoteArray.length; i++){
            //   noteNBTTags = noteNBTTags + `,"hypercube:notes${i+1}":"`+splitNoteArray[i].substring(0,splitNoteArray[i].length-1)+`"`;
            // }

            let noteNBTTags = stringBuilder;
            console.log(noteNBTTags);
            var SONG_PARSER_VERSION = "4";
            var SONG_NBS_FORMAT_VERSION = "4";
            var version =
                "v" + SONG_PARSER_VERSION + "-nbs" + SONG_NBS_FORMAT_VERSION;

            var songData = noteNBTTags.split("=");
            var currentNotes = "";
            var templateCode = "";
            var currentBlock = "";
            var instList = "";

            if (title.length == 0) {
                if (file.indexOf(".") > 0) {
                    title = file.substring(0, file.lastIndexOf("."));
                } else {
                    title = file;
                }
            }
            if (author.length == 0) author = "N/A";

            templateCode =
                templateCode +
                `{\"id\":\"block\",\"block\":\"func\",\"args\":{\"items\":[{\"slot\": 0, \"item\":{\"id\":\"item\",\"data\":{\"item\":\"{DF_NBT:3955,components:{\\"!minecraft:jukebox_playable\\":{},\\"minecraft:custom_name\\":'{\\"extra\\":[{\\"color\\":\\"light_purple\\",\\"extra\\":[\\"SONG \\",{\\"color\\":\\"gray\\",\\"extra\\":[\\"» \\",{\\"color\\":\\"white\\",\\"text\\":\\"${title}\\"}],\\"text\\":\\"\\"}],\\"text\\":\\"\\"}],\\"italic\\":false,\\"text\\":\\"\\"}'},count:1,id:\\"minecraft:music_disc_5\\"}\"}}},{\"item\":{\"id\":\"bl_tag\",\"data\":{\"option\":\"False\",\"tag\":\"Is Hidden\",\"action\":\"dynamic\",\"block\":\"func\"}},\"slot\":26}]},\"data\":\"${title}\"},`;
            var slot = 1;
            var chestCount = 1;
            var chestInited = false;
            var noteCount = 0;
            var finalNote = false;
            var totalSongLength = songData.length;

            for (let i = 0; i < totalSongLength; i++) {
                var closeChest = false;
                if (slot == 1) {
                    if (!chestInited) {
                        chestInited = true;
                        currentBlock =
                            currentBlock +
                            '{"id":"block","block":"set_var","args":{"items":[{"item":{"id":"var","data":{"name":"notes","scope":"local"}},"slot":0}';
                    }
                }

                if (slot >= 27) {
                    closeChest = true;
                }

                if (!closeChest) {
                    var currentNote = songData[i];
                    var revertString = currentNotes.toString();

                    if (noteCount == 0) {
                        currentNotes = currentNotes + currentNote;
                    } else {
                        currentNotes = currentNotes + "=" + currentNote;
                    }
                    noteCount++;

                    if (currentNotes.length > 1930) {
                        currentNotes = revertString.toString();
                        currentBlock =
                            currentBlock +
                            `,{\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"${currentNotes}\"}},\"slot\":${slot}}`;
                        // currentNotes.setLength(0);
                        currentNotes = "";
                        noteCount = 0;
                        finalNote = true;
                        i -= 1;
                        slot++;
                    }

                    if (i >= totalSongLength - 1) {
                        if (!finalNote) {
                            currentBlock =
                                currentBlock +
                                `,{\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"${currentNotes}\"}},\"slot\":${slot}}`;
                            // currentNotes.setLength(0);
                            currentNotes = "";
                        }
                        closeChest = true;
                    }
                    finalNote = false;
                }
                if (closeChest) {
                    var varActionType;
                    if (chestCount == 1) {
                        varActionType = "CreateList";
                    } else {
                        varActionType = "AppendValue";
                    }

                    currentBlock =
                        currentBlock + `]},\"action\":\"${varActionType}\"},`;
                    templateCode = templateCode + currentBlock;
                    currentBlock = "";
                    currentNotes = "";

                    chestInited = false;
                    noteCount = 0;
                    finalNote = false;
                    chestCount++;
                    slot = 1;
                }
            }

            if (customInstruments == 0) {
                templateCode =
                    templateCode +
                    '{"id":"block","block":"set_var","args":{"items":[{"item":{"id":"var","data":{"name":"instrumentNames","scope":"local"}},"slot":0},{"item":{"id":"txt","data":{"name":"Harp"}},"slot":1},{"item":{"id":"txt","data":{"name":"Bass"}},"slot":2},{"item":{"id":"txt","data":{"name":"Bass Drum"}},"slot":3},{"item":{"id":"txt","data":{"name":"Snare Drum"}},"slot":4},{"item":{"id":"txt","data":{"name":"Click"}},"slot":5},{"item":{"id":"txt","data":{"name":"Guitar"}},"slot":6},{"item":{"id":"txt","data":{"name":"Flute"}},"slot":7},{"item":{"id":"txt","data":{"name":"Bell"}},"slot":8},{"item":{"id":"txt","data":{"name":"Chime"}},"slot":9},{"item":{"id":"txt","data":{"name":"Xylophone"}},"slot":10},{"item":{"id":"txt","data":{"name":"Iron Xylophone"}},"slot":11},{"item":{"id":"txt","data":{"name":"Cow Bell"}},"slot":12},{"item":{"id":"txt","data":{"name":"Didgeridoo"}},"slot":13},{"item":{"id":"txt","data":{"name":"Bit"}},"slot":14},{"item":{"id":"txt","data":{"name":"Banjo"}},"slot":15},{"item":{"id":"txt","data":{"name":"Pling"}},"slot":16}]},"action":"CreateList"},';
            } else {
                instList =
                    instList +
                    '{"id":"block","block":"set_var","args":{"items":[{"item":{"id":"var","data":{"name":"instrumentNames","scope":"local"}},"slot":0},{"item":{"id":"txt","data":{"name":"Harp"}},"slot":1},{"item":{"id":"txt","data":{"name":"Bass"}},"slot":2},{"item":{"id":"txt","data":{"name":"Bass Drum"}},"slot":3},{"item":{"id":"txt","data":{"name":"Snare Drum"}},"slot":4},{"item":{"id":"txt","data":{"name":"Click"}},"slot":5},{"item":{"id":"txt","data":{"name":"Guitar"}},"slot":6},{"item":{"id":"txt","data":{"name":"Flute"}},"slot":7},{"item":{"id":"txt","data":{"name":"Bell"}},"slot":8},{"item":{"id":"txt","data":{"name":"Chime"}},"slot":9},{"item":{"id":"txt","data":{"name":"Xylophone"}},"slot":10},{"item":{"id":"txt","data":{"name":"Iron Xylophone"}},"slot":11},{"item":{"id":"txt","data":{"name":"Cow Bell"}},"slot":12},{"item":{"id":"txt","data":{"name":"Didgeridoo"}},"slot":13},{"item":{"id":"txt","data":{"name":"Bit"}},"slot":14},{"item":{"id":"txt","data":{"name":"Banjo"}},"slot":15},{"item":{"id":"txt","data":{"name":"Pling"}},"slot":16},';

                var currentSlot;

                currentSlot = 17;
                for (
                    var currentInstID = 1;
                    currentInstID <= customInstruments;
                    currentInstID++
                ) {
                    if (currentInstID == customInstruments) {
                        instList =
                            instList +
                            `{\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"` +
                            customInstrumentNames[currentInstID - 1] +
                            `\"}},\"slot\":${currentSlot}}`;
                    } else {
                        instList =
                            instList +
                            `{\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"` +
                            customInstrumentNames[currentInstID - 1] +
                            `\"}},\"slot\":${currentSlot}},`;
                    }
                    currentSlot++;
                }
                instList = instList + ']},"action":"CreateList"},';
                templateCode = templateCode + instList;
            }

            //CreateList: songData
            templateCode =
                '{"blocks": [' +
                templateCode +
                `{\"id\":\"block\",\"block\":\"set_var\",\"args\":{\"items\":[{\"item\":{\"id\":\"var\",\"data\":{\"name\":\"songData\",\"scope\":\"local\"}},\"slot\":0},{\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"${title}\"}},\"slot\":1},{\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"${author}\"}},\"slot\":2},{\"item\":{\"id\":\"num\",\"data\":{\"name\":\"${speed}\"}},\"slot\":3}, {\"item\":{\"id\":\"num\",\"data\":{\"name\":\"${length + timeSignature + 1}\"}},\"slot\":4}, {\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"${layerStringBuilder}\"}},\"slot\":5}, {\"item\":{\"id\":\"txt\",\"data\":{\"name\":\"${version}\"}},\"slot\":6},{\"item\":{\"id\":\"num\",\"data\":{\"name\":\"${loopTick + 1}\"}},\"slot\":7},{\"item\":{\"id\":\"num\",\"data\":{\"name\":\"${loopCount}\"}},\"slot\":8}]},\"action\":\"CreateList\"}` +
                "]}";

            compress(templateCode).then((finalCode) => {
                console.log(finalCode);
                sendToSocket(
                    `give {components:{"minecraft:custom_data":{PublicBukkitValues:{"hypercube:codetemplatedata":'{"author":"Red DF Website","name":"&dSONG &7» &f${title}","version":1,"code":"${finalCode}"}'}},"minecraft:custom_name":'{"extra":[{"color":"light_purple","text":"SONG"}," ",{"color":"gray","text":"»"}," ",{"color":"white","text":"${title}"},""],"italic":false,"text":""}'},count:1,id:"minecraft:note_block"}`,
                    "Woohoo! Your template has been sent to CodeClient!"
                );
            });
        };
        fr.readAsArrayBuffer(nbsElement.files[0]);
    }

    //gzip stuff

    const compress = (string: string) => {
        const blobToBase64 = (blob: Blob) =>
            new Promise((resolve, _) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        if (typeof reader.result === 'string') {
                            resolve(reader.result.split(",")[1]);
                        } else {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                };
                reader.readAsDataURL(blob);
            });
        const byteArray = new TextEncoder().encode(string);
        const cs = new CompressionStream("gzip");
        const writer = cs.writable.getWriter();
        writer.write(byteArray);
        writer.close();
        return new Response(cs.readable).blob().then(blobToBase64);
    };

    // function decompressCode(code){
    //   var strData = atob(code);
    //   var charData = strData.split('').map(function(x){return x.charCodeAt(0);});
    //   var binData = new Uint8Array(charData);
    //   var data = pako.inflate(binData);
    //   var strData = String.fromCharCode.apply(null, new Uint16Array(data));

    //   return JSON.parse(strData);
    // }

    function giveNbsPlayer() {
        var nbsPlayerCode =
            "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";
        sendToSocket(
            `give {components:{"minecraft:custom_data":{PublicBukkitValues:{"hypercube:codetemplatedata":'{"author":"Red DF Website","name":"&5» &dMusic Player","version":1,"code":"${nbsPlayerCode}"}'}},"minecraft:custom_name":'{"extra":[{"color":"dark_purple","text":"»"}," ",{"color":"light_purple","text":"Music Player"},""],"italic":false,"text":""}',"minecraft:enchantment_glint_override":1b},count:1,id:"minecraft:note_block"}`,
            "Music Player has been sent to CodeClient!"
        );
    }
</script>

<DefaultPage pageName="NBS Importer" subtitle="Import NBS files to DiamondFire">
    <div class="flex flex-col gap-6">
        <div class="flex gap-5">
            <Input accept=".nbs" id="nbs" multiple={false} type="file"/>
            <Button on:click={() => {receivedNbs();}}>
                Send
            </Button>
        </div>
        <Button on:click={() => {giveNbsPlayer(); }} variant="secondary">
            Send Note Block Player
        </Button>
    </div>
    <WarningCard message="This page processes your NBS file locally. Your data is not sent to any server."
                 title="Local Processing"/>
</DefaultPage>
