/*
 * @Author: Yuk
 * @Date:   2016-05-13 23:30:56
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-14 00:38:16
 */

'use strict';
var koa = require('koa');

var path = require('path');
var count_file = path.join(__dirname + '/count.txt');
var Reduce = require('./day2expots.js');



var app = koa();
app.use(function*() {
  var echo = this.query.echo;
  var count = Reduce.reduce(count_file);
  if (!echo) {
    this.body = 'hahaha none' + count;
  } else {
    this.body = echo + count;
  }
})
app.listen(443);
console.log('443');
