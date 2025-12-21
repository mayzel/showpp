export interface Channel {
    id: string;
    name: string;
}

export interface Event {
    channel: string; // id of the channel
    type: 'pulse' | 'gradient' | 'delay' | 'fid';
    label: string;
    time: number; // start time
    duration: number;
}

export interface Annotation {
    label: string;
    time: number;
}

export interface NeutralModel {
    channels: Channel[];
    events: Event[];
    annotations: Annotation[];
    totalDuration: number;
}

export function parsePulseProgram(content: string): NeutralModel {
    // For now, return hardcoded data that looks like the target image.
    // In the future, this function will parse the `content` string.
    
    // This is a rough approximation of the screenshot for now.
    // Timings are arbitrary.
    const model: NeutralModel = {
        channels: [
            { id: 'f1', name: 'F1' },
            { id: 'f2', name: 'F2' },
            { id: 'gp', name: 'Z' }
        ],
        events: [
            // F1 channel
            { channel: 'f1', type: 'delay', label: '30m', time: 10, duration: 30 },
            { channel: 'f1', type: 'delay', label: 'D1', time: 40, duration: 50 },
            { channel: 'f1', type: 'delay', label: '4u', time: 90, duration: 4 },
            { channel: 'f1', type: 'delay', label: '4u', time: 94, duration: 4 },
            { channel: 'f1', type: 'delay', label: 'D16', time: 98, duration: 20 },
            { channel: 'f1', type: 'pulse', label: 'P0 ph1', time: 118, duration: 10 },
            { channel: 'f1', type: 'delay', label: 'D0', time: 128, duration: 3 },
            { channel: 'f1', type: 'delay', label: 'DELTA', time: 131, duration: 40 },
            { channel: 'f1', type: 'fid', label: 'FID', time: 171, duration: 50 },
            { channel: 'f1', type: 'delay', label: '30m', time: 221, duration: 30 },
            { channel: 'f1', type: 'delay', label: '4u', time: 251, duration: 4 },

            // F2 channel
            { channel: 'f2', type: 'pulse', label: 'P3 ph1', time: 140, duration: 10 },

            // Z (gradient) channel
            { channel: 'gp', type: 'gradient', label: 'P16:G1', time: 100, duration: 15 }
        ],
        annotations: [
            { label: 'ZE', time: 0 },
            { label: 'PLW 1', time: 50},
            { label: 'Go', time: 125},
            { label: 'MC', time: 230},
            { label: 'BLK', time: 10},
            { label: 'UNBLK', time: 80},
            { label: 'BLK', time: 240}
        ],
        totalDuration: 260
    };

    return model;
}
