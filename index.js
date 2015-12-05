/**
 * Redis dump main file.
 *
 * @author welchwsy
 */

var Redis = require('redis'),
	async = require('async');

/**
 * Redis move class.
 *
 * @param {Object} params init params.
 * @constructor
 */
var RedisMove = module.exports = function (params) {
	'use strict';

	var clientFrom;
	var clientTo;

	this.getVersion = function () {
		return '0.0.1';
	};

	this.getClientFrom = function () {
		return clientFrom;
	};

	this.getClientTo = function () {
		return clientTo;
	};

	this.connectFrom = function () {
		clientFrom = Redis.createClient(params.from.port, params.from.host);
		if (params.from.password) {
			clientFrom.auth(params.from.password,function(err,auth){
				console.log("auth",err,auth);
			});
		}

		return !clientFrom;
	};
	this.connectTo = function () {
		clientTo = Redis.createClient(params.to.port, params.to.host);
		if (params.to.password) {
			clientTo.auth(params.to.password,function(err,auth){
				console.log("auth",err,auth);
			});
		}

		return !clientTo;
	};
};

/**
 * Make redis move.
 *
 * @param {Object} params
 */
RedisMove.prototype.move = function (next) {
	'use strict';
	var index = 0
	var list =0,set=0,hash=0,string=0,zset=0;
	var _MoveRedis = this;
	_MoveRedis.getClientFrom().keys('*', function (err, keys) {
		//console.log("keys",keys.length);
		if (err) return next(err, null);
		async.eachSeries(keys, function iterator(key, next) {
			_MoveRedis.getClientFrom().type(key, function (err, type) {
				switch (type) {
					case 'set':
						set++;
						_MoveRedis.getClientFrom().smembers(key, function (err, value) {
							async.eachSeries(value, function iterator(item, next) {
								_MoveRedis.getClientTo().SADD(key, item, function (err, result) {
									next(err, result);
								});
							}, function (err, result) {
								if (err) { 
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{
									next(err,result);
								}
							});
						});
						break;

					case 'zset':
						zset++;
						_MoveRedis.getClientFrom().zrange(key, 0,-1,"WITHSCORES",function (err, value) {
							async.forEachOf(value, function iterator(arr_value,arr_key, next) {
								if(arr_key % 2 == 0)
									_MoveRedis.getClientTo().ZADD(key,value[arr_key+1], arr_value, function (err, result) {
										next(err, result);
									});
								else
									next(err,null);
							}, function (err, result) {
								if (err) { 
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{								
									next(err,result);
								}
							});
						});
						break;

					case 'hash':
						hash++;
						_MoveRedis.getClientFrom().hgetall(key, function (err, value) {
							async.forEachOf(value, function iterator(O_value,O_key, next) {
								_MoveRedis.getClientTo().HSET(key, O_key, O_value, function (err, result) {
									next(err, result);
								});
							}, function (err, result) {
								if (err) { 
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{	
									next(err,result);
								}
							});
						});
						break;
					case 'list':
						list++;
						_MoveRedis.getClientFrom().lrange(key, 0, -1, function (err, value) {
							_MoveRedis.getClientTo().del(key, function (err, result) {
								async.eachSeries(value, function iterator(item, next) {
									_MoveRedis.getClientTo().RPUSH(key, item, function (err, result) {
										next(err, result);
									});
								}, function (err, result) {
									if (err) {
										console.log("ERROR", err);
										next(err, null);
									}
									else {
										next(err, result);
									}
								});
							})
						});
						break;
						
					case 'string':
						string++;
						_MoveRedis.getClientFrom().get(key, function (err, value) {
							if(err)console.log("err",err);
							_MoveRedis.getClientTo().set(key, value, function (err, result) {
								if (err) { 
									console.log("ERROR", err);
									next(err,null);
									}
								else
								{
									next(err,result);
								}
							});
						});
						break;
					default:
						next(null,key);
						break;	
				}
			});
		}, function (err, result) {
			console.log("list:",list,"set:",set,"hash:",hash,"string:",string,"zset:",zset,"all",list+set+hash+string+zset);
			next(err, "ok");
		});
	});
};