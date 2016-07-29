var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var request = require('request');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);



// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'conf.VERIFY_TOKEN') {
        res.send(req.query['hub.challenge']);
        console.log('VERIFY_TOKEN Good!')
    } else {
        res.send('Invalid verify token');
    }
});

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging; //所有訊息

  for (i = 0; i < messaging_events.length; i++) { // 遍歷毎一則

    event = req.body.entry[0].messaging[i]; 
    sender = event.sender.id; // 誰發的訊息
    console.log(messaging_events)

    if (event.message && event.message.text) {
      text = event.message.text.toString();
      // Handle a text message from this sender
      console.log(sender,text)

      sendTextMessage(sender,text);
    }
  }
  res.sendStatus(200);
});


var token = "EAAPAMB8xZBQsBAGyvmBYJ2ZChwWYQUf9eogb1EZCpgkSc3LuEFeJCxEuE76EDZBy7flBZAinwWk9xZC2TCdzaTZAZC4EOxxWYqzy0CWk9z8IQcZBiQdyppqS1fiDkzjvHujNja5VWsdaoYGsJq6l6RXRaW6PDm7axDgbQDCHBbqYCCgZDZD";
function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}





// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
