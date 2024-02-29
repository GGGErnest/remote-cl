import { ITerminalAddon } from 'xterm';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { ImageAddon } from 'xterm-addon-image';
import { SearchAddon } from 'xterm-addon-search';
import { SerializeAddon } from 'xterm-addon-serialize';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from 'xterm-addon-webgl';

export type AddonType = 'attach' | 'fit' | 'image' | 'search' | 'serialize' | 'unicode11' | 'web-links' | 'webgl' | 'ligatures';
export type UsedAddons = Exclude<AddonType, 'attach' | 'ligatures'>;

export interface AddonWrapper<T extends AddonType> {
    name: T;
    canChange: boolean;
    ctor: (
      T extends 'attach' ? typeof AttachAddon :
          T extends 'fit' ? typeof FitAddon :
            T extends 'image' ? typeof ImageAddon :
              T extends 'search' ? typeof SearchAddon :
                T extends 'serialize' ? typeof SerializeAddon :
                  T extends 'web-links' ? typeof WebLinksAddon :
                    T extends 'unicode11' ? typeof Unicode11Addon :
                        typeof WebglAddon
    );
    instance?: ITerminalAddon;
  }
  