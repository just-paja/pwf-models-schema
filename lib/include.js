if (!pwf.get_status('class', 'model')) {
	require('pwf-models');
}

if (!pwf.get_status('module', 'async')) {
	require('pwf-async-compat');
}

module.exports = require('./schema');
