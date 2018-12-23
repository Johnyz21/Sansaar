const fs = require('fs')
// const Jimp = require('jimp');

function getDestination (req, file, cb) {
  cb(null, '/dev/null')
}

function MyCustomStorage (opts) {
  this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  this.getDestination(req, file, function (err, path) {
    // if (err) return cb(err)
    //
    // Jimp.read(file).then( image => {
    //   image.resize(256,256).quality(20).write(path);
    //   console.log(path);
    //   return cb(null, {
    //       path: path,
    //       filename: file.originalname
    //     })
    // }).catch( () => { return cb});





    var outStream = fs.createWriteStream(path);
    console.log(file);
    file.stream.pipe(outStream);
    outStream.on('error', cb);
    outStream.on('finish', function () {
      cb(null, {
        path: path,
        size: outStream.bytesWritten,
        filename: file.originalname
      })
    });
  })
}

MyCustomStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb)
}

module.exports = function (opts) {
  return new MyCustomStorage(opts)
}
