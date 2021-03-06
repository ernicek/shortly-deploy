var mongoose    = require('mongoose');

var prodVersion = false;
if (process.env.NODE_ENV === 'production') {
  prodVersion = true;
  console.log('Using production settings!');
  mongoose.connect('mongodb://MongoLab-c:Psr6cAsLDibDhzSM66S.5Lt7twoSi0dkl7ZN_JGttIo-@ds056727.mongolab.com:56727/MongoLab-c');
} else {
  mongoose.connect('mongodb://localhost/shortly2');
}

var express = require('express');
var partials = require('express-partials');
var util = require('./lib/utility');

var handler = require('./lib/request-handler');

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser('shhhh, very secret'));
  app.use(express.session());
});

app.get('/', util.checkUser, handler.renderIndex);
app.get('/create', util.checkUser, handler.renderIndex);

app.get('/links', util.checkUser, handler.fetchLinks);
app.post('/links', handler.saveLink);

app.get('/login', handler.loginUserForm);
app.post('/login', handler.loginUser);
app.get('/logout', handler.logoutUser);

app.get('/signup', handler.signupUserForm);
app.post('/signup', handler.signupUser);

app.get('/*', handler.navToLink);

module.exports = app;
