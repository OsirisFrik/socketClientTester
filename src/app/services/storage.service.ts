import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {

  constructor() { }

  getData() {
    let data = JSON.parse(localStorage.getItem('tabsData'))
    if (typeof data === 'undefined' || data === null) {
      let newData = {
        tabs: [
          {
            name: null,
            options: {
              path: {
                value: null,
                active: false
              },
              querys: []
            },
            ws: null,
            events: [],
            emits: []
          }
        ]
      }

      localStorage.setItem('tabsData', JSON.stringify(newData))
      return newData.tabs
    }

    return data.tabs
  }

  saveData(data: any[]) {
    let tabs = {
      tabs: data
    }
    localStorage.setItem('tabsData', JSON.stringify(tabs))
  }

}
