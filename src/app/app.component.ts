import { Component } from '@angular/core';
import { ElectronAppService } from "./services/electron-sv.service";
import { StorageService } from "./services/storage.service";
import * as M from "materialize-css";
import * as hljs from "highlight.js";
var ace = require('assets/ace/src-noconflict/ace.js')

hljs.configure({ useBR: true })

var data: any[]
var edit: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ElectronAppService, StorageService]
})
export class AppComponent {

  public tabsData: any[] = []
  public tabs: any
  public testCode: any
  public editor: any

  constructor(
    private _electron: ElectronAppService,
    private _storage: StorageService
  ) {
    this.tabs = setTimeout(function() {
      edit = this.ace
      return new M.Tabs(document.getElementById('tabs-sockets'))
    })
    data = this._storage.getData()
    for (let i = 0; i < data.length; i++) {
      setTimeout(function() {
        new M.Tabs(document.getElementById(`socket-${i}-tabs`))
        new M.Collapsible(document.getElementById(`options-${i}-collaps`))
      })
      let tabData = {
        name: data[i].name,
        socket: null,
        events: [],
        emits: data[i].emits,
        editEmit: null,
        viewEvent: null,
        ws: data[i].ws,
        options: {
          path: data[i].options.path,
          querys: data[i].options.querys
        },
        tab: null,
        collaps: null
      }

      if (data[i].events.length > 0) {
        for (let j = 0; j < data[i].events.length; j++) {
          tabData.events.push({ data: data[i].events[j], responses: [] })
        }
      }

      this.tabsData.push(tabData)
    }
    this.testCode = 'sdad\nasda'
  }

  ngOnInit() {
    console.log(this)
  }

  addQuery(indexTab: number) {
    if (this.tabsData[indexTab].collaps === null) {
      this.tabsData[indexTab].collaps = M.Collapsible.getInstance(document.getElementById(`options-${indexTab}-collaps`))
    }

    let newQuery = {
      name: null,
      value: null,
      active: false
    }

    this.tabsData[indexTab].options.querys.push(newQuery)
    this.tabsData[indexTab].collaps.open()
    console.log(data)
    this.saveData(indexTab)
  }

  loadCode() {
    this.editor = edit.edit('editor')
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/jsoniq");
    this.editor.resize()
  }

  saveData(index: number) {
    console.log(data)
    this._storage.saveData(data)
  }

  saveQuery(indexTab: number, indexQuery: number) {
    data[indexTab].options.querys[indexQuery] = this.tabsData[indexTab].options.querys[indexQuery]
    this.saveData(indexTab)
  }

  deleteQuery(indexTab: number, indexQuery: number) {
    this.tabsData[indexTab].options.querys.splice(indexQuery, 1)
    data[indexTab].options.querys.splice(indexQuery, 1)
    this.saveData(indexTab)
  }

}
