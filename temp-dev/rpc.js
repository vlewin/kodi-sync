var rpc = require('node-json-rpc')

var kodi1 = new rpc.Client({
  host: '192.168.178.23',
  port: '8080',
  path: '/jsonrpc',
  strict: true
})

var kodi2 = new rpc.Client({
  host: '192.168.178.50',
  port: '8080',
  path: '/jsonrpc',
  strict: true
})

let url = null
let percentage = null

function moveTo () {
  console.log('getPlayingUrl')
  kodi1.call({
    'jsonrpc': '2.0',
    'method': 'Player.GetItem',
    'params': {
      'properties': [
        'title',
        'duration',
        'thumbnail',
        'file'
      ],
      'playerid': 1
    },
    'id': 'VideoGetItem'
  }, function (err, res) {
    if (err) {
      console.log(err)
    } else {
      console.log(res.result.item.file)
      url = res.result.item.file

      console.log('Link is', url)
      getCurrentPosition()
    }
  })
}

function getCurrentPosition () {
  console.log('getCurrentPosition')

  kodi1.call(
    { 'jsonrpc': '2.0', 'method': 'Player.GetProperties', 'params': { 'playerid': 1, 'properties': ['percentage', 'time', 'totaltime'] }, 'id': '1' },
    function (err, res) {
      if (err) { console.log(err) } else {
        percentage = res.result.percentage
        console.log(res.result.percentage)

        play(url)
      }
    }
  )
}

function stop () {
  console.log('Stop')
  kodi1.call(
    { 'jsonrpc': '2.0', 'method': 'Player.Stop', 'params': { 'playerid': 1 }, 'id': 1 },
    function (err, res) {
      if (err) { console.log(err) } else {
        console.log(res)
        play(kodi2, url)
      }
    }
  )
}

function play (url) {
  console.log('play', url)
  kodi2.call({
    'jsonrpc': '2.0', 'id': '1', 'method': 'Player.Open', 'params': { 'item': { 'file': url }}
  },
  function (err, res) {
    if (err) {
      console.log(err)
    } else {
      console.log(res)
      console.log('Playback started')
      seek(percentage)
    }
  })
}

function seek (player, percentage) {
  kodi2.call({
    'jsonrpc': '2.0', 'method': 'Player.Seek', 'params': { 'playerid': 1, 'value': percentage }, 'id': '1'
  },
    function (err, res) {
      if (err) { console.log(err) } else {
        console.log(res)
        playPause(player)
      }
    }
  )
}

function playPause () {
  kodi1.call(
    { 'jsonrpc': '2.0', 'method': 'Player.PlayPause', 'params': { 'playerid': 1 }, 'id': 1 },
    function (err, res) {
      if (err) { console.log(err) } else {
        console.log(res)
        console.log('DONE')
      }
    }
  )
}

moveTo()
