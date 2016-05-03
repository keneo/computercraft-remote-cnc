// Load the TCP Library
net = require('net');

arg = process.argv[2]



var client = new net.Socket();
client.connect(5000, '127.0.0.1', function() {
  console.log('Connected');
  //client.write('Hello, server! Love, Client.');
  client.write(arg);
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.log('Connection closed');
});