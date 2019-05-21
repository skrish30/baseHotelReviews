// Author: Oliver Rodriguez

// Modules to import
const express = require("express");
const rp = require("request-promise");
const cfenv = require("cfenv");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server);
require('dotenv').config({silent: true});

//modules for V2 assistant
var bodyParser = require('body-parser'); // parser for post requests


//Import Watson Developer Cloud SDK
var AssistantV2 = require('watson-developer-cloud/assistant/v2'); // watson sdk
const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');


// Get the environment variables from Cloud Foundry
const appEnv = cfenv.getAppEnv();

// Serve the static files in the /public directory
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Create the Conversation object
  var assistant = new AssistantV2({
  version: '2018-11-08'
});

var newContext = {
  global : {
    system : {
      turn_count : 1
    }
  }
};

// Create the Discovery object
const discovery = new DiscoveryV1({
  version: '2017-08-01',
  url: process.env.DISCOVERY_URL || 'https://gateway.watsonplatform.net/discovery/api',
});


// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});


io.on('connection', function(socket) {
  console.log('a user has connected');
  
  var assistantId = process.env.ASSISTANT_ID || '<assistant-id>';
  if (!assistantId || assistantId === '<assistant-id>>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>ASSISTANT_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  //console.log(`This is the assistant ${assistantId}`)

  assistant.createSession({
    assistant_id: process.env.ASSISTANT_ID || '{assistant_id}'
  })
    .then(res => {
      sessionId = res.session_id;
      //console.log(JSON.stringify(res, null, 2));
    })
    .catch(err => {
      console.log(err);
    });
    

  // Handle incomming chat messages
  socket.on('chat message', function(msg) {


    console.log('message: ' + msg);
    io.emit('chat message', "you: " + msg);
    

    
    /*****************************
        Send text to Conversation
    ******************************/

    
   assistant.message({
    assistant_id: assistantId,
    session_id: sessionId,
    input: {
      'message_type': 'text',
      'text': msg,
      options : {
        return_context : true
      }
      }
    })
    .then(res => {
      reply=(res.output.generic[0].text);
      //reply = (JSON.stringify(res, null, 2));
      //console.log(reply);
      
      var skills;
      (res.context.hasOwnProperty("skills")) ?  skills = res.context.skills["main skill"].user_defined : skills =false;
      
      //console.log(res.context.skills["main skill"].user_defined);
      var queryString = "";
      var answer = [];
      var city = "";
      //console.log(skills);
      if(skills){
        if(skills.best){
          console.log('best');
          console.log(skills.best);
          switch(skills.best){
            case "All":
            queryDiscovery("term(hotel,count:50).average(enriched_text.sentiment.document.score)", (err,queryResults) =>{
              console.log(err+"I am here");
              if(err){
                console.log(err);
              }
            
              queryResults = queryResults.aggregations[0].results;
              console.log(queryResults)
              findBestHotels(queryResults, (hotel,sentiment)=>{
                  console.log( "The best hotel overall is " + hotel.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase())  
                    + "with an average sentiment of " + sentiment.toFixed(2));
              });
            });
              break;
            case "new-york-city":
            queryDiscovery("filter(city::"+skills.best+").term(hotel,count:50).average(enriched_text.sentiment.document.score)", (err,queryResults) =>{
              console.log(err+"I am here");
              console.log(queryResults);
            
              if(err){
                console.log(err);
              }
            
              queryResults = queryResults.aggregations[0].aggregations[0].results;
              console.log(queryResults)
              findBestHotels(queryResults, (hotel,sentiment)=>{
                  console.log( "The best hotel in New York City is " + hotel.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase())  
                    + "with an average sentiment of " + sentiment.toFixed(2));
              });
            });
              break;
            case "san-francisco":
            queryDiscovery("filter(city::"+skills.best+").term(hotel,count:50).average(enriched_text.sentiment.document.score)", (err,queryResults) =>{
              console.log(err+"I am here");
              console.log(queryResults);
            
              if(err){
                console.log(err);
              }
            
              queryResults = queryResults.aggregations[0].aggregations[0].results;
              console.log(queryResults)
              findBestHotels(queryResults, (hotel,sentiment)=>{
                  console.log( "The best hotel in San Francisco is " + hotel.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase())  
                    + "with an average sentiment of " + sentiment.toFixed(2));
              });
            });
              break;
            case "chicago":
            queryDiscovery("filter(city::"+skills.best+").term(hotel,count:50).average(enriched_text.sentiment.document.score)", (err,queryResults) =>{
              console.log(err+"I am here");
              console.log(queryResults);
            
              if(err){
                console.log(err);
              }
            
              queryResults = queryResults.aggregations[0].aggregations[0].results;
              console.log(queryResults)
              findBestHotels(queryResults, (hotel,sentiment)=>{
                  console.log( "The best hotel in Chicago is " + hotel.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase())  
                    + "with an average sentiment of " + sentiment.toFixed(2));
              });
            });
              break;
          }
        } else if(skills.list){
          console.log('list');
        } else if(skills.hotel){
          console.log('hotel');
        } 
      } else{
        io.emit('chat message',"Hotel BOT: " + reply);
      }

    })
    .catch(err => {
      console.log(err);
    });
    

    // ***************************************

   });
});

app.get('/', function(req, res){
  res.sendFile('index.html');
});

/*****************************
    Function Definitions
******************************/
function queryDiscovery(query,callback){
  //function to query Discovery
  let queryParams ={
    environment_id: process.env.ENVIRONMENT_ID,
    collection_id: process.env.COLLECTION_ID,
    aggregation: query
  };
  console.log(queryParams);
  discovery.query(queryParams)
    .then(queryResponse =>{
      //console.log(JSON.stringify(queryResponse, null, 2));
      /*
      fsPromises.writeFile("data.txt", JSON.stringify(queryResponse, null, 2))
        .then(()=> console.log("success"))
        .catch(()=> console.log("failure"))
      */
      console.log('successful query');
      callback(null,queryResponse);
    })
    .catch(err =>{
      console.log('error',err);
      callback(err,null);
    });
};

function findBestHotels(queryResults,callback){
  //Function to find the best hotel

  let highestSent =0;
  let currentSent;
  let bestHotel;
  for (let index = 0; index < queryResults.length; index++) {
    currentSent = queryResults[index].aggregations[0].value;
    if(currentSent > highestSent){
      highestSent = currentSent;
      bestHotel = queryResults[index].key;
    }
  }
  callback(bestHotel, highestSent);
}

