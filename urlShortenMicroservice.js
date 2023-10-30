require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
 const url = require("url");
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const urlSchema = new mongoose.Schema({
  url: String,
});
//intiate the model with above schema
let Url = mongoose.model('Url', urlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let oriUrl = [];

app.post('/api/shorturl',(req,res)=>{
  const originalUrl = req.body.url;
 

  const lookupUrl = originalUrl;
  const parsedLookupUrl = url.parse(lookupUrl);
  dns.lookup(parsedLookupUrl.protocol ? parsedLookupUrl.host 
             : parsedLookupUrl.path, (error,address,family)=>{
  
   if(error || !address)  {
     res.json({error:'invalid url'}) 
   } else {
    oriUrl.push(originalUrl);
     res.json({"original_url":originalUrl});
   } 

     }
  );
});

app.get('/api/shorturl/:short_url',(req,res)=>{
  console.log(oriUrl);
  console.log(oriUrl[1]);
  res.redirect(oriUrl[1])
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
