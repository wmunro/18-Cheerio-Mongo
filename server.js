var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

//Morgan
var logger = require('morgan');
app.use(logger('dev'));

//Setting static folder
app.use(express.static('public'));

//Mongoose 
mongoose.connect('mongodb://heroku_z2hrssqk:2p05ml5kqb9log7uvffai3fgcg@ds143707.mlab.com:43707/heroku_z2hrssqk');
var db = mongoose.connection;

db.on('error', function(err){
  console.log("MG Error: ", err);
});
db.once('open', function(){
  console.log("DB connection successful.");
});

//Handlebars
var expressHandlebars = require('express-handlebars');
app.engine('handlebars', expressHandlebars({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));


var Comment = require('./models/comment.js');
var Content = require("./models/content.js");

app.get('/', function(req, res){
  request('https://www.reddit.com/r/Election/', function(err, res, html){
    var $ = cheerio.load(html);
    var result = [];
    $("p.title").each(function(i, element){
      var title = $(this).text();
      var link = $(element).children().attr('href');

      //New Content
      var pageContent = new Content({
        title : title,
        link : link
      });

      //Save to DB
      pageContent.save(function(err, dbContent){
        if (err){
          console.log(err);
        }
        else{
          console.log(dbContent);
        }
      });
    });
  res.sendFile(process.cwd() + "/index.html")
  });
});

app.listen(3000, function(){
  console.log('Connected to', 3000);
});