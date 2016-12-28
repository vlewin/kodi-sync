// let upnpClient = require("node-upnp-client")
// var cli = new upnpClient();
// cli.searchDevices();
// cli.on('searchDevicesEnd', function() {
//   console.log('searchDevicesEnd')
// 	console.log('_avTransports'+ JSON.stringify(cli._avTransports))
//   console.log('_renderers'+ JSON.stringify(cli._renderers))
//   console.log('_connectionManagers'+ JSON.stringify(cli._connectionManagers))
//   console.log('_servers'+ JSON.stringify(cli._servers))
// });
// cli.on('updateUpnpDevice', function() {
//   console.log('updateUpnpDevice')
//   console.log('_avTransports'+ JSON.stringify(cli._avTransports))
//   console.log('_renderers'+ JSON.stringify(cli._renderers))
//   console.log('_connectionManagers'+ JSON.stringify(cli._connectionManagers))
//   console.log('_servers'+ JSON.stringify(cli._servers))
// });

var bonjour = require('bonjour')()

// advertise an HTTP server on port 3000
// bonjour.publish({ name: 'My Web Server', type: 'http', port: 3000 })

// browse for all http services
bonjour.find({ type: 'http' }, function (service) {
  console.log('Found an HTTP server:', service.name, service.referer.address, service.port)
})
