export type WSMessageTypes = 'Output';

export interface WSMessage {
    type:WSMessageTypes;
}

export interface WSOutMessage extends WSMessage {
    type: 'Output';
    threadId: string;
    output?: string;
    shellError?: string;
    serverError?: string;
}