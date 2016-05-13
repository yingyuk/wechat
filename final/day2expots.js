/*
 * @Author: Yuk
 * @Date:   2016-05-14 00:28:20
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-14 01:18:30
 */

'use strict';

var fs = require('fs');
var num = 0;

exports.reduce = function(fpath, encoding) {
  try {
    var count = parseInt(fs.readFileSync(fpath), 10)
  } catch (e) {
    write(fpath, ++num);
  }
  if (isNaN(count)) {
  	count=0;
  }
  write(fpath, ++count);
  return count;
}

function read(fpath, encoding) {
  return new Promise(function(resolve, reject) {
    console.log(fpath);
    fs.readFile(fpath, encoding, function(err, content) {
      if (err) {
        console.log('err');
        reject(err);
      } else {
        resolve(content);
      }
    });
  })
}

function write(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err, content) {
      if (err) {
        console.log('err');
        reject(err);
      } else {
        resolve(content);
      }
    });
  })
}
