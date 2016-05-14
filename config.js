/*
* @Author: yingyuk
* @Date:   2016-05-14 20:05:12
* @Last Modified by:   Yuk
* @Last Modified time: 2016-05-14 23:52:26
*/

'use strict';

var path = require('path');
var sha1 = require('sha1');
var util = require('./libs/util.js');
var wechat_file = path.join(__dirname + '/config/wechat.txt');

var config = {
  wechat: {
    // appID: 'wx319d986c900527d7',
    // appSecret: 'de760f83f74145a738472c99e9318221',
    appID: 'wx61b587718f0c7f5e',
    appSecret: 'b75e415d163411b9f6ba3d948c9f1fe1',
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

module.exports = config;
