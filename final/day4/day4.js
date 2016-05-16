/*
 * @Author: Yuk
 * @Date:   2016-05-13 23:30:56
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-16 17:52:29
 */

'use strict';
var koa = require('koa');

var path = require('path');
var count_file = path.join(__dirname + '/count.txt');
var Count = require('./day4expots.js');



var app = koa();
app.use(Count.time(Count.count(count_file)));

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
