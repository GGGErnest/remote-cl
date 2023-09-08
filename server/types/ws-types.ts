export type WSMessageTypes = 'Output' | 'Prompt' | 'Shell' | "Input" | 'TerminalResize';

export interface WSMessage {
    type:WSMessageTypes;
    terminalId: string;
}

export interface WSOutputMessage extends WSMessage {
    type: 'Output';
    output?: string;
    shellError?: string;
    serverError?: string;
}

export interface WSInputMessage extends WSMessage {
    type: 'Input';
    message: string;
}

export interface WSTerminalResizeMessage extends WSMessage {
    type: 'TerminalResize';
    rows: number;
    cols: number;
    height:number;
    width:number
}

export interface WSShellMessage extends WSMessage {
    type: 'Shell';
    state: string;
    shellId: string;
}