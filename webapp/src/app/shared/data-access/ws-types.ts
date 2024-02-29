export type WSMessageTypes = 'Output' | 'Input' | 'TerminalResize' | 'AuthError';

export interface WSMessage {
    type:WSMessageTypes;
    terminalId:string;
}

export interface WSAuthErrorMessage extends WSMessage {
    type: 'AuthError';
    output: string;
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
    accessToken:string | null;
}

export interface WSTerminalResizeMessage extends WSMessage {
    type: 'TerminalResize'
    rows: number;
    cols: number;
    height:number;
    width:number
}

export type WSState = 'Disconnected' | 'Connecting' | 'Disconnecting' | 'Connected' | "Reconnecting"