import { Component } from '@angular/core';
import { ElectronAppService } from "./services/electron-sv.service";
import { StorageService } from "./services/storage.service";
import { SocketsService } from "./services/sockets.service";
import { GlobalsService } from "./services/globals.service";
import { ToastService } from "./services/toast.service";
import * as M from "materialize-css";
import * as hljs from "highlight.js";
var ace = require('assets/ace/src-noconflict/ace.js')

hljs.configure({ useBR: true })

var data: any[]
var edit: any
var beautify: any

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ElectronAppService, StorageService, SocketsService]
})
export class AppComponent {

  public tabsData: any[] = []
  public tabs: any
  public editor: any
  public modalSettings: any = false

  constructor(
    private _electron: ElectronAppService,
    private _storage: StorageService,
    private _socket: SocketsService,
    private _toast: ToastService,
    public globals: GlobalsService
  ) {
    this.tabs = setTimeout(function() {
      edit = this.ace
      beautify = edit.require('ace/ext/beautify')
      new M.Modal(document.getElementById('modal-event-settings'))
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
          tabData.events.push({ name: data[i].events[j].name, settings: data[i].events[j].settings, responses: [] })
        }
      }

      this.globals.tabs.push(tabData)
    }
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
    if (this.tabsData[index].socket !== null) {
      this._socket.disconnect(this.tabsData[index].socket, index)
    }
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
      settings: {
        allResponses: false,
        notification: false,
        callback: null
      },
      responses: []
    }

    this.tabsData[indexTab].events.push(newEvent)
    for (let i = 0; i < this.tabsData[indexTab].events.length; i++) {
      data[indexTab].events[i] = { name: this.tabsData[indexTab].events[i].name, settings: this.tabsData[indexTab].events[i].settings }
    }
    this.saveData(indexTab)
  }

  viewEvent(indexTab, indexEvent) {
    this.tabsData[indexTab].viewEvent = indexEvent

    if (this.tabsData[indexTab].block === null) {
      this.tabsData[indexTab].block = edit.edit(`socket-${indexTab}-event-data`)
      this.tabsData[indexTab].block.setTheme('ace/theme/monokai')
      this.tabsData[indexTab].block.commands.addCommand({
        name: 'beautifyCommand',
        bindKey: { wind: 'Ctrl-alt-d', mac: 'Ctrl-alt-d' },
        exec: function(ed) {
          beautify.beautify(ed.session)
        }
      })
      this.tabsData[indexTab].block.resize()
    }

    let data = this.tabsData[indexTab].events[indexEvent].responses
    if (typeof data === 'object') {
      if (this.tabsData[indexTab].events[indexEvent].settings.allResponses) {
        data = JSON.stringify(data)
      } else {
        data = JSON.stringify(data.pop())
      }
      this.tabsData[indexTab].block.session.setMode("ace/mode/json");
    }
    this.tabsData[indexTab].block.setValue(data)
    let editor = this.tabsData[indexTab].block
    setTimeout(function() {
      beautify.beautify(editor.session)
    })
  }

  saveEvent(indexTab: number, indexEvent: number) {
    data[indexTab].events[indexEvent] = {
      name: this.tabsData[indexTab].events[indexEvent].name,
      settings: this.tabsData[indexTab].events[indexEvent].settings
    }
    if (this.tabsData[indexTab].socket !== null) {
      this._socket.listenEvent(this.tabsData[indexTab].socket, indexTab, indexEvent)
    }
    this.saveData(indexTab)
  }

  deleteEvent(indexTab: number, indexEvent: number) {
    if (this.tabsData[indexTab].socket !== null) {
      this._socket.exitEvent(this.tabsData[indexTab].socket, indexTab, indexEvent)
    }
    this.tabsData[indexTab].events.splice(indexEvent, 1)
    data[indexTab].events.splice(indexEvent, 1)
    if (this.tabsData[indexTab].viewEvent === indexEvent) {
      this.tabsData[indexTab].block.setValue('')
      this.tabsData[indexTab].viewEvent = null
    }
    this.saveData(indexTab)
  }

  addEmit(indexTab: number) {
    let newEmit = {
      name: null,
      value: null
    }

    this.tabsData[indexTab].emits.push(newEmit)
    for (let i = 0; i < this.tabsData[indexTab].emits.length; i++) {
      data[indexTab].emits[i].name = this.tabsData[indexTab].emits[i].name
      data[indexTab].emits[i].value = null
    }
    this.saveData(indexTab)
  }

  editEmit(indexTab: number, indexEmit: number) {
    this.tabsData[indexTab].editEmit = indexEmit
    if (this.tabsData[indexTab].code === null) {
      this.tabsData[indexTab].code = edit.edit(`socket-${indexTab}-emit-data`)
      this.tabsData[indexTab].code.setTheme('ace/theme/monokai')
      this.tabsData[indexTab].code.commands.addCommand({
        name: 'beautifyCommand',
        bindKey: { wind: 'Ctrl-alt-d', mac: 'Ctrl-alt-d' },
        exec: function(ed) {
          beautify.beautify(ed.session)
        }
      })
      this.tabsData[indexTab].code.resize()
    }
    let data = this.tabsData[indexTab].emits[indexEmit].value

    if (typeof data === 'object') {
      data = JSON.stringify(data)
      this.tabsData[indexTab].code.session.setMode("ace/mode/json");
    }
    this.tabsData[indexTab].code.setValue(data)
    let editor = this.tabsData[indexTab].code
    setTimeout(function() {
      beautify.beautify(editor.session)
    }, 100)
  }

  saveEmit(indexTab: number, indexEmit: number) {
    data[indexTab].emits[indexEmit].name = this.tabsData[indexTab].emits[indexEmit].name
    if (this.tabsData[indexTab].editEmit === indexEmit) {
      this.tabsData[indexTab].emits[indexEmit].value = this.tabsData[indexTab].code.getValue()
    }
    data[indexTab].emits[indexEmit].value = this.tabsData[indexTab].emits[indexEmit].value
    this.saveData(indexTab)
  }

  deleteEmit(indexTab: number, indexEmit: number) {
    this.tabsData[indexTab].emits.splice(indexEmit, 1)
    data[indexTab].emits.splice(indexEmit, 1)
    if (this.tabsData[indexTab].editEmit === indexEmit) {
      this.tabsData[indexTab].code.setValue('')
      this.tabsData[indexTab].code = null
      this.tabsData[indexTab].editEmit = null
    }
    this.saveData(indexTab)
  }

  sendEmit(indexTab: number, indexEmit: number) {
    if (this.tabsData[indexTab].socekt !== null && this.tabsData[indexTab].socketStatus) {
      this.saveEmit(indexTab, indexEmit)
      this._socket.emit(this.tabsData[indexTab].socket, indexEmit, this.tabsData[indexTab].emits[indexEmit].name, this.tabsData[indexTab].emits[indexEmit].value)
    } else {
      this._toast.warning('Please connect the socket first')
    }
  }

  openModal(indexTab: number, indexEvent: number) {
    this.modalSettings = {
      settings: this.tabsData[indexTab].events[indexEvent].settings,
      indexTab: indexTab,
      indexEvent: indexEvent
    }
  }

  closeModal() {
    let edit = this.modalSettings
    this.tabsData[edit.indexTab].events[edit.indexEvent].settings = edit.settings
    if (this.tabsData[edit.indexTab].block !== null && this.tabsData[edit.indexTab].viewEvent === edit.indexEvent && !edit.settings.allResponses) {
      this.tabsData[edit.indexTab].block.setValue(JSON.stringify(this.tabsData[edit.indexTab].events[edit.indexEvent].responses.pop()))
    } else if (this.tabsData[edit.indexTab].block !== null && this.tabsData[edit.indexTab].viewEvent === edit.indexEvent && edit.settings.allResponses) {
      this.tabsData[edit.indexTab].block.setValue(JSON.stringify(this.tabsData[edit.indexTab].events[edit.indexEvent].responses))
    }
    this.saveData(edit.indexTab)
    this.modalSettings = false
  }

}
