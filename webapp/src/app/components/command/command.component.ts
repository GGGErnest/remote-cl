import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommandService } from '../../services/command.service';
import { ThreadService } from '../../services/thread.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss']
})
export class CommandComponent implements OnInit, OnDestroy {
  threadID = '';
  commandsHistory:string[] = [];
  outputHistory:string[] = [];
  activeThread = '';
  command = '';
  threads$ =this.threadService.threads$;

  constructor(private commandService: CommandService, private threadService: ThreadService) {
      this.threadService.activeThreadOutput$.subscribe(output=> {
        if(Array.isArray(output)) {
          this.outputHistory = output;
        } else {
          this.outputHistory = [...this.outputHistory, output];
        }
      });
    }
  
  executeCommand() {
    this.commandService.executeCommand(this.command, this.threadID).subscribe(
      response => {
        this.command = '';
      },
      error => {
        //TODO: Add error handling logic here
      }
    );
  }

  ngOnInit(): void {

    this.threadService.activeThread$.pipe(tap(thread=> {
       this.activeThread = thread;
       this.outputHistory = this.threadService.getOutputs(this.activeThread) ?? [];
    }));

    this.threadService.getAllThreads().subscribe();
  }

  ngOnDestroy(): void {
  }
}
