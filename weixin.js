/*
 * @Author: yingyuk
 * @Date:   2016-05-14 20:08:28
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-16 17:34:07
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
    } else if (message.Event === 'location') {
      this.body = '地理位置是: ' + message.Latitude + '/' + message.Longitude + '精度 ' + message.Precision;
    } else if (message.Event === 'CLICK') {
      this.body = '您点击了菜单 ' + message.EventKey;
    } else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码 ' + message.EventKey + ' ' + message.Ticket);
      this.body = '看到你扫了一下哦';
    } else if (message.Evnt === 'VIEW') {
      this.body = '您点击了菜单中的链接 ' + message.EventKey;
    }
  } else if (message.MsgType === 'text') {
    var content = message.Content;
    var reply = '额,你说的' + content + '太复杂了';
    if (content === '1') {
      reply = '一';
    } else if (content === '2') {
      reply = '二';
    } else if (content === '4') {
      reply = [{
        title: '这是图片的title',
        description: '图片的描述',
        picUrl: 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/logo_white_fe6da1ec.png',
        url: 'https://github.com/'
      }];
    } else if (content === '5') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.png');
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    } else if (content === '6') {
      var data = yield wechatApi.uploadMaterial('video', __dirname + '/2.mp4');
      reply = {
        type: 'video',
        title: '视频',
        description: '描述',
        mediaId: data.media_id
      }
    } else if (content === '7') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.png');
      reply = {
        type: 'music',
        title: '音乐',
        description: '描述',
        musicUrl: 'http://yingyuk.space/wechat/3.mp3',
        hqMusicUrl: 'http://yingyuk.space/wechat/3.mp3',
        thumbMediaId: data.media_id
      }
    } else if (content === '8') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/1.png', { type: 'image' });
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    } else if (content === '9') {
      var data = yield wechatApi.uploadMaterial('video', __dirname + '/2.mp4', { type: 'video', description: '{"title":"这是一个TITLE","introduction":"这是introduction"}' });

      console.log('9data', data);
      reply = {
        type: 'video',
        title: '视频',
        description: '描述',
        mediaId: data.media_id
      }
    } else if (content === '10') {
      console.log('上传图片');
      var picData = yield wechatApi.uploadMaterial('image', __dirname + '/1.png', {});
      console.log('得到永久图片素材', picData.media_id);
      var media = {
        articles: [{
          title: '素材标题',
          thumb_media_id: picData.media_id,
          author: '作者',
          digest: '摘要',
          show_cover_pic: 1,
          content: 'CONTENT',
          content_source_url: 'https://www.baidu.com'
        }]
      };
      console.log('上传图文');
      data = yield wechatApi.uploadMaterial('news', media, {});
      console.log('获取图文', data.media_id);
      data = yield wechatApi.fetchMaterial(data.media_id, 'news', {});
      console.log('图文数据', data);
      var items = data.news_item;
      console.log('items', items);
      var news = [];
      items.forEach(function(item) {
        news.push({
          title: item.title,
          description: item.digest,
          picUrl: picData.url,
          url: item.url
        });
      })
      reply = news;
    } else if (content === '11') {
      console.log('获取素材总数');
      var count = yield wechatApi.count();
      console.log('获取素材总数', JSON.stringify(count));
      console.log('获取素材列表');
      var data = yield [
        wechatApi.batch({
          type: 'image',
          offset: 0,
          count: 10
        }),
        wechatApi.batch({
          type: 'video',
          offset: 0,
          count: 10
        }), wechatApi.batch({
          type: 'news',
          offset: 0,
          count: 10
        }),
        wechatApi.batch({
          type: 'voice',
          offset: 0,
          count: 10
        })
      ]

      console.log('获取素材列表', JSON.stringify(data));



      reply = '1';
    } else if (content === '12') {
      console.log('创建新分组名');
      var group = yield wechatApi.createGroup('hello');
      console.log(group);
      var fetch = yield wechatApi.fetchGroups();
      console.log('fetch', fetch);

      var index = yield wechatApi.checkGroupId(message.FromUserName);
      console.log('查看自己分组');
      console.log(index);
      console.log('移动分组');
      var move = yield wechatApi.moveGroup(message.FromUserName, 103);
      console.log(move);

      console.log('查看自己分组2');
      index = yield wechatApi.checkGroupId(message.FromUserName);
      console.log(index);
      var change = yield wechatApi.update(102, '改名');
      console.log('改名');
      console.log(change);
      fetch = yield wechatApi.fetchGroups();
      console.log('fetch2', fetch);
      var del = yield wechatApi.delete(101);
      console.log('del', del);
      fetch = yield wechatApi.fetchGroups();
      console.log('fetch3', fetch);

      reply = '1';
    } else if (content === '13') {
      var user = yield wechatApi.fetchUserInfo(message.FromUserName);

      console.log('user', user);
      var userList = [{
        openid: message.FromUserName,
        lang: 'en'
      }];
      var user2 = yield wechatApi.fetchUserInfo(userList);
      console.log('user2',user2);


      reply = '1';
    }
else if (content === '14') {
      var user = yield wechatApi.userList();
      console.log(user);

      reply = user +'';
    }
















    this.body = reply;
  }
  yield next;
}
