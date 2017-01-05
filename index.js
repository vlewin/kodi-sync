const DEBUG = false
const path = require('path')
const { app, BrowserWindow, Tray, ipcMain, nativeImage } = require('electron')

// FIXME: Tray icon for windows and linux => http://electron.rocks/proper-tray-icon/
const ASSETS_DIR = path.join(__dirname, 'app', 'images')
const TRAY_ICON = nativeImage.createFromPath(path.join(ASSETS_DIR, 'tray.png'))
const TRAY_ICON_HIGHLIGHTED = nativeImage.createFromPath(path.join(ASSETS_DIR, 'tray-highlighted.png'))

TRAY_ICON.setTemplateImage(true)
TRAY_ICON_HIGHLIGHTED.setTemplateImage(true)

let tray = undefined
let window = undefined
let dock = app.dock

require('electron-reload')(__dirname, {
  electron: require('electron-prebuilt')
});

// NOTE: Don't show the app in the doc
dock.hide()

// Application events
app.on('ready', () => {
  tray = new Tray(TRAY_ICON)
  tray.setPressedImage(TRAY_ICON_HIGHLIGHTED);
  tray.setToolTip('Kodi Sync')
  tray.on('click', function (event) {
    console.log('Tray clicked')
    toggleWindow()
  })

  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

// IPC events
ipcMain.on('show-window', () => {
  showWindow()
})

ipcMain.on('quit', () => {
  console.log('QUIT APP')
  window.close()
})

// Creates window & specifies its values
const createWindow = () => {
  if(DEBUG) {
    window = new BrowserWindow({
      width: 800,
      height: 500,
      show: true,
      frame: true,
      fullscreenable: true,
      resizable: true,
      transparent: false,
      'node-integration': false
    })

    window.webContents.openDevTools()
  } else {
    window = new BrowserWindow({
      width: 420,
      height: 420,
      show: true,
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent: false,
      'node-integration': false
    })

    const position = getWindowPosition()
    window.setPosition(position.x, position.y, false)
  }

  window.loadURL(`file://${__dirname}/app/index.html`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })

  window.on('show', () => {
    console.log('window show')
    tray.setImage(TRAY_ICON_HIGHLIGHTED)
    // tray.setPressedImage(TRAY_ICON_HIGHLIGHTED)
    tray.setHighlightMode('always')
  })

  window.on('hide', () => {
    console.log('window hide')
    tray.setImage(TRAY_ICON);
    // tray.setPressedImage(TRAY_ICON)
    tray.setHighlightMode('never')
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    hideWindow()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

const hideWindow = () => {
  window.hide()
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 3)

  return {x: x, y: y}
}
