// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get("/api/:date?", (req, res) => {
  console.log('param', req.params.date)
  if(req.params.date == '' || !req.params.date){
    console.log('empty date');
    res.send({
      unix: Date.now(),
      utc: new Date().toUTCString()
    })
  }else if(new Date(parseInt(req.params.date)) == 'Invalid Date') {
    console.log('invalidDate');
    res.send({'error':'Invalid Date'});
  }
  else if (/^\d+$/.test(req.params.date)) {
    console.log('number');
    const timestamp = Number(req.params.date);
    res.send({
      unix: timestamp,
      utc: new Date(timestamp).toUTCString()
    });
  } else {
    console.log('string')
    res.send({
      unix: new Date(req.params.date).getTime(),
      utc: new Date(req.params.date).toUTCString()
    });
  }
})


// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
