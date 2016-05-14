/*
 * @Author: Yuk
 * @Date:   2016-05-13 22:31:21
 * @Last Modified by:   yingyuk
 * @Last Modified time: 2016-05-14 20:57:20
 */

'use strict';
var xml2js = require('xml2js');
var template = require('./template.js');



exports.parseXMLAsync = function(xml) {
  return new Promise(function(resolve, reject) {
    xml2js.parseString(xml, { trim: true }, function(err, content) {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    })
  })
}

function formatMessage(result) {
  var message = {};
  if (typeof result == 'object') {
    var keys = Object.keys(result);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var item = result[key];
      if (!(item instanceof Array) || item.length == 0) {
        continue;
      }
      if (item.length === 1) {

        var val = item[0];
        if (typeof val === 'object') {
          // 继续格式化;
          message[key] = formatMessage(val);
        } else {
          // 是否是空的
          message[key] = (val || '').trim();
        }
      } else {
        // 数组
        message[key] = [];
        for (var i = 0, len = item.length; i < len; i++) {
          message[key].push(formatMessage(item[j]));

        }
      }
    }
  }
  return message;
}

exports.formatMessage = formatMessage;
exports.tpl = function(content, message) {
  var info = {};
  var type = 'text';
  var fromUserName = message.FromUserName;
  var toUserName = message.ToUserName;
  if (Array.isArray(content)) {
    type = 'news';
  }
  type = content.type || type;
  info = {
    content: content,
    createTime: (new Date()).getTime(),
    msgType: type,
    toUserName: fromUserName,
    fromUserName: toUserName
  };
  return template.compiled(info);

}
