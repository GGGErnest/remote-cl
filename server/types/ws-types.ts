export type WSMessageTypes = 'Output' | 'Prompt' | 'Shell' | "Input";

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

export interface WSPromptMessage extends WSMessage {
    type: 'Prompt';
    prompt: string;
    shellError?: string;
    serverError?: string;
}

export interface WSShellMessage extends WSMessage {
    type: 'Shell';
    state: string;
    shellId: string;
}