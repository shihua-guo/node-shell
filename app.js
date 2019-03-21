var express = require('express');
var app = express();
var fs = require('fs');
const { exec } = require('child_process');
const filePath = "./exports";//需要修改的文件
const cmd = "systemctl restart nfs";//需要执行的重启nfs命令
const passwd = "mypwd";//非常简单的密码，用于简单的验证

var extractIpFromString = function(str){//因为接收到可能是ipv6地址，所以我们需要提取ipv4地址
	var r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
	var ip = str.match(r);
	return ip[0];
}

app.get('/',function(req,resp){
    var ip = extractIpFromString(req.ip);
	console.log("将ip替换为：",ip);
    var pwd = req.query.pwd;
    if(ip && pwd === passwd){
        fs.readFile(filePath,'utf-8',function(err,data){
            if (err) {
                resp.send('更换配置失败');
                throw err;
            }
            var newData = data.replace( /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/gi, ip);
            
            fs.writeFile(filePath, newData, 'utf-8', function (err) {
                if (err) {
                    resp.send('更换配置失败');
                    throw err;
                }
              });
        })
    }else{
       resp.end('fuckyou！ ' );//其实就是密码错误，但是别让别人发现了，所以就不发送密码错误了
	return false;
    }

    exec(cmd, (err, stdout, stderr) => {//执行脚本。为了正常运行，所以我们就捕获可能遇到的异常
        console.log("执行重启nfs");
        try{
            if (err) {
                resp.send('重启失败');
            return;
            }
            resp.send('Fuck me！');//这样返回给客户端就是成功了
        }catch(e){
            console.log(e);
        }
	});
    
});
app.listen(3000);
console.log("app is running on 3000")
