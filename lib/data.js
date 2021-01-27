/* lib for storing and editing data into /.data folder */

// Deps
var fs = require('fs');
var path = require('path');

// Container for the module
var lib = {};

// define base directory of the data flder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback) {
    // Open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fd) {
        if (!err && fd) {
            // convert data to string
            var stringData = JSON.stringify(data);
            // Write to file and close it
            fs.writeFile(fd, stringData, function(err) {
                if (!err) {
                    fs.close(fd, function(err) {
                        if (!err) {
                            callback(false);
                        } else callback('error closing new file');
                    })
                } else {
                    callback('error writing to the file');
                }
            })
        } else {
            callback('Could not create a new file, it may already exist');
        }
    });
};

lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', function(err, data) {
        callback(err, data);
    });
};

lib.update = function(dir, file, data, callback) {
    // Open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err, fd) {
        if (!err && fd) {
            // convert data to string
            var stringData = JSON.stringify(data);

            // truncate the content
            fs.ftruncate(fd, function(err) {
                if (!err) {
                    fs.writeFile(fd, stringData, function(err) {
                        if (!err) {
                            fs.close(fd, function(err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('error : could not close file');
                                }
                            })
                        } else {
                            callback('error : could not write to the file');
                        }
                    })
                } else {
                    callback('error : could not truncate the file');
                }
            });
        }
    });
};

lib.delete = function(dir, file, callback) {
    // Unlink the file
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err) {
        if (!err) {
            callback(false);
        } else {
            callback('error: could not delete file.');
        }
    });
};
// Export module
module.exports = lib;