import pako from 'pako';

interface SongData {
    title: string;
    author: string;
    speed: number;
    length: number;
    notes: string;
    layers: string;
    loopTick: number;
    loopCount: number;
    customInstruments: number;
    customNameList: string[];
}

class NBSToTemplate {
    private static readonly SONG_PARSER_VERSION = "4";
    private static readonly SONG_NBS_FORMAT_VERSION = "4";

    private readonly song: string;
    private readonly filename: string;
    private readonly layers: string;
    private readonly version: string;
    private readonly speed: number;
    private readonly length: number;
    private readonly loopTick: number;
    private readonly loopCount: number;
    private readonly customInstrumentCount: number;
    private readonly customInstrumentNames: string[];
    private name: string;
    private author: string;

    constructor(song: SongData, filename: string = 'Untitled') {
        this.version = `v${NBSToTemplate.SONG_PARSER_VERSION}-nbs${NBSToTemplate.SONG_NBS_FORMAT_VERSION}`;
        this.song = song.notes;
        this.author = song.author;
        this.name = song.title;
        this.filename = filename;
        this.layers = song.layers;
        this.length = song.length;
        this.speed = song.speed;
        this.loopTick = song.loopTick;
        this.loopCount = song.loopCount;
        this.customInstrumentCount = song.customInstruments;
        this.customInstrumentNames = song.customNameList;
    }

    convert(): string {
        const songData = this.song.split("=");
        let currentNotes = "";
        let code = "";
        let currentBlock = "";

        const songTempo = this.speed.toString();
        if (this.name.length === 0) {
            const dotIndex = this.filename.indexOf(".");
            this.name = dotIndex > 0 ? this.filename.substring(0, dotIndex) : this.filename;
        }
        if (this.author.length === 0) this.author = "N/A";

        code = `{"id":"block","block":"func","args":{"items":[{"item":{"id":"bl_tag","data":{"option":"False","tag":"Is Hidden","action":"dynamic","block":"func"}},"slot":26}]},"data":"${this.name}"},`;

        let slot = 1;
        let chestCount = 1;
        let chestInited = false;
        let noteCount = 0;
        let finalNote = false;

        for (let i = 0; i < songData.length; i++) {
            let closeChest = false;
            if (slot === 1 && !chestInited) {
                chestInited = true;
                currentBlock = `{"id":"block","block":"set_var","args":{"items":[{"item":{"id":"var","data":{"name":"notes","scope":"local"}},"slot":0}`;
            }

            if (slot >= 27) {
                closeChest = true;
            }

            if (!closeChest) {
                const currentNote = songData[i];
                const revertString = currentNotes;

                currentNotes = noteCount === 0 ? currentNote : `${currentNotes}=${currentNote}`;
                noteCount++;

                if (currentNotes.length > 1930) {
                    currentNotes = revertString;
                    currentBlock += `,{"item":{"id":"txt","data":{"name":"${currentNotes}"}},"slot":${slot}}`;
                    currentNotes = "";
                    noteCount = 0;
                    finalNote = true;
                    i--;
                    slot++;
                }

                if (i >= songData.length - 1 && !finalNote) {
                    currentBlock += `,{"item":{"id":"txt","data":{"name":"${currentNotes}"}},"slot":${slot}}`;
                    currentNotes = "";
                    closeChest = true;
                }
                finalNote = false;
            }

            if (closeChest) {
                const varActionType = chestCount === 1 ? "CreateList" : "AppendValue";
                currentBlock += `]},"action":"${varActionType}"},`;
                code += currentBlock;
                currentBlock = "";
                currentNotes = "";
                chestInited = false;
                noteCount = 0;
                chestCount++;
                slot = 1;
            }
        }

        // Add instrument names
        code += this.generateInstrumentList();

        // Add song data
        code += `{"id":"block","block":"set_var","args":{"items":[{"item":{"id":"var","data":{"name":"songData","scope":"local"}},"slot":0},` +
            `{"item":{"id":"txt","data":{"name":"${this.name}"}},"slot":1},` +
            `{"item":{"id":"txt","data":{"name":"${this.author}"}},"slot":2},` +
            `{"item":{"id":"num","data":{"name":"${songTempo}"}},"slot":3},` +
            `{"item":{"id":"num","data":{"name":"${this.length}"}},"slot":4},` +
            `{"item":{"id":"txt","data":{"name":"${this.layers}"}},"slot":5},` +
            `{"item":{"id":"txt","data":{"name":"${this.version}"}},"slot":6},` +
            `{"item":{"id":"num","data":{"name":"${this.loopTick}"}},"slot":7},` +
            `{"item":{"id":"num","data":{"name":"${this.loopCount}"}},"slot":8}]},"action":"CreateList"}`;

        return `{"blocks": [${code}]}`;
    }

    private generateInstrumentList(): string {
        const defaultInstruments = [
            "Harp", "Bass", "Bass Drum", "Snare Drum", "Click", "Guitar", "Flute", "Bell",
            "Chime", "Xylophone", "Iron Xylophone", "Cow Bell", "Didgeridoo", "Bit", "Banjo", "Pling"
        ];

        let instrumentCode = `{"id":"block","block":"set_var","args":{"items":[{"item":{"id":"var","data":{"name":"instrumentNames","scope":"local"}},"slot":0}`;

        // Add default instruments
        defaultInstruments.forEach((inst, index) => {
            instrumentCode += `,{"item":{"id":"txt","data":{"name":"${inst}"}},"slot":${index + 1}}`;
        });

        if (this.customInstrumentCount === 0) {
            return instrumentCode + `]},"action":"CreateList"},`;
        }

        let currentSlot = 17;
        let currentFails = 0;
        let placedBlock = false;

        for (let i = 0; i < this.customInstrumentCount; i++) {
            let currentName = this.customInstrumentNames[i];
            if (!currentName?.trim()) {
                currentFails++;
                currentName = `<Custom Instrument ${currentFails}>`;
            }

            if (currentSlot === 27) {
                instrumentCode += `]},"action":"${placedBlock ? "AppendList" : "CreateList"}"},`;
                placedBlock = true;
                currentSlot = 1;
                instrumentCode += `{"id":"block","block":"set_var","args":{"items":[{"item":{"id":"var","data":{"name":"instrumentNames","scope":"local"}},"slot":0}`;
            }

            instrumentCode += `,{"item":{"id":"txt","data":{"name":"${currentName}"}},"slot":${currentSlot}}`;
            currentSlot++;
        }

        return instrumentCode + `]},"action":"${placedBlock ? "AppendList" : "CreateList"}"},`;
    }
}

export const handleNBSFile = (songData: SongData, filename: string = 'Untitled'): string => {
    const template = new NBSToTemplate(songData, filename);
    const templateData = template.convert();

    const compressedData = pako.gzip(templateData);
    // @ts-ignore
    const base64Data = btoa(String.fromCharCode.apply(null, compressedData));

    return `give {components:{"minecraft:custom_data":{PublicBukkitValues:{"hypercube:codetemplatedata":'{"author":"Red DF Website","name":"&dSONG &7» &f${songData.title}","version":1,"code":"${base64Data}"}'}},"minecraft:custom_name":'{"extra":[{"color":"light_purple","text":"SONG"}," ",{"color":"gray","text":"»"}," ",{"color":"white","text":"${songData.title}"},""],"italic":false,"text":""}'},count:1,id:"minecraft:note_block"}`;
};