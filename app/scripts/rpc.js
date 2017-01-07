
var Kodi = require('node-kodi')
var kodi = new Kodi({ url: 'http://192.168.178.50:8080', user: 'kodi' })

kodi.player.getCurrentlyPlayingVideo().then(function (r) {
  console.log(r)
}).catch(function (error) {
  console.error(error)
})

kodi.player.getProperties().then(function (r) {
  console.log(r)
})

kodi.player.getActivePlayers().then(function (r) {
  console.log(r)
})

// kodi.player.playPause().then(function(r) {
//   console.log(r);
// });
//
// kodi.player.stop().then(function(r) {
//   console.log(r);
// });

// let params = {"jsonrpc":"2.0","id":"1","method":"Player.Open","params":}
//
// kodi.player.open({"jsonrpc":"2.0","id":3,"method":"Player.Open","params":{"item":{"file":1},"options":{"resume":30.0}}}).then(function(r) {
//   console.log(r);
// });

const stream = 'http://trailers.divx.com/divx_prod/divx_plus_hd_showcase/Sintel_DivXPlus_6500kbps.mkv'
const params = { 'item': { 'file': stream }, options: { 'resume': { 'hours': 0, 'minutes': 10, 'seconds': 0, 'milliseconds': 0 }}}
kodi.player.open(params).then(function (r) {
  console.log(r)
})
