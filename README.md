# move-redis
一个简单的redis数据迁移脚本
通过`move-redis`你可以在windows平台上将redis无缝迁移到`腾讯云存储redis`,同样适用于阿里云等平台。

*使用windows平台的redis偶尔会遇到`save`、`bgsave`、`slaveof`都失败导致无法保存数据，可使用`move-redis`备份数据。*

##Install
`git clone https://github.com/welchwsy/move-redis.git`

OR

download `https://codeload.github.com/welchwsy/move-redis/zip/master`

##Run
你需要一个node.js的运行环境。node.js安装：https://nodejs.org/en/

执行：`npm install`

修改`simple.js`的config中的属性。例如：
```
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
```

开始迁移数据：`node simple.js`
*数据多的时候需要很长的一段时间，请耐心等待。执行完成后有数据类型的统计*
![](http://7vzrz4.com1.z0.glb.clouddn.com/屏幕快照%202015-11-24%20上午8.58.00.png)
