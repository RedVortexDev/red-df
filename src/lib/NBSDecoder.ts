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

type NBSArray = number[];
type BiArray<T> = T[][];

class NBSDecoder {
    static parse(fileArray: NBSArray, fileName: string, isCustom: boolean = false): SongData {
        let title: string;
        let author: string;
        let speed: number;
        let actualSpeed: number;
        let timeSignature: number;
        let loopTick: number = 0;
        let loopCount: number = 0;
        let vanillaInstruments: number = 9;

        let stringBuilder: string = "";
        let layerStringBuilder: string = "";

        let length: number = this.readShort(fileArray);
        let nbsVersion: number = 0;

        if (length === 0) {
            nbsVersion = fileArray.shift() ?? 0;
            vanillaInstruments = fileArray.shift() ?? 0;
            if (nbsVersion >= 3) {
                length = this.readShort(fileArray);
            } else if (nbsVersion === 1 || nbsVersion === 2) {
                throw new Error("Outdated NBS version");
            }
        }

        const layers: number = this.readShort(fileArray);
        title = this.readString(fileArray);
        title = title.length === 0 ? fileName.split('.')[0] : title;
        title = title.replace("'", "\\'");
        author = this.readString(fileArray);
        this.readString(fileArray); // original author
        this.readString(fileArray); // description
        actualSpeed = this.readShort(fileArray);
        speed = actualSpeed / 100;
        fileArray.shift(); // autosave boolean
        fileArray.shift(); // autosave duration
        timeSignature = fileArray.shift() ?? 0;
        this.readInt(fileArray); // minutes spent
        this.readInt(fileArray); // left clicks
        this.readInt(fileArray); // right clicks
        this.readInt(fileArray); // blocks added
        this.readInt(fileArray); // blocks removed
        this.readString(fileArray); // mid/schematic filename

        if (nbsVersion >= 4) {
            fileArray.shift(); // loop on/off
            loopCount = fileArray.shift() ?? 0;
            loopTick = this.readShort(fileArray);
        }

        let tick: number = -1;
        const addStringList: BiArray<string | null> = this.newBiArray<string | null>(layers, length + 1);
        const instrumentList: BiArray<number> = this.newBiArray<number>(layers, length + 1, 0);
        const pitchList: BiArray<number> = this.newBiArray<number>(layers, length + 1, 0);
        const finepitchList: BiArray<number> = this.newBiArray<number>(layers, length + 1, 0);
        const velocityList: BiArray<number> = this.newBiArray<number>(layers, length + 1, 0);
        const panningList: BiArray<number> = this.newBiArray<number>(layers, length + 1, 0);
        const columnExistence: boolean[] = new Array(length + 1).fill(false);
        const noteExistence: BiArray<boolean> = this.newBiArray<boolean>(layers, length + 1, false);
        let firstNoted: boolean = false;

        // Read notes
        while (true) {
            const t: number = this.readShort(fileArray);
            if (t === 0) break;

            tick += t;
            columnExistence[tick] = true;

            let layer: number = -1;
            while (true) {
                const jumpLayers: number = this.readShort(fileArray);
                if (jumpLayers === 0) break;

                layer += jumpLayers;
                const instrument: number = fileArray.shift() ?? 0;
                const note: number = fileArray.shift() ?? 0;
                let velocity: number = 100;
                let panning: number = 100;
                let finepitch: number = 0;

                if (nbsVersion >= 4) {
                    velocity = fileArray.shift() ?? 100;
                    panning = fileArray.shift() ?? 100;
                    finepitch = this.readShort(fileArray);
                }

                instrumentList[layer][tick] = instrument;
                pitchList[layer][tick] = note;
                finepitchList[layer][tick] = finepitch;
                velocityList[layer][tick] = velocity;
                panningList[layer][tick] = panning;
                noteExistence[layer][tick] = true;
            }
        }

        // Read layer data
        for (let i = 0; i < layers; i++) {
            this.readString(fileArray); // layer name

            if (nbsVersion >= 4) {
                fileArray.shift();
            }

            const volume: number = fileArray.shift() ?? 0;
            let panning: number = 100;

            if (nbsVersion >= 2) {
                panning = fileArray.shift() ?? 100;
            }

            for (let currentTick = 0; currentTick <= length; currentTick++) {
                if (noteExistence[i][currentTick]) {
                    const noteVelocity: number = velocityList[i][currentTick];
                    const notePanning: number = panningList[i][currentTick];

                    const averageVelocity: number = noteVelocity * (volume / 100);
                    const averagePanning: number = (notePanning + panning) / 2;
                    const preFinalPanning: number = (averagePanning - 100) / 50;

                    const finalVelocity: string = averageVelocity.toFixed(3).replace(/\.?0+$/, '');
                    const finalPanning: string = preFinalPanning.toFixed(3).replace(/\.?0+$/, '');

                    addStringList[i][currentTick] = preFinalPanning === 0
                        ? `,${finalVelocity}`
                        : `,${finalVelocity},${finalPanning}`;
                }
            }

            const finalLayerVolume: string = volume.toFixed(3).replace(/\.?0+$/, '');
            const finalLayerPanning: string = panning.toFixed(3).replace(/\.?0+$/, '');
            layerStringBuilder += `=${finalLayerVolume},${finalLayerPanning}`;
        }

        // Read custom instruments
        const customInstruments: number = fileArray.shift() ?? 0;
        const customPitchList: number[] = new Array(customInstruments).fill(0);
        const customNameList: string[] = new Array(customInstruments).fill('');

        if (customInstruments >= 1) {
            for (let i = 0; i < customInstruments; i++) {
                customNameList[i] = this.readString(fileArray); // Instrument name
                this.readString(fileArray); // Sound file
                customPitchList[i] = fileArray.shift() ?? 0; // Sound pitch
                fileArray.shift(); // Press key
            }
        }

        // Build final string
        for (let currentTick = 0; currentTick <= length; currentTick++) {
            if (columnExistence[currentTick]) {
                let columnString: string = '';

                if (!firstNoted) {
                    columnString = (currentTick + 1).toString();
                    firstNoted = true;
                } else {
                    columnString = `=${currentTick + 1}`;
                }

                let firstAppend: boolean = true;
                for (let i = 0; i < layers; i++) {
                    if (noteExistence[i][currentTick]) {
                        const laterNoteString: string = addStringList[i][currentTick] ?? '';
                        const noteInstrument: number = instrumentList[i][currentTick];
                        const noteKey: number = pitchList[i][currentTick];
                        const noteFinePitch: number = finepitchList[i][currentTick];
                        let noteKeyOffset: number = 0;

                        if (noteInstrument >= vanillaInstruments) {
                            const instrumentId: number = noteInstrument - vanillaInstruments;
                            noteKeyOffset = customPitchList[instrumentId] - 45;
                        }

                        const pitch: number = this.getMinecraftPitch(
                            noteKey + noteFinePitch / 100,
                            noteKeyOffset,
                            isCustom
                        );

                        if (firstAppend) {
                            columnString += `:${noteInstrument + 1},${pitch}${laterNoteString}`;
                            firstAppend = false;
                        } else {
                            columnString += `;${noteInstrument + 1},${pitch}${laterNoteString}`;
                        }
                    }
                }
                stringBuilder += columnString;
            }
        }

        return {
            title,
            author,
            speed,
            length: Math.ceil((length + 1) / (4 * timeSignature)) * (4 * timeSignature),
            notes: stringBuilder,
            layers: layerStringBuilder,
            loopTick: loopTick + 1,
            loopCount,
            customInstruments,
            customNameList
        };
    }

