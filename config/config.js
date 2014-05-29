var _ = require('lodash');
var env = process.env.NODE_ENV || 'development';

module.exports = _.extend(
    require('./env/all'),
    require('./env/' + env)
);