import { Observable } from "rxjs";

export interface TerminalConnection {
    output: Observable<string | undefined>;
    input: (input:string) => void;
    destroy(): void;
}