    static newBiArray<T>(dim1: number, dim2: number, defaultValue?: T): BiArray<T> {
        return Array(dim1).fill(null).map(() => Array(dim2).fill(defaultValue ?? null));
    }

    static readShort(fileArray: NBSArray): number {
        const byte1: number = fileArray.shift() ?? 0;
        const byte2: number = fileArray.shift() ?? 0;
        return byte1 + (byte2 << 8);
    }

    static readInt(fileArray: NBSArray): number {
        const byte1: number = fileArray.shift() ?? 0;
        const byte2: number = fileArray.shift() ?? 0;
        const byte3: number = fileArray.shift() ?? 0;
        const byte4: number = fileArray.shift() ?? 0;
        return byte1 + (byte2 << 8) + (byte3 << 16) + (byte4 << 24);
    }

    static readString(fileArray: NBSArray): string {
        const length: number = this.readInt(fileArray);
        let result: string = '';
        for (let i = 0; i < length; i++) {
            let c: string = String.fromCharCode(fileArray.shift() ?? 0);
            if (c === '\r') c = ' ';
            result += c;
        }
        return result;
    }

    static getMinecraftPitch(key: number, offset: number, isCustom: boolean): number {
        if (!isCustom) {
            if (key < 33) key -= 9;
            else if (key > 57) key -= 57;
            else key -= 33;

            key += offset;
            return (0.5 * Math.pow(2, key / 12)) * 1000;
        }
        return key * 1000;
    }
}

export default NBSDecoder;