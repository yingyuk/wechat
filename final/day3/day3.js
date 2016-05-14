/*
 * @Author: Yuk
 * @Date:   2016-05-14 15:31:23
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-14 16:13:08
 */

'use strict';
var fs = require('fs');
var path = require('path');
var count_file = path.join(__dirname + '/count.txt');
var express = require('express');
var app = express();

function count(fpath) {

  if (!fpath) {
    throw new Error('缺少文件路径;')
  }
  var num = 0;
  if (fs.existsSync(fpath)) {
    num = fs.readFileSync(fpath);
  } else {
    fs.writeFileSync(fpath, num);
  }
  if (isNaN(num)) {
    num = 0;
  }
  return function(req, res, next) {
    req.num = fs.readFileSync(fpath);
    fs.writeFileSync(fpath, ++num);
    next();
  }
}
app.use(count(count_file));

app.get('/', function(req, res) {
  // var body = req.num;
  var body = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Document</title></head><body>' + req.num + '</body></html>';

  res.send(body);
})
app.listen(443);
console.log(443);
