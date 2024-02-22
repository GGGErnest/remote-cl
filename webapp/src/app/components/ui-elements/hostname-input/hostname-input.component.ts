import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm,
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import {
  validateHostname,
  validateIPv4,
  validateIPv6,
} from 'src/app/logic/ipv4-validator';

// function that receives a string containing an IP or an empty string and a character that will be appended to the IP. 
// In addition the function will add a dot to the IP if the last character is a number and the character to be appended is a number,
// all that keeping in account the length of the IP and the position of the dot.
function appendToIp(ip: string, char: string):  string {
  if(Number.isNaN(char)) {
    return ip;
  }

  if(ip.length === 0) {
    return char;
  }

  if(char === '.' && ip[ip.length - 1] === '.') { 
    return ip;
  }


  // and IP with 3 dots has 15 characters
  if(ip.length === 15) {
    return ip;
  }

  const subnets = ip.split('.');


  if(subnets.length <= 4) {
    if(subnets[subnets.length - 1].length === 3) {
      return ip + '.' + char;
    } else {
      return ip + char;
    }
  }

  return ip
}

@Component({
  selector: 'hostname-input',
  templateUrl: './hostname-input.component.html',
  styleUrls: ['./hostname-input.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: HostnameInputComponent },
  ],
  host: {
    '[class.hostname-floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
})
export class HostnameInputComponent
  implements
    ControlValueAccessor,
    MatFormFieldControl<string | null>,
    OnInit,
    DoCheck,
    OnDestroy
{
  private _value: string | null = null;
  private _placeholder = 'Hostname or IP';
  private _required = false;
  private _disabled = false;
  private _invalid = false;
  private _errorState: boolean = false;
  private _touched = false;
  private _focused = false;
  private _mode: 'dns' | 'ip' = 'dns';
  
  public controlType = 'hostname-input';
  public autofilled?: boolean | undefined;
  public static nextId = 0;
  public stateChanges = new Subject<void>();
  @HostBinding()
  public id = `hostname-input-${HostnameInputComponent.nextId++}`;
  @Input('aria-describedby') userAriaDescribedBy: string = '';
  public onChange = (ip: string | null) => {};
  public onTouched = () => {};

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() private _parentForm: NgForm,
    @Optional() private _parentFormGroup: FormGroupDirective
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  private updateErrorState() {
    const parent = this._parentFormGroup || this._parentForm;

    const oldState = this.errorState;
    const newState =
      (this.ngControl?.invalid || this._invalid) &&
      (this._touched || parent.submitted);

    if (oldState !== newState) {
      this._errorState = newState;
      this.stateChanges.next();
    }

    [].length
  }

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public set value(hostname: string | null) {
    this._value = hostname;
    this.onChange(this._value);
    this.stateChanges.next();
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this._focused || !this.empty;
  }

  @Input()
  public get placeholder(): string {
    return this._placeholder;
  }

  public set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  public get value(): string | null {
    return this._value;
  }

  public set mode(value: 'dns' | 'ip') {
    this._mode = value;
    this.validate();
  }

  public get mode(): 'dns' | 'ip' {
    return this._mode;
  }

  public validate() {
    const value = this.ngControl.control?.value;
    const validationErrors = this.ngControl.control?.errors || {};
    
    if (value.includes(' ')) {
      validationErrors['noSpaceAllowd'] = value;
    }

    if(this.mode === 'dns' && !validateHostname(value)) {
      validationErrors['invalidHostname'] = value;
    }
    
    if(this.mode === 'ip' && !validateIPv4(value) && !validateIPv6(value)) {
      validationErrors['invalidIp'] = value;
    }
    
    if(Object.keys(validationErrors).length) {
      this._invalid = true;
      this.ngControl.control?.setErrors(validationErrors);
    } else {
      this._invalid = false;
      this.ngControl.control?.setErrors(null);
    }
  }

  registerOnValidatorChange?(fn: () => void): void {
    throw new Error('Method not implemented.');
  }

  onKeypress(event: KeyboardEvent) {
    debugger;
    if(this.mode === 'ip') {
      this.value = appendToIp(this.value|| '', event.key || '');
    } else {
      this.value = (event.target as HTMLInputElement).value;
    }
    this.validate();
  }

  onFocusIn(event: FocusEvent) {
    if (!this._focused) {
      this._focused = true;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (
      !this._elementRef.nativeElement.contains(event.relatedTarget as Element)
    ) {
      this._touched = true;
      this._focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  get empty() {
    return this._value == null || this._value == '';
  }

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(req: BooleanInput) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return this._errorState;
  }

  public get focused(): boolean {
    return this._focused;
  }

  set focused(value: boolean) {
    this._focused = value;
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.hostname-input-container'
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this._elementRef.nativeElement.querySelector('input')!.focus();
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnInit() {
    
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }
}
