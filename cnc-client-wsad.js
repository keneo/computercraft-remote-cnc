net = require('net');

var client = new net.Socket();
client.connect(5000, '127.0.0.1', function() {
  console.log('Connected. Use WSAD to move.');
  //client.write('Hello, server! Love, Client.');
  //client.write(arg);

  // without this, we would only get streams once enter is pressed
  process.stdin.setRawMode( true );

  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  process.stdin.resume();

  // i don't want binary, do you?
  process.stdin.setEncoding( 'utf8' );

  // on any data into stdin
  process.stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
      process.exit();
    }

    var keymap = { 
      'w':'forward()',
      's':'back()',
      'a':'turnLeft()',
      'd':'turnRight()',
      ' ':'up()',
      'e':'up()',
      'c':'down()',
      'W':'dig()',
      '2':'digUp()',
      'E':'digUp()',
      'C':'digDown()',
      'r':'refuel(1)',
    };

    var script = keymap[key];

    if (script==undefined) {
      console.log("Unmapped key: " + key);
    } else {
      client.write("state=turtle."+script+"\n");
    }

    // write the key to stdout all normal like
    //process.stdout.write( key );
  });


});

client.on('data', function(data) {
  console.log('Received: ' + data);
  //client.destroy(); // kill client after server's response
});

client.on('close', function() {
  console.log('Connection closed');
  process.exit();
});