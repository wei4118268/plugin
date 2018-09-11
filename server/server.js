var http=require('http');
var fs = require('fs');
var url = require('url');

//创建服务器
http.createServer(function(request,response) {
  //解析请求，包括文件名
  var pathname= url.parse(request.url).pathname;
  //输出请求的文件名
  console.log("Request for "+ pathname + "  received.");

  var extIndex = pathname.lastIndexOf("\.");
  var extName = pathname.substring(extIndex + 1);
  console.log(extName);
  var ContentType = {'Content-Type': 'text/html'};
  // js - application/x-javascript
  if (extName && extName === 'css') {
    ContentType = {'Content-Type': 'text/css'};
  } else if (extName && extName === 'js') {
    ContentType = {'Content-Type': 'application/x-javascript'}
  }

  //从文件系统中去请求的文件内容
  fs.readFile(pathname.substr(1),function(err, data) {
    if(err) {
      console.log(err);
      //HTTP 状态码 404 ： NOT FOUND
      response.writeHead(404, {'Content-Type': 'text/html'});
    }
    else {
      //HTTP 状态码 200 ： OK
      response.writeHead(200, ContentType);

      //写会回相应内容
      response.write(data.toString());
    }
    //发送响应数据
    response.end();
  });
}).listen(80);

console.log('Server running at http://127.0.0.1:80/');
