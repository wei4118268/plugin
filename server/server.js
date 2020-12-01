let http = require('http');
let url = require('url');
let fs = require('fs');

let cTypes = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/x-javascript',
    jpg: 'image/jpg',
    png: 'image/png',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    mp4: 'video/mp4'
}

//创建server
http.createServer( (request, response) => {
    //获取请求的文件名
    let pathName = url.parse(request.url).pathname;
    let extName;
    if(pathName.lastIndexOf("\.") !== -1){
        extName = pathName.substring( pathName.lastIndexOf("\.") + 1 );
    }else{
        extName = "html";
        if(pathName.substr(-1) !== '/'){
            pathName += '/';
        }
        pathName += "index.html"
    }
    console.log(extName)

    //输出请求文件名
    console.log('Request for ' + pathName + ' received.');

    fs.exists( pathName.substring(1), exists => {
        if( exists ){
            handleRequest(request, response, pathName, extName);
        }else{
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end();
        }
    } );

    function handleRequest( req, res, pathName, extName ){
        let range = req.headers['range'];
        let contentType = cTypes[extName];
        if( range ){
            //解析范围请求
            let totalSize = fs.statSync(pathName.substring(1)).size;
            //获取range的范围
            let rangeSize = range.match(/bytes=(\d*)-(\d*)/);
            rangeSize[2] == '' ? false : rangeSize[2];
            let end = +(rangeSize[2] || totalSize - 1);
            let start = +(rangeSize[1]);

            if( !(start > end || start < 0 || end >= totalSize) ){
                //请求合法
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
                res.setHeader('Content-Length', start == end ? 0 : end - start + 1);
                res.setHeader('Content-Type', contentType);
                res.statusCode = 206;

                //读取文件
                let rs = fs.createReadStream( pathName.substring(1), { start, end } );
                rs.pipe(res);
                rs.on('end', () => {
                    res.end();
                });
            }
        }else{
            res.writeHead(200, {'Content-Type': contentType});
            let rs = fs.createReadStream( pathName.substring(1) );
            rs.pipe(res);
            rs.on('end', () => {
                res.end();
            });
        }
    }
} ).listen(80);

console.log('Server running at http://127.0.0.1:80/');
