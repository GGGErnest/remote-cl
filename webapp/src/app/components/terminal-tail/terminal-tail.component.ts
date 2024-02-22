import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgTerminalComponent } from 'ng-terminal';
import { TerminalConnectionManagerService } from 'src/app/services/shells-connection-manager.service';
import { TerminalsService } from 'src/app/services/terminals.service';
import { TerminalConnection } from 'src/app/types/terminal-connection';
import { ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SerializeAddon } from 'xterm-addon-serialize';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { WebglAddon } from 'xterm-addon-webgl';

@Component({
  selector: 'app-terminal-tail',
  templateUrl: './terminal-tail.component.html',
  styleUrls: ['./terminal-tail.component.scss']
})
export class TerminalTailComponent implements OnInit, AfterViewInit {
  private _unicode11 = new Unicode11Addon();
  private _serializeAddon = new SerializeAddon();
  private _searchAddon = new SearchAddon();
  private _fitAddon = new FitAddon();
  private _terminalConnection?: TerminalConnection;

  @Input() terminalId:string = '';

  @ViewChild(NgTerminalComponent) terminal!: NgTerminalComponent;
  terminalOptions: ITerminalOptions = {cursorBlink: true, allowProposedApi:true, macOptionClickForcesSelection:true,macOptionIsMeta:true};

  constructor(private _terminalConnectionManagerService: TerminalConnectionManagerService,
    private _terminalsService:  TerminalsService) {

  }

  initTerminal() {
   
    this._terminalConnection =
      this._terminalConnectionManagerService.getConnection(this.terminalId);
      this.terminal.onData().subscribe((input) => this._terminalConnection?.input(input));
    this.terminal.underlying?.loadAddon(this._fitAddon);
    this.terminal.underlying?.loadAddon(this._unicode11);
    this.terminal.underlying?.loadAddon(this._serializeAddon);
    this.terminal.underlying?.loadAddon(this._searchAddon);


    

      if(this._terminalConnection) {
        this._terminalsService.getTerminalHistory(this.terminalId).subscribe((response) => {
          const terminalHistory = response.result;

          terminalHistory.forEach(message=> {
            this.terminal.write(message);
            this._fitAddon.fit();
          })
          
          this._terminalConnection!.output.subscribe({next:(output)=> {
            if(output){
              this.terminal.write(output);
            }
          }, complete:()=> {
            this.terminal.underlying?.textarea?.setAttribute('disabled', 'true');
          }})
        });
      }
  }

  open() {

  }

  stop() {
    
  }

  ngOnInit(): void {
      
  }

  ngAfterViewInit(): void {
    this.initTerminal();
  }
}
