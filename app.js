/*
 * @Author: Yuk
 * @Date:   2016-05-13 15:18:17
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-13 21:49:35
 */

'use strict';

var path = require('path');
var Koa = require('koa');
var sha1 = require('sha1');
var wechat = require('./wechat/generator.js');
var util = require('./libs/util.js');

var wechat_file = path.join(__dirname + '/config/wechat.txt');

var port = 443;
var config = {
  wechat: {
    appID: 'wx319d986c900527d7',
    appSecret: 'de760f83f74145a738472c99e9318221',
    token:'nodewechat',
    getAccessToken:function () {
    	return util.readFileAsync(wechat_file);
    },
    saveAccessToken:function (data) {
    	data = JSON.stringify(data);
    	return util.writeFileAsync(wechat_file,data);
    }

  }
};

var app = new Koa();
app.use(wechat(config));
app.listen(port);
console.log('Listening : ' + port);
