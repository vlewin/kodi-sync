// Sets variables (const)

const { app, BrowserWindow, ipcMain, Tray } = require('electron')
const path = require('path')
const assetsDirectory = path.join(__dirname, 'stream.png')

let tray
const window

// Don't show the app in the doc
app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

// Creates tray image & toggles window on click
const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'icon.png'))
  tray.on('click', function (event) {
    toggleWindow()
  })
}

const getWindowPosition = () => {
    const windowBounds = window.getBounds()
    const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 3)

    return { x: x, y: y }
  }
