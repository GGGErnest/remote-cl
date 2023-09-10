import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubPageTitleService {
  
  private _title = new BehaviorSubject<string | undefined>(undefined);
  public title$ =  this._title.asObservable();

  setTitle(newTitle?:string) {
    this._title.next(newTitle);
  }
}
