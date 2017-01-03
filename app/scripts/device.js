const Rpc = require('node-json-rpc')
const Bonjour = require('bonjour')()
const EventEmitter = require('events')

const eventHub = new EventEmitter()

'use strict';

class Device {
  constructor(service) {
    this.name = service.name
    this.ip = service.referer.address
    this.port = service.port
    this.image = './images/Kodi.png'
    this.playing = false
    this.paused = false
    this.playerid = null
    this.stream = null
    this.progress = null
    this.timer = null
    this.interval = null
    this.client = new Rpc.Client({
      host: service.referer.address,
      port: service.port,
      path: '/jsonrpc',
      strict: true
    })

    this.refresh()
  }

  static get bonjour() {
    console.log('DEVICE: Bonjour getter')
    return Bonjour.find({ type: 'http' })
  }

  static get eventHub() {
    console.log('DEVICE: eventHub getter')
    return eventHub
  }

  static findAll() {
    this.bonjour.on('up', function(service) {
      if(service.name.includes('Kodi')) {
        // console.log('DEVICE: Service up:', service.name)
        eventHub.emit('SERVICE_UP', service)
      } else {
        console.warn('Kodi service?', service.name)
      }
    })

    this.bonjour.on('down', function(service) {
      if(service.name.includes('Kodi')) {
        // console.log('DEVICE: Service down:', service.name)
        eventHub.emit('SERVICE_DOWN', service)
      } else {
        console.warn('Kodi service?', service.name)
      }
    })
  }

  static sync(source, target) {
    let file = source.stream.file
    let percentage = source.progress.percentage
    console.log('Pause source')
    source.pause()
    console.log('Open file and seek', percentage)


    // target.open(file)
    // setTimeout(function() {
    //   target.pause()
    //   target.seek(percentage)
    // }, 3000)

    target.open(file, function() {
      target.seek(percentage)
    })
  }

  static errorHandler(error) {
    if(error) {
      console.error(JSON.stringify(error))
    }

    return false
  }

  refresh() {
    this.getActivePlayers()
    this.nowPlaying()
    this.getProgress()
  }

  getActivePlayers() {
    let _this = this
    let params = {"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}

    this.client.call(params, function(error, response) {
      _this.constructor.errorHandler(error)

      if(response && response.result.length) {
        let playerid = response.result[0].playerid
        eventHub.emit('ACTIVE_PLAYER', _this, playerid);
      } else {
        console.warn('No active players on device', _this.name)
        eventHub.emit('ACTIVE_PLAYER', _this, null);
      }
    })
  }

  nowPlaying() {
    let _this = this
    let params = { "jsonrpc": "2.0", "method": "Player.GetItem", "params": { "playerid": 1, "properties": [ "title", "thumbnail", "file"] }, "id": 1}

    if(this.playerid) {
      this.client.call(params, function(error, response) {
        _this.constructor.errorHandler(error)

        if(!response.error) {
          let item  = response.result.item
          let title = !!item.label ? item.label : null
          let file = !!item.file ? item.file : null
          let image = !!item.thumbnail ? decodeURIComponent(item.thumbnail.replace('image://', '').replace('.jpg/', '.jpg')) : null

          eventHub.emit('PLAYER_ITEM', _this, { title: title, file: file, image: image });
        }
      })
    }
  }

  getProgress() {
    let _this = this
    let params = { "jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1, "properties":["percentage", "time", "totaltime"]}, "id": 1}

    if(this.playerid) {
      this.client.call(params, function (error, response) {
        _this.constructor.errorHandler(error || response.error)

        let progress = response.result
        if(progress) {
          eventHub.emit('PLAYER_PROGRESS', _this, {
            percentage: Math.round(progress.percentage),
            time: progress.time,
            totaltime: progress.totaltime
          })
        }
      })
    }
  }

  open(stream, callback) {
    let _this = this
    let params = {"jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file": stream }}}

    this.client.call(params, function (error, response) {
      _this.constructor.errorHandler(error || response.error)
      eventHub.emit('PLAYER_OPEN', _this)

      if(callback) {
        console.info('DEVICE: CALLBACK ON OPEN', callback)
        callback()
      } else {
        console.warn('DEVICE: NO CALLBACK')
      }
    })
  }

  seek(percentage) {
    let _this = this
    let params = { "jsonrpc":"2.0","method":"Player.Seek","params":{ "playerid":1, "value": percentage }, "id": 1 }
    // xbmc.Player.Seek({"playerid":1,"value":{ "hours":0, "minutes":10, "seconds":0}})
    console.warn('DEVICE: Seek', percentage)

    if(this.playerid) {
      this.client.call(params, function (error, response) {
        _this.constructor.errorHandler(error || response.error)
        eventHub.emit('PLAYER_PLAY', _this)
      })
    }
  }

  play() {
    let _this = this
    let params = {"jsonrpc": "2.0", "method": "Player.PlayPause", "params": { "playerid": 1, "play":true }, "id": 1}

    this.client.call(params, function (error, response) {
      _this.constructor.errorHandler(error || response.error)
      eventHub.emit('PLAYER_PLAY', _this)
    })
  }

  pause() {
    let _this = this
    let params = {"jsonrpc": "2.0", "method": "Player.PlayPause", "params": { "playerid": 1, "play":false }, "id": 1}

    this.client.call(params, function (error, response) {
      _this.constructor.errorHandler(error || response.error)
      eventHub.emit('PLAYER_PAUSE', _this)
    })
  }

  stop() {
    let _this = this
    let params = {"jsonrpc": "2.0", "method": "Player.Stop", "params": { "playerid": 1 }, "id": 1}

    this.client.call(params, function (error, response) {
      _this.constructor.errorHandler(error || response.error)
      eventHub.emit('PLAYER_STOP', _this)
    })
  }

  // function sync(source, target) {
  //   let file = source.stream.file
  //   let percentage = source.progress.percentage
  //   source.pause()
  //   target.open(file)
  //   target.seek(percentage)
  //   target.pause()
  // }
}

module.exports = Device
