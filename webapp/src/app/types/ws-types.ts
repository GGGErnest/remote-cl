export type WSMessageTypes = 'Output' | 'Input' | 'TerminalResize';

export interface WSMessage {
    type:WSMessageTypes;
    terminalId:string;
}

export interface WSOutMessage extends WSMessage {
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
    type: 'TerminalResize'
    rows: number;
    cols: number;
    height:number;
    width:number
}

export type WSState = 'Disconnected' | 'Connecting' | 'Disconnecting' | 'Connected' | "Reconnecting"