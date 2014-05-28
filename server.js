// NODE_ENV=staging|production|development node server.js

var debug = require('debug')('lotto');
var config = require('./config/config');
var app = require('./app');

//app.set('port', process.env.PORT || 3000);
app.set('port', config.port || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
