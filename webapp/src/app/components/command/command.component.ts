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
} from '@angular/core';
import { CommandService } from '../../services/command.service';
import { ThreadService } from '../../services/thread.service';
import { tap } from 'rxjs';
import { deserializeMap, serializeMap } from '../../utils/serializers';
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
  selectedShell = '';
  newShellName = '';
  showNewShellInput = false;
  commandsHistoryHandler = new CommandHistoryHandler();
  outputHistory: string[] = [];
  commandHistory: string[] = [];
  activeThread = '';
  command = '';
  threads$ = this.threadService.threads$;
  @ViewChild('commandLineOutput') commandOutputDiv!: ElementRef<HTMLDivElement>;

  constructor(
    private commandService: CommandService,
    private threadService: ThreadService
  ) {}

  executeCommand() {
    const shellId = this.showNewShellInput
      ? this.newShellName
      : this.selectedShell;
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
        this.showNewShellInput = false;
      },
    });
  }

  private scrollUp() {
    setTimeout(
      () =>
        (this.commandOutputDiv.nativeElement.scrollTop =
          this.commandOutputDiv.nativeElement.scrollHeight),
      0
    );
  }

  ngOnInit(): void {
    this.threadService.activeThread$.subscribe({
      next: (shellId) => {
        this.selectedShell = shellId;3
        this.commandHistory = this.commandsHistoryHandler.getCommands(
          this.selectedShell
        );
       this.outputHistory = this.threadService.getOutputs(this.selectedShell);
      },
    });

    this.threadService.getAllThreads().subscribe();
  }

  ngOnDestroy(): void {}

  changeSelectedShell(selectedValue: string | undefined) {
    if (selectedValue) {
      this.showNewShellInput = false;
      this.threadService.setActiveThread(selectedValue);
    } else {
      this.showNewShellInput = true;
      this.outputHistory = [];
      this.selectedShell = '';
      this.commandHistory = [];
    }
  }

  ngAfterViewInit(): void {
    this.threadService.activeThreadOutput$.subscribe((output) => {
      this.outputHistory = [...this.outputHistory, output];
      this.scrollUp();
    });
  }
}
