import { Component } from '@angular/core';
import { ElectronAppService } from "./services/electron-sv.service";
import { StorageService } from "./services/storage.service";
import * as M from "materialize-css";

var data;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ElectronAppService, StorageService]
})
export class AppComponent {

  public tabsData: any[]
  public tabs: any

  constructor(
    private _electron: ElectronAppService,
    private _storage: StorageService
  ) {
    this.tabsData = this._storage.getData()
  }

  ngOnInit() {
    console.log(this.tabsData)
    setTimeout(function () {
        this.tabs = new M.Tabs(document.getElementById('tabs-sockets'))
    }, 500)
  }

}
