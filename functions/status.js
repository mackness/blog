const os = require('os')
const pkg = require('../../package.json')

exports.handler = function(event, context, callback) {
  callback(null, {
    statusCode: 200,
    body: {
      version: pkg.version,
      cpu: os.cpus(),
    },
  })
}
