var http  = require('http'); //The built-in "http" module provides HTTP server and client functionality
var fs    = require('fs'); // The built-in "fs" module provides filesystem-related functionality
var path  = require('path'); //The built-in "path" module provides filesystem path-related functionality
var mime  = require('mime'); // The add-on "mime" module provides the ability to derive a MIME type based on a filename extension
var cache = {}; //The cache object is where the contents of cached files are stored

//Helper functions
// this helper function handles the sending og 404 errors when file requests fail

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

//This second helper function handles serving file data, and writes appropriate http header then sends the contents of the file 

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );  response.end(fileContents);
}


function serveStatic(response, cache, absPath) {
  if (cache[absPath]) { // Check if file is cached in memory
    sendFile(response, absPath, cache[absPath]); // Serve file from memory
  } else {
    fs.exists(absPath, function(exists) {  //Check if file exists
      if (exists) {
        fs.readFile(absPath, function(err, data) { // Read file from disk
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data); // Serve file read from disk
          }
        });
      } else {
        send404(response); // Send HTTP 404 response
      }
    });
  }
}

//Create an HTTP server that listens for requests and serves static files
var server = http.createServer(function(request, response) { //Create HTTP server, using anonymous function to define per-request behavior 
  var filePath = false;
  if (request.url == '/') {
    filePath = 'public/index.html'; //Determine HTML file to be served by default
  } else {
    filePath = 'public' + request.url; // Translate URL path to relative file path
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath); // Serve the static file
});

//Start the server and listen on port 3000
server.listen(3000, function() {
     console.log("Server listening on port 3000.");
});