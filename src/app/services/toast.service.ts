import { Injectable } from '@angular/core';
import * as M from "materialize-css";

@Injectable()
export class ToastService {

  constructor() { }

  clasic(message: string, time?: number, callback?: any, styles?: string) {
    return new M.Toast({html: message, displayLength: time || 3000, completeCallback: callback || null})
  }

  success(message: string, time?: number, callback?: any) {
    return new M.Toast({html: message, displayLength: time || 3000, completeCallback: callback || null, classes: 'green darken-1'})
  }

  error(message: string, time?: number, callback?: any) {
    return new M.Toast({html: message, displayLength: time || 4000, completeCallback: callback || null, classes: 'red darken-1'})
  }

  warning(message: string, time?: number, callback?: any) {
    return new M.Toast({html: message, displayLength: time || 5000, completeCallback: callback || null, classes: 'orange darken-2'})
  }


}
