var rpc = require('node-json-rpc')
let port = '8080'


var kodi1 = new rpc.Client({
  host: '192.168.178.23',
  port: port,
  path: '/jsonrpc',
  strict: true
})

var kodi2 = new rpc.Client({
  host: '192.168.178.50',
  port: port,
  path: '/jsonrpc',
  strict: true
})

function test(url){
  stream = "http://media.ntv.ru/vod/promo/2016/20161224/0176416_hd_lo.webm?ts=1482783242&md5=IylYrYW_DK1Fc8_kgxQLHg&poLYs3=6%08%0B%0Bqr%0D%10I3"
  stream = "https://r1---sn-4g5edney.googlevideo.com/videoplayback?mn=sn-4g5edney&mm=31&requiressl=yes&clen=8316720&mime=video%2Fmp4&keepalive=yes&source=youtube&ms=au&mv=m&mt=1482746577&ipbits=0&signature=E18D486051FCBFDE33FB7225C8DA6101DFA4382A.D7EAB668052977253B9582B531143113D55C2840&itag=134&nh=IgpwZjAyLmZyYTE2KhgyMDAxOjQ4NjA6MToxOjA6Y2Y4OjA6Njk&expire=1482768322&dur=130.560&pl=40&key=yt6&gir=yes&sparams=clen%2Cdur%2Cei%2Cgir%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Ckeepalive%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cnh%2Cpl%2Crequiressl%2Csource%2Cupn%2Cexpire&ip=2003%3A86%3A8d27%3A8300%3A153c%3A4132%3Af33a%3A5f0&lmt=1458209288587608&upn=Gcl1xNMMSzA&ei=YetgWLKpOab-iAaLiZewCA&id=o-AEOuRg4xbsBzkRXBD4sCYYPr2_3mioDjyEhJmrRC6xPI&initcwndbps=727500&alr=yes&ratebypass=yes&cpn=44ml2KsmJsT_wMOU&c=WEB&cver=1.20161219&ir=1&rr=12&range=1675857-3644095&rn=10&rbuf=24718"
  stream = "http://c1.kinokong.biz/files/TBW8lqKDqBjyK7d70CVFzg/1482769615/Nocturnal.Animals.2016.D.HDTV.1O8Op_480.mp4"
  kodi1.call(
    {"jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file":stream}}},
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
      }
    }
  )
}

function play(url){
  console.log('play', url)
  kodi1.call({
    "jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file":play}}
  },
  function (err, res) {
      if (err) {
        console.log(err)
      } else {
        console.log(res)
      }
  })
}

function moveTo(player, url){
  player.call(
    {"jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file":url}}},
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
      }
    }
  )
}

function playPause() {
  kodi1.call(
    {"jsonrpc": "2.0", "method": "Player.PlayPause", "params": { "playerid": 1 }, "id": 1},
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
      }
    }
  )
}

function nowPlaying() {
  kodi1.call({
      "jsonrpc": "2.0",
      "method": "Player.GetItem",
      "params": {
        "properties": [
            "title",
            "duration",
            "thumbnail",
            "file"
        ],
        "playerid": 1
      },
      "id": "VideoGetItem"
  }, function (err, res) {
    if (err) { console.log(err) }
    else {
      console.log(res)
      console.log(res.result.item.file)
      console.log(res.result.item.streamdetails)

      // moveTo(kodi2, res.result.item.file)
    }
  })
}


function playingItem() {
  kodi1.call(
    { "jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["percentage", "time", "totaltime"]},"id":"1" },
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
      }
    }
  )
}

function seek() {
  // xbmc.Player.Seek({"playerid":1,"value":{ "hours":0, "minutes":10, "seconds":0}})
  kodi1.call({
      "jsonrpc":"2.0","method":"Player.Seek","params":{"playerid":1,"value":30},"id":"1"
    },
    function (err, res) {
      if (err) { console.log(err) }
      else {
        console.log(res)
      }
    }
  )
}



// xbmc.Player.Seek({"playerid":1,"value":{ "hours":0, "minutes":10, "seconds":0}})


// play()
// nowPlaying()
// play('http://media.ntv.ru/vod/promo/2016/20161224/0176599.mp4?ts=1482834999&md5=CY-St6YajmGNooD6tOCTqA')
// test()
// seek()
// playPause()

// function progress(player, callback) {
//   player.call(
//     { "jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["percentage", "time", "totaltime"]},"id":"1" },
//     callback
//     // function (err, res) {
//     //   if (err) {
//     //     console.log(err)
//     //   } else {
//     //     // console.log(res)
//     //     return res
//     //   }
//     // }
//   )
// }

function playOn(player1, player2) {
  let url = null
  let percentage = null

  player1.call({
    "jsonrpc": "2.0",
    "method": "Player.GetItem",
    "params": {
      "properties": [
          "title",
          "duration",
          "thumbnail",
          "file"
      ],
      "playerid": 1
    },
    "id": "VideoGetItem"
  }, function (err, res) {
    if (err) { console.log(err) }
    else {
      console.log(res)
      console.log(res.result.item.file)
      console.log(res.result.item.streamdetails)
      url = res.result.item.file

      player1.call({
          "jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["percentage", "time", "totaltime"]},"id":"1"
        },
        function (err, res) {
          if (err) { console.log(err) }
          else {
            percentage = res.result.percentage

            player1.call({
              "jsonrpc":"2.0","id":"1","method":"Player.Open","params":{"item":{"file": url }}},
              function (err, res) {
                if (err) { console.log(err) }
                else {
                  player1.call({
                      "jsonrpc":"2.0","method":"Player.Seek","params":{"playerid":1,"value": percentage },"id":"1"
                    },
                    function (err, res) {
                      if (err) { console.log(err) }
                      else {
                        console.log(res)
                      }
                    }
                  )
                  console.log(res)
                }
            })
          }
        }
      )
    }
  })


}

// function playingItem() {
//   kodi1.call(
//     { "jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["percentage", "time", "totaltime"]},"id":"1" },
//     function (err, res) {
//       if (err) { console.log(err) }
//       else {
//         console.log(res)
//       }
//     }
//   )
// }

//
// progress(kodi1, function (err, res) {
//   let url = null
//   let percentage = null
//   if (err) {
//     console.log(err)
//   } else {
//     kodi1.call(
//       { "jsonrpc":"2.0","method":"Player.GetProperties","params":{"playerid":1,"properties":["percentage", "time", "totaltime"]},"id":"1" },
//       function (err, res) {
//         if (err) { console.log(err) }
//         else {
//           console.log(res)
//         }
//       }
//     )
//     percentage = res.result.percentage
//     console.log(res.result.percentage)
//   }
// })

playOn(kodi1, kodi2)
