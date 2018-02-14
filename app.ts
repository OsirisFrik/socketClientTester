import { app, BrowserWindow, ipcMain, Menu } from "electron";
import * as path from "path";
import * as url from "url";
import * as storage from "electron-json-storage";

const commands = process.argv
const appPath = 'SocketClientTester'
var mode = 'prod'

for (let i = 0; i < commands.length; i++) {
  if (~['dev', '--Dev', '-d'].indexOf(commands[i])) {
    mode = 'dev'
  }

  if (~['prod', '--Prod', '-p'].indexOf(commands[i])) {
    mode = 'prod'
  }
}

let win

function initApp() {
  // if (mode == 'prod') {
  //   Menu.setApplicationMenu(Menu.buildFromTemplate(tem));
  // }
  createWindow()
}

function createWindow() {
  const iconName = process.platform === 'win32' ? 'icons/win/icon.icon' : 'icons/png/64x64.png'
  const iconPath = path.join(__dirname, iconName)
  win = new BrowserWindow({ width: 1090, height: 800, icon: iconPath, darkTheme: true })
  setTimeout(function() {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file',
      slashes: true
    }))
  }, 1000)

  if (mode === 'dev') {
    win.webContents.openDevTools();
  }
}

exports.getData = function() {
  return new Promise(function(resolve, reject) {
    storage.get(appPath, (err, data) => {
      if (err) {
        reject()
      }
      resolve(data)
    })
  })
}

exports.setData = function(data) {
  return new Promise(function(resolve, reject) {
    storage.set(appPath, data, err => {
      if (err) {
        reject()
      }

      resolve(data)
    })
  });
}

app.on('ready', initApp)

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg)  // prints "ping"
  event.returnValue = 'pong'
})
