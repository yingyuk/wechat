/*
 * @Author: Yuk
 * @Date:   2016-05-13 21:54:58
 * @Last Modified by:   Yuk
 * @Last Modified time: 2016-05-16 17:32:54
 */

'use strict';
var Promise = require('bluebird')
var fs = require('fs');
var request = Promise.promisify(require('request'));
var util = require('./util.js');
var _ = require('lodash');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  // 获取票据
  accessToken: prefix + 'token?grant_type=client_credential',
  // 临时素材
  temporary: {
    upload: prefix + 'media/upload?',
    fetch: prefix + 'media/get?'
  },
  // 永久素材
  permanent: {
    upload: prefix + 'material/add_material?',
    fetch: prefix + 'material/get_material?',
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    del: prefix + 'material/del_material?',
    update: prefix + 'material/update_news?',
    count: prefix + 'material/get_materialcount?',
    batch: prefix + 'material/batchget_material?'
  },
  // 用户分组
  group: {
    create: prefix + 'groups/create?',
    // 分组列表
    fetch: prefix + 'groups/get?',
    // 用户所在分组
    checkGroupId: prefix + 'groups/getid?',
    update: prefix + 'groups/update?',
    move: prefix + 'groups/members/update?',
    // 批量移动用户分组
    batchMove: prefix + 'groups/members/batchupdate?',
    delete: prefix + 'groups/delete?'
  },
  user: {
    // 备注用户
    remark: prefix + 'user/info/updateremark?',
    fetch: prefix + 'user/info?',
    batch: prefix + 'user/info/batchget?',
    list: prefix + 'user/get?'
  }
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
    if (this.access_token && this.expires_in) {
      if (this.isValidAccessToken(this)) {
        return Promise.resolve(this);
      }
    }
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
      request({
          url: url,
          json: true
        })
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
  /**
   * 上传素材
   * @param  {string} type      素材类型
   * @param  {string} material  素材
   * @param  {string} permanent 外面传入的配置项,是否是永久素材;
   * @return {json}           微信返回的素材ID
   */
  uploadMaterial: function(type, material, permanent) {
    var that = this;
    // 默认临时上传url
    var uploadUrl = api.temporary.upload;
    var form = {};
    if (permanent) {
      // 如果是传入永久素材;
      uploadUrl = api.permanent.upload;
      // 拓展设置;
      _.extend(form, permanent);
    }
    if (type === 'pic') {
      // 图片
      uploadUrl = api.permanent.uploadNewsPic;

    } else if (type === 'news') {
      // 图文
      uploadUrl = api.permanent.uploadNews;
      form = material;
    } else {
      // 素材文件路径
      form.media = fs.createReadStream(material)
    }

    var appID = this.appID;
    var appSecret = this.appSecret;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = uploadUrl + 'access_token=' + data.access_token;
          if (!permanent) {
            // 非永久
            url += '&type=' + type;
          } else {
            // form 也加上票据
            form.access_token = data.access_token;
          }
          // 定义上传配置
          var options = {
            method: 'POST',
            url: url,
            json: true
          };
          if (type === 'news') {
            options.body = form
          } else {
            options.formData = form;
          }


          request(options)
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
  },
  /**
   * 获取素材
   * @param  {str} madiaId   素材id
   * @param  {string} type      素材类型
   * @param  {object} permanent 临时来说永久素材
   * @return {object}           微信返回
   */
  fetchMaterial: function(mediaId, type, permanent) {
    var that = this;
    // 默认临时上传url
    var fetchUrl = api.temporary.fetch;

    var appID = this.appID;
    var appSecret = this.appSecret;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var form = {};
          var url;
          var options = {
            method: 'POST',
            json: true,
          }
          if (permanent) {
            url = api.permanent.fetch + 'access_token=' + data.access_token;
            form = {
              media_id: mediaId
            };
            options.body = form;
          } else {
            url = fetchUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId;
            if (type === 'video') {
              // 非永久 视频
              url = url.replace('https://', 'http://');
            }
          }
          options.url = url;
          if (type === 'news' || type === 'video') {
            console.log('options.body', options.body);
            console.log('URL', url);
            request(options)
              .then(function(response) {
                var _data = response.body;
                if (_data) {
                  resolve(_data)
                } else {
                  throw new Error('fetchMaterial error');
                }
              })
              .catch(function(err) {
                reject(err);
              })
          } else {
            resolve(url);
          }
        })
    })
  },
  /**
   * 删除素材
   * @param  {[type]} mediaId [description]
   * @return {[type]}         [description]
   */
  delMaterial: function(mediaId) {
    var that = this;
    // 默认临时上传url
    var form = {
      media_id: mediaId
    };
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;
          // 定义上传配置
          var options = {
            method: 'POST',
            url: url,
            json: true,
            body: form
          };
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('del error!');
              }
            })
            .catch(function(err) {
              reject(err);
            })

        })
    })
  },
  // 更新素材
  updateMaterial: function(mediaId, news) {
    var that = this;
    // 默认临时上传url
    var form = {
      media_id: mediaId
    };
    _.extend(form, news);

    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + mediaId;
          // 定义上传配置
          var options = {
            method: 'POST',
            url: url,
            json: true,
            body: form
          };
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('update news error!');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  // 素材总数
  count: function() {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.permanent.count + 'access_token=' + data.access_token;
          // 定义上传配置
          var options = {
            method: 'GET',
            url: url,
            json: true,
          };
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('count error!');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  // 素材列表
  batch: function(parameter) {
    var that = this;
    parameter.type = parameter.type || 'image';
    parameter.offset = parameter.offset || 0;
    parameter.count = parameter.count || 1;

    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.permanent.batch + 'access_token=' + data.access_token;
          // 定义上传配置
          console.log(url);
          var options = {
            method: 'POST',
            url: url,
            json: true,
            body: parameter
          };
          console.log(options);
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('batch error!');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  createGroup: function(name) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.group.create + 'access_token=' + data.access_token;
          var form = {
            group: {
              name: name
            }
          };
          var options = {
            json: true,
            url: url,
            body: form,
            method: 'POST'
          };
          console.log('options', options);
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('create group error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  fetchGroups: function() {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.group.fetch + 'access_token=' + data.access_token;
          var options = {
            method: 'GET',
            json: true,
            url: url
          };
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('fetch group list error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  checkGroupId: function(openId) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.group.checkGroupId + 'access_token=' + data.access_token;
          var form = {
            openid: openId
          };
          var options = {
            method: 'POST',
            json: true,
            url: url,
            body: form
          };
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('checkGroupId  error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  // 分组改名
  update: function(id, name) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.group.update + 'access_token=' + data.access_token;
          var form = {
            group: {
              id: id,
              name: name
            }
          };
          var options = {
            method: 'POST',
            json: true,
            url: url,
            body: form
          };
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('update group list error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  // 更改用户分组;
  moveGroup: function(openId, groupId) {
    var that = this;

    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.group.move + 'access_token=' + data.access_token;
          var form = {
            to_groupid: groupId
          };
          // 如果是批量更改分组
          if (_.isArray(openId)) {
            console.log('是数组');
            url = api.group.batchMove + 'access_token=' + data.access_token;
            form.openid_list = openId;
          } else {
            console.log('不是数组');
            form.openid = openId;
          }
          var options = {
            method: 'POST',
            json: true,
            url: url,
            body: form
          };
          console.log('更改的url', options);
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('moveGroup list error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  // 删除分组;
  delete: function(groupId) {
    var that = this;

    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.group.delete + 'access_token=' + data.access_token;
          var form = {
            group: {
              id: groupId
            }
          };
          var options = {
            method: 'POST',
            json: true,
            url: url,
            body: form
          };
          console.log('删除选择', url);
          console.log();
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('delete group list error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  /**
   * 用户重命名
   * @param  {string} openId     用户id
   * @param  {string} remarkName 备注名
   */
  remarkUser: function(openId, remarkName) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.user.remark + 'access_token=' + data.access_token;
          var form = {
            openid: openId,
            remark: remarkName
          };
          var options = {
            method: 'POST',
            json: true,
            url: url,
            body: form
          };
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('remarkUser  error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  /**
   * 单个/批量获取用户信息
   * @param  {string OR array} openId 用户信息;
   * @return {[strng]}        [返回语言]
   */
  fetchUserInfo: function(openId, lang) {
    var that = this;
    lang = lang || 'zh_CN';
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var options;
          if (_.isArray(openId)) {
            options = {
              method: 'POST',
              json: true,
              body: {
                user_list: openId
              },
              url: api.user.batch + 'access_token=' + data.access_token
            };
          } else {
            options = {
              method: 'GET',
              json: true,
              url: api.user.fetch + 'access_token=' + data.access_token + '&openid=' + openId + '&lang=' + lang
            };
          }
          console.log(options);
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('batchInfo  error');
              }
            })
            .catch(function(err) {
              reject(err);
            })
        })
    })
  },
  /**
   * 获取用户列表
   * @param  {[type]} nextIndex [description]
   * @return {[type]}           [description]
   */
  userList: function(nextIndex) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that
        .fetchAccessToken()
        .then(function(data) {
          var url = api.user.list + 'access_token=' + data.access_token;
          if (nextIndex) {
            url += '&next_openid=' + nextIndex;
          }
          var options = {
            method: 'GET',
            json: true,
            url: url
          };
          console.log(url);
          request(options)
            .then(function(response) {
              var _data = response.body;
              if (_data) {
                resolve(_data);
              } else {
                throw new Error('userList  error');
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
