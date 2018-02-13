import { Injectable } from '@angular/core';
import { GlobalsService } from "./globals.service";
import { ToastService } from "./toast.service";
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import * as socketIo from 'socket.io-client';
import * as hljs from "highlight.js";

@Injectable()
export class SocketsService {

  constructor(
    public globals: GlobalsService,
    private _toast: ToastService
  ) { }

  socketStatus(i: number, value: boolean) {
    this.globals.tabs[i].socketStatus = value
  }

  initSocket(url, i: number) {
    let querys = {}
    for (let j = 0; j < this.globals.tabs[i].options.querys.length; j++) {
      if (this.globals.tabs[i].options.querys[j].active) {
        querys[this.globals.tabs[i].options.querys[j].name] = this.globals.tabs[i].options.querys[j].value
      }
    }

    let socket = socketIo(url, {
      query: querys
    })
    this.listenEvent(socket, i)
    socket.on('connect', s => {
      console.log('connect')
      this.socketStatus(i, true)
      this._toast.success('Socket connected')
    })

    socket.on('disconnect', d => {
      console.log('Socket disconnected', d)
      this.socketStatus(i, false)
      this.globals.tabs[i].socket = null
      this._toast.error('Socket disconnected')
    })

    socket.on('reconnect', data => {
      this.socketStatus(i, true)
      this._toast.success('Socket reconnected')
    })

    socket.on('reconnecting', data => {
      if (data >= 5) {
        this.socketStatus(i, false)
        this._toast.error('Reconnect error, disconnecting')
        this.disconnect(socket, i)
      } else {
        this._toast.warning(`Socket reconnecting x${data}`)
      }
    })

    socket.on('test', data => {
      console.log(data)
    })

    return socket
  }

  disconnect(socket, i: number) {
    socket.close()
  }

  listenEvent(socket, i: number, ie?: number) {
    let tabs = this.globals.tabs[i]
    if (typeof ie !== 'undefined' && ie !== null) {
      console.log(tabs.events[ie])
      this.subscribeMessage(socket, tabs.events[ie].name).subscribe(data => {
        tabs.events[ie].responses.push(data)
        console.log(tabs.events[ie].name, data)
        if (tabs.viewEvent === ie && tabs.block !== null) {
          tabs.block.setValue(JSON.stringify(tabs.events[ie].responses))
        }
      })
    } else {
      for (let e = 0; e < tabs.events.length; e++) {
        console.log(tabs.events[e])
        this.subscribeMessage(socket, tabs.events[e].name).subscribe(data => {
          tabs.events[e].responses.push(data)
          console.log(tabs.events[e].name, data)
          if (tabs.viewEvent === e && tabs.block !== null) {
            tabs.block.setValue(JSON.stringify(tabs.events[e].responses))
          }
        })
      }
    }
  }

  emit(socket, i: number, event: string, data: any) {
    socket.emit(event, data)
    this._toast.success(`${event} send`)
  }

  private subscribeMessage(socket, ev): Observable<any> {
    return new Observable(observable => {
      socket.on(ev, data => observable.next(data))
    })
  }

}
