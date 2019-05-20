// Author: Oliver Rodriguez

// Modules to import
const express = require("express");
const rp = require("request-promise");
const cfenv = require("cfenv");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server);

//Import Watson Developer Cloud SDK
const watson = require("watson-developer-cloud");
// Import service credentials

// Get the environment variables from Cloud Foundry
const appEnv = cfenv.getAppEnv();

// Serve the static files in the /public directory
app.use(express.static(__dirname + '/public'));

// Create the Conversation object
var conversation = new watson.ConversationV1({
  username:serviceCredentials.conversation.username,
  password:serviceCredentials.conversation.password,
  version_date: watson.ConversationV1.VERSION_DATE_2017_05_26
});

var workspace = serviceCredentials.conversation.workspaceID;
var context = {};

// Create the Discovery object
var discovery = new watson.DiscoveryV1({
  username: serviceCredentials.discovery.username,
  password: serviceCredentials.discovery.password,
  version_date: watson.DiscoveryV1.VERSION_DATE_2017_04_27
});

var environmentId = serviceCredentials.discovery.environmentID;
var collectionId = serviceCredentials.discovery.collectionID;

// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

io.on('connection', function(socket) {
  console.log('a user has connected');

  // Handle incomming chat messages
  socket.on('chat message', function(msg) {

    console.log('message: ' + msg);
    io.emit('chat message', "you: " + msg);

    /*****************************
        Send text to Conversation
    ******************************/



   });
});

app.get('/', function(req, res){
  res.sendFile('index.html');
});

/*****************************
    Function Definitions
******************************/

