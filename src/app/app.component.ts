import { Component } from '@angular/core';
import { ElectronAppService } from "./services/electron-sv.service";
import { StorageService } from "./services/storage.service";
import { SocketsService } from "./services/sockets.service";
import {GlobalsService} from "./services/globals.service";
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
  providers: [ElectronAppService, StorageService, SocketsService]
})
export class AppComponent {

  public tabsData: any[] = []
  public tabs: any
  public testCode: any
  public editor: any

  constructor(
    private _electron: ElectronAppService,
    private _storage: StorageService,
    private _socket: SocketsService,
    public globals: GlobalsService
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
        socketStatus: false,
        events: [],
        emits: data[i].emits,
        editEmit: null,
        viewEvent: null,
        block: null,
        code: null,
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
          tabData.events.push({ name: data[i].events[j], responses: [] })
        }
      }

      this.globals.tabs.push(tabData)
    }
    this.testCode = 'sdad\nasda'
    this.tabsData = this.globals.tabs
  }

  ngOnInit() {
    console.log(this)
  }

  loadCode() {
    this.editor = edit.edit('editor')
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/jsoniq");
    this.editor.resize()
  }

  connectSocket(index: number) {
    data[index].ws = this.tabsData[index].ws
    this.saveData(index)
    this.tabsData[index].socket = this._socket.initSocket(this.tabsData[index].ws, index)
    console.log(this.tabsData[index].socket)
  }

  disconnectSocket(index: number) {
    this._socket.disconnect(this.tabsData[index].socket, index)
  }

  saveData(index: number) {
    console.log(data)
    this._storage.saveData(data)
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
    this.saveData(indexTab)
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

  addEvent(indexTab: number) {
    let newEvent = {
      name: null,
      responses: []
    }

    this.tabsData[indexTab].events.push(newEvent)
    for (let i = 0; i < this.tabsData[indexTab].events.length; i++) {
      data[indexTab].events[i] = this.tabsData[indexTab].events[i].name
    }
    this.saveData(indexTab)
  }

  viewEvent(indexTab, indexEvent) {
    if (this.tabsData[indexTab].block === null) {
      this.tabsData[indexTab].block = document.querySelector(`code#socket-${indexTab}-code`)
      hljs.highlightBlock(this.tabsData[indexTab].block)
    }

    this.tabsData[indexTab].viewEvent = indexEvent
    this.tabsData[indexTab].block.innerHTML = hljs.highlightAuto(JSON.stringify(this.tabsData[indexTab].events[indexEvent].responses)).value
  }

  saveEvent(indexTab: number, indexEvent: number) {
    data[indexTab].events[indexEvent] = this.tabsData[indexTab].events[indexEvent].name
    if (this.tabsData[indexTab].socket !== null) {
      this._socket.listenEvent(this.tabsData[indexTab].socket, indexTab, indexEvent)
    }
    this.saveData(indexTab)
  }

  deleteEvent(indexTab: number, indexEvent: number) {
    this.tabsData[indexTab].events.splice(indexEvent, 1)
    data[indexTab].events.splice(indexEvent, 1)
    this.saveData(indexTab)
  }

}
