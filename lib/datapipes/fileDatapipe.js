/* lib for storing and editing data into /.data folder */

// Deps
var fs = require('fs');
var path = require('path');
var helpers = require('../helpers')

// Container for the module
var dataPipe = {};

// define base directory of the data flder
dataPipe.baseDir = path.join(__dirname, '../../.data/');

// Write data to a file
dataPipe.create = function(dir, file, data, callback) {
    // Open the file for writing
    fs.open(dataPipe.baseDir + dir + '/' + file + '.json', 'wx', function(err, fd) {
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

// Read
dataPipe.read = function(dir, file, callback) {
    fs.readFile(dataPipe.baseDir + dir + '/' + file + '.json', 'utf-8', function(err, data) {
        if (!err && data) {
            callback(false, helpers.toObject(data));
        } else {
            callback(err, data);
        }
    });
};

// Update
dataPipe.update = function(dir, file, data, callback) {
    // Open the file for writing
    fs.open(dataPipe.baseDir + dir + '/' + file + '.json', 'r+', function(err, fd) {
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

// Delete
dataPipe.delete = function(dir, file, callback) {
    // Unlink the file
    fs.unlink(dataPipe.baseDir + dir + '/' + file + '.json', function(err) {
        if (!err) {
            callback(false);
        } else {
            callback('error: could not delete file.');
        }
    });
};
// Export module
module.exports = dataPipe;