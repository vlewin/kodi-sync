const { ipcRenderer } = require('electron')
const Vue = require('vue/dist/vue.js')
const Rpc = require('node-kodi')
const Bonjour = require('bonjour')()

Vue.config.silent = false

const eventHub = new Vue()

new Vue({
  el: '#app',
  data () {
    return {
      devices: [],
      source: null,
      target: null,
      streamURL: 'http://trailers.divx.com/divx_prod/divx_plus_hd_showcase/Sintel_DivXPlus_6500kbps.mkv',
      showStreamForm: false,
      loading: false
    }
  },

  created () {
    this.findAll()
  },

  mounted () {
    const _this = this

    eventHub.$on('SERVICE_UP', function (service) {
      console.log('EVENT: Service found:', service.name)
      // TODO: Generate device UUID
      const device = {
        name: service.name,
        ip: service.referer.address,
        port: service.port,
        image: './images/Kodi.png',
        playing: false,
        paused: false,
        playerid: null,
        stream: null,
        progress: null,
        timer: null,
        interval: null,
        loading: false,
        client: new Rpc({ url: `http://${service.referer.address}:${service.port}`, user: 'kodi' })
      }

      _this.refresh(device).then(function () {
        console.log('Refresh done', device.name, device.playing)
        _this.addDevice(device)
      })
    })

    eventHub.$on('SERVICE_DOWN', function (service) {
      console.log('EVENT: Service found:', service.name)
      const device = {
        name: service.name,
        ip: service.referer.address,
        port: service.port
      }
      _this.removeDevice(device)
    })
  },

  destroyed () {
    console.warn('Component destroyed, clear timers')
    this.clearAllTimers()
  },

  watch: {
    devices (val) {
      if (val) {
        if (val.length === 1) {
          this.source = this.devices.find(function (device) {
            console.info('DEVICES CHAGED:', device.name, device.playing)

            if (device.playing) {
              console.info('DEVICES CHAGED:', 'Set', device.name, 'as source')
            } else {
              console.warn('DEVICES CHAGED:', 'No playing devices')
            }
            return device.playing
          })
        }

        this.source = this.source || this.devices[0]

        if (this.devices.length === 2) {
          this.target = this.targets[0]
        }
      }
    },

    source (val) {
      if (this.source) {
        this.refresh(this.source)
      }
    }
  },

  computed: {
    targets () {
      const _this = this
      return this.devices.filter(function (device) {
        return device.name !== _this.source.name
      })
    },

    ready () {
      return this.source && this.source.playing && this.target
    }
  },

  methods: {
    findAll () {
      const bonjour = Bonjour.find({ type: 'http' })
      bonjour.on('up', function (service) {
        if (service.name.includes('Kodi')) {
          eventHub.$emit('SERVICE_UP', service)
        } else {
          console.warn('Kodi service?', service.name)
        }
      })

      bonjour.on('down', function (service) {
        if (service.name.includes('Kodi')) {
          eventHub.$emit('SERVICE_DOWN', service)
        } else {
          console.warn('Kodi service?', service.name)
        }
      })
    },

    isSourceDevice (device) {
      return this.source.ip === device.ip
    },

    addDevice (device) {
      const includes = this.devices.find(function (item) {
        return item.ip === device.ip
      })

      if (!includes) {
        this.devices.push(device)
      }
    },

    removeDevice (device) {
      this.devices = this.devices.filter(function (item) {
        return item.ip !== device.ip
      })
    },

    imageExists (url, callback) {
      var img = new Image()
      img.onload = function () { callback(true) }
      img.onerror = function () { callback(false) }
      img.src = url
    },

    sourceDeviceImage () {
      const _this = this

      if (this.source && this.source.stream) {
        if (this.source.stream.image) {
          const image = decodeURIComponent(this.source.stream.image.replace('image://', '').replace('.jpg/', '.jpg'))
          this.imageExists(image, function (exists) {
            if (exists) {
              _this.source.image = image
            }
          })
        }
      }
    },

    rescan () {
      this.devices = []
      this.clearAllTimers()
      this.findAll()
    },

    playing (device) {
      const _this = this
      const params = { properties: ['title', 'year', 'art', 'rating', 'runtime', 'imdbnumber', 'showtitle', 'season', 'episode', 'file', 'duration', 'description'] }
      device.client.player.getCurrentlyPlayingVideo(params).then(function (response) {
        if (response && !!response.item.file) {
          console.log('Info:', device.name, JSON.stringify(response))

          const stream = {
            title: response.item.label,
            file: response.item.file,
            image: response.item.art.thumb
          }

          Vue.set(device, 'playing', true)
          Vue.set(device, 'stream', stream)

          _this.sourceDeviceImage()
        } else {
          console.warn(device.name, response)
          device.playing = false
          device.stream = null
        }
      }).catch(function (error) {
        console.error(error)
      })
    },

    progress (device) {
      device.client.player.getProperties().then(function (response) {
        // console.log('Playback progress:', device.name, JSON.stringify(response))
        device.progress = response
        device.paused = !device.progress.speed
      })
    },

    refresh (device) {
      const _this = this
      console.log('INDEX: refresh', device.name)

      device.loading = true

      return Promise.all([
        this.playing(device),
        this.progress(device)
      ]).then(function () {
        device.loading = false

        clearTimeout(device.timer)
        device.timer = setTimeout(function () {
          _this.refresh(device)
        }, 5000)
      })
    },

    refreshAll () {
      const _this = this
      this.clearAllTimers()

      for (const i in this.devices) {
        const device = this.devices[i]

        _this.refresh(device)
      }
    },

    clearAllTimers () {
      for (const i in this.devices) {
        console.log('Clear refresh timer')
        clearTimeout(this.devices[i].timer)
      }
    },

    setSource (device) {
      this.source = device
      this.refresh(device)
    },

    setTarget (device) {
      this.target = device

      if (device.ip === this.source.ip) {
        this.source = this.targets[0]
      }
    },

    toggleStreamURLForm () {
      this.showStreamForm = !this.showStreamForm
    },

    closeStreamURLForm () {
      // this.streamURL = null
      this.showStreamForm = false
    },

    open () {
      // TODO: Add loading indicator
      const _this = this
      this.source.loading = true

      this.stop(this.source).then(function () {
        _this.source.client.player.open({ 'item': { 'file': _this.streamURL }}).then(function (r) {
          console.log(r)
          _this.source.loading = false
        }).then(function () {
          setTimeout(function () {
            _this.refresh(_this.source)
          }, 2000)
        })
      })

      this.closeStreamURLForm()
    },

    play (device) {
      device.loading = true

      return device.client.player.playPause({ play: true }).then(function (r) {
        device.paused = false
        device.loading = false
      })
    },

    pause (device) {
      device.loading = true

      return device.client.player.playPause({ play: false }).then(function (r) {
        device.paused = true
        device.loading = false
      })
    },

    stop (device) {
      device.loading = true

      return device.client.player.stop().then(function (r) {
        device.playing = false
        device.stream = device.progress = null
        device.loading = false
      })
    },

    backward () {
      this.source.seek(10)
    },

    seek () {
      this.source.seek(60)
    },

    sync () {
      const _this = this
      const item = { 'file': this.source.stream.file }
      const options = { 'resume': this.source.progress.time }

      this.pause(this.source)

      this.target.loading = this.loading = true
      this.target.client.player.open({ item: item, options: options }).then(function (r) {
        _this.loading = false
      })
    },

    quit () {
      ipcRenderer.send('quit', 'ping')
    }
  }
})
