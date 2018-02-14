import { Injectable } from '@angular/core';

@Injectable()
export class GlobalsService {

  constructor() { }

  public tabs: any[] = []

  public events: any[] = []

  public jsonStructure(data) {
    let newData = data.replace(/\[{/g, '[\n {')
    newData = newData.replace(/}]/g, '} \n]')
    newData = newData.replace(/{/g, '{\n    ')
    newData = newData.replace(/}/g, '\n  }')
    newData = newData.replace(/},/g, '},\n  ')
    newData = newData.replace(/,"/g, ',\n "')

    return newData
  }

}
