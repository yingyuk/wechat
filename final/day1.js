/*
* @Author: Yuk
* @Date:   2016-05-13 23:30:56
* @Last Modified by:   Yuk
* @Last Modified time: 2016-05-13 23:48:05
*/

'use strict';
var koa = require('koa');
var app = koa();
app.use(function *() {
	var echo = this.query.echo;
	if (!echo) {
		this.body = 'hahaha none';
	}else{
		this.body = echo;
	}
})
app.listen(443);
console.log('443');
