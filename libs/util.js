/*
 * @Author: Yuk
 * @Date:   2016-05-13 20:32:06
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-13 22:31:15
 */

'use strict';
// 读写文件;
var fs = require('fs');

exports.readFileAsync = function(fpath, encoding) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fpath, encoding, function(err, content) {
      if (err) {
        reject()
      } else {
        resolve(content);
      }
    })
  })
}

exports.writeFileAsync = function(fpath, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(fpath, content, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  })
}
