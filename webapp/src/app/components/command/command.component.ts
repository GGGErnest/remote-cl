import { Component, OnInit, OnDestroy, ContentChild, AfterViewInit, AfterContentInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CommandService } from '../../services/command.service';
import { ThreadService } from '../../services/thread.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss']
})
export class CommandComponent implements OnInit, OnDestroy, AfterViewInit {
  shellId = '';
  newShellName = '';
  showNewShellInput = false;
  commandsHistory:string[] = [];
  outputHistory:string[] = [];
  activeThread = '';
  command = '';
  threads$ =this.threadService.threads$;
  @ViewChild('commandLineOutput') commandOutputDiv!:ElementRef<HTMLDivElement>;

  constructor(private commandService: CommandService, private threadService: ThreadService) {
      
  }
  
  executeCommand() {
    const threadId =  this.showNewShellInput ? this.newShellName:this.shellId;
    this.commandService.executeCommand(this.command, this.shellId).subscribe(
      response => {
        this.command = '';
      },
      error => {
        //TODO: Add error handling logic here
      }
    );
  }

  private scrollUp() {
    setTimeout(()=> this.commandOutputDiv.nativeElement.scrollTop = this.commandOutputDiv.nativeElement.scrollHeight,0 );
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

  changeSelectedShell(selectedValue:string){
    if(selectedValue === 'New'){
      this.showNewShellInput = true;
      this.outputHistory = [];
      this.shellId = '';
    } else {
      this.showNewShellInput = false;
      this.threadService.setActiveThread(selectedValue);
      this.shellId = selectedValue;
    }

  }

  ngAfterViewInit(): void {
    this.threadService.activeThreadOutput$.subscribe(output=> {
      if(Array.isArray(output)) {
        this.outputHistory = output;
      } else {
        this.outputHistory = [...this.outputHistory, output];
      }
      this.scrollUp();
    });
  }
}
