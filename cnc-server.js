// Load the TCP Library
const net = require('net');
const carrier = require('carrier');
const http = require('http');


// Keep track of the chat clients
const clients = [];
const webWaitingClients = [];
const todoCommands = [];

function sendNextCommandTo(webcli){
  var cmd = todoCommands.shift();
  webcli.end(cmd);
  broadcast("REQUEST_SENT " + cmd,"webclient");
}

function addCommand(cmd) {
  todoCommands.push(cmd);
  if (webWaitingClients.length>0){
    var webcli = webWaitingClients.shift();

    sendNextCommandTo(webcli);
  } else {
    broadcast("REQUEST_ENQUEUED " + cmd);
  }
}

// Send a message to all clients
function broadcast(message, sender) {
  clients.forEach(function (client) {
    // Don't want to send it to sender
    if (client === sender) return;
    client.write(message + "\r\n");
  });
  // Log it to the server output too
  process.stdout.write(message + "\r\n");
}

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort

  // Put this new client in the list
  clients.push(socket);

  // Send a nice welcome message and announce
  socket.write("WELCOME " + socket.name + "\r\n");
  broadcast("JOINED " + socket.name, socket);

  // Handle incoming messages from clients.
  //socket.on('data', function (data) {
  //  broadcast(socket.name + "> " + data, socket);
  //  addCommand(data);
  //});

  carrier.carry(socket, function(line) {
    //console.log('got one line: ' + line);
    broadcast(socket.name + "> " + line, socket);
    addCommand(line);
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast("LEFT " + socket.name);
  });

  // Remove the client from the list when it leaves
  socket.on('error', function (err) {
    clients.splice(clients.indexOf(socket), 1);
    broadcast("ERROR " + socket.name + " " + err);
    broadcast("LEFT " + socket.name);
  });

}).listen(5000);


// Put a friendly message on the terminal of the server.
console.log("C&C admin telnet server running at port 5000\n");

http.createServer(function (req, res) {

  if (req.url=="/hello/") {
    res.end("Hello!");
  } else if (req.url.startsWith("/?")) {
    broadcast("SLAVE_STATE " + req.url.substring(2));

    res.writeHead(200, {'Content-Type': 'text/plain'});
    if (todoCommands.length>0) {
      var webcli = res;
      sendNextCommandTo(webcli);
    } else {
      broadcast("SLAVE_WAITING");
      webWaitingClients.push(res);
    }

  } else if (req.url=="/favicon.ico") {
    res.end();
  } else {
    broadcast("UNHANDLED " + req.url);
  }
}).listen(8080);
console.log("C&C turtle overlord (web server) running at http://127.0.0.1:8080/\n");
