export type WSMessageTypes = 'Output' | 'Prompt' | 'Shell';

export interface WSMessage {
    type:WSMessageTypes;
    threadId: string;
}

export interface WSOutMessage extends WSMessage {
    type: 'Output';
    output?: string;
    shellError?: string;
    serverError?: string;
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