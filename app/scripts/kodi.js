var rpc = require('node-json-rpc')
// let port = '8080'
//
//
// var kodi1 = new rpc.Client({
//   host: '192.168.178.23',
//   port: port,
//   path: '/jsonrpc',
//   strict: true
// })
//
// function test() {
//   kodi1.call(
//     {"jsonrpc": "2.0", "method": "Player.PlayPause", "params": { "playerid": 1 }, "id": 1},
//     function (err, res) {
//       if (err) { console.log(err) }
//       else {
//         console.log(res)
//       }
//     }
//   )
// }

let playerid = null

function errorHandler(error) {
  if(error) { console.error(JSON.stringify(error)) }
  return false
}

function setPlayerId(error, response) {
  errorHandler(error)

  if(response.result.length) {
    playerid = response.result[0].playerid
    console.log('Active player found', playerid)
  } else {
    console.warn('No active players on device')
  }
}

function getActivePlayers(device, callback) {
  device.client.call({"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}, function setPlayerId(error, response) {
    errorHandler(error)

    if(response.result.length) {
      playerid = response.result[0].playerid
      console.log('Active player found for device', device.name, playerid)

      Vue.set(device, 'playerid', playerid)
    } else {
      console.warn('No active players on device', device.name)
      Vue.set(device, 'playerid', null)
    }
  })
}

function nowPlaying(device, callback) {
  device.client.call({
      "jsonrpc": "2.0",
      "method": "Player.GetItem",
      "params": {
        "properties": [
          "title",
          "thumbnail",
          "file"
        ],
        "playerid": 1
      },
      "id": "VideoGetItem"
  }, function (err, res) {
    if (err) { console.log(err) }
    else {
      console.log(JSON.stringify(res))

      if(!res.error) {
        let title = !!res.result.item.label ? res.result.item.label : null
        let file = !!res.result.item.file ? res.result.item.file : null
        let image = !!res.result.item.thumbnail ? decodeURIComponent(res.result.item.thumbnail.replace('image://', '').replace('.jpg/', '.jpg')) : null

        console.info('Name', title, 'File', file, 'Image', image)
        Vue.set(device, 'stream', {
          title: title,
          file: file,
          image: image
        })

        getProgress(device)

        // FIXME: Avoid callback hell => Event emmiter or Promise
        if(callback) {
          console.log(callback)
          callback()
        }
      }
    }
  })
}

function getProgress(device) {
  console.log('getProgress')

  device.client.call(
    { "jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["percentage", "time", "totaltime"]},"id":"1" },
    function (err, res) {
      if (err) { console.log(err) }
      else {
        if(!res.error) {
          percentage = res.result.percentage
          console.log(res.result.percentage)
          Vue.set(device, 'progress', percentage)
        }
      }
    }
  )
}

function sync(source, target) {
  let file = source.stream.file

  console.warn(JSON.stringify(source))
  console.info('SYNC', source.stream.file, source.progress)
  target.client.call({
    "jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file": file }}
  },
  function (err, res) {
      if (err) {
        console.log(err)
      } else {
        console.log(res)
        console.log('Playback started')
        pause(source)
        seek(target, source.progress)
      }
  })
}


function seek(device) {
  // xbmc.Player.Seek({"playerid":1,"value":{ "hours":0, "minutes":10, "seconds":0}})
  device.client.call({
      "jsonrpc":"2.0","method":"Player.Seek","params":{"playerid":1,"value": device.progress },"id":"1"
    },
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
      }
    }
  )
}

function play(device, url){
  console.log('play', url)
  device.client.call({
    "jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file": url }}
  },
  function (err, res) {
      if (err) {
        console.log(err)
      } else {
        console.log(res)
        console.log('Playback started')
        // seek(percentage)
      }
  })
}

function stop(device) {
  console.log('Stop')
  device.client.call(
    {"jsonrpc": "2.0", "method": "Player.Stop", "params": { "playerid": 1 }, "id": 1},
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
      }
    }
  )
}


function pause(device) {
  device.client.call(
    {"jsonrpc": "2.0", "method": "Player.PlayPause", "params": { "playerid": 1, "play":false }, "id": 1},
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
        console.log('DONE')
      }
    }
  )
}

// module.exports.test = test;
module.exports.getActivePlayers = getActivePlayers;
module.exports.nowPlaying = nowPlaying;
module.exports.play = play;
module.exports.stop = stop;
module.exports.sync = sync;

// test()
