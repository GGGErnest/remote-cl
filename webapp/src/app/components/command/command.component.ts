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
import { ShellsService } from '../../services/shells.service';
import { deserializeMap, serializeMap } from '../../utils/serializers';
import { NgTerminal } from 'ng-terminal';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { AttachAddon } from 'xterm-addon-attach';
import { WebglAddon } from 'xterm-addon-webgl';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { ImageAddon } from 'xterm-addon-image';
import { SerializeAddon } from 'xterm-addon-serialize';
import { AddonType, AddonWrapper, UsedAddons } from 'src/app/types/terminal-types';


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

  private addons: { [T in UsedAddons]?: AddonWrapper <UsedAddons> } = {};

  constructor(
    private commandService: CommandService,
    private threadService: ShellsService
  ) {}

  executeCommand() {
    const shellId = this.selectedShell ?? this.newShellName;
    this.commandService.executeCommand(this.command, shellId).subscribe({
      next: (response) => {
        // Set as active shell the newly added shell
        this.threadService.updateThread(response.threadId, this.command);
        this.threadService.setActiveShell(response.threadId);

        this.commandsHistoryHandler.addCommand(
          response.threadId,
          response.command
        );
        this.commandHistory = this.commandsHistoryHandler.getCommands(
          response.threadId
        );
        this.command = '';
        this.term.write('\r\n$ ');
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
      this.threadService.setActiveShell(selectedValue);
  }

  onTerminalKey(terminalEvent:{ key: string, domEvent: KeyboardEvent } ): void {
    const { domEvent:event ,key} = terminalEvent;
    console.log('keyboard event:' + event.code + ', ' + event.key);

      const printable = !event.altKey && !event.ctrlKey && !event.metaKey;
      
      
      if (event.code === '13') {
        this.term.write('\r\n$ ');
      } else if (event.code === 'Backspace') {
        this.term.write('\b \b');
        if (this.command.length > 0) {
         this.command = this.command.substr(0, this.command.length - 1);
        }
      } else if(event.code === 'Enter') {
          this.executeCommand();
      } else if (printable) {
        this.term.write(key);
        this.command+= key;
      }
  }

  private initAddons(): void {
    this.addons = {
      // attach: { name: 'attach', ctor: AttachAddon, canChange: false },
      fit: { name: 'fit', ctor: FitAddon, canChange: false , instance: new FitAddon()},
      image: { name: 'image', ctor: ImageAddon, canChange: true, instance : new ImageAddon() },
      search: { name: 'search', ctor: SearchAddon, canChange: true, instance: new SearchAddon() },
      serialize: { name: 'serialize', ctor: SerializeAddon, canChange: true, instance: new SerializeAddon() },
      'web-links': { name: 'web-links', ctor: WebLinksAddon, canChange: true, instance:new WebLinksAddon() },
      webgl: { name: 'webgl', ctor: WebglAddon, canChange: true, instance: new WebglAddon() },
      unicode11: { name: 'unicode11', ctor: Unicode11Addon, canChange: true, instance: new Unicode11Addon() },
      // ligatures: { name: 'ligatures', ctor: LigaturesAddon, canChange: true, instance: new LigaturesAddon() }
    };

    const term = this.term.underlying!;

    (Object.keys(this.addons) as UsedAddons[]).forEach((name: UsedAddons) => {
      const addon = this.addons[name];
      if (addon && addon.instance) {
        term.loadAddon(addon.instance);
     
        if (name === 'unicode11') {
          term.unicode.activeVersion = '11';
        }
        if (name === 'search') {
          (addon.instance as SearchAddon).onDidChangeResults(event => this.updateFindResults(event));
        }
        
      }
    });
      }
  
 private updateFindResults(e: { resultIndex: number, resultCount: number } | undefined): void {
    let content: string;
    if (e === undefined) {
      content = 'undefined';
    } else {
      content = `index: ${e.resultIndex}, count: ${e.resultCount}`;
    }
    // actionElements.findResults.textContent = content;
  }

  private initTerminal() {
    // loading addons
  //  this.initAddons();
  }

  ngAfterViewInit(): void {
    this.threadService.activeThreadOutput$.subscribe((output) => {
      this.term?.write(output);
    });
    this.initTerminal()
  }
}
