var path = require('path')
var Buffer = require('buffer').Buffer
var fs = require('fs')

function encodeBase64 (filename) {
  try {
    var data = fs.readFileSync(path.join(__dirname, '..', '..', '/public/', 'images', filename))
    var buf = Buffer.from(data)
    return buf.toString('base64')
  } catch (err) {
    return false
  }
}

exports.encodeBase64 = encodeBase64

