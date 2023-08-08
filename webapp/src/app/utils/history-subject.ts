import { BehaviorSubject } from 'rxjs';

export class HistorySubject<T> extends BehaviorSubject<T> {
  private history: T[] = [];

  constructor(defaultValue: T) {
    super(defaultValue);
    this.history.push(defaultValue);
  }

  override next(value: T) {
    this.history.push(value);
    super.next(value);
  }

  getHistory(): T[] {
    return [...this.history];
  }
}
