import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class ElectronAppService {
  private app:any
  constructor(
    private _electron: ElectronService
  ) {
    this.app = this._electron.remote.require('./app')
  }

}
