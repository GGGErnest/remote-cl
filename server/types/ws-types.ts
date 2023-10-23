export type WSMessageTypes = 'Output' | 'Prompt' | 'Shell' | "Input" | 'TerminalResize' | 'AuthError';

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

export interface WSAuthErrorMessage extends WSMessage {
    type: 'AuthError';
    output: string;
}

export interface WSInputMessage extends WSMessage {
    type: 'Input';
    message: string;
    accessToken: string;
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