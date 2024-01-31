import { Component } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

@Component({
  selector: 'app-ip-input',
  templateUrl: './ip-input.component.html',
  styleUrls: ['./ip-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi:true,
    useExisting: IpInputComponent
  }]
})
export class IpInputComponent implements ControlValueAccessor, Validator {

  static nextId = 0;

  private _ip:string | null = null;

  private _touched = false;

  public disabled = false;

  public onChange = (ip:string | null)=> {};

  public onTouched = () => {};

  public set ip(ip:string | null) {
    this.markAsTouched();
    this._ip = ip;
    this.onChange(this._ip);
  }

  public get ip(): string | null {
    return this._ip;
  }

  valueChange(value:InputEvent): void {
    this.ip = value.data;
  }

  writeValue(ip: string | null): void {
    this._ip = ip;
  }

  registerOnChange(fn: (ip:string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  markAsTouched() {
    if (!this._touched) {
      this.onTouched();
      this._touched = true;
    }
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    const value = control.value;
    if(value) {
      return {

      };
    }
  }
  registerOnValidatorChange?(fn: () => void): void {
    throw new Error('Method not implemented.');
  }

}
