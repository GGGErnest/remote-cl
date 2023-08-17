import {
  Component,
  OnInit,
  OnDestroy,
  ContentChild,
  AfterViewInit,
  AfterContentInit,
  TemplateRef,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommandService } from '../../services/command.service';
import { ThreadService } from '../../services/thread.service';
import { deserializeMap, serializeMap } from '../../utils/serializers';
import { NgTerminal } from 'ng-terminal';
class CommandHistoryHandler {
  private localStorageKey = 'commandHistory';
  private commandsHistory = new Map<string, string[]>();

  constructor() {
    // restoring the history from the localstorage
    const commandsHistory = localStorage.getItem(this.localStorageKey);
    if (commandsHistory) {
      this.commandsHistory = deserializeMap(commandsHistory);
    }
  }

  public addCommand(shellId: string, command: string) {
    const commandHistory = this.commandsHistory.get(shellId);
    if (commandHistory) {
      if (commandHistory.find((item) => command === item)) {
        return;
      }
      commandHistory.push(command);
      localStorage.setItem(
        this.localStorageKey,
        serializeMap(this.commandsHistory)
      );
      return;
    }

    this.commandsHistory.set(shellId, [command]);
  }

  public getCommands(shellId: string): string[] {
    return Array.from(this.commandsHistory.get(shellId)??[]);
  }
  public getShellIDs(): string[] | undefined {
    return Array.from(this.commandsHistory.keys());
  }

  public hasShell(shellID: string) {
    return this.commandsHistory.has(shellID);
  }

  public removeShell(shellID: string) {
    return this.commandsHistory.delete(shellID);
  }
}

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss'],
})
export class CommandComponent implements OnInit, OnDestroy, AfterViewInit {
  selectedShell? = '';
  newShellName = '';
  commandsHistoryHandler = new CommandHistoryHandler();
  outputHistory: string[] = [];
  commandHistory: string[] = [];
  command = '';
  threads$ = this.threadService.threads$;
  @ViewChild('term',{ static: true }) term!: NgTerminal;

  constructor(
    private commandService: CommandService,
    private threadService: ThreadService
  ) {}

  executeCommand() {
    const shellId = this.selectedShell ?? this.newShellName;
    this.commandService.executeCommand(this.command, shellId).subscribe({
      next: (response) => {
        // Set as active shell the newly added shell
        this.threadService.updateThread(response.threadId, this.command);
        this.threadService.setActiveThread(response.threadId);

        this.commandsHistoryHandler.addCommand(
          response.threadId,
          response.command
        );
        this.commandHistory = this.commandsHistoryHandler.getCommands(
          response.threadId
        );
        this.command = '';
      },
    });
  }

  removeSelectedShell(event: Event) {
    if(this.selectedShell){
      this.threadService.deleteThread(this.selectedShell).subscribe();
    }
    
    event.stopImmediatePropagation();
  }

  private restoreTerminal() {
    this.term.underlying?.clear();
    this.outputHistory.forEach(command => {
        this.term?.write(command);
    });
  }

  ngOnInit(): void {
    this.threadService.activeThread$.subscribe({
      next: (shellId) => {
        this.selectedShell = shellId;
        if(this.selectedShell){
          this.commandHistory = this.commandsHistoryHandler.getCommands(
            this.selectedShell
          );
         this.outputHistory = this.threadService.getOutputs(this.selectedShell);
         this.restoreTerminal()
        } else {
          this.commandHistory = [];
          this.outputHistory = [];
        }
      },
    });

    this.threadService.getAllThreads().subscribe();

  }

  ngOnDestroy(): void {}

  changeSelectedShell(selectedValue: string | undefined) {
      this.threadService.setActiveThread(selectedValue);
  }

  onTerminalKey(event:Event ): void {
    console.log('keyboard event:' + event.keyCode + ', ' + event.key);

      const printable = !event.altKey && !event.ctrlKey && !event.metaKey;

      if (event.keyCode === 13) {
        this.term.write('\r\n$ ');
      } else if (event.keyCode === 8) {
        // Do not delete the prompt
        if ((this.term.underlying?.buffer as any).cursorX > 2) {
          this.term.write('\b \b');
        }
      } else if (printable) {
        this.term.write(event.key);
      }
  }

  private initTerminal() {
    
  }

  ngAfterViewInit(): void {
    this.threadService.activeThreadOutput$.subscribe((output) => {
      this.term?.write(output);
    });
    this.initTerminal()
  }
}
