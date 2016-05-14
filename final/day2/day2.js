/*
 * @Author: Yuk
 * @Date:   2016-05-13 23:30:56
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-14 15:13:13
 */

'use strict';
var koa = require('koa');

var path = require('path');
var count_file = path.join(__dirname + '/count.txt');
var Count = require('./day2expots.js');



var app = koa();
app.use(Count.count(count_file));
app.use(function*() {
  var echo = this.query.echo;
  if (!echo) {
    this.body = 'none ' + this.count;
  } else {
    this.body = echo + this.count;
  }
})
app.listen(443);
console.log('443');
