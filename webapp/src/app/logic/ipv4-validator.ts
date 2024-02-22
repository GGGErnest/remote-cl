import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function validateHostname(hostname: string) {
    const isValidFormat = /^[a-zA-Z0-9.-]+$/.test(hostname);
    const isValidLength = hostname.length >= 1 && hostname.length <= 255;
    const isValidLabels = hostname.split('.').every(label => label.length >= 1 && label.length <= 63);

    return isValidFormat && isValidLength && isValidLabels;
}

export function validateIPv4(ip: string) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})\.){3}(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})$/;
    return ipv4Regex.test(ip);
}

export function validateIPv6(ip: string) {
    const ipv6Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})\.){3}(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})$/;
    return ipv6Regex.test(ip);
}

export function hostnameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value == null || value === '') {
            return null;
        }

        if (validateHostname(value)) {
            return null;
        }

        return { hostname: { value } };
    };
}

export function ipv4Validator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null || value === '') {
      return null;
    }

    if (validateIPv4(value)) {
      return null;
    }

    return { ipv4: { value } };
  };
}


export function ipv6Validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value == null || value === '') {
        return null;
      }
  
      if (validateIPv6(value)) {
        return null;
      }
  
      return { ipv6: { value } };
    };
  }

  export function noSpaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        debugger;
      const value = control.value;
      if (value == null || value === '') {
        return null;
      }
  
      if (value.includes(' ')) {
        return null;
      }
  
      return { noSpace: { value } };
    };
  }