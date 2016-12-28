## Kody Sync - Sync currently playing stream across multiple Kodi devices

### Installation
`npm install`

`npm start`

### Packaging
`npm run build`

### TODO:
- [ ] Eslint and jscsc config
- [ ] Code clean up and refactoring
- [ ] Event emitter or promises instead of callbacks
- [ ] Better tray and dummy icons
- [ ] Packaging
- [ ] Win/Mac install with “auto update” support =>  https://github.com/electron-userland/electron-builder

### Screenshots
![Alt text](https://github.com/vlewin/kodi-sync/raw/master/Screenshot_1.png?raw=true "Optional Title")

![Alt text](https://github.com/vlewin/kodi-sync/raw/master/Screenshot_2.png?raw=true "Optional Title")

### ATOM Plugins
➜  electron-tray-player git:(master) ✗ apm list --installed
Community Packages (8) /Users/vlewin/.atom/packages
├── editorconfig@2.0.5
├── js-hyperclick@1.9.0
├── jscs-fixer@1.3.0
├── language-vue@0.21.0
├── linter@1.11.18
├── linter-eslint@8.0.0
├── linter-jscs@4.1.0
└── vue-hyperclick@0.1.0

└── (empty)

### WIP

Test streams: http://www.sample-videos.com

curl --header 'Content-Type: application/json' --data-binary '{    "jsonrpc": "2.0",    "method": "Player.GetItem","params": {"properties": [ "file"],"playerid":1},"id": "VideoGetItem"}' 'http://192.168.178.23:8080/jsonrpc'
