/*
 * @Author: yingyuk
 * @Date:   2016-05-14 20:08:28
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-15 00:47:51
 */

'use strict';
var config = require('./config');
var Wechat = require('./wechat/wechat');

var wechatApi = new Wechat(config);


// 暂时用来回复;
exports.reply = function*(next) {
  var message = this.weixin;
  if (message.MsgType === 'event') {
    // 关注
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        // ticket 可以换取二维码图片
        console.log('扫描二维码关注: ' + message.EventKey + ' ' + message.ticket);
      }
      this.body = '谢谢关注!\r\n' + ' 消息ID: ' + message.MsgId;
    } else if (message.Event === 'unsubscribe') {
      console.log('取消关注');
      this.body = '';
    }else if(message.Event === 'location'){
    	this.body = '地理位置是: ' + message.Latitude + '/' + message.Longitude +'精度 ' + message.Precision;
    }else if (message.Event === 'CLICK'){
    	this.body = '您点击了菜单 ' + message.EventKey;
    }else if(message.Event === 'SCAN'){
    	console.log('关注后扫二维码 ' + message.EventKey + ' ' + message.Ticket);
    	this.body = '看到你扫了一下哦';
    }else if(message.Evnt === 'VIEW'){
    	this.body = '您点击了菜单中的链接 ' + message.EventKey;
    }
  }else if (message.MsgType === 'text') {
  	var content = message.Content;
  	var reply = '额,你说的'+ content + '太复杂了';
  	if (content === '1') {
  		reply = '一';
  	}else if (content === '2'){
  		reply = '二';
  	}else if(content === '4'){
  		reply = [{
  			title:'这是图片的title',
  			description:'图片的描述',
  			picUrl:'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/logo_white_fe6da1ec.png',
  			url:'https://github.com/'
  		}];
  	}else if(content === '5'){
  		var data = yield wechatApi.uploadMaterial('image',__dirname + '/1.png');
  		reply = {
  			type:'image',
  			mediaId:data.media_id
  		}
  	}else if(content === '6'){
  		var data = yield wechatApi.uploadMaterial('video',__dirname + '/2.mp4');
  		reply = {
  			type:'video',
  			title:'视频',
  			description:'描述',
  			mediaId:data.media_id
  		}
  	}
  	}else if(content === '7'){
  		var data = yield wechatApi.uploadMaterial('music',__dirname + '/2.png');
  		reply = {
  			type:'music',
  			title:'音乐',
  			description:'描述',
  			musicUrl:'',
  			thumbMediaId:data.media_id
  		}
  	}
  	this.body = reply;
  }
  yield next;
}
