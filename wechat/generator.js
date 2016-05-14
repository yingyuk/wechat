/*
 * @Author: Yuk
 * @Date:   2016-05-13 15:18:17
 * @Last Modified by:   yingyuk
 * @Last Modified time: 2016-05-14 21:56:47
 */

'use strict';
// 获取更新票据;
// 票据中间件
var sha1 = require('sha1');
var getRawBody = require('raw-body');
var util = require('./util.js');
var Wechat = require('./wechat');

module.exports = function(options,handler) {
  var wechat = new Wechat(options);
  return function*(next) {
    var that = this;
    var token = options.wechat.token;
    var signature = this.query.signature;
    var nonce = this.query.nonce;
    var timestamp = this.query.timestamp;
    var echostr = this.query.echostr;
    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);

    if (this.method === 'GET') {
      if (sha === signature) {
        this.body = echostr + '';
      } else {
        this.body = 'wrong';
      }
    } else if (this.method === 'POST') {
      // 推送数据,消息
      // 防止其他人的服务器的POST;
      if (sha !== signature) {
        this.body = 'wrong';
        return false;
      }
      var data = yield getRawBody(this.req, {
        // 拿到数据;
        length: this.length,
        limit: '1mb',
        encoding: this.charset
      });
      // 格式转换;
      console.log('data',data);
      var content = yield util.parseXMLAsync(data);
      console.log(content);
      var message = util.formatMessage(content.xml);
      console.log(message);
      this.weixin = message;

      yield handler.call(this,next);

      yield wechat.reply.call(this);

    }
  }
}
