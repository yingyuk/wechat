/*
 * @Author: Yuk
 * @Date:   2016-05-13 21:54:58
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-15 00:12:41
 */

'use strict';
var Promise = require('bluebird')
var fs = require('fs');
var request = Promise.promisify(require('request'));
var util = require('./util.js');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  upload: prefix + 'media/upload?'
};

function Wechat(options) {
  var that = this;
  this.appID = options.wechat.appID;
  this.appSecret = options.wechat.appSecret;
  this.getAccessToken = options.wechat.getAccessToken;
  this.saveAccessToken = options.wechat.saveAccessToken;
  this.fetchAccessToken();
}

Wechat.prototype = {
  constructor: Wechat,
  fetchAccessToken: function() {
    var that = this;
    console.log('开始获取');
    if (this.access_token && this.expires_in) {
      console.log('存在');
      if (this.isValidAccessToken(this)) {
        console.log('未失效');

        return Promise.resolve(this);
      }
    }
    console.log('重新获取');

    this.getAccessToken()
      .then(function(data) {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return that.updateAccessToken(data);
        }
        if (that.isValidAccessToken(data)) {
          return Promise.resolve(data);
        } else {
          return that.updateAccessToken();
        }
      })
      .then(function(data) {
        that.access_token = data.access_token;
        that.expires_in = data.expires_in;
        that.saveAccessToken(data);
        return Promise.resolve(data);
      });
  },
  isValidAccessToken: function(data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime())
    console.log(now);
    console.log(expires_in);
    if (now < expires_in) {
      return true;
    } else {
      return false;
    }
  },
  updateAccessToken: function() {
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
    return new Promise(function(resolve, reject) {
      request({ url: url, json: true })
        .then(function(response) {
          var data = response.body;
          var now = (new Date()).getTime();
          var expires_in = now + (data.expires_in - 20) * 1000;
          data.expires_in = expires_in;
          resolve(data);
        })
    })
  },
  reply: function*() {
    var content = this.body;
    var message = this.weixin;
    console.log('content ', content);
    var xml = util.tpl(content, message);

    console.log(xml);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
  },
  uploadMaterial: function(type, filePath) {
    var that = this;
    var form = {
      media: fs.createReadStream(filePath)
    };
    var appID = this.appID;
    var appSecret = this.appSecret;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.upload + 'access_token=' + data.access_token + '&type=' + type;
          request({ method: 'POST', url: url, formData: form, json: true })
            .then(function(response) {
              var _data = response.body;
              console.log('_data', _data);
              console.log('_data', _data.media_id);
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('upload error!');
              }
            })
            .catch(function(err) {
              reject(err);
            })

        })
    })
  }

};



module.exports = Wechat;
