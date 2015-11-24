var MoveRedis = require('./index');
var config = {
	from:{
		port:6379,
		host:"127.0.0.1",
		password:"your passqord or empty"
		},
	to:{
		port:6380,
		host:"127.0.0.1",
		password:"your passqord or empty"
	}	
};
var move = new MoveRedis(config);
move.connectFrom();
move.connectTo();
move.move(function(err,result){
	if(err)console.log("error",err);
	else
	console.log("ok");
});