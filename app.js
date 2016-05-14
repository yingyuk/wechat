/*
 * @Author: Yuk
 * @Date:   2016-05-13 15:18:17
 * @Last Modified by:   yingyuk
 * @Last Modified time: 2016-05-14 20:44:00
 */

'use strict';

var path = require('path');
var Koa = require('koa');
var sha1 = require('sha1');
var wechat = require('./wechat/generator.js');
var config = require('./config.js');
var util = require('./libs/util.js');
var weixin = require('./weixin.js');


var wechat_file = path.join(__dirname + '/config/wechat.txt');

var port = 443;

var app = new Koa();
app.use(wechat(config,weixin.reply));
app.listen(port);
console.log('Listening : ' + port);
