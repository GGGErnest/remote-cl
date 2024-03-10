import { WritableSignal, signal } from '@angular/core';
import { cloneDeep, merge } from 'lodash';

export type HistorySignal<T> = WritableSignal<T> & {
  rollback: (stepback?: number) => void;
  setNoHistory: (value: T) => void;
  rollbackTo: (condition: (historyValue: T) => boolean) => void;
};

export type HistorySignalOptions = {
  historySize?: number;
  preventUpdateHistory?: boolean;
};

const DEFAULT_OPTIONS = {
  historySize: 2,
  preventUpdateHistory: false,
};

export function historySignal<T>(
  initialValue: T,
  options?: HistorySignalOptions
): HistorySignal<T> {
  const currentOptions = merge(DEFAULT_OPTIONS, options);

  let history: T[] = [];
  const signalValue = signal<T>(initialValue) as any;

  if (!currentOptions.preventUpdateHistory) {
    history.push(initialValue);
  }

  const set = signalValue.set;
  signalValue['set'] = (value: T) => {
    if (history.length === currentOptions.historySize) {
      history.splice(0, 1);
    }
    history.push(value);

    set.bind(signalValue);
    set(value);
    console.log('History size', history);
  };

  signalValue['setNoHistory'] = (value: T) => {
    set.bind(signalValue);
    set(value);
    console.log('History size', history);
  };

  signalValue['rollbackTo'] = (predicate: (historyValue: T) => boolean) => {
    let posOfTheMatchedElement = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (predicate(history[i])) {
        posOfTheMatchedElement = i;
        break;
      }
    }
    if (posOfTheMatchedElement > -1) {
      const rollBackTo =  history.length - 1 - posOfTheMatchedElement;
      signalValue.rollback(rollBackTo);
    }
  };

  signalValue['rollback'] = (stepback?: number) => {
    if (history.length === 0) {
      return;
    }

    if (!stepback) {
      signalValue.setNoHistory(history[history.length - 1]);
      return;
    }

    if (stepback >= history.length) {
      history = [history[0]];
      signalValue.setNoHistory(history[0]);
      return;
    }

    history = history.slice(0, history.length - stepback);
    signalValue.setNoHistory(history[history.length - 1]);
  };
  return signalValue as HistorySignal<T>;
}
