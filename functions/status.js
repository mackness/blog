exports.handler = function(event, context, callback) {
  const value = event.queryStringParameters.value || 42
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      value,
    }),
  })
}
