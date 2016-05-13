/*
 * @Author: Yuk
 * @Date:   2016-05-13 15:18:17
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-13 23:26:20
 */

'use strict';
// 获取更新票据;
// 票据中间件
var sha1 = require('sha1');
var getRawBody = require('raw-body');
var util = require('./util.js');
var Wechat = require('./wechat');

module.exports = function(options) {
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

    console.log('get post');

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
      var content = yield util.parseXMLAsync(data);
      console.log(content);
      var message = util.formatMessage(content.xml);
      console.log(message);
      if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
          var now = new Date().getTime();
          that.status = 200;
          that.type = 'application/xml';
          var reply = '<xml>' +
            '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
            '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
            '<CreateTime>' + now + '</CreateTime>' +
            '<MsgType><![CDATA[text]]></MsgType>' +
            '<Content><![CDATA[你好...]]></Content>' +
            '</xml>';
          console.log(reply);
          that.body = reply;
          return
        }
      }
    }
  }
}
