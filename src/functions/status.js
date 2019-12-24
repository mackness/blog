const os = require('os')
const pkg = require('../../package.json')

exports.handler = function(event, context, callback) {
  callback({
    version: pkg.version,
    cpu: os.cpus(),
  })
}
