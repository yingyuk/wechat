/*
 * @Author: Yuk
 * @Date:   2016-05-14 00:28:20
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-16 17:57:02
 */

'use strict';

var fs = require('fs');
var count = 0;

exports.count = function(fpath, encoding) {
  if (!fpath) {
    console.log('没有文件路径');
    return;
  }
  if (fs.existsSync(fpath)) {
    // console.log(fs.existsSync(fpath));
    // console.log(fs.statSync(fpath));
    // console.log(fs.lstatSync(fpath));
    // console.log(fs.accessSync(fpath));
    count = parseInt(fs.readFileSync(fpath), 10);
  } else {
    fs.writeFileSync(fpath, count)
  }
  if (isNaN(count)) {
    count = 0;
  }
  return function*(next) {
    if (this.method === 'GET' && this.url.indexOf('/favicon.ico') === -1) {
      count++;
      fs.writeFileSync(fpath, count);
    }
    this.count = count;
    yield * next;
  }
}

exports.time = function(next) {
  return function* time() {
  var that = this;
  console.log(that);
    var now = (new Date).getTime();
    yield next;
    var offset = (new Date).getTime() - now;
    that.set('X-Response-Time', offset);
  }
}
