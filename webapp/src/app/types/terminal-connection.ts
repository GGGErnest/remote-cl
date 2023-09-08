import { Observable } from "rxjs";

export interface TerminalConnection {
    output: Observable<string | undefined>;
    input: (input:string) => void;
    destroy(): void;
    resize(rows:number, cols:number, height: number, width: number):void;
}