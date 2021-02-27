/* lib for storing and editing data into /.data folder */

// Deps
const fs = require('fs');
const path = require('path');
const helpers = require('../helpers');

// Container for the module
const dataPipe = {};

// define base directory of the data flder
dataPipe.baseDir = path.join(__dirname, '../../.data/');

// Write data to a file
dataPipe.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(`${dataPipe.baseDir + dir}/${file}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      // convert data to string
      const stringData = JSON.stringify(data);
      // Write to file and close it
      fs.writeFile(fd, stringData, (writeError) => {
        if (!writeError) {
          fs.close(fd, (closeError) => {
            if (!closeError) {
              callback(false);
            } else callback('error closing new file');
          });
        } else {
          callback('error writing to the file');
        }
      });
    } else {
      callback('Could not create a new file, it may already exist');
    }
  });
};

// Read
dataPipe.read = (dir, file, callback) => {
  fs.readFile(`${dataPipe.baseDir + dir}/${file}.json`, 'utf-8', (err, data) => {
    if (!err && data) {
      callback(false, helpers.parseJson(data));
    } else {
      callback(err, data);
    }
  });
};

// Update
dataPipe.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(`${dataPipe.baseDir + dir}/${file}.json`, 'r+', (err, fd) => {
    if (!err && fd) {
      // convert data to string
      const stringData = JSON.stringify(data);

      // truncate the content
      fs.ftruncate(fd, (truncateError) => {
        if (!truncateError) {
          fs.writeFile(fd, stringData, (writeError) => {
            if (!writeError) {
              fs.close(fd, (closeError) => {
                if (!closeError) {
                  callback(false, data);
                } else {
                  callback({ Error: 'could not close file' });
                }
              });
            } else {
              callback({ Error: 'could not write to the file' });
            }
          });
        } else {
          callback({ Error: 'could not truncate the file' });
        }
      });
    }
  });
};

// Delete
dataPipe.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(`${dataPipe.baseDir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('error: could not delete file.');
    }
  });
};
// Export module
module.exports = dataPipe;
