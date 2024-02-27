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
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import {
  validateHostname,
  validateIPv4,
  validateIPv6,
} from 'src/app/utils/validators/ipv4-validator';

@Component({
  selector: 'hostname-input',
  templateUrl: './hostname-input.component.html',
  styleUrls: ['./hostname-input.component.scss'],
  standalone:true,
  imports:[
    MatFormFieldModule,

  ],
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

  public get mode(): 'dns' | 'ip' {
    return this._mode;
  }

  public validate() {
    const value = this.value ?? '';
    const validationErrors = this.ngControl.control?.errors || {};
    
    if(!(validateHostname(value) || validateIPv4(value) || validateIPv6(value))) {
      validationErrors['invalidHostnameOrIp'] = value;
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

  onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
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
