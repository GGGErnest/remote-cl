import { ITerminalInitOnlyOptions, ITerminalOptions, Terminal as XTermGTerminal } from 'xterm';

export class Terminal extends XTermGTerminal {

    constructor(options?: ITerminalOptions & ITerminalInitOnlyOptions){
        super(options);
    }

    public prompt(): void {
        this.write('\r\n$ ');
    }
